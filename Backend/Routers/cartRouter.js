import { Router } from "express";
import { getCart, addItem, updateItem, removeItem, clearCart } from "../Controllers/cartApis/cartController.js";
import { authMiddleware } from "../Middlewares/authMiddleware.js";

const r = Router();
r.use(authMiddleware);
r.get("/", getCart);
r.delete("/", clearCart);
r.post("/items/:productId", addItem); // body: { quantity? }
r.put("/items/:productId", updateItem); // body: { quantity }  (0 removes)
r.delete("/items/:productId", removeItem);
export default r;


// import { Router } from "express";

// import {
//   createCartItem,
//   getCartItems,
//   editCartItem,
//   deleteCartItems,
// } from "../Controllers/cartApis/cartController.js";

// import {
//   authMiddleware,
// } from "../Middlewares/authMiddleware.js";

// const cartRouter = Router();

// // ======================
// // CREATE CART ITEM
// // ======================

// cartRouter.post(
//   "/create/:productId",
//   authMiddleware,
//   createCartItem
// );

// // ======================
// // GET CART
// // ======================

// cartRouter.get(
//   "/",
//   authMiddleware,
//   getCartItems
// );

// // ======================
// // UPDATE CART ITEM
// // ======================

// cartRouter.put(
//   "/update",
//   authMiddleware,
//   editCartItem
// );

// // ======================
// // CLEAR CART
// // ======================

// cartRouter.delete(
//   "/delete",
//   authMiddleware,
//   deleteCartItems
// );

// export default cartRouter;