// src/services/authService.js
import axios from "axios";
import { getBackendOrigin } from "../utils/apiOrigin";

const authService = axios.create({
  baseURL: getBackendOrigin(),
  withCredentials: true,
});

export default authService;