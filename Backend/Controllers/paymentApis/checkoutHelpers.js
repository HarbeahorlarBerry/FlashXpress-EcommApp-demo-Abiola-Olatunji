import Cart from "../../Models/cartSchema.js";
import Order from "../../Models/orderSchema.js";
import Product from "../../Models/productSchema.js";
import { assessRisk, FRAUD_BLOCK_SCORE } from "../../utils/fraud.js";
import { resolveCharge } from "../../utils/currency.js";
import { creditSellersForOrder } from "../walletApis/walletService.js";

export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

export const restock = async (items) => {
  try {
    await Promise.all(
      items.map((i) => Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } }))
    );
  } catch (error) {
    console.error("Restock failed:", error.message);
  }
};

// Re-read prices from the DB (never trust the cart snapshot) and reserve stock atomically.
export const buildAndReserve = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart?.products?.length) throw httpError(400, "Your cart is empty");

  const items = [];
  try {
    for (const line of cart.products) {
      const qty = Number(line.quantity);
      const product = await Product.findOneAndUpdate(
        { _id: line.productId, isActive: { $ne: false }, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!product) throw httpError(409, "An item is out of stock or no longer available");

      items.push({
        productId: product._id,
        sellerId: product.userId,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity: qty,
        total: Math.round(product.price * qty * 100) / 100,
      });
    }
  } catch (error) {
    await restock(items); // roll back anything already reserved
    throw error;
  }

  const amount = Math.round(items.reduce((s, i) => s + i.total, 0) * 100) / 100;
  return { items, amount };
};

// Atomic pending -> failed/canceled. Only the winner restocks, so it is safe to call twice.
export const releaseOrder = async (orderId, status = "canceled") => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: "pending" },
    { paymentStatus: status, fulfilment: "cancelled" },
    { new: true }
  );
  if (order) await restock(order.items);
  return order;
};

export const cancelUserPendingOrders = async (userId) => {
  const pending = await Order.find({ userId, paymentStatus: "pending" }).select("_id");
  await Promise.all(pending.map((o) => releaseOrder(o._id)));
};

export const releaseStaleOrders = async (minutes = 45) => {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const stale = await Order.find({ paymentStatus: "pending", createdAt: { $lt: cutoff } }).select("_id");
  const released = await Promise.all(stale.map((o) => releaseOrder(o._id)));
  return released.filter(Boolean).length;
};

// Atomic pending -> paid. Idempotent: webhook retries and the redirect verify can both call it.
export const markOrderPaid = async (orderId, patch = {}) => {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, paymentStatus: "pending" },
    { paymentStatus: "paid", ...patch },
    { new: true }
  );
  if (!order) return null;

  await Cart.updateOne({ userId: order.userId }, { $set: { products: [], totalCartPrice: 0 } });
  await Promise.all(
    order.items.map((i) => Product.updateOne({ _id: i.productId }, { $inc: { soldCount: i.quantity } }))
  );
  try {
    await creditSellersForOrder(order);
  } catch (error) {
    console.error("Seller credit failed:", error.message); // payment is already confirmed: never fail it
  }
  return order;
};

// Shared first half of every provider's checkout: validate, reserve stock, risk-check, create the pending order.
export const startCheckout = async (req, currency, { fx = true } = {}) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress || typeof shippingAddress !== "object") {
    throw httpError(400, "Shipping address is required");
  }

  await cancelUserPendingOrders(req.user._id); // retries never double-reserve stock
  const { items, amount } = await buildAndReserve(req.user._id);

  try {
    const risk = await assessRisk({ user: req.user, amount, items, shippingAddress });
    if (risk.score >= FRAUD_BLOCK_SCORE()) {
      throw httpError(403, "We couldn't process this order. Please contact support.");
    }
    const charge = fx
      ? await resolveCharge(amount, req.body.currency)
      : { chargeAmount: amount, chargeCurrency: currency, fxRate: 1 };

    const order = await Order.create({
      userId: req.user._id, items, amount, currency, shippingAddress, risk, ...charge,
    });
    return { order };
  } catch (error) {
    await restock(items); // address validation, risk block, FX or DB failure: give the stock back
    throw error;
  }
};
