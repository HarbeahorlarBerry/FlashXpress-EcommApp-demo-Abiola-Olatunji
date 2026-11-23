import crypto from "crypto";
import Order from "../../Models/orderSchema.js";
import { initPayment, verifyTransaction } from "./flutterwave.js";
import { markOrderPaid, releaseOrder, startCheckout } from "./checkoutHelpers.js";

const CLIENT_URL = () => process.env.CLIENT_URL || "http://localhost:5173";
const currencyOf = () => (process.env.CURRENCY || "USD").toUpperCase();

// Never fulfil on the redirect/webhook payload alone: match status, reference, currency and amount.
const isValidPayment = (order, tx) =>
  tx?.status === "successful" &&
  tx.tx_ref === order.txRef &&
  String(tx.currency).toUpperCase() === String(order.chargeCurrency || order.currency).toUpperCase() &&
  Number(tx.amount) >= (order.chargeAmount ?? order.amount);

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const summary = (order) => ({
  status: "success",
  paymentStatus: order.paymentStatus,
  orderNumber: order.orderNumber,
  amount: order.amount,
  currency: order.currency,
  chargeAmount: order.chargeAmount,
  chargeCurrency: order.chargeCurrency,
});

// POST /api/payment/checkout  (when PAYMENT_PROVIDER=flutterwave, the default)
export const createFlutterwaveCheckout = async (req, res, next) => {
  try {
    const currency = currencyOf();
    const { order } = await startCheckout(req, currency);

    order.paymentProvider = "flutterwave";
    order.txRef = `AX-${order._id}-${Date.now()}`;
    await order.save();

    try {
      const response = await initPayment({
        tx_ref: order.txRef,
        amount: order.chargeAmount ?? order.amount,
        currency: order.chargeCurrency || currency,
        redirect_url: `${CLIENT_URL()}/checkout/result`,
        customer: {
          email: req.user.gmail,
          name: order.shippingAddress.fullName,
          phonenumber: order.shippingAddress.phone,
        },
        customizations: { title: "AlieXpress", description: `Order ${order.orderNumber}` },
        meta: { orderId: String(order._id), userId: String(req.user._id) },
      });

      return res.status(200).json({
        status: "success",
        url: response.data.link,
        orderNumber: order.orderNumber,
      });
    } catch (providerError) {
      await releaseOrder(order._id, "failed"); // give the stock back
      throw providerError;
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/payment/flutterwave/verify   body: { tx_ref, transaction_id?, status? }
export const verifyFlutterwavePayment = async (req, res, next) => {
  try {
    const { tx_ref: txRef, transaction_id: transactionId, status } = req.body;
    if (!txRef) {
      return res.status(400).json({ status: "error", message: "tx_ref is required" });
    }

    const order = await Order.findOne({ txRef, userId: req.user._id });
    if (!order) return res.status(404).json({ status: "error", message: "Order not found" });
    if (order.paymentStatus !== "pending") return res.json(summary(order));

    // Customer backed out on the payment page: release the reserved stock now.
    if (!transactionId) {
      if (status === "cancelled" || status === "failed") {
        const released = await releaseOrder(order._id, "canceled");
        return res.json(summary(released || order));
      }
      return res.json(summary(order));
    }

    const { data } = await verifyTransaction(transactionId);
    if (isValidPayment(order, data)) {
      const paid = await markOrderPaid(order._id, { providerTransactionId: String(data.id) });
      return res.json(summary(paid || (await Order.findById(order._id))));
    }

    return res.json(summary(order)); // still pending; the webhook or cleanup job will settle it
  } catch (error) {
    next(error);
  }
};

// POST /webhooks/flutterwave  (Flutterwave sends your secret hash in the verif-hash header)
export const flutterwaveWebhook = async (req, res) => {
  try {
    const secret = process.env.FLW_SECRET_HASH;
    const signature = req.headers["verif-hash"];
    if (!secret || !signature || !safeEqual(signature, secret)) {
      return res.sendStatus(401);
    }

    const { event, data } = req.body || {};
    if (event === "charge.completed" && data?.id && data?.tx_ref) {
      const order = await Order.findOne({ txRef: data.tx_ref });
      if (order && order.paymentStatus === "pending") {
        const verified = await verifyTransaction(data.id); // re-verify with the API, don't trust the body
        if (isValidPayment(order, verified.data)) {
          await markOrderPaid(order._id, { providerTransactionId: String(verified.data.id) });
        }
      } else if (order && order.paymentStatus === "canceled") {
        console.warn(`Payment received for canceled order ${order.orderNumber}: review for a refund`);
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("Flutterwave webhook error:", error.message);
    return res.sendStatus(500); // non-2xx makes Flutterwave retry
  }
};
