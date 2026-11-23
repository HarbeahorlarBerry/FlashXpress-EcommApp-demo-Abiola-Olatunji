import { Router } from "express";
import { getStats } from "../Controllers/adminApis/AdminController.js";
import { viewLogs } from "../Controllers/logsApis/logsController.js";
import { authMiddleware, adminMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.use(authMiddleware, adminMiddleware);
r.get("/stats", getStats);
r.get("/logs", viewLogs);
export default r;