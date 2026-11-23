import mongoose from "mongoose";
import Order from "../../Models/orderSchema.js";

const paginate = (q) => {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(q.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

const validId = (id) => mongoose.isValidObjectId(id);

// BUYER: my orders
export const getMyOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { userId: req.user._id, paymentStatus: { $ne: "failed" } };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ status: "success", total, page, limit, orders });
};

// BUYER / SELLER / ADMIN: single order (access-checked)
export const getOrder = async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ status: "error", message: "Invalid order id" });
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ status: "error", message: "Order not found" });
  }

  const uid = String(req.user._id);
  const allowed =
    req.user.role === "admin" ||
    String(order.userId) === uid ||
    order.items.some((i) => String(i.sellerId) === uid);

  if (!allowed) {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }
  res.json({ status: "success", order });
};

// Success page: confirm payment status for the logged-in buyer
export const verifyCheckout = async (req, res) => {
  const order = await Order.findOne({
    stripeSessionId: req.params.sessionId,
    userId: req.user._id,
  });
  if (!order) {
    return res.status(404).json({ status: "error", message: "Order not found" });
  }
  res.json({
    status: "success",
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    amount: order.amount,
  });
};

// SELLER: orders containing my products (only my items are returned)
export const getSellerOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const sellerId = req.user._id;
  const filter = { "items.sellerId": sellerId, paymentStatus: "paid" };

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  const mine = orders.map((o) => ({
    ...o,
    items: o.items.filter((i) => String(i.sellerId) === String(sellerId)),
  }));
  res.json({ status: "success", total, page, limit, orders: mine });
};

// SELLER (own) / ADMIN: update fulfilment
export const updateFulfilment = async (req, res) => {
  const { fulfilment, trackingNumber } = req.body;
  const allowed = ["processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(fulfilment)) {
    return res.status(400).json({ status: "error", message: "Invalid status" });
  }
  if (!validId(req.params.id)) {
    return res.status(400).json({ status: "error", message: "Invalid order id" });
  }

  const order = await Order.findById(req.params.id);
  if (!order || order.paymentStatus !== "paid") {
    return res.status(404).json({ status: "error", message: "Order not found" });
  }

  const owns = order.items.some(
    (i) => String(i.sellerId) === String(req.user._id)
  );
  if (req.user.role !== "admin" && !owns) {
    return res.status(403).json({ status: "error", message: "Access denied" });
  }

  order.fulfilment = fulfilment;
  if (typeof trackingNumber === "string") order.trackingNumber = trackingNumber.trim();
  await order.save();
  res.json({ status: "success", order });
};

// ADMIN: all orders with optional filters
export const getAllOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.fulfilment) filter.fulfilment = req.query.fulfilment;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("userId", "username gmail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ status: "success", total, page, limit, orders });
};