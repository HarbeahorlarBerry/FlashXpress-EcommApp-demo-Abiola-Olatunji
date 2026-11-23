import crypto from "crypto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../Models/usersSchema.js";
import OtpChallenge from "../../Models/otpChallengeSchema.js";
import { hashOtp } from "../../utils/Otp.js";
import { sendMail } from "../../utils/sendEmail.js";
import { setAuthCookie } from "../../utils/Cookies.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;
const REG_TOKEN_TTL_MS = 15 * 60 * 1000;

const sha256 = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const publicUser = (u) => ({
  id: u._id,
  username: u.username,
  gmail: u.gmail,
  role: u.role,
  provider: u.provider,
  isVerified: u.isVerified,
});

// Step 1: Send 6-digit OTP to Gmail before creating user
export const sendRegistrationOtp = async (req, res) => {
  const gmail = String(req.body.gmail || "").toLowerCase().trim();
  if (!EMAIL_RE.test(gmail)) {
    return res
      .status(400)
      .json({ status: "error", message: "Please enter a valid Gmail/email address" });
  }

  const existingUser = await User.findOne({ gmail }).select("_id");
  if (existingUser) {
    return res
      .status(409)
      .json({ status: "error", message: "An account with this email already exists" });
  }

  let challenge = await OtpChallenge.findOne({ gmail });
  if (
    challenge &&
    challenge.lastOtpSentAt &&
    Date.now() - challenge.lastOtpSentAt.getTime() < RESEND_COOLDOWN_MS
  ) {
    const waitSec = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - challenge.lastOtpSentAt.getTime())) / 1000
    );
    return res.status(429).json({
      status: "error",
      message: `Please wait ${waitSec}s before requesting another code`,
    });
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  const now = Date.now();

  if (!challenge) {
    challenge = new OtpChallenge({ gmail });
  }
  challenge.otpHash = hashOtp(otp);
  challenge.otpExpires = new Date(now + OTP_TTL_MS);
  challenge.otpAttempts = 0;
  challenge.lastOtpSentAt = new Date(now);
  challenge.verified = false;
  challenge.registrationTokenHash = "";
  challenge.registrationTokenExpires = undefined;
  challenge.expiresAt = new Date(now + OTP_TTL_MS + REG_TOKEN_TTL_MS);
  await challenge.save();

  try {
    await sendMail({
      mailFrom: process.env.EMAIL_USER,
      mailTo: gmail,
      subject: "Your registration verification code",
      body: `<h2>Verify your email</h2><p>Your 6-digit code is:</p><h1>${otp}</h1><p>This code expires in 10 minutes.</p>`,
    });
  } catch (error) {
    console.error("Registration OTP email failed:", error.message);
    return res
      .status(502)
      .json({ status: "error", message: "Could not send verification email" });
  }

  return res.status(200).json({
    status: "success",
    message: "Verification code sent to your email",
    gmail,
  });
};

// Step 2: Verify OTP and issue short-lived registrationToken
export const verifyRegistrationOtp = async (req, res) => {
  const gmail = String(req.body.gmail || "").toLowerCase().trim();
  const otp = String(req.body.otp || "").trim();

  if (!EMAIL_RE.test(gmail) || !/^\d{6}$/.test(otp)) {
    return res
      .status(400)
      .json({ status: "error", message: "Valid email and 6-digit code are required" });
  }

  const challenge = await OtpChallenge.findOne({ gmail });
  if (
    !challenge ||
    !challenge.otpHash ||
    !challenge.otpExpires ||
    challenge.otpExpires.getTime() < Date.now()
  ) {
    return res.status(400).json({
      status: "error",
      message: "Code expired or not requested. Please request a new code.",
    });
  }

  if (challenge.otpAttempts >= MAX_ATTEMPTS) {
    return res
      .status(429)
      .json({ status: "error", message: "Too many attempts. Request a new code." });
  }

  if (hashOtp(otp) !== challenge.otpHash) {
    challenge.otpAttempts += 1;
    await challenge.save();
    return res.status(400).json({ status: "error", message: "Invalid verification code" });
  }

  const registrationToken = crypto.randomBytes(32).toString("hex");
  const now = Date.now();

  challenge.verified = true;
  challenge.otpHash = "";
  challenge.otpExpires = undefined;
  challenge.registrationTokenHash = sha256(registrationToken);
  challenge.registrationTokenExpires = new Date(now + REG_TOKEN_TTL_MS);
  challenge.expiresAt = new Date(now + REG_TOKEN_TTL_MS);
  await challenge.save();

  return res.status(200).json({
    status: "success",
    message: "Email verified. Complete your registration.",
    registrationToken,
    gmail,
  });
};

// Step 3: Final registration after OTP verification succeeds
export const completeRegistration = async (req, res) => {
  const gmail = String(req.body.gmail || "").toLowerCase().trim();
  const username = String(req.body.username || "").trim();
  const registrationToken = String(req.body.registrationToken || "").trim();
  const country = String(req.body.country || "").trim();
  const { password } = req.body;

  if (!EMAIL_RE.test(gmail)) {
    return res
      .status(400)
      .json({ status: "error", message: "A valid email is required" });
  }
  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({
      status: "error",
      message: "Username must be 3-30 characters (letters, numbers, ., _, -)",
    });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res
      .status(400)
      .json({ status: "error", message: "Password must be at least 8 characters" });
  }
  if (!registrationToken) {
    return res
      .status(400)
      .json({ status: "error", message: "OTP verification token is required" });
  }

  const challenge = await OtpChallenge.findOne({ gmail });
  if (
    !challenge ||
    !challenge.verified ||
    !challenge.registrationTokenHash ||
    !challenge.registrationTokenExpires ||
    challenge.registrationTokenExpires.getTime() < Date.now() ||
    sha256(registrationToken) !== challenge.registrationTokenHash
  ) {
    return res.status(400).json({
      status: "error",
      message: "OTP verification expired or invalid. Please verify your email again.",
    });
  }

  if (await User.exists({ $or: [{ gmail }, { username }] })) {
    return res
      .status(409)
      .json({ status: "error", message: "Email or username already in use" });
  }

  const hashedPassword = await bcryptjs.hash(password, 12);
  const user = await User.create({
    username,
    gmail,
    password: hashedPassword,
    provider: "local",
    role: "user",
    isVerified: true,
    profile: country ? { country } : undefined,
  });

  await OtpChallenge.deleteOne({ _id: challenge._id });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "5h" }
  );
  setAuthCookie(res, token);

  return res.status(201).json({
    status: "success",
    message: "Registration complete",
    user: publicUser(user),
  });
};