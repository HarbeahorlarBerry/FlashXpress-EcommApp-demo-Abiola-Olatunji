// src/services/productService.js
import axios from "axios";
import { getBackendOrigin } from "../utils/apiOrigin";

const productService = axios.create({
  baseURL: getBackendOrigin(),
  withCredentials: true,
});

export default productService;