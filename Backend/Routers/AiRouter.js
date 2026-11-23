import { Router } from "express";
import { getRecommendations, assistant, getAssistantHistory, clearAssistantHistory } from "../Controllers/aiApis/Aicontroller.js";
import { search } from "../Controllers/searchApis/Searchcontroller.js";
import { authMiddleware, optionalAuth } from "../Middlewares/authMiddleware.js";

const r = Router();
r.get("/recommendations", optionalAuth, getRecommendations);
r.get("/search", search); // semantic (synonym + typo aware) search, same engine as /api/search
r.post("/assistant", optionalAuth, assistant);
r.get("/history", authMiddleware, getAssistantHistory);
r.delete("/history", authMiddleware, clearAssistantHistory);
export default r;