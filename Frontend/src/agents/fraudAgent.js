// Advisory, client-side signal only. Real fraud scoring runs on the server at checkout.
class FraudAgent {
  analyze(order) {
    const count = Array.isArray(order.items) ? order.items.length : Number(order.items) || 0; // was comparing an array to 20
    if (order.amount > 1000) return { risky: true, reason: "High value transaction" }; // base-currency units, matches server FRAUD_HIGH_VALUE
    if (count > 20) return { risky: true, reason: "Bulk suspicious order" };
    return { risky: false };
  }
}

export default new FraudAgent();