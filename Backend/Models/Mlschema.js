import mongoose from "mongoose";

// Cached results of the heavy ML aggregations (forecast per seller / platform, RFM segments).
// Also keeps a short history of past forecasts. Snapshots delete themselves after 7 days.
const mlSnapshotSchema = new mongoose.Schema({
  kind: { type: String, enum: ["forecast", "segments"], required: true },
  scope: { type: String, required: true }, // "platform" or a seller's user id
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  generatedAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});
mlSnapshotSchema.index({ kind: 1, scope: 1, generatedAt: -1 });

export default mongoose.model("MlSnapshot", mlSnapshotSchema);