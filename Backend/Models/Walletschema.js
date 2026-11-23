import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    available: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const txSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["sale", "withdrawal"], required: true },
    status: { type: String, enum: ["pending", "completed", "requested", "paid", "rejected"], required: true },
    amount: { type: Number, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    meta: { gross: Number, fee: Number, feePercent: Number },
    bank: { bankName: String, accountNumber: String, accountName: String },
    note: { type: String, default: "" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
txSchema.index({ userId: 1, createdAt: -1 });
txSchema.index({ orderId: 1, type: 1, status: 1 });

// Use mongoose.models to prevent OverwriteModelError if imported twice
export const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
export const WalletTx = mongoose.models.WalletTx || mongoose.model("WalletTx", txSchema);