import mongoose from "mongoose";
import Product from "../../Models/productSchema.js";
import Order from "../../Models/orderSchema.js";

// One review per user; re-submitting updates it. Only verified buyers can review.
export const addReview = async (req, res) => {
  const { id } = req.params;
  const rating = Number(req.body.rating);
  const text = String(req.body.review || "").trim();

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: "error", message: "Invalid product id" });
  }
  if (!(rating >= 1 && rating <= 5) || !text) {
    return res.status(400).json({ status: "error", message: "A rating (1-5) and review text are required" });
  }

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ status: "error", message: "Product not found" });

  const purchased = await Order.exists({
    userId: req.user._id,
    paymentStatus: "paid",
    "items.productId": product._id,
  });
  if (!purchased) {
    return res.status(403).json({ status: "error", message: "Only customers who bought this product can review it" });
  }

  const existing = product.reviews.find((r) => String(r.userId) === String(req.user._id));
  if (existing) {
    existing.rating = rating;
    existing.review = text;
  } else {
    product.reviews.push({ userId: req.user._id, rating, review: text });
  }

  product.reviewCount = product.reviews.length;
  product.averageRating =
    Math.round((product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length) * 10) / 10;
  await product.save();

  res.status(existing ? 200 : 201).json({
    status: "success",
    message: existing ? "Review updated" : "Review added",
    averageRating: product.averageRating,
    reviewCount: product.reviewCount,
  });
};