import { Router } from "express";
import {
  logginIn,
  getCurrentUser,
  passwordResetRequest,
  passwordReset,
  logout,
} from "../Controllers/authApis/authController.js";
import {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  completeRegistration,
} from "../Controllers/authApis/otpRegistrationController.js";
import {
  listContinueProviders,
  startSocialOAuth,
} from "../Controllers/authApis/socialAuthController.js";
import { authMiddleware, adminMiddleware } from "../Middlewares/authMiddleware.js";
import { authLimiter, otpLimiter } from "../Middlewares/Security.js";

const authRouter = Router();

// ======================
// CONTINUE OPTIONS (NO PASSKEY)
// ======================
authRouter.get("/providers", listContinueProviders);

// ======================
// GMAIL OTP -> FINAL REGISTRATION FLOW
// ======================
authRouter.post("/register/send-otp", otpLimiter, sendRegistrationOtp);
authRouter.post("/register/verify-otp", otpLimiter, verifyRegistrationOtp);
authRouter.post("/register", authLimiter, completeRegistration);
authRouter.post("/register/complete", authLimiter, completeRegistration);

// ======================
// LOGIN & SESSION
// ======================
authRouter.post("/login", authLimiter, logginIn);
authRouter.get("/me", authMiddleware, getCurrentUser);
authRouter.post("/logout", logout);

// ======================
// OTHER "CONTINUE WITH" PROVIDERS
// ======================
authRouter.get("/oauth/facebook", startSocialOAuth("facebook"));
authRouter.get("/oauth/apple", startSocialOAuth("apple"));
authRouter.get("/oauth/x", startSocialOAuth("x"));

// ======================
// PASSWORD RESET
// ======================
authRouter.post("/password-reset-request", authLimiter, passwordResetRequest);
authRouter.post("/password-reset", authLimiter, passwordReset);

// ======================
// ADMIN
// ======================
authRouter.get("/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

export default authRouter;


// import { Router } from "express";
// import passport from "passport";
// import jwt from "jsonwebtoken";

// import {
//   logginIn,
//   getCurrentUser,
//   passwordResetRequest,
//   passwordReset,
//   logout,
// } from "../Controllers/authApis/authController.js";
// import { register } from "../Controllers/authApis/RegisterConroller.js";
// import { authMiddleware, adminMiddleware } from "../Middlewares/authMiddleware.js";
// import { authLimiter } from "../Middlewares/security.js";

// const authRouter = Router();

// // ======================
// // REGISTRATION & LOGIN
// // ======================
// authRouter.post("/register", authLimiter, register);
// authRouter.post("/login", authLimiter, logginIn);

// // ======================
// // CURRENT USER (Not rate limited: called on every page load)
// // ======================
// authRouter.get("/me", authMiddleware, getCurrentUser);

// // ======================
// // GOOGLE AUTH
// // ======================
// authRouter.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// authRouter.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     session: false,
//   }),
//   (req, res) => {
//     const token = jwt.sign(
//       {
//         id: req.user._id,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "5h",
//       }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       secure: false,
//     });

//     res.redirect("http://localhost:5173/dashboard");
//   }
// );

// // ======================
// // PASSWORD RESET
// // ======================
// authRouter.post("/password-reset-request", authLimiter, passwordResetRequest);
// authRouter.post("/password-reset", authLimiter, passwordReset);

// // ======================
// // LOGOUT
// // ======================
// authRouter.post("/logout", logout);

// // ======================
// // ADMIN
// // ======================
// authRouter.get(
//   "/admin/dashboard",
//   authMiddleware,
//   adminMiddleware,
//   (req, res) => {
//     res.json({
//       message: "Welcome Admin",
//     });
//   }
// );

// export default authRouter;

// import { Router } from "express";
// import {
//   logginIn, getCurrentUser, passwordResetRequest, passwordReset, logout,
// } from "../Controllers/authApis/authController.js";
// import { register } from "../Controllers/authApis/RegisterConroller.js";
// import { authMiddleware } from "../Middlewares/authMiddleware.js";
// import { authLimiter } from "../Middlewares/security.js";

// const r = Router();
// r.post("/register", authLimiter, register);
// r.post("/login", authLimiter, logginIn);
// r.get("/me", authMiddleware, getCurrentUser); // not rate limited: called on every page load
// r.post("/password-reset-request", authLimiter, passwordResetRequest);
// r.post("/password-reset", authLimiter, passwordReset);
// r.post("/logout", logout);
// export default r;

// import { Router } from "express";
// import passport from "passport";
// import jwt from "jsonwebtoken";

// import {
//   logginIn,
//   passwordResetRequest,
//   passwordReset,
//   logout,
// } from "../Controllers/authApis/authController.js";

// import {
//   authMiddleware,
//   adminMiddleware,
// } from "../Middlewares/authMiddleware.js";


// const authRouter = Router();


// // ======================
// // LOGIN
// // ======================
// authRouter.post(
//   "/login",
//   logginIn
// );


// // ======================
// // CURRENT USER
// // ======================
// authRouter.get(
//   "/me",
//   authMiddleware,
//   (req, res) => {
//     return res.status(200).json({
//       status: "success",
//       user: {
//         id: req.user._id,
//         username: req.user.username,
//         gmail: req.user.gmail,
//         role: req.user.role,
//       },
//     });
//   }
// );


// // ======================
// // GOOGLE AUTH
// // ======================
// authRouter.get(
//   "/google",
//   passport.authenticate(
//     "google",
//     {
//       scope: [
//         "profile",
//         "email",
//       ],
//     }
//   )
// );


// authRouter.get(
//   "/google/callback",
//   passport.authenticate(
//     "google",
//     {
//       session: false,
//     }
//   ),
//   (req, res) => {
//     const token = jwt.sign(
//       {
//         id: req.user._id,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "5h",
//       }
//     );

//     res.cookie(
//       "token",
//       token,
//       {
//         httpOnly: true,
//         sameSite: "lax",
//         secure: false,
//       }
//     );

//     res.redirect(
//       "http://localhost:5173/dashboard"
//     );
//   }
// );


// // ======================
// // PASSWORD RESET
// // ======================
// authRouter.post(
//   "/password-reset-request",
//   passwordResetRequest
// );

// authRouter.post(
//   "/password-reset",
//   passwordReset
// );


// // ======================
// // LOGOUT
// // ======================
// authRouter.post(
//   "/logout",
//   logout
// );


// // ======================
// // ADMIN
// // ======================
// authRouter.get(
//   "/admin/dashboard",
//   authMiddleware,
//   adminMiddleware,
//   (req, res) => {
//     res.json({
//       message: "Welcome Admin",
//     });
//   }
// );


// export default authRouter;