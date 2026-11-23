import { Router } from "express";
import { getWishlist, toggleWishlist } from "../Controllers/wishlistApis/WishlistController.js";
import { authMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.get("/", authMiddleware, getWishlist);
r.post("/toggle/:productId", authMiddleware, toggleWishlist);
export default r;