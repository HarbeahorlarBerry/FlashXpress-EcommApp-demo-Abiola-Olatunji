import { Schema, model } from "mongoose";

const otpChallengeSchema = new Schema(
  {
    gmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      default: "",
    },
    otpExpires: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpSentAt: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    registrationTokenHash: {
      type: String,
      default: "",
    },
    registrationTokenExpires: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export default model("OtpChallenge", otpChallengeSchema);