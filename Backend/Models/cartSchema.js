import mongoose from "mongoose";

const { Schema, model } = mongoose;

// ======================
// CART ITEM
// ======================

const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  totalItemPrice: {
    type: Number,
    default: 0,
  },
});

// ======================
// CART
// ======================

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // change if your usersSchema exports "User"
      unique: true,
      required: true,
    },

    products: [cartItemSchema],

    totalCartPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = model(
  "Cart",
  cartSchema
);

export default Cart;