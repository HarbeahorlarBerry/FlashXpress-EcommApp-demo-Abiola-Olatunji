import "dotenv/config";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import mongoose from "mongoose";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import "./MongoDb/passport.js";
import connectDB from "./MongoDb/mongoDb.js";
import { setIO } from "./core/socket.js";
import { notFound, errorHandler } from "./core/Errorhandler.js";
import { securityMiddleware, apiLimiter, otpLimiter, aiLimiter } from "./Middlewares/Security.js";
import { startCleanUp } from "./cronjobs/startCleanUp.js";
import { stripeWebhookHandler, flutterwaveWebhook } from "./Controllers/paymentApis/barrel.js";

import googleRouter from "./Routers/googleAuthRouter.js";
import authRouter from "./Routers/authRouter.js";
import usersRouter from "./Routers/usersRouters.js";
import productRouter from "./Routers/productRouter.js";
import cartRouter from "./Routers/cartRouter.js";
import orderRouter from "./Routers/OrderRouter.js";
import paymentRouter from "./Routers/paymentRouter.js";
import wishlistRouter from "./Routers/WishlistRouter.js";
import otpRouter from "./Routers/otpRouter.js";
import adminRouter from "./Routers/AdminRouter.js";
import currencyRouter from "./Routers/currencyRouter.js";
import aiRouter from "./Routers/AiRouter.js";
import chatRouter from "./Routers/ChatRouter.js";
import mlRouter from "./Routers/Mlrouter.js";
import insightsRouter from "./Routers/Insightsrouter.js";
import walletRouter from "./Routers/Walletrouter.js";
import searchRouter from "./Routers/Searchrouter.js";

const app = express();
const PORT = process.env.PORT || 9000;
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL, credentials: true } });
setIO(io);

// Sockets must carry the same login cookie as the REST API; each user joins a private room.
io.use((socket, next) => {
  try {
    const raw = socket.handshake.headers.cookie || "";
    const pair = raw.split(";").map((s) => s.trim()).find((s) => s.startsWith("token="));
    if (!pair) return next(new Error("unauthorized"));
    const decoded = jwt.verify(decodeURIComponent(pair.slice(6)), process.env.JWT_SECRET);
    socket.userId = String(decoded.id);
    next();
  } catch (error) {
    next(new Error("unauthorized"));
  }
});
io.on("connection", (socket) => socket.join(`user:${socket.userId}`));

app.set("trust proxy", 1); // required behind Render/Railway/Nginx for secure cookies
app.use(securityMiddleware);
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Stripe needs the raw body, so this must come BEFORE express.json()
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Flutterwave webhook (plain JSON; authenticated by the verif-hash header)
app.post("/webhooks/flutterwave", flutterwaveWebhook);

app.get("/", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    service: "FlashXpress E-Commerce API",
    status: "live",
    productionReady: dbConnected,
    environment: process.env.NODE_ENV || "production",
    db: dbConnected,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 })
);

app.use("/auth", googleRouter); // keeps GOOGLE_CALLBACK_URL=.../auth/google/callback valid
app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api/otp", otpLimiter, otpRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/admin", adminRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/chat", chatRouter);
app.use("/api/ai", aiLimiter, aiRouter);
app.use("/api/search", searchRouter);
app.use("/api/ml", mlRouter);
app.use("/api/insights", insightsRouter);

app.use(notFound);
app.use(errorHandler);

await connectDB(); // connect first, then accept traffic
startCleanUp();
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// import express from "express";
// import http from "http";

// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import passport from "passport";

// import { Server } from "socket.io";

// import "./MongoDb/passport.js";

// import connectDB from "./MongoDb/mongoDb.js";


// // =====================
// // ROUTES
// // =====================

// import googleRouter from "./Routers/googleAuthRouter.js";
// import usersRouters from "./Routers/usersRouters.js";
// import authRouter from "./Routers/authRouter.js";
// import cartRouter from "./Routers/cartRouter.js";
// import productRouter from "./Routers/productRouter.js";
// import uploadFileRouter from "./Routers/uploadFileRouter.js";
// import otpRouter from "./Routers/otpRouter.js";
// import allApis from "./Routers/allApis.js";
// import logsRouter from "./Routers/logsRouter.js";
// import paymentRouter from "./Routers/paymentRouter.js";
// import orderRouter from "./Routers/OrderRouter.js";



// // =====================
// // PAYMENT
// // =====================

// import {
//   stripeWebhookHandler,
// } from "./Controllers/paymentApis/paymentController.js";


// // =====================
// // CRON
// // =====================

// import {
//   startCleanUp,
// } from "./cronjobs/startCleanUp.js";


// dotenv.config();

// const appServer =
//   express();

// const PORT =
//   process.env.PORT || 9000;


// // =====================
// // HTTP SERVER
// // =====================

// const server =
//   http.createServer(
//     appServer
//   );


// // =====================
// // SOCKET.IO
// // =====================

// export const io =
//   new Server(server, {
//     cors: {
//       origin:
//         "http://localhost:5173",
//       credentials: true,
//     },
//   });


// io.on(
//   "connection",
//   (socket) => {

//     console.log(
//       "Socket connected:",
//       socket.id
//     );


//     socket.on(
//       "disconnect",
//       () => {
//         console.log(
//           "Socket disconnected:",
//           socket.id
//         );
//       }
//     );
//   }
// );


// // =====================
// // DB
// // =====================

// connectDB();

// startCleanUp();


// // =====================
// // CORS
// // =====================

// appServer.use(
//   cors({
//     origin:
//       "http://localhost:5173",
//     credentials: true,
//   })
// );


// // =====================
// // WEBHOOK FIRST
// // =====================

// appServer.post(
//   "/webhooks/stripe",
//   express.raw({
//     type:
//       "application/json",
//   }),
//   stripeWebhookHandler
// );


// // =====================
// // NORMAL MIDDLEWARES
// // =====================

// appServer.use(
//   express.urlencoded({
//     extended: true,
//   })
// );

// appServer.use(
//   express.json()
// );

// appServer.use(
//   cookieParser()
// );

// appServer.use(
//   passport.initialize()
// );


// // =====================
// // AUTH ROUTES
// // =====================

// appServer.use(
//   "/auth",
//   googleRouter
// );


// // =====================
// // API ROUTES
// // =====================

// appServer.use(
//   "/api/users",
//   usersRouters
// );

// appServer.use(
//   "/api/auth",
//   googleRouter
// );

// appServer.use(
//   "/api/auth",
//   authRouter
// );

// appServer.use(
//   "/api/products",
//   productRouter
// );

// appServer.use(
//   "/api/cart",
//   cartRouter
// );

// appServer.use(
//   "/api/upload",
//   uploadFileRouter
// );

// appServer.use(
//   "/api/otp",
//   otpRouter
// );

// appServer.use(
//   "/api",
//   logsRouter
// );

// appServer.use(
//   "/api/payment",
//   paymentRouter
// );

// appServer.use(
//   "/api/orders",
//   orderRouter
// );

// appServer.use(
//   "/",
//   allApis
// );


// // =====================
// // HEALTH CHECK
// // =====================

// appServer.get(
//   "/",
//   (req, res) => {
//     res
//       .status(200)
//       .json({
//         status:
//           "success",
//         message:
//           "AliExpress API running",
//       });
//   }
// );


// // =====================
// // 404
// // =====================

// appServer.use(
//   (req, res) => {
//     res
//       .status(404)
//       .json({
//         message:
//           "Route not found",
//       });
//   }
// );


// // =====================
// // ERROR HANDLER
// // =====================

// appServer.use(
//   (
//     err,
//     req,
//     res,
//     next
//   ) => {

//     console.error(
//       "Server error:",
//       err
//     );

//     res
//       .status(500)
//       .json({
//         message:
//           "Internal server error",
//       });
//   }
// );


// // =====================
// // START SERVER
// // =====================

// server.listen(
//   PORT,
//   () => {

//     console.log(
//       `Server running on port ${PORT}`
//     );
//   }
// );