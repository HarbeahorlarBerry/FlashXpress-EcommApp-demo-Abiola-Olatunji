import mongoose from "mongoose";
import User from "../../Models/usersSchema.js";
import Product from "../../Models/productSchema.js";
import { Conversation, Message } from "../../Models/Chatschema.js";
import { getIO } from "../../core/socket.js";

const bad = (res, code, message) => res.status(code).json({ status: "error", message });
const validId = (id) => mongoose.isValidObjectId(id);

const loadMine = async (id, userId) => {
  if (!validId(id)) return null;
  const c = await Conversation.findById(id);
  if (!c) return null;
  const me = String(userId);
  return String(c.buyerId) === me || String(c.sellerId) === me ? c : null;
};

// POST /api/chat/conversations  { sellerId, productId? }  (buyers start; returns existing if any)
export const startConversation = async (req, res, next) => {
  try {
    const { sellerId, productId } = req.body;
    if (!validId(sellerId)) return bad(res, 400, "Invalid seller");
    if (String(sellerId) === String(req.user._id)) return bad(res, 400, "You cannot message yourself");

    const seller = await User.findById(sellerId).select("role");
    if (!seller || !["seller", "admin"].includes(seller.role)) return bad(res, 404, "Seller not found");

    let pid = null;
    if (productId) {
      if (!validId(productId) || !(await Product.exists({ _id: productId, userId: sellerId }))) {
        return bad(res, 404, "Product not found for this seller");
      }
      pid = productId;
    }

    const conversation = await Conversation.findOneAndUpdate(
      { buyerId: req.user._id, sellerId, productId: pid },
      { $setOnInsert: { buyerId: req.user._id, sellerId, productId: pid } },
      { upsert: true, new: true }
    );
    return res.status(200).json({ status: "success", conversation });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/conversations
export const listConversations = async (req, res, next) => {
  try {
    const me = String(req.user._id);
    const rows = await Conversation.find({ $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }] })
      .sort({ lastMessageAt: -1 }).limit(100)
      .populate("buyerId", "username").populate("sellerId", "username").populate("productId", "name images")
      .lean();

    const conversations = rows.map((c) => {
      const iAmBuyer = String(c.buyerId._id) === me;
      return {
        _id: c._id,
        other: iAmBuyer ? c.sellerId : c.buyerId,
        product: c.productId,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unread: iAmBuyer ? c.unreadBuyer : c.unreadSeller,
      };
    });
    return res.status(200).json({ status: "success", conversations });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/conversations/:id/messages  (also marks them read for me)
export const getMessages = async (req, res, next) => {
  try {
    const c = await loadMine(req.params.id, req.user._id);
    if (!c) return bad(res, 404, "Conversation not found");

    const messages = await Message.find({ conversationId: c._id }).sort({ createdAt: -1 }).limit(100).lean();
    const field = String(c.buyerId) === String(req.user._id) ? "unreadBuyer" : "unreadSeller";
    if (c[field]) await Conversation.updateOne({ _id: c._id }, { [field]: 0 });

    return res.status(200).json({ status: "success", messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/conversations/:id/messages  { text }
export const sendMessage = async (req, res, next) => {
  try {
    const c = await loadMine(req.params.id, req.user._id);
    if (!c) return bad(res, 404, "Conversation not found");

    const text = String(req.body.text || "").trim();
    if (!text || text.length > 1000) return bad(res, 400, "Message must be 1-1000 characters");

    const message = await Message.create({ conversationId: c._id, senderId: req.user._id, text });
    const iAmBuyer = String(c.buyerId) === String(req.user._id);
    await Conversation.updateOne(
      { _id: c._id },
      { lastMessage: text.slice(0, 120), lastMessageAt: new Date(), $inc: { [iAmBuyer ? "unreadSeller" : "unreadBuyer"]: 1 } }
    );

    const otherId = String(iAmBuyer ? c.sellerId : c.buyerId);
    getIO()?.to(`user:${otherId}`).emit("chat:message", { conversationId: String(c._id), message });

    return res.status(201).json({ status: "success", message });
  } catch (error) {
    next(error);
  }
};