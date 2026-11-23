import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const securityMiddleware = helmet();

const limiter = (windowMin, max, message) =>
  rateLimit({
    windowMs: windowMin * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: "error", message },
  });

export const apiLimiter = limiter(15, 300, "Too many requests, slow down");
export const authLimiter = limiter(15, 25, "Too many login/register attempts, try again later");
export const otpLimiter = limiter(15, 15, "Too many OTP requests, try again later");
export const aiLimiter = limiter(15, 30, "Too many AI requests, please slow down");