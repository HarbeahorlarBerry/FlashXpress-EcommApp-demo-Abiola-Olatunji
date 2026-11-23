import mongoose from "mongoose";

const searchQuerySchema = new mongoose.Schema({
  q: { type: String, required: true, index: true },
  results: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // auto-delete after 30 days
});

export default mongoose.model("SearchQuery", searchQuerySchema);