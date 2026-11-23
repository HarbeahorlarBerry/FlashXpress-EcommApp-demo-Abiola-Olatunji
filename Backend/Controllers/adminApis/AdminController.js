import User from "../../Models/usersSchema.js";
import Product from "../../Models/productSchema.js";
import Order from "../../Models/orderSchema.js";

export const getStats = async (req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [users, sellers, products, paidOrders, revenue, salesByDay, topProducts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "seller" }),
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
    Product.find({ isActive: true }, "name images price soldCount").sort({ soldCount: -1 }).limit(5).lean(),
  ]);

  res.json({
    status: "success",
    totals: { users, sellers, products, paidOrders, revenue: revenue[0]?.total || 0 },
    salesByDay: salesByDay.map((d) => ({ date: d._id, orders: d.orders, revenue: d.revenue })),
    topProducts,
  });
};