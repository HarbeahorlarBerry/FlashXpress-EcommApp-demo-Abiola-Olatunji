import Order from "../../Models/orderSchema.js";
import Product from "../../Models/productSchema.js";

const DAY = 24 * 60 * 60 * 1000;
const pct = (cur, prev) => (prev ? Math.round(((cur - prev) / prev) * 1000) / 10 : null);

// GET /api/insights  (seller: own business, admin: whole marketplace)
export const getInsights = async (req, res, next) => {
  try {
    const admin = req.user.role === "admin";
    const since30 = new Date(Date.now() - 30 * DAY);
    const since60 = new Date(Date.now() - 60 * DAY);
    const base = [
      { $match: { paymentStatus: "paid", fulfilment: { $ne: "cancelled" }, createdAt: { $gte: since60 } } },
      { $unwind: "$items" },
      ...(admin ? [] : [{ $match: { "items.sellerId": req.user._id } }]),
    ];
    const current = { $match: { createdAt: { $gte: since30 } } };
    const productFilter = { isActive: true, ...(admin ? {} : { userId: req.user._id }) };

    const [windows, categories, topProducts, customers, products] = await Promise.all([
      Order.aggregate([
        ...base,
        { $group: { _id: { $cond: [{ $gte: ["$createdAt", since30] }, "current", "previous"] }, revenue: { $sum: "$items.total" }, units: { $sum: "$items.quantity" }, orders: { $addToSet: "$_id" } } },
        { $project: { revenue: 1, units: 1, orders: { $size: "$orders" } } },
      ]),
      Order.aggregate([
        ...base, current,
        { $lookup: { from: "products", localField: "items.productId", foreignField: "_id", as: "p" } },
        { $unwind: "$p" },
        { $group: { _id: "$p.category", revenue: { $sum: "$items.total" }, units: { $sum: "$items.quantity" } } },
        { $sort: { revenue: -1 } }, { $limit: 6 },
      ]),
      Order.aggregate([
        ...base, current,
        { $group: { _id: "$items.productId", name: { $first: "$items.name" }, revenue: { $sum: "$items.total" }, units: { $sum: "$items.quantity" } } },
        { $sort: { revenue: -1 } }, { $limit: 5 },
      ]),
      Order.aggregate([...base, { $group: { _id: "$userId", orders: { $addToSet: "$_id" } } }, { $project: { n: { $size: "$orders" } } }]),
      Product.find(productFilter, "name stock images averageRating reviewCount").lean(),
    ]);

    const get = (k) => windows.find((w) => w._id === k) || { revenue: 0, units: 0, orders: 0 };
    const cur = get("current"), prev = get("previous");
    const rated = products.filter((p) => p.reviewCount > 0);
    const ratingCount = rated.reduce((s, p) => s + p.reviewCount, 0);

    return res.status(200).json({
      status: "success",
      period: "last 30 days vs the 30 before",
      kpis: {
        revenue: { value: Math.round(cur.revenue * 100) / 100, change: pct(cur.revenue, prev.revenue) },
        orders: { value: cur.orders, change: pct(cur.orders, prev.orders) },
        units: { value: cur.units, change: pct(cur.units, prev.units) },
        avgOrderValue: { value: cur.orders ? Math.round((cur.revenue / cur.orders) * 100) / 100 : 0, change: null },
        repeatCustomerRate: customers.length ? Math.round((customers.filter((c) => c.n >= 2).length / customers.length) * 1000) / 10 : 0,
        avgRating: ratingCount ? Math.round((rated.reduce((s, p) => s + p.averageRating * p.reviewCount, 0) / ratingCount) * 10) / 10 : null,
      },
      categories: categories.map((c) => ({ category: c._id, revenue: Math.round(c.revenue * 100) / 100, units: c.units })),
      topProducts: topProducts.map((p) => ({ _id: p._id, name: p.name, revenue: Math.round(p.revenue * 100) / 100, units: p.units })),
      lowStock: products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5),
      lowestRated: rated.sort((a, b) => a.averageRating - b.averageRating).slice(0, 3),
    });
  } catch (error) {
    next(error);
  }
};