import api from "./api";

// Fetch buyer's orders
export const getOrders = () => api.get("/orders");

// Cancel an order
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`);

// Fetch seller's orders (used in SellerDashboard)
export const getSellerOrders = () => api.get("/orders/seller");

// Update order fulfillment status (used in SellerDashboard)
export const updateFulfilment = (orderId, status) => 
  api.patch(`/orders/${orderId}/fulfillment`, { status });