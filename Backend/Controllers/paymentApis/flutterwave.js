import { httpError } from "./checkoutHelpers.js";

const BASE = "https://api.flutterwave.com/v3";

const call = async (path, options = {}) => {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === "error") {
      throw httpError(502, data.message || "Payment provider error");
    }
    return data;
  } catch (error) {
    if (error.status) throw error;
    throw httpError(502, "Could not reach the payment provider");
  }
};

// Creates a hosted checkout; the response has data.link to redirect the customer to.
export const initPayment = (payload) =>
  call("/payments", { method: "POST", body: JSON.stringify(payload) });

export const verifyTransaction = (transactionId) =>
  call(`/transactions/${encodeURIComponent(transactionId)}/verify`);
