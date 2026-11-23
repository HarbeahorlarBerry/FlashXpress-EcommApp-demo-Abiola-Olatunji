import { Router } from "express";
import passport from "passport";
import { googleCallback } from "../Controllers/authApis/googleAuthController.js";

const r = Router();
r.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
r.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=google`,
  }),
  googleCallback
);
export default r;


// import {
//   Router,
// } from "express";

// import passport from "passport";

// import {
//   googleCallback,
// } from "../Controllers/authApis/googleAuthController.js";


// const googleRouter =
//   Router();


// // ======================
// // GOOGLE LOGIN
// // ======================
// googleRouter.get(
//   "/google",

//   passport.authenticate(
//     "google",
//     {
//       scope: [
//         "profile",
//         "email",
//       ],

//       session:
//         false,
//     }
//   )
// );


// // ======================
// // GOOGLE CALLBACK
// // ======================
// googleRouter.get(
//   "/google/callback",

//   passport.authenticate(
//     "google",
//     {
//       session:
//         false,

//       failureRedirect:
//         "/login",
//     }
//   ),

//   googleCallback
// );


// export default
//   googleRouter;