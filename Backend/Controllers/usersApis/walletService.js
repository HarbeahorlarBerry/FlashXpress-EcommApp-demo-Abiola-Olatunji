import { Wallet, WalletTx } from "../../Models/walletSchema.js";
import Order from "../../Models/orderSchema.js";

const feePercent = () => Math.min(Math.max(Number(process.env.PLATFORM_FEE_PERCENT ?? 10), 0), 90);
const round2 = (n) => Math.round(n * 100) / 100;

// Called once when an order becomes paid: each seller's net earnings go to their PENDING balance.
export const creditSellersForOrder = async (order) => {
  const bySeller = new Map();
  for (const i of order.items) {
    const k = String(i.sellerId);
    bySeller.set(k, (bySeller.get(k) || 0) + i.total);
  }
  const pct = feePercent();
  for (const [sellerId, gross] of bySeller) {
    const fee = round2((gross * pct) / 100);
    const net = round2(gross - fee);
    await Wallet.updateOne({ userId: sellerId }, { $inc: { pending: net, totalEarned: net } }, { upsert: true });
    await WalletTx.create({
      userId: sellerId, type: "sale", status: "pending", amount: net, orderId: order._id,
      meta: { gross: round2(gross), fee, feePercent: pct },
    });
  }
};

// Pending -> withdrawable for every seller on the order. Each transaction is claimed atomically,
// so calling this twice (buyer confirms AND the timer fires) can never pay out twice.
export const releaseOrderEarnings = async (orderId) => {
  const txs = await WalletTx.find({ orderId, type: "sale", status: "pending" });
  for (const tx of txs) {
    const claimed = await WalletTx.findOneAndUpdate({ _id: tx._id, status: "pending" }, { status: "completed" });
    if (!claimed) continue;
    await Wallet.updateOne({ userId: tx.userId }, { $inc: { pending: -tx.amount, available: tx.amount } });
  }
};

// Fraud clawback: pending earnings of a blocked order disappear instead of becoming withdrawable.
export const voidOrderEarnings = async (orderId, note = "Order blocked after fraud review") => {
  const txs = await WalletTx.find({ orderId, type: "sale", status: "pending" });
  for (const tx of txs) {
    const claimed = await WalletTx.findOneAndUpdate({ _id: tx._id, status: "pending" }, { status: "rejected", note });
    if (!claimed) continue;
    await Wallet.updateOne({ userId: tx.userId }, { $inc: { pending: -tx.amount, totalEarned: -tx.amount } });
  }
};

// Safety net run by the cron job: if the buyer never confirms, release `holdDays` after delivery.
export const releaseDueEarnings = async (holdDays = 3) => {
  const orderIds = await WalletTx.distinct("orderId", { type: "sale", status: "pending" });
  if (!orderIds.length) return 0;
  const cutoff = new Date(Date.now() - holdDays * 24 * 60 * 60 * 1000);
  const due = await Order.find({
    _id: { $in: orderIds }, fulfilment: "delivered", deliveredAt: { $lte: cutoff }, "risk.review": { $ne: "blocked" },
  }).select("_id");
  for (const o of due) await releaseOrderEarnings(o._id);
  return due.length;
};
