import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 }, // snapshot, major units
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
});

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled", "refunded"],
      default: "pending",
      index: true,
    },
    fulfilment: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    trackingNumber: { type: String, default: "" },

    stripeSessionId: { type: String, unique: true, sparse: true },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}${rand}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);



// import mongoose from "mongoose";

// const orderItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true,
//   },

//   name: {
//     type: String,
//     required: true,
//   },

//   price: {
//     type: Number,
//     required: true,
//   },

//   quantity: {
//     type: Number,
//     required: true,
//   },

//   total: {
//     type: Number,
//     required: true,
//   },
// });

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", // use your actual user model name
//       required: true,
//     },

//     items: [orderItemSchema],

//     amount: {
//       type: Number,
//       required: true,
//     },

//     currency: {
//       type: String,
//       default: "usd",
//     },

//     status: {
//       type: String,
//       enum: [
//         "pending",
//         "paid",
//         "failed",
//         "canceled",
//       ],
//       default: "pending",
//     },

//     stripeSessionId: {
//       type: String,
//     },

//     paymentIntentId: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Order = mongoose.model(
//   "Order",
//   orderSchema
// );

// export default Order;