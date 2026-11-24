// Routers/allApis.js
import { Router } from "express";

const allApis = Router();
const LIVE_API_BASE = "https://flashxpress-ecommapp-backend.onrender.com/api";

const apis = [
  {
    name: "user",
    description: "user related apis",
    endpoints: [
      `${LIVE_API_BASE}/auth/register`,
      `${LIVE_API_BASE}/auth/login`,
      `${LIVE_API_BASE}/auth/register/verify-otp`,
      `${LIVE_API_BASE}/auth/register/send-otp`,
    ],
  },
  {
    name: "product",
    description: "product related apis",
    endpoints: [
      `${LIVE_API_BASE}/products`,
    ],
  },
  {
    name: "cart",
    description: "cart related apis",
    endpoints: [
      `${LIVE_API_BASE}/cart`,
    ],
  },
  {
    name: "uploadFile",
    description: "upload file related apis",
    endpoints: [
      `${LIVE_API_BASE}/upload`,
    ],
  },
  {
    name: "otp",
    description: "otp related apis",
    endpoints: [
      `${LIVE_API_BASE}/auth/register/verify-otp`,
      `${LIVE_API_BASE}/auth/register/send-otp`,
    ],
  },
];

allApis.get("/", (req, res) => {
  res.status(200).send({ apis });
});

export default allApis;