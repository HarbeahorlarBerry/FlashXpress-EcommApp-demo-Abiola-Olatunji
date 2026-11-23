import mongoose from "mongoose";
import Wishlist from "../../Models/Wishlistschema.js";
import Product from "../../Models/productSchema.js";

export const getWishlist = async (req, res) => {
  const list = await Wishlist.findOne({ userId: req.user._id }).populate({
    path: "products",
    match: { isActive: true },
    select: "-reviews",
  });
  res.json({ status: "success", products: list?.products || [] });
};

// Toggle: adds if absent, removes if present
export const toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
    return res.status(404).json({ status: "error", message: "Product not found" });
  }

  const list = await Wishlist.findOneAndUpdate(
    { userId: req.user._id },
    { $setOnInsert: { userId: req.user._id } },
    { upsert: true, new: true }
  );

  const has = list.products.some((p) => String(p) === productId);
  if (has) list.products.pull(productId);
  else list.products.push(productId);
  await list.save();

  res.json({ status: "success", wishlisted: !has, count: list.products.length });
};