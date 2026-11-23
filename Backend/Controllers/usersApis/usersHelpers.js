// Shared helpers for the users controllers (not exported from the barrel)
export const SAFE =
  "-password -otp -otpExpires -otpAttempts -lastOtpSentAt -passwordResetToken -passwordResetExpires -googleId";

export const ADDRESS_FIELDS = ["fullName", "phone", "street", "city", "state", "postalCode", "country"];

export const bad = (res, code, message) =>
  res.status(code).json({ status: "error", message });

export const pickAddress = (body) =>
  Object.fromEntries(
    ADDRESS_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, String(body[k]).trim()])
  );