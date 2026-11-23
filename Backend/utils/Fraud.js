import Order from "../Models/orderSchema.js";

const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
export const FRAUD_BLOCK_SCORE = () => num(process.env.FRAUD_BLOCK_SCORE, 90);

// Transparent rule-based scoring (0-100). Every point is explained in `reasons`.
export const assessRisk = async ({ user, amount, items, shippingAddress }) => {
  const reasons = [];
  let score = 0;
  const add = (pts, why) => {
    score += pts;
    reasons.push(why);
  };

  const now = Date.now();
  const since = (m) => new Date(now - m * 60000);
  const [recent15, badLastHour] = await Promise.all([
    Order.countDocuments({ userId: user._id, createdAt: { $gte: since(15) } }),
    Order.countDocuments({ userId: user._id, paymentStatus: { $in: ["failed", "canceled"] }, createdAt: { $gte: since(60) } }),
  ]);

  if (now - new Date(user.createdAt).getTime() < 10 * 60000) add(15, "Account created in the last 10 minutes");
  if (recent15 >= 5) add(50, `${recent15} orders started in 15 minutes`);
  else if (recent15 >= 3) add(30, `${recent15} orders started in 15 minutes`);
  if (badLastHour >= 3) add(25, "Repeated failed or canceled payments");

  const high = num(process.env.FRAUD_HIGH_VALUE, 1000);
  if (amount > high * 5) add(35, "Very high order value");
  else if (amount > high) add(20, "High order value");

  if (items.some((i) => i.quantity >= 10)) add(10, "Bulk quantity of a single item");
  if (String(shippingAddress?.phone || "").replace(/\D/g, "").length < 7) add(10, "Phone number looks invalid");

  const profileCountry = (user.profile?.country || "").trim().toLowerCase();
  const shipCountry = (shippingAddress?.country || "").trim().toLowerCase();
  if (profileCountry && shipCountry && profileCountry !== shipCountry) add(10, "Shipping country differs from profile country");

  score = Math.min(100, score);
  return { score, level: score >= 60 ? "high" : score >= 30 ? "medium" : "low", reasons, review: "none" };
};