import crypto from "crypto";
import { sendMail } from "./sendEmail.js";

export const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");

export const issueOtp = async (user, subject = "Verify your account") => {
  const otp = String(crypto.randomInt(100000, 1000000));
  user.otp = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  user.lastOtpSentAt = new Date();
  await user.save();

  try {
    await sendMail({
      mailFrom: process.env.EMAIL_USER,
      mailTo: user.gmail,
      subject,
      body: `<h2>Hi ${user.username}</h2><p>Your verification code is:</p><h1>${otp}</h1><p>It expires in 10 minutes.</p>`,
    });
  } catch (e) {
    console.error("OTP email failed:", e.message);
  }
};