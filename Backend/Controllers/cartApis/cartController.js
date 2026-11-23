import mongoose from "mongoose";
import Cart from "../../Models/cartSchema.js";
import Product from "../../Models/productSchema.js";

const round = (n) => Math.round(n * 100) / 100;
const bad = (res, code, message) => res.status(code).json({ status: "error", message });

const recalc = (cart) => {
  cart.products.forEach((i) => (i.totalItemPrice = round(i.price * i.quantity)));
  cart.totalCartPrice = round(cart.products.reduce((s, i) => s + i.totalItemPrice, 0));
};

const send = async (res, cart) => {
  recalc(cart);
  await cart.save();
  await cart.populate("products.productId", "name images price stock isActive userId");
  res.json({ status: "success", cart });
};

const loadCart = async (userId) =>
  (await Cart.findOne({ userId })) || new Cart({ userId, products: [] });

// GET: re-syncs prices/stock with the catalog; empty cart is a normal 200, not an error
export const getCart = async (req, res) => {
  const cart = await loadCart(req.user._id);
  const products = await Product.find({ _id: { $in: cart.products.map((i) => i.productId) } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  cart.products = cart.products.filter((line) => {
    const p = byId.get(String(line.productId));
    if (!p || !p.isActive || p.stock < 1) return false;
    line.price = p.price;
    line.quantity = Math.min(line.quantity, p.stock);
    return true;
  });
  await send(res, cart);
};

export const addItem = async (req, res) => {
  const { productId } = req.params;
  const qty = Math.max(1, Math.floor(Number(req.body?.quantity) || 1));
  if (!mongoose.isValidObjectId(productId)) return bad(res, 400, "Invalid product id");

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return bad(res, 404, "Product not found");
  if (String(product.userId) === String(req.user._id)) return bad(res, 400, "You cannot buy your own product");

  const cart = await loadCart(req.user._id);
  const line = cart.products.find((i) => String(i.productId) === productId);
  const newQty = (line?.quantity || 0) + qty;
  if (newQty > product.stock) return bad(res, 409, `Only ${product.stock} left in stock`);

  if (line) {
    line.quantity = newQty;
    line.price = product.price;
  } else {
    cart.products.push({ productId, quantity: qty, price: product.price });
  }
  await send(res, cart);
};

export const updateItem = async (req, res) => {
  const { productId } = req.params;
  const qty = Math.floor(Number(req.body?.quantity));
  if (!mongoose.isValidObjectId(productId)) return bad(res, 400, "Invalid product id");
  if (Number.isNaN(qty) || qty < 0) return bad(res, 400, "quantity must be 0 or more");

  const cart = await loadCart(req.user._id);
  const line = cart.products.find((i) => String(i.productId) === productId);
  if (!line) return bad(res, 404, "Item not in cart");

  if (qty === 0) {
    cart.products = cart.products.filter((i) => String(i.productId) !== productId);
  } else {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return bad(res, 404, "Product no longer available");
    if (qty > product.stock) return bad(res, 409, `Only ${product.stock} left in stock`);
    line.quantity = qty;
    line.price = product.price;
  }
  await send(res, cart);
};

export const removeItem = async (req, res) => {
  const cart = await loadCart(req.user._id);
  cart.products = cart.products.filter((i) => String(i.productId) !== req.params.productId);
  await send(res, cart);
};

export const clearCart = async (req, res) => {
  const cart = await loadCart(req.user._id);
  cart.products = [];
  await send(res, cart);
};

// import Cart from "../../Models/cartSchema.js";
// import Product from "../../Models/productSchema.js";

// // CREATE Cart Item
// export const createCartItem = async (req, res) => {
//   const { productId } = req.params;
//   const userid = req.user._id;

//   try {
//     // 1. Confirm product exists
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(400).json({ message: "Product not found" });
//     }

//     // 2. Find user's cart
//     let cart = await Cart.findOne({ userId: userid });

//     if (!cart) {
//       // 3. Create new cart
//       cart = new Cart({
//         userId: userid,
//         products: [
//           {
//             productId: product.id,
//             quantity: 1,
//             price: product.price,
//           },
//         ],
//       });
//     } else {
//       // 4. Check if product already exists in cart
//       const existingCartItem = cart.products.find(
//         (item) => item.productId.toString() === productId
//       );

//       if (existingCartItem) {
//         existingCartItem.quantity += 1;
//       } else {
//         cart.products.push({
//           productId: productId,
//           quantity: 1,
//           price: product.price,
//         });
//       }
//     }

//     // update totalItemPrice of each product
//     cart.products.forEach((item) => {
//       item.totalItemPrice = item.price * item.quantity;
//     });

//     // update the totalCartPrice
//     cart.totalCartPrice = cart.products.reduce(
//       (sum, item) => sum + item.totalItemPrice,
//       0
//     );

//     // save cart
//     await cart.save();
//     await cart.populate(`products.productId`);
//     return res.status(200).json({ message: "Item added to cart", cart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // UPDATE CART ITEM
// export const editCartItem = async (req, res) => {
//   const { productId, type } = req.body;

//   if (!productId || !type) {
//     return res.status(400).json({
//       message: "Please provide all fields",
//     });
//   }

//   try {
//     const cart = await Cart.findOne({
//       userId: req.user._id,
//     });

//     if (!cart) {
//       return res.status(404).json({
//         message: "Cart not found",
//       });
//     }

//     const existingCartItem =
//       cart.products.find(
//         item =>
//           item.productId.toString() === productId
//       );

//     if (!existingCartItem) {
//       return res.status(404).json({
//         message: "Item not found in cart",
//       });
//     }

//     const product =
//       await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     if (type === "increase") {
//       if (
//         existingCartItem.quantity >=
//         product.stock
//       ) {
//         return res.status(400).json({
//           message:
//             "Maximum stock reached",
//         });
//       }

//       existingCartItem.quantity += 1;
//     }

//     else if (type === "decrease") {
//       if (
//         existingCartItem.quantity > 1
//       ) {
//         existingCartItem.quantity -= 1;
//       } else {
//         cart.products =
//           cart.products.filter(
//             item =>
//               item.productId.toString() !==
//               productId
//           );
//       }
//     }

//     else {
//       return res.status(400).json({
//         message:
//           "Type must be increase or decrease",
//       });
//     }

//     cart.products.forEach(item => {
//       item.totalItemPrice =
//         item.price * item.quantity;
//     });

//     cart.totalCartPrice =
//       cart.products.reduce(
//         (sum, item) =>
//           sum + item.totalItemPrice,
//         0
//       );

//     await cart.save();

//     await cart.populate(
//       "products.productId"
//     );

//     return res.status(200).json({
//       status: "success",
//       cart,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// // GET CART ITEMS
// export const getCartItems = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user._id }).populate(
//       "products.productId"
//     );
//     if (!cart) {
//       return res.status(400).json({ message: "Cart not found" });
//     }
//     res.status(200).json(cart);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// // DELETE CART ITEMS
// export const deleteCartItems = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(400).json({ message: "Cart not found" });
//     }
//     cart.products = [];
//     cart.totalCartPrice = 0;
//     await cart.save();
//     res.status(200).json({ message: "Cart deleted successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };
