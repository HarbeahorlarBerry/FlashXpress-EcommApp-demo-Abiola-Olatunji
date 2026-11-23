import api from "./api";

// ======================
// GET PRODUCTS
// ======================

export const getProducts = (page = 1) => api.get(`/products?page=${page}`);

// ======================
// GET SINGLE PRODUCT
// ======================

export const getSingleProduct = (id) => api.get(`/products/${id}`);

// ======================
// CREATE PRODUCT
// ======================

export const createProduct = (formData) =>
  api.post("/products/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// ======================
// ADD REVIEW
// ======================

export const addReview = (productId, reviewData) =>
  api.post(`/products/review/${productId}`, reviewData);

// ======================
// SIMILAR PRODUCTS
// ======================

export const getSimilarProducts = (id) => api.get(`/products/similar/${id}`);

// ======================
// SEARCH PRODUCTS
// ======================

export const searchProducts = (query) =>
  api.get(`/products?q=${encodeURIComponent(query)}`);

// ======================
// MY PRODUCTS
// ======================

export const getMyProducts = () => api.get("/products/my-products");

// ======================
// DELETE PRODUCT
// ======================

export const deleteProduct = (id) => api.delete(`/products/delete/${id}`);

// ======================
// UPDATE PRODUCT
// ======================

export const updateProduct = (id, data) =>
  api.put(`/products/update/${id}`, data);