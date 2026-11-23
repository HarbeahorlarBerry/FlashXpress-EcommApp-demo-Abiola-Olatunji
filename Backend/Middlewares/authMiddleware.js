import jwt from "jsonwebtoken";
import User from "../Models/usersSchema.js";

const SAFE_FIELDS =
  "-password -otp -otpExpires -lastOtpSentAt -passwordResetToken -passwordResetExpires";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ status: "error", message: "Please login first" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(SAFE_FIELDS);
    if (!user) {
      return res.status(401).json({ status: "error", message: "User not found" });
    }
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
};

// Roles: "user" (buyer), "seller", "admin"
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ status: "error", message: "You do not have access to this resource" });
    }
    next();
  };

export const adminMiddleware = requireRole("admin");
export const sellerMiddleware = requireRole("seller", "admin");

// Attaches req.user when a valid cookie is present, but never rejects the request.
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select(SAFE_FIELDS);
      if (user) req.user = user;
    }
  } catch {
    // invalid or expired cookie: continue as a guest
  }
  next();
};



// import jwt from "jsonwebtoken";
// import User from "../Models/usersSchema.js";

// // ======================
// // AUTH MIDDLEWARE
// // ======================

// export const authMiddleware = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const token =
//       req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({
//         status: "error",
//         message: "Please login first",
//       });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     const user =
//       await User.findById(
//         decoded.id
//       ).select("-password");

//     if (!user) {
//       return res.status(401).json({
//         status: "error",
//         message: "User not found",
//       });
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     return res.status(401).json({
//       status: "error",
//       message:
//         "Invalid or expired token",
//     });
//   }
// };

// // ======================
// // ADMIN ONLY
// // ======================

// export const adminMiddleware = (
//   req,
//   res,
//   next
// ) => {
//   if (!req.user) {
//     return res.status(401).json({
//       status: "error",
//       message: "Unauthorized",
//     });
//   }

//   if (req.user.role !== "admin") {
//     return res.status(403).json({
//       status: "error",
//       message:
//         "Admin access required",
//     });
//   }

//   next();
// };

// // ======================
// // ULTIMATE ADMIN ONLY
// // ======================

// export const ultimateAdminMiddleware = (
//   req,
//   res,
//   next
// ) => {
//   if (!req.user) {
//     return res.status(401).json({
//       status: "error",
//       message: "Unauthorized",
//     });
//   }

//   if (
//     req.user.role !==
//     "ultimateAdmin"
//   ) {
//     return res.status(403).json({
//       status: "error",
//       message:
//         "Ultimate Admin access required",
//     });
//   }

//   next();
// };