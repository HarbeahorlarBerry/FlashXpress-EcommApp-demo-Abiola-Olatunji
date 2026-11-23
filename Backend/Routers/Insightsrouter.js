import { Router } from "express";
import { getInsights } from "../Controllers/insightsApis/Insightscontroller.js";
import { authMiddleware, sellerMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.get("/", authMiddleware, sellerMiddleware, getInsights);
export default r;