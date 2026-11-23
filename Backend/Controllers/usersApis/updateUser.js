import mongoose from "mongoose";
import User from "../../Models/usersSchema.js";
import { logAction } from "../Helper/logAction.js";
import { SAFE, bad } from "./usersHelpers.js";

// PATCH /api/users/me  (whitelisted fields only)
export const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { username, country, phone, bio } = req.body;

    if (username !== undefined) {
      const name = String(username).trim();
      if (name.length < 3 || name.length > 30) {
        return bad(res, 400, "Username must be 3-30 characters");
      }
      if (name !== user.username && (await User.exists({ username: name }))) {
        return bad(res, 409, "Username already taken");
      }
      user.username = name;
    }
    if (country !== undefined) user.profile.country = String(country).trim();
    if (phone !== undefined) user.profile.phone = String(phone).trim();
    if (bio !== undefined) user.profile.bio = String(bio).trim().slice(0, 300);

    await user.save();
    return res.status(200).json({ status: "success", message: "Profile updated" });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/become-seller
export const becomeSeller = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return bad(res, 400, "Your account is already a seller or admin");
    }
    await User.updateOne({ _id: req.user._id }, { role: "seller" });
    return res
      .status(200)
      .json({ status: "success", message: "You can now sell on the marketplace", role: "seller" });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/role  (admin)
export const setRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "seller", "admin"].includes(role)) return bad(res, 400, "Invalid role");
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, 400, "Invalid user id");
    if (String(req.params.id) === String(req.user._id)) {
      return bad(res, 400, "You cannot change your own role");
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(SAFE);
    if (!user) return bad(res, 404, "User not found");

    await logAction(req, "Role Changed", `${user.username} -> ${role}`);
    return res.status(200).json({ status: "success", user });
  } catch (error) {
    next(error);
  }
};

// import  User  from "../../Models/usersSchema.js";

// // edit user
// export const editUser = async (req, res) => {
//     const { id } = req.params
//     const reqId = req.user._id
//     const { username, gmail, password } = req.body
//     if (id === reqId) {
//         try {
//             await User.findByIdAndUpdate(id, req.body, { new: true })
//             res.status(200).json({mess: 'User updated successfully'})
//         } catch (error) {
//             res.status(500).json(error)
//         }
//     } else {
//       return res.status(401).json({ message: "You are not authorized to edit this user" })
//     }
   
// }
// export const editProfile = async (req, res) => {
//     const { id } = req.params
//     const reqId = req.user._id
//     const { country, Number, Street, Bio } = req.body
//     if (id === reqId) {
//         try {
//             await User.findByIdAndUpdate(id, {
//                 $set: {
//                     'profile.country': country,
//                     'profile.Number': Number,
//                     'profile.Street': Street,
//                     'profile.Bio': Bio
//                 }
//             }, { new: true })
//             res.status(200).json({mess: 'User updated successfully'})
//         } catch (error) {
//             res.status(500).json(error)
//         }
//     } else {
//       return res.status(401).json({ message: "You are not authorized to edit this user" })
//     }
   
// };