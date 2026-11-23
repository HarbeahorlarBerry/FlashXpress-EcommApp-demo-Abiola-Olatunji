import User from "../../Models/usersSchema.js";
import { SAFE } from "./usersHelpers.js";

// GET /api/users/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(SAFE);
    return res.status(200).json({ status: "success", user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users  (admin) ?page=&limit=&role=&q=
export const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.q) {
      const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ username: rx }, { gmail: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select(SAFE).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({ status: "success", total, page, limit, users });
  } catch (error) {
    next(error);
  }
};

// import User  from "../../Models/usersSchema.js";

// // get all users
// export const getAllUsers = async (req, res) => {    
//     try {
//         const users = await User.find()
//         res.status(200).json(users)
//     } catch (error) {
//         res.status(500).json(error)
//     }
// }

// //getAUser
// export const getAUser = async (req, res) => {
//     const { id } = req.params
//     try {
//         const user = await User.findById(id)
//         res.status(200).json(user)
//     } catch (error) {
//         res.status(500).json(error)
//     }
// }

// //getByqueryParams

// export const getByqueryParams = async (req, res) => {
//     const { name, price, year } = req.query
//     const filter = {}

//     if (username) filter.filterusername = name
//     if (gmail) filter.gmail = price
//     if (gmail) filter.year = year

//     try {
//         const user = await User.find(filter)
//         res.status(200).json(user)
//     } catch (error) {
//         res.status(500).json(error)
//     }
// };