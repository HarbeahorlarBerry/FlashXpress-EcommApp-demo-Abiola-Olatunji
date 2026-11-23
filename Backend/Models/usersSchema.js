import { Schema, model } from "mongoose";

const addressSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, default: "", trim: true },
  postalCode: { type: String, default: "", trim: true },
  country: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
});

const usersSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    gmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },

    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
    appleId: { type: String, unique: true, sparse: true },
    xId: { type: String, unique: true, sparse: true },
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "apple", "x"],
      default: "local",
    },

    profile: {
      country: { type: String, default: "" },
      phone: { type: String, default: "" },
      bio: { type: String, default: "", maxlength: 300 },
    },
    addresses: [addressSchema],

    otp: String,
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: Date,
    isVerified: { type: Boolean, default: false },

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

export default model("User", usersSchema);



// import { Schema, model } from "mongoose";

// const usersSchema = new Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     gmail: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     password: {
//       type: String,
//       required: false, // Google users may not have password
//     },

//     role: {
//       type: String,
//       enum: ["user", "admin", "seller"],
//       default: "user",
//     },

//     // ✅ Google auth support
//     googleId: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },

//     provider: {
//       type: String,
//       enum: ["local", "google"],
//       default: "local",
//     },

//     profile: {
//       country: {
//         type: String,
//         default: "",
//       },
//       Number: {
//         type: Number,
//         default: "",
//       },
//       Street: {
//         type: String,
//         default: "", // Fixed typo here (ddefault -> default)
//       },
//       Bio: {
//         type: String,
//         default: "",
//       },
//     },

//     otp: String,
//     otpExpires: Date,

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },

//     lastOtpSentAt: Date,
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//   },
//   { timestamps: true }
// );

// const User = model("User", usersSchema);

// export default User;