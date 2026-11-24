import { markOrderPaid, releaseOrder, startCheckout } from "./checkoutHelpers.js";

const LIVE_CLIENT_URL = "https://aliexpress-ecommapp-demo-abiola-olatunji.onrender.com";

// Loaded lazily so the app boots without Stripe keys when another provider is selected.
const getStripe = async () => (await import("../../utils/stripe.js")).stripe;
const CLIENT_URL = () => String(process.env.CLIENT_URL || LIVE_CLIENT_URL).replace(/\/+$/, "");

// POST /api/payment/checkout  (when PAYMENT_PROVIDER=stripe)
export const createStripeCheckout = async (req, res, next) => {
  try {
    const currency = (process.env.CURRENCY || "usd").toLowerCase();
    const { order } = await startCheckout(req, currency.toUpperCase(), { fx: false });

    try {
      const stripe = await getStripe();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: req.user.gmail,
        line_items: order.items.map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency,
            product_data: { name: i.name },
            unit_amount: Math.round(i.price * 100),
          },
        })),
        success_url: `${CLIENT_URL()}/checkout/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL()}/checkout/result?status=cancelled`,
        metadata: { userId: String(req.user._id), orderId: String(order._id) },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });

      order.paymentProvider = "stripe";
      order.stripeSessionId = session.id;
      await order.save();

      return res.status(200).json({ status: "success", url: session.url, orderNumber: order.orderNumber });
    } catch (providerError) {
      await releaseOrder(order._id, "failed");
      throw providerError;
    }
  } catch (error) {
    next(error);
  }
};

// POST /webhooks/stripe  (mounted with express.raw before express.json)
// export const stripeWebhookHandler = async (req, res) => {
//   let event;
//   try {
//     const stripe = await getStripe();
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       req.headers["stripe-signature"],
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     return res.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   try {
//     const session = event.data.object;
//     const orderId = session.metadata?.orderId;

//     if (event.type === "checkout.session.completed" && orderId) {
//       await markOrderPaid(orderId, { paymentIntentId: session.payment_intent });
//     }
//     if (event.type === "checkout.session.expired" && orderId) {
//       await releaseOrder(orderId, "canceled");
//     }
//     return res.status(200).json({ received: true });
//   } catch (error) {
//     console.error("Stripe webhook error:", error.message);
//     return res.status(500).json({ message: "Webhook processing failed" });
//   }
// };
