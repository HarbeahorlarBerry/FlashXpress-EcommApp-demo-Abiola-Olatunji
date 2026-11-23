import { stripe } from "../../utils/stripe.js";
import { resolveCharge, decimalsFor } from "../../utils/currency.js";
import Cart from "../../Models/cartSchema.js";
import Order from "../../Models/orderSchema.js";
import Product from "../../Models/productSchema.js";

const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

const CLIENT_URL = () =>
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

async function restock(items) {
  await Promise.all(
    items.map((i) =>
      Product.updateOne({ _id: i.productId }, { $inc: { stock: i.quantity } })
    )
  );
}

// Re-read prices from DB (never trust cart snapshot) and reserve stock atomically.
async function buildAndReserve(userId) {
  const cart = await Cart.findOne({ userId });
  if (!cart?.products?.length) throw httpError(400, "Cart is empty");

  const items = [];
  try {
    for (const line of cart.products) {
      const qty = Number(line.quantity);
      const product = await Product.findOneAndUpdate(
        { _id: line.productId, isActive: { $ne: false }, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!product) {
        throw httpError(409, "An item is out of stock or no longer available");
      }
      items.push({
        productId: product._id,
        sellerId: product.userId,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity: qty,
        total: Math.round(product.price * qty * 100) / 100,
      });
    }
  } catch (err) {
    await restock(items);
    throw err;
  }

  const amount = items.reduce((s, i) => s + i.total, 0);
  return { items, amount };
}

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", message: "Unauthorized" });
    }

    const { shippingAddress, currency: requestedCurrency } = req.body || {};

    if (!shippingAddress) {
      return res
        .status(400)
        .json({ status: "error", message: "Shipping address is required" });
    }

    const reserved = await buildAndReserve(userId);

    const fallbackCurrency = (process.env.CURRENCY || "usd").toUpperCase();
    const { chargeAmount, chargeCurrency, fxRate } = await resolveCharge(
      reserved.amount,
      requestedCurrency || fallbackCurrency
    );
    const stripeCurrency = chargeCurrency.toLowerCase();
    const decimals = decimalsFor(chargeCurrency);
    const minorMultiplier = 10 ** decimals;

    const order = await Order.create({
      userId,
      items: reserved.items,
      amount: reserved.amount,
      currency: stripeCurrency,
      shippingAddress,
    });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: reserved.items.map((i) => {
          const convertedUnitPrice = i.price * fxRate;
          const unitAmount = Math.max(
            1,
            Math.round(convertedUnitPrice * minorMultiplier)
          );
          return {
            quantity: i.quantity,
            price_data: {
              currency: stripeCurrency,
              product_data: { name: i.name },
              unit_amount: unitAmount,
            },
          };
        }),
        success_url: `${CLIENT_URL()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL()}/checkout/cancel`,
        metadata: {
          userId: String(userId),
          orderId: String(order._id),
          chargeAmount: String(chargeAmount),
          chargeCurrency,
        },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });

      order.stripeSessionId = session.id;
      await order.save();

      return res.json({
        status: "success",
        sessionId: session.id,
        url: session.url,
        orderNumber: order.orderNumber,
      });
    } catch (stripeErr) {
      order.paymentStatus = "failed";
      await order.save();
      await restock(reserved.items);
      throw stripeErr;
    }
  } catch (error) {
    console.error("Checkout error:", error.message);
    return res.status(error.status || 500).json({
      status: "error",
      message: error.status ? error.message : "Could not start checkout",
    });
  }
};

export const getStripePublicKey = (req, res) =>
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "" });

export const stripeWebhookHandler = async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (event.type === "checkout.session.completed" && orderId) {
      const order = await Order.findOneAndUpdate(
        { _id: orderId, paymentStatus: "pending" },
        { paymentStatus: "paid", paymentIntentId: session.payment_intent },
        { new: true }
      );
      if (order) {
        await Cart.updateOne(
          { userId: order.userId },
          { $set: { products: [], totalCartPrice: 0 } }
        );
      }
    }

    if (event.type === "checkout.session.expired" && orderId) {
      const order = await Order.findOneAndUpdate(
        { _id: orderId, paymentStatus: "pending" },
        { paymentStatus: "canceled", fulfilment: "cancelled" },
        { new: true }
      );
      if (order) await restock(order.items);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

// import { stripe } from "../../utils/stripe.js";
// import Cart from "../../Models/cartSchema.js";
// import Order from "../../Models/orderSchema.js";

// // ======================
// // BUILD ORDER FROM CART
// // ======================

// async function buildOrderFromCart(userId) {
//   const cart = await Cart.findOne({
//     userId,
//   }).populate("products.productId");

//   if (!cart || !cart.products?.length) {
//     const err = new Error("Cart is empty");
//     err.status = 400;
//     throw err;
//   }

//   const items = cart.products.map((item) => {
//     if (!item.productId) {
//       throw new Error("Product no longer exists");
//     }

//     const unitPrice = Number(item.price);
//     const quantity = Number(item.quantity);

//     return {
//       productId: item.productId._id,
//       name:
//         item.productId.name ||
//         item.productId.title ||
//         "Product",
//       price: unitPrice,
//       quantity,
//       total: unitPrice * quantity,
//     };
//   });

//   const amount = items.reduce(
//     (sum, item) => sum + item.total,
//     0
//   );

//   return {
//     items,
//     amount,
//     cart,
//   };
// }

// // ======================
// // CREATE CHECKOUT SESSION
// // ======================

// export const createCheckoutSession =
//   async (req, res) => {
//     try {
//       const userId = req.user._id;

//       const currency =
//         (
//           process.env.CURRENCY ||
//           "usd"
//         ).toLowerCase();

//       const {
//         items,
//         amount,
//       } = await buildOrderFromCart(
//         userId
//       );

//       // Create Pending Order

//       const order =
//         await Order.create({
//           userId,
//           items,
//           amount,
//           currency,
//           status: "pending",
//         });

//       const line_items =
//         items.map((item) => ({
//           quantity:
//             item.quantity,

//           price_data: {
//             currency,

//             product_data: {
//               name:
//                 item.name,
//             },

//             unit_amount:
//               Math.round(
//                 item.price * 100
//               ),
//           },
//         }));

//       const session =
//         await stripe.checkout.sessions.create(
//           {
//             mode: "payment",

//             payment_method_types: [
//               "card",
//             ],

//             line_items,

//             success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

//             cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,

//             metadata: {
//               userId:
//                 String(userId),

//               orderId:
//                 String(order._id),
//             },
//           }
//         );

//       order.stripeSessionId =
//         session.id;

//       await order.save();

//       return res
//         .status(200)
//         .json({
//           status:
//             "success",

//           sessionId:
//             session.id,

//           url:
//             session.url,
//         });

//     } catch (error) {
//       console.error(
//         "Checkout Error:",
//         error
//       );

//       return res
//         .status(
//           error.status || 500
//         )
//         .json({
//           status:
//             "error",

//           message:
//             error.message ||
//             "Payment error",
//         });
//     }
//   };

// // ======================
// // STRIPE PUBLIC KEY
// // ======================

// export const getStripePublicKey =
//   (req, res) => {
//     return res.json({
//       publishableKey:
//         process.env
//           .STRIPE_PUBLISHABLE_KEY ||
//         "",
//     });
//   };

// // ======================
// // STRIPE WEBHOOK
// // ======================

// export const stripeWebhookHandler =
//   async (req, res) => {
//     const signature =
//       req.headers[
//         "stripe-signature"
//       ];

//     let event;

//     try {
//       event =
//         stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           process.env
//             .STRIPE_WEBHOOK_SECRET
//         );

//     } catch (error) {
//       console.error(
//         "Webhook Verification Failed:",
//         error.message
//       );

//       return res
//         .status(400)
//         .send(
//           `Webhook Error: ${error.message}`
//         );
//     }

//     try {
//       switch (
//         event.type
//       ) {

//         case "checkout.session.completed": {

//           const session =
//             event.data.object;

//           const orderId =
//             session.metadata
//               ?.orderId;

//           const userId =
//             session.metadata
//               ?.userId;

//           const paymentIntentId =
//             session.payment_intent;

//           if (orderId) {

//             const order =
//               await Order.findById(
//                 orderId
//               );

//             if (order) {

//               order.status =
//                 "paid";

//               order.paymentIntentId =
//                 paymentIntentId;

//               await order.save();
//             }
//           }

//           // Clear Cart AFTER Payment Success

//           if (userId) {

//             const cart =
//               await Cart.findOne(
//                 {
//                   userId,
//                 }
//               );

//             if (cart) {

//               cart.products =
//                 [];

//               cart.totalCartPrice =
//                 0;

//               await cart.save();
//             }
//           }

//           break;
//         }

//         case "checkout.session.expired":

//         case "payment_intent.payment_failed":

//           console.log(
//             "Payment failed or expired"
//           );

//           break;

//         default:
//           break;
//       }

//       return res
//         .status(200)
//         .json({
//           received: true,
//         });

//     } catch (error) {

//       console.error(
//         "Webhook Handler Error:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           message:
//             "Webhook processing failed",
//         });
//     }
//   };