import api from "./api";

export const fetchCartApi = () => api.get("/cart");
export const addCartItemApi = (productId, quantity = 1) =>
  api.post(`/cart/items/${productId}`, { quantity });
export const updateCartItemApi = (productId, quantity) =>
  api.put(`/cart/items/${productId}`, { quantity });
export const removeCartItemApi = (productId) =>
  api.delete(`/cart/items/${productId}`);
export const clearCartApi = () => api.delete("/cart");

export const createCheckout = (payload = {}) =>
  api.post("/payment/checkout", payload);