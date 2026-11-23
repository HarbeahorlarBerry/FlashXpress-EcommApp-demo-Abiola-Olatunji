import User from "../../Models/usersSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMail } from "../../utils/sendEmail.js";
import { setAuthCookie, clearAuthCookie } from "../../utils/Cookies.js";

const hash = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const publicUser = (u) => ({
  id: u._id,
  username: u.username,
  gmail: u.gmail,
  role: u.role,
  provider: u.provider,
  isVerified: u.isVerified,
});

export const logginIn = async (req, res) => {
  try {
    const loginId = String(
      req.body.identifier || req.body.username || req.body.gmail || req.body.email || ""
    ).trim();
    const { password } = req.body;

    const invalid = () =>
      res.status(401).json({
        status: "error",
        message: "Password or username is incorrect",
      });

    if (!loginId || typeof password !== "string" || !password) {
      return invalid();
    }

    const user = await User.findOne({
      $or: [
        { gmail: loginId.toLowerCase() },
        { username: new RegExp(`^${escapeRegex(loginId)}$`, "i") },
      ],
    });

    if (!user || !user.password) return invalid();
    if (!(await bcryptjs.compare(password, user.password))) return invalid();

    if (!user.isVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email with the OTP first",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    setAuthCookie(res, token);
    return res.json({
      status: "success",
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      status: "error",
      message: "Unable to sign in right now. Please try again.",
    });
  }
};

export const getCurrentUser = (req, res) =>
  res.json({ status: "success", user: publicUser(req.user) });

export const passwordResetRequest = async (req, res) => {
  try {
    const gmail = String(req.body.gmail || req.body.email || "")
      .toLowerCase()
      .trim();

    if (!gmail) {
      return res.status(400).json({ status: "error", message: "Gmail is required" });
    }

    const generic = {
      status: "success",
      message: "If that email exists, a reset link has been sent",
    };

    const user = await User.findOne({ gmail });
    if (user && user.password) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = hash(token);
      user.passwordResetExpires = new Date(Date.now() + 20 * 60 * 1000);
      await user.save();

      const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const link = `${baseUrl}/reset-password?token=${token}`;
      try {
        await sendMail({
          mailFrom: process.env.EMAIL_USER,
          mailTo: gmail,
          subject: "Reset your password",
          body: `<p>Click to reset your password (valid 20 minutes):</p><a href="${link}">Reset password</a>`,
        });
      } catch (e) {
        console.error("Reset email failed:", e.message);
      }
    }

    return res.json(generic);
  } catch (err) {
    console.error("Password reset request error:", err);
    return res.status(500).json({
      status: "error",
      message: "Could not send reset link right now",
    });
  }
};

export const passwordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Token and password required" });
    }
    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ status: "error", message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      passwordResetToken: hash(String(token)),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or expired token" });
    }

    user.password = await bcryptjs.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ status: "success", message: "Password reset successful" });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({
      status: "error",
      message: "Could not reset password right now",
    });
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  return res.json({ status: "success", message: "Logged out successfully" });
};


// import User from "../../Models/usersSchema.js";
// import bcryptjs from "bcryptjs";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";


// // ======================
// // LOGIN
// // ======================
// export const logginIn =
//   async (req, res) => {
//     try {
//       const {
//         gmail,
//         password,
//       } = req.body;


//       if (
//         !gmail ||
//         !password
//       ) {
//         return res
//           .status(400)
//           .json({
//             status:
//               "error",

//             message:
//               "Please provide gmail and password",
//           });
//       }


//       const user =
//         await User.findOne({
//           gmail,
//         });


//       if (!user) {
//         return res
//           .status(404)
//           .json({
//             status:
//               "error",

//             message:
//               "User not found",
//           });
//       }


//       // GOOGLE USER
//       if (
//         !user.password
//       ) {
//         return res
//           .status(400)
//           .json({
//             status:
//               "error",

//             message:
//               "This account uses Google sign-in",
//           });
//       }


//       if (
//         !user.isVerified
//       ) {
//         return res
//           .status(403)
//           .json({
//             status:
//               "error",

//             message:
//               "OTP not verified",
//           });
//       }


//       const isPasswordCorrect =
//         await bcryptjs.compare(
//           password,
//           user.password
//         );


//       if (
//         !isPasswordCorrect
//       ) {
//         return res
//           .status(401)
//           .json({
//             status:
//               "error",

//             message:
//               "Invalid gmail or password",
//           });
//       }


//       const token =
//         jwt.sign(
//           {
//             id:
//               user._id,

//             role:
//               user.role,
//           },

//           process.env
//             .JWT_SECRET,

//           {
//             expiresIn:
//               "5h",
//           }
//         );


//       return res
//         .cookie(
//           "token",
//           token,
//           {
//             httpOnly:
//               true,

//             secure: process.env.NODE_ENV === "production",

//             sameSite: process.env.NODE_ENV === "production"
//             ? "none"
//              : "lax",

//             path:
//               "/",

//             maxAge:
//               5 *
//               60 *
//               60 *
//               1000,
//           }
//         )

//         .status(200)

//         .json({
//           status:
//             "success",

//           message:
//             "Login successful",

//           user: {
//             id:
//               user._id,

//             username:
//               user.username,

//             gmail:
//               user.gmail,

//             role:
//               user.role,
//           },
//         });

//     } catch (
//       error
//     ) {
//       console.error(
//         "Login error:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",

//           message:
//             "Server error",
//         });
//     }
//   };


// // ======================
// // PASSWORD RESET REQUEST
// // ======================
// export const passwordResetRequest = async (req, res) => {
//   try {
//     const { gmail } = req.body;

//     if (!gmail) {
//       return res.status(400).json({
//         status: "error",
//         message: "Gmail is required",
//       });
//     }

//     const user = await User.findOne({ gmail });

//     if (!user) {
//       return res.status(404).json({
//         status: "error",
//         message: "User not found",
//       });
//     }

//     const token = crypto.randomBytes(32).toString("hex");

//     user.passwordResetToken = token;
//     user.passwordResetExpires =
//       Date.now() + 20 * 60 * 1000;

//     await user.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Password reset link sent",
//       token,
//     });

//   } catch (error) {
//     console.error("Reset request error:", error);

//     return res.status(500).json({
//       status: "error",
//       message: "Invalid or expired token",
//     });
//   }
// };


// // ======================
// // PASSWORD RESET
// // ======================
// export const passwordReset = async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;

//     if (!token || !newPassword) {
//       return res.status(400).json({
//         status: "error",
//         message: "Token and password required",
//       });
//     }

//     const user = await User.findOne({
//       passwordResetToken: token,
//       passwordResetExpires: {
//         $gt: Date.now(),
//       },
//     });

//     if (!user) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid or expired token",
//       });
//     }

//     if (newPassword.length < 6) {
//       return res.status(400).json({
//         status: "error",
//         message: "Password must be at least 6 characters",
//       });
//     }

//     const hashedPassword =
//       await bcryptjs.hash(newPassword, 10);

//     user.password = hashedPassword;
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;

//     await user.save();

//     return res.status(200).json({
//       status: "success",
//       message: "Password reset successful",
//     });

//   } catch (error) {
//     console.error("Password reset error:", error);

//     return res.status(500).json({
//       status: "error",
//       message: "Server error",
//     });
//   }
// };


// // ======================
// // LOGOUT
// // ======================
// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: false,
//     });

//     return res.status(200).json({
//       status: "success",
//       message: "Logged out successfully",
//     });

//   } catch (error) {
//     console.error("Logout error:", error);

//     return res.status(500).json({
//       status: "error",
//       message: "Server error",
//     });
//   }
// };

// // ======================
// // CURRENT LOGGED-IN USER
// // ======================
// export const getCurrentUser =
//   async (req, res) => {
//     try {
//       const token =
//         req.cookies.token;

//       if (!token) {
//         return res
//           .status(401)
//           .json({
//             status:
//               "error",
//             message:
//               "Not authenticated",
//           });
//       }

//       const decoded =
//         jwt.verify(
//           token,
//           process.env
//             .JWT_SECRET
//         );

//       const user =
//         await User.findById(
//           decoded.id
//         ).select(
//           "-password"
//         );

//       if (!user) {
//         return res
//           .status(404)
//           .json({
//             status:
//               "error",
//             message:
//               "User not found",
//           });
//       }

//       return res
//         .status(200)
//         .json({
//           status:
//             "success",

//           user: {
//             id:
//               user._id,

//             username:
//               user.username,

//             gmail:
//               user.gmail,

//             role:
//               user.role,
//           },
//         });

//     } catch (
//       error
//     ) {
//       console.error(
//         "Get current user error:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",

//           message:
//             "Server error",
//         });
//     }
//   };