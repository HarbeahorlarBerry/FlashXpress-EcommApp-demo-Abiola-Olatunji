import axios from "axios";

const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "")
  .trim()
  .replace(/\/+$/, "");

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const baseURL =
  envUrl || (isLocalHost ? "http://localhost:9000" : "https://flashxpress-ecommapp-backend.onrender.com");

const productService = axios.create({
  baseURL,
  withCredentials: true,
});

export default productService;