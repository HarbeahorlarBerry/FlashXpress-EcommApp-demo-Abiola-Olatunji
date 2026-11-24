// Backend/Routers/AdminRouter.js
import { Router } from "express";
import {
  getStats,
  listUsers,
  updateUserRole,
  deleteUser,
} from "../Controllers/adminApis/AdminController.js";
import { viewLogs } from "../Controllers/logsApis/logsController.js";
import { authMiddleware, adminMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.use(authMiddleware, adminMiddleware);
r.get("/stats", getStats);
r.get("/users", listUsers);
r.patch("/users/:id/role", updateUserRole);
r.delete("/users/:id", deleteUser);
r.get("/logs", viewLogs);
export default r;