// src/services/orderService.js
import axios from "axios";
import { getBackendOrigin } from "../utils/apiOrigin";

const orderService = axios.create({
  baseURL: getBackendOrigin(),
  withCredentials: true,
});

export default orderService;