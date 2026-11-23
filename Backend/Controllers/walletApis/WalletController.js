import mongoose from "mongoose";
import { Wallet, WalletTx } from "../../Models/Walletschema.js";
import { logAction } from "../Helper/logAction.js";

const round2 = (n) => Math.round(n * 100) / 100;
const bad = (res, code, message) => res.status(code).json({ status: "error", message });

// GET /api/wallet?page=
export const getWallet = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 15;
    const [wallet, transactions, total] = await Promise.all([
      Wallet.findOne({ userId: req.user._id }).lean(),
      WalletTx.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      WalletTx.countDocuments({ userId: req.user._id }),
    ]);
    return res.status(200).json({
      status: "success",
      wallet: wallet || { available: 0, pending: 0, totalEarned: 0, totalWithdrawn: 0 },
      transactions, total, page, limit,
      minWithdrawal: Number(process.env.MIN_WITHDRAWAL ?? 10),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wallet/withdraw  { amount, bankName, accountNumber, accountName }
export const requestWithdrawal = async (req, res, next) => {
  try {
    const amount = round2(Number(req.body.amount));
    const { bankName, accountNumber, accountName } = req.body;
    const min = Number(process.env.MIN_WITHDRAWAL ?? 10);

    if (!Number.isFinite(amount) || amount < min) return bad(res, 400, `Minimum withdrawal is ${min}`);
    if (!bankName?.trim() || !accountName?.trim() || !/^\d{6,20}$/.test(String(accountNumber || ""))) {
      return bad(res, 400, "Bank name, account name and a valid account number are required");
    }

    // Atomic hold: only succeeds if the balance is enough, so two requests can't overdraw
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id, available: { $gte: amount } },
      { $inc: { available: -amount } },
      { new: true }
    );
    if (!wallet) return bad(res, 400, "Insufficient available balance");

    const withdrawal = await WalletTx.create({
      userId: req.user._id, type: "withdrawal", status: "requested", amount,
      bank: { bankName: bankName.trim(), accountNumber: String(accountNumber), accountName: accountName.trim() },
    });
    return res.status(201).json({ status: "success", withdrawal, wallet });
  } catch (error) {
    next(error);
  }
};

// GET /api/wallet/admin/withdrawals?status=requested
export const adminListWithdrawals = async (req, res, next) => {
  try {
    const filter = { type: "withdrawal" };
    if (req.query.status) filter.status = req.query.status;
    const withdrawals = await WalletTx.find(filter).sort({ createdAt: -1 }).limit(100).populate("userId", "username gmail").lean();
    return res.status(200).json({ status: "success", withdrawals });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/wallet/admin/withdrawals/:id  { status: "paid" | "rejected", note? }
export const adminResolveWithdrawal = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!["paid", "rejected"].includes(status)) return bad(res, 400, "status must be paid or rejected");
    if (!mongoose.isValidObjectId(req.params.id)) return bad(res, 400, "Invalid id");

    const tx = await WalletTx.findOneAndUpdate(
      { _id: req.params.id, type: "withdrawal", status: "requested" }, // atomic claim: resolves only once
      { status, note: String(note || "").slice(0, 200), resolvedBy: req.user._id },
      { new: true }
    );
    if (!tx) return bad(res, 404, "Withdrawal not found or already resolved");

    if (status === "paid") await Wallet.updateOne({ userId: tx.userId }, { $inc: { totalWithdrawn: tx.amount } });
    else await Wallet.updateOne({ userId: tx.userId }, { $inc: { available: tx.amount } }); // give the held money back

    await logAction(req, "Withdrawal " + status, `${tx.amount} for user ${tx.userId}`);
    return res.status(200).json({ status: "success", withdrawal: tx });
  } catch (error) {
    next(error);
  }
};