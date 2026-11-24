// utils/sendEmail.js
import nodemailer from "nodemailer";
import crypto from "crypto";

// ======================
// SEND EMAIL
// ======================
export const sendMail = async ({ mailFrom, mailTo, subject, body }) => {
  try {
    const port = Number(process.env.EMAIL_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject,
      html: body,
    });

    return info;
  } catch (error) {
    console.log("Email error:", error.message);
    throw error;
  }
};

// ======================
// GENERATE OTP
// ======================
export const generateOTP = () => {
  return {
    otp: Math.floor(100000 + Math.random() * 900000).toString(),
    otpExpires: new Date(Date.now() + 20 * 60 * 1000),
    token: crypto.randomBytes(32).toString("hex"),
  };
};