import bcryptjs from "bcryptjs";
import User from "../../Models/usersSchema.js";
import { issueOtp } from "../../utils/Otp.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Role is ALWAYS "user" here. Admins come from the seed script / database only.
export const register = async (req, res) => {
  const username = String(req.body.username || "").trim();
  const gmail = String(req.body.gmail || "").toLowerCase().trim();
  const { password } = req.body;

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ status: "error", message: "Username must be 3-30 characters" });
  }
  if (!EMAIL_RE.test(gmail)) {
    return res.status(400).json({ status: "error", message: "A valid email is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ status: "error", message: "Password must be at least 8 characters" });
  }

  if (await User.exists({ $or: [{ gmail }, { username }] })) {
    return res.status(409).json({ status: "error", message: "Email or username already in use" });
  }

  const user = new User({ username, gmail, password: await bcryptjs.hash(password, 12) });
  await issueOtp(user); // saves the user and emails the code

  res.status(201).json({
    status: "success",
    message: "Account created. Check your email for the verification code.",
    user: { id: user._id, username: user.username, gmail: user.gmail },
  });
};