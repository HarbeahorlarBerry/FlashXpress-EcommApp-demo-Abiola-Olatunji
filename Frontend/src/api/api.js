import axios from "axios";
import { getApiBaseUrl } from "../utils/apiOrigin";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;