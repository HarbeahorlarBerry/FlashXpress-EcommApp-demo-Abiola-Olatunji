import { Router } from "express";
import { startConversation, listConversations, getMessages, sendMessage } from "../Controllers/chatApis/Chatcontroller.js";
import { authMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.use(authMiddleware);
r.get("/conversations", listConversations);
r.post("/conversations", startConversation);
r.get("/conversations/:id/messages", getMessages);
r.post("/conversations/:id/messages", sendMessage);
export default r;