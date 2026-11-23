import Order from "../../Models/orderSchema.js";
import Product from "../../Models/productSchema.js";
import { linearRegression, predictAt, quintileScores } from "../../utils/Mlmath.js";

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (d) => d.toISOString().slice(0, 10); // UTC, matches Mongo's $dateToString

// GET /api/ml/predictions  (seller: own sales, admin: marketplace)
// 7-day revenue forecast via linear regression on the last 30 days + stock-out risk from sales velocity.
export const getPredictions = async (req, res, next) => {
  try {
    const admin = req.user.role === "admin";
    const mine = admin ? [] : [{ $match: { "items.sellerId": req.user._id } }];

    const [daily, velocity] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid", fulfilment: { $ne: "cancelled" }, createdAt: { $gte: new Date(Date.now() - 30 * DAY) } } },
        { $unwind: "$items" }, ...mine,
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$items.total" }, units: { $sum: "$items.quantity" } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid", fulfilment: { $ne: "cancelled" }, createdAt: { $gte: new Date(Date.now() - 14 * DAY) } } },
        { $unwind: "$items" }, ...mine,
        { $group: { _id: "$items.productId", units: { $sum: "$items.quantity" } } },
      ]),
    ]);

    const byDay = new Map(daily.map((d) => [d._id, d]));
    const history = Array.from({ length: 30 }, (_, i) => {
      const date = dayKey(new Date(Date.now() - (29 - i) * DAY));
      return { date, revenue: byDay.get(date)?.revenue || 0, units: byDay.get(date)?.units || 0 };
    });

    const model = linearRegression(history.map((h) => h.revenue));
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: dayKey(new Date(Date.now() + (i + 1) * DAY)),
      revenue: Math.max(0, Math.round(predictAt(model, 30 + i) * 100) / 100),
    }));

    const half = (arr) => arr.reduce((s, h) => s + h.revenue, 0);
    const recent = half(history.slice(15)), earlier = half(history.slice(0, 15));
    const trend = earlier === 0 ? (recent > 0 ? "up" : "flat") : recent > earlier * 1.05 ? "up" : recent < earlier * 0.95 ? "down" : "flat";

    const products = await Product.find({ _id: { $in: velocity.map((v) => v._id) }, isActive: true }, "name stock images").lean();
    const stockRisk = products
      .map((p) => {
        const perDay = (velocity.find((v) => String(v._id) === String(p._id))?.units || 0) / 14;
        return { _id: p._id, name: p.name, image: p.images?.[0] || "", stock: p.stock, unitsPerDay: Math.round(perDay * 100) / 100, daysLeft: perDay ? Math.round((p.stock / perDay) * 10) / 10 : null };
      })
      .filter((p) => p.daysLeft !== null && p.daysLeft < 14)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);

    return res.status(200).json({
      status: "success",
      history, forecast, trend, stockRisk,
      model: { type: "linear-regression", slope: Math.round(model.slope * 100) / 100, r2: Math.round(model.r2 * 100) / 100, trainedOnDays: 30 },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ml/segments  (admin) RFM customer segmentation
export const getSegments = async (req, res, next) => {
  try {
    const rows = await Order.aggregate([
      { $match: { paymentStatus: "paid", fulfilment: { $ne: "cancelled" } } },
      { $group: { _id: "$userId", orders: { $sum: 1 }, spent: { $sum: "$amount" }, last: { $max: "$createdAt" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
      { $unwind: "$u" },
      { $project: { orders: 1, spent: 1, last: 1, username: "$u.username", gmail: "$u.gmail" } },
    ]);

    if (!rows.length) return res.status(200).json({ status: "success", totalCustomers: 0, segments: [] });

    const R = quintileScores(rows.map((r) => (Date.now() - new Date(r.last)) / DAY), false);
    const F = quintileScores(rows.map((r) => r.orders));
    const M = quintileScores(rows.map((r) => r.spent));

    const name = (r, f, m) => {
      if (r >= 4 && f >= 4 && m >= 4) return "Champions";
      if (r >= 3 && f >= 3) return "Loyal";
      if (r >= 4 && f <= 2) return "New / Promising";
      if (r <= 2 && f >= 3) return "At risk";
      if (r <= 2 && f <= 2) return "Hibernating";
      return "Potential";
    };

    const groups = new Map();
    rows.forEach((row, i) => {
      const seg = name(R[i], F[i], M[i]);
      const g = groups.get(seg) || { name: seg, count: 0, revenue: 0, customers: [] };
      g.count += 1;
      g.revenue += row.spent;
      g.customers.push({ username: row.username, gmail: row.gmail, orders: row.orders, spent: row.spent, lastOrderAt: row.last });
      groups.set(seg, g);
    });

    const segments = [...groups.values()]
      .map((g) => ({ ...g, revenue: Math.round(g.revenue * 100) / 100, customers: g.customers.sort((a, b) => b.spent - a.spent).slice(0, 5) }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.status(200).json({ status: "success", totalCustomers: rows.length, segments });
  } catch (error) {
    next(error);
  }
};