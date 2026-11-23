import jwt from "jsonwebtoken";
import { setAuthCookie } from "../../utils/Cookies.js";

// ======================
// GOOGLE CALLBACK
// ======================
export const googleCallback = async (req, res) => {
  try {
    const token = jwt.sign(
      {
        id: req.user._id,
        role: req.user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );

    // Pass both the response and the generated token to your cookie helper
    setAuthCookie(res, token);

    // Redirect the user to your frontend dashboard/account page
    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Google login failed",
    });
  }
};
  


// import axios from "axios";
// import jwt from "jsonwebtoken";
// import User from "../../Models/usersSchema.js";

// export const googleRedirect = (req, res) => {
//   const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`;

//   res.redirect(url);
// };

// export const googleCallback = async (req, res) => {
//   const { code } = req.query;

//   try {
//     const tokenRes = await axios.post(
//       "https://oauth2.googleapis.com/token",
//       {
//         code,
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         redirect_uri: process.env.GOOGLE_CALLBACK_URL,
//         grant_type: "authorization_code",
//       }
//     );

//     const { id_token } = tokenRes.data;

//     const userInfo = JSON.parse(
//       Buffer.from(id_token.split(".")[1], "base64").toString()
//     );

//     let user = await User.findOne({ gmail: userInfo.email });

//     if (!user) {
//       user = await User.create({
//         username: userInfo.name,
//         gmail: userInfo.email,
//         password: "google-oauth",
//         isVerified: true,
//       });
//     }

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "5h" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "strict",
//     });

//     // 🔥 redirect to frontend
//     res.redirect("http://localhost:5173/dashboard");

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Google login failed" });
//   }
// };