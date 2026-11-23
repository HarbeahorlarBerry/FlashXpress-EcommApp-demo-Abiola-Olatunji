import User from "../../Models/usersSchema.js";
import { bad, pickAddress } from "./usersHelpers.js";

// GET /api/users/me/addresses
export const listAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    return res.status(200).json({ status: "success", addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/me/addresses
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.addresses.length >= 10) return bad(res, 400, "You can save up to 10 addresses");

    const makeDefault = req.body.isDefault === true || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({ ...pickAddress(req.body), isDefault: makeDefault });

    await user.save(); // schema validation enforces required fields
    return res.status(201).json({ status: "success", addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me/addresses/:addressId
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return bad(res, 404, "Address not found");

    Object.assign(address, pickAddress(req.body));
    if (req.body.isDefault === true) {
      user.addresses.forEach((a) => (a.isDefault = false));
      address.isDefault = true;
    }

    await user.save();
    return res.status(200).json({ status: "success", addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/me/addresses/:addressId
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return bad(res, 404, "Address not found");

    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;

    await user.save();
    return res.status(200).json({ status: "success", addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};


// import User from "../../Models/usersSchema.js";
// import bcrypt from "bcryptjs";
// import {
//   generateOTP,
//   sendMail,
// } from "../../utils/sendEmail.js";


// // ======================
// // REGISTER USER
// // ======================
// export const createUser =
//   async (req, res) => {
//     try {
//       const {
//         username,
//         gmail,
//         password,
//       } = req.body;

//       // VALIDATION
//       if (
//         !username ||
//         !gmail ||
//         !password
//       ) {
//         return res
//           .status(400)
//           .json({
//             message:
//               "Please provide all fields",
//           });
//       }

//       // CHECK EXISTING USER
//       const existingUser =
//         await User.findOne({
//           gmail,
//         });

//       if (
//         existingUser
//       ) {
//         return res
//           .status(400)
//           .json({
//             message:
//               "User already exists",
//           });
//       }

//       // GENERATE OTP
//       const {
//         otp,
//         otpExpires,
//       } = generateOTP();

//       // HASH PASSWORD
//       const hashedPassword =
//         await bcrypt.hash(
//           password,
//           10
//         );

//       // ASSIGN ROLE
//       let role = "user";

//       if (
//         gmail ===
//           "Flash@gmail.com" ||
//         gmail ===
//           "Berry@gmail.com"
//       ) {
//         role = "admin";
//       }

//       // CREATE USER
//       const newUser =
//         await User.create({
//           username,
//           gmail,
//           password:
//             hashedPassword,
//           role,
//           otp,
//           otpExpires,

//           profile: {
//             country: "",
//             Number: "",
//             Street: "",
//             Bio: "",
//           },
//         });

//       // SEND OTP EMAIL
//       try {
//         await sendMail({
//           mailFrom:
//             process.env
//               .EMAIL_USER,

//           mailTo: gmail,

//           subject:
//             "Account Verification",

//           body: `
//             <h1>Welcome ${username}</h1>
//             <p>Your OTP is:</p>
//             <h2>${otp}</h2>
//           `,
//         });

//       } catch (
//         emailError
//       ) {
//         console.log(
//           "Email error:",
//           emailError.message
//         );
//       }

//       return res
//         .status(201)
//         .json({
//           status:
//             "success",

//           message:
//             "User registered successfully. Check your email for OTP.",

//           user: {
//             id:
//               newUser._id,

//             username:
//               newUser.username,

//             gmail:
//               newUser.gmail,
//           },
//         });

//     } catch (
//       error
//     ) {
//       console.error(
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           message:
//             "Server error",
//         });
//     }
//   };