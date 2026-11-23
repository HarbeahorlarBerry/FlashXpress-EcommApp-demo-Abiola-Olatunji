import { Wallet, WalletTx } from "../../Models/walletSchema.js";

const feePercent = () => Math.min(Math.max(Number(process.env.PLATFORM_FEE_PERCENT ?? 10), 0), 90);
const round2 = (n) => Math.round(n * 100) / 100;

// Called once when an order becomes paid: each seller's net earnings go to their pending balance.
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

// Delivered -> the acting seller's pending earnings become withdrawable (admins release everyone's).
export const releaseSellerEarnings = async (order, actor) => {
  const filter = { orderId: order._id, type: "sale", status: "pending" };
  if (actor.role !== "admin") filter.userId = actor._id;

  const txs = await WalletTx.find(filter);
  for (const tx of txs) {
    const claimed = await WalletTx.findOneAndUpdate({ _id: tx._id, status: "pending" }, { status: "completed" });
    if (!claimed) continue; // someone else released it first
    await Wallet.updateOne({ userId: tx.userId }, { $inc: { pending: -tx.amount, available: tx.amount } });
  }
};