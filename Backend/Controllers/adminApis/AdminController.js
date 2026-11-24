// Backend/Controllers/adminApis/AdminController.js
import mongoose from "mongoose";
import User from "../../Models/usersSchema.js";
import Product from "../../Models/productSchema.js";
import Order from "../../Models/orderSchema.js";

const VALID_ROLES = ["user", "seller", "admin", "ultimateadmin"];
const ELEVATED_ROLES = ["admin", "ultimateadmin"];

export const getStats = async (req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [users, sellers, ultimateAdmins, products, paidOrders, revenue, salesByDay, topProducts] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "ultimateadmin" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ paymentStatus: "paid" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ isActive: true }, "name images price soldCount")
        .sort({ soldCount: -1 })
        .limit(5)
        .lean(),
    ]);

  res.json({
    status: "success",
    totals: {
      users,
      sellers,
      ultimateAdmins,
      products,
      paidOrders,
      revenue: revenue[0]?.total || 0,
    },
    salesByDay: salesByDay.map((d) => ({ date: d._id, orders: d.orders, revenue: d.revenue })),
    topProducts,
  });
};

export const listUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const q = String(req.query.q || "").trim();
  const role = String(req.query.role || "").trim();

  const filter = {};
  if (role && VALID_ROLES.includes(role)) {
    filter.role = role;
  }
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { username: new RegExp(safe, "i") },
      { gmail: new RegExp(safe, "i") },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter, "username gmail role provider isVerified createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ status: "success", users, total, page, limit });
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const nextRole = String(req.body.role || "").trim();

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Invalid user ID" });
  }
  if (!VALID_ROLES.includes(nextRole)) {
    return res.status(400).json({ status: "error", message: "Invalid role specified" });
  }

  const target = await User.findById(id).select("username gmail role");
  if (!target) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  if (req.user.role !== "ultimateadmin") {
    if (ELEVATED_ROLES.includes(target.role) || ELEVATED_ROLES.includes(nextRole)) {
      return res.status(403).json({
        status: "error",
        message: "Only an ultimateadmin can modify admin or ultimateadmin roles",
      });
    }
  }

  target.role = nextRole;
  await target.save();

  res.json({
    status: "success",
    message: `Updated ${target.username} role to ${nextRole}`,
    user: {
      id: target._id,
      username: target.username,
      gmail: target.gmail,
      role: target.role,
    },
  });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Invalid user ID" });
  }
  if (String(req.user._id) === String(id)) {
    return res.status(400).json({ status: "error", message: "You cannot delete your own account" });
  }

  const target = await User.findById(id).select("username gmail role");
  if (!target) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  if (req.user.role !== "ultimateadmin" && ELEVATED_ROLES.includes(target.role)) {
    return res.status(403).json({
      status: "error",
      message: "Only an ultimateadmin can delete admin or ultimateadmin accounts",
    });
  }

  await User.deleteOne({ _id: id });
  res.json({ status: "success", message: `Deleted user ${target.username}` });
};