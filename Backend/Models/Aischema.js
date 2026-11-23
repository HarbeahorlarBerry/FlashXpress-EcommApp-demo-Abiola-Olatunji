import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    source: { type: String, enum: ["claude", "rules"] },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One rolling conversation per user (last 40 messages). The SERVER supplies this history to the model,
// so a client can never inject fake "assistant" turns.
const aiChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    messages: [aiMessageSchema],
  },
  { timestamps: true }
);

export default mongoose.model("AiChat", aiChatSchema);