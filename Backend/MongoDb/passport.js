import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../Models/usersSchema.js";

dotenv.config();

const uniqueUsername = async (base) => {
  const clean =
    String(base || "user")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .toLowerCase()
      .slice(0, 20) || "user";
  let candidate = clean.length >= 3 ? clean : `${clean}user`;

  while (await User.exists({ username: candidate })) {
    candidate = `${candidate.slice(0, 22)}${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return candidate;
};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:9000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();
          if (!email) {
            return done(new Error("No email returned from Google"), null);
          }

          let user =
            (await User.findOne({ googleId: profile.id })) ||
            (await User.findOne({ gmail: email }));

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
            }
            user.isVerified = true;
            await user.save();
          } else {
            user = await User.create({
              username: await uniqueUsername(profile.displayName),
              gmail: email,
              googleId: profile.id,
              provider: "google",
              role: "user",
              isVerified: true,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

export default passport;



// import passport from "passport";

// import {
//   Strategy as GoogleStrategy,
// } from "passport-google-oauth20";

// import User from "../Models/usersSchema.js";

// import dotenv from "dotenv";

// dotenv.config();


// passport.use(
//   new GoogleStrategy(
//     {
//       clientID:
//         process.env
//           .GOOGLE_CLIENT_ID,

//       clientSecret:
//         process.env
//           .GOOGLE_CLIENT_SECRET,

//       callbackURL:
//         process.env
//           .GOOGLE_CALLBACK_URL,
//     },

//     async (
//       accessToken,
//       refreshToken,
//       profile,
//       done
//     ) => {
//       try {
//         let user =
//           await User.findOne({
//             googleId:
//               profile.id,
//           });

//         if (!user) {
//           user =
//             await User.create({
//               username:
//                 profile
//                   .displayName,

//               gmail:
//                 profile
//                   .emails[0]
//                   .value,

//               googleId:
//                 profile.id,

//               provider:
//                 "google",

//               isVerified:
//                 true,
//             });
//         }

//         done(
//           null,
//           user
//         );

//       } catch (
//         error
//       ) {
//         done(
//           error,
//           null
//         );
//       }
//     }
//   )
// );


// export default passport;