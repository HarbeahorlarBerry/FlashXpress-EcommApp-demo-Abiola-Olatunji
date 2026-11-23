import { Router } from "express";
import { getWallet, requestWithdrawal, adminListWithdrawals, adminResolveWithdrawal } from "../Controllers/walletApis/WalletController.js";
import { authMiddleware, adminMiddleware, sellerMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.use(authMiddleware);
r.get("/", getWallet);
r.post("/withdraw", sellerMiddleware, requestWithdrawal);
r.get("/admin/withdrawals", adminMiddleware, adminListWithdrawals);
r.patch("/admin/withdrawals/:id", adminMiddleware, adminResolveWithdrawal);
export default r;