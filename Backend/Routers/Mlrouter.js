import { Router } from "express";
import { getPredictions, getSegments } from "../Controllers/mlApis/Mlcontroller.js";
import { authMiddleware, adminMiddleware, sellerMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.use(authMiddleware);
r.get("/predictions", sellerMiddleware, getPredictions);
r.get("/segments", adminMiddleware, getSegments);
export default r;