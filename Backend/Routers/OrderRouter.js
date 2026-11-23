import { Router } from "express";
import {
  getMyOrders,
  getOrder,
  verifyCheckout,
  getSellerOrders,
  updateFulfilment,
  getAllOrders,
} from "../Controllers/orderApis/Ordercontroller.js";
import {
  authMiddleware,
  adminMiddleware,
  sellerMiddleware,
} from "../Middlewares/authMiddleware.js";

const orderRouter = Router();

// Buyer
orderRouter.get("/mine", authMiddleware, getMyOrders);
orderRouter.get("/verify/:sessionId", authMiddleware, verifyCheckout);

// Seller
orderRouter.get("/seller", authMiddleware, sellerMiddleware, getSellerOrders);

// Admin
orderRouter.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);

// Shared (access checked inside controller) - keep after the static routes
orderRouter.get("/:id", authMiddleware, getOrder);
orderRouter.patch("/:id/fulfilment", authMiddleware, sellerMiddleware, updateFulfilment);

export default orderRouter;