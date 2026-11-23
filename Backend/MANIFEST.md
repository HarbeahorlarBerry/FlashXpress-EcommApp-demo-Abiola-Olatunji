# Backend wiring map

Generated from the code in this folder: every router, the file `server.js` mounts it with, the controller files it calls, and the models those controllers use.

## `/auth`  ←  `Routers/googleAuthRouter.js`
- **Controllers:** `Controllers/authApis/googleAuthController.js`
- **Models:** none
- **Endpoints:** 2
  - `GET /auth/google`
  - `GET /auth/google/callback`

## `/api/auth`  ←  `Routers/authRouter.js`
- **Controllers:** `Controllers/authApis/authController.js`, `Controllers/authApis/registerController.js`
- **Models:** `usersSchema.js`
- **Endpoints:** 6
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/password-reset-request`
  - `POST /api/auth/password-reset`
  - `POST /api/auth/logout`

## `/api/otp`  ←  `Routers/otpRouter.js`
- **Controllers:** `Controllers/otpApis/verifyOTP.js`
- **Models:** `usersSchema.js`
- **Endpoints:** 2
  - `POST /api/otp/verify`
  - `POST /api/otp/resend`

## `/api/users`  ←  `Routers/usersRouter.js`
- **Controllers:** `Controllers/usersApis/readUser.js`, `Controllers/usersApis/updateUser.js`, `Controllers/usersApis/deleteUser.js`, `Controllers/usersApis/address.js`
- **Models:** `usersSchema.js`
- **Endpoints:** 10
  - `GET /api/users/me`
  - `PATCH /api/users/me`
  - `POST /api/users/become-seller`
  - `GET /api/users/me/addresses`
  - `POST /api/users/me/addresses`
  - `PUT /api/users/me/addresses/:addressId`
  - `DELETE /api/users/me/addresses/:addressId`
  - `GET /api/users`
  - `PATCH /api/users/:id/role`
  - `DELETE /api/users/:id`

## `/api/products`  ←  `Routers/productRouter.js`
- **Controllers:** `Controllers/productApis/productController.js`, `Controllers/productApis/reviewController.js`
- **Models:** `productSchema.js`, `orderSchema.js`
- **Endpoints:** 9
  - `GET /api/products`
  - `GET /api/products/categories`
  - `GET /api/products/my-products`
  - `POST /api/products/create`
  - `GET /api/products/similar/:id`
  - `POST /api/products/review/:id`
  - `PUT /api/products/update/:id`
  - `DELETE /api/products/delete/:id`
  - `GET /api/products/:id`

## `/api/cart`  ←  `Routers/cartRouter.js`
- **Controllers:** `Controllers/cartApis/cartController.js`
- **Models:** `cartSchema.js`, `productSchema.js`
- **Endpoints:** 5
  - `GET /api/cart`
  - `DELETE /api/cart`
  - `POST /api/cart/items/:productId`
  - `PUT /api/cart/items/:productId`
  - `DELETE /api/cart/items/:productId`

## `/api/orders`  ←  `Routers/orderRouter.js`
- **Controllers:** `Controllers/orderApis/orderController.js`
- **Models:** `orderSchema.js`
- **Endpoints:** 7
  - `GET /api/orders/mine`
  - `GET /api/orders/verify/:sessionId`
  - `GET /api/orders/seller`
  - `GET /api/orders/admin/all`
  - `POST /api/orders/:id/confirm-delivery`
  - `GET /api/orders/:id`
  - `PATCH /api/orders/:id/fulfilment`

## `/api/payment`  ←  `Routers/paymentRouter.js`
- **Controllers:** `Controllers/paymentApis/paymentController.js`, `Controllers/paymentApis/flutterwaveController.js`, `Controllers/paymentApis/stripeController.js`
- **Models:** `orderSchema.js`
- **Endpoints:** 3
  - `GET /api/payment/config`
  - `POST /api/payment/checkout`
  - `POST /api/payment/flutterwave/verify`

## `/api/wishlist`  ←  `Routers/wishlistRouter.js`
- **Controllers:** `Controllers/wishlistApis/wishlistController.js`
- **Models:** `wishlistSchema.js`, `productSchema.js`
- **Endpoints:** 2
  - `GET /api/wishlist`
  - `POST /api/wishlist/toggle/:productId`

## `/api/admin`  ←  `Routers/adminRouter.js`
- **Controllers:** `Controllers/adminApis/adminController.js`, `Controllers/adminApis/fraudController.js`, `Controllers/adminApis/opsController.js`
- **Models:** `usersSchema.js`, `productSchema.js`, `orderSchema.js`, `walletSchema.js`
- **Endpoints:** 5
  - `GET /api/admin/stats`
  - `GET /api/admin/logs`
  - `GET /api/admin/ops`
  - `GET /api/admin/fraud`
  - `PATCH /api/admin/fraud/:id`

## `/api/currency`  ←  `Routers/currencyRouter.js`
- **Controllers:** `Controllers/currencyApis/currencyController.js`
- **Models:** none
- **Endpoints:** 1
  - `GET /api/currency`

## `/api/wallet`  ←  `Routers/walletRouter.js`
- **Controllers:** `Controllers/walletApis/walletController.js`, `Controllers/walletApis/walletService.js`
- **Models:** `walletSchema.js`, `orderSchema.js`
- **Endpoints:** 4
  - `GET /api/wallet`
  - `POST /api/wallet/withdraw`
  - `GET /api/wallet/admin/withdrawals`
  - `PATCH /api/wallet/admin/withdrawals/:id`

## `/api/chat`  ←  `Routers/chatRouter.js`
- **Controllers:** `Controllers/chatApis/chatController.js`
- **Models:** `usersSchema.js`, `productSchema.js`, `chatSchema.js`
- **Endpoints:** 4
  - `GET /api/chat/conversations`
  - `POST /api/chat/conversations`
  - `GET /api/chat/conversations/:id/messages`
  - `POST /api/chat/conversations/:id/messages`

## `/api/ai`  ←  `Routers/aiRouter.js`
- **Controllers:** `Controllers/aiApis/aiController.js`, `Controllers/searchApis/searchController.js`
- **Models:** `productSchema.js`, `orderSchema.js`, `wishlistSchema.js`, `aiSchema.js`, `searchQuerySchema.js`
- **Endpoints:** 5
  - `GET /api/ai/recommendations`
  - `GET /api/ai/search`
  - `POST /api/ai/assistant`
  - `GET /api/ai/history`
  - `DELETE /api/ai/history`

## `/api/search`  ←  `Routers/searchRouter.js`
- **Controllers:** `Controllers/searchApis/searchController.js`
- **Models:** `productSchema.js`, `searchQuerySchema.js`
- **Endpoints:** 3
  - `GET /api/search`
  - `GET /api/search/trending`
  - `GET /api/search/suggestions`

## `/api/ml`  ←  `Routers/mlRouter.js`
- **Controllers:** `Controllers/mlApis/mlController.js`
- **Models:** `orderSchema.js`, `productSchema.js`, `mlSchema.js`
- **Endpoints:** 2
  - `GET /api/ml/predictions`
  - `GET /api/ml/segments`

## `/api/insights`  ←  `Routers/insightsRouter.js`
- **Controllers:** `Controllers/insightsApis/insightsController.js`
- **Models:** `orderSchema.js`, `productSchema.js`
- **Endpoints:** 1
  - `GET /api/insights`

## Webhooks (mounted directly in server.js)
- `POST /webhooks/stripe` (raw body), `POST /webhooks/flutterwave`

## Models
- `Models/aiSchema.js`
- `Models/chatSchema.js`
- `Models/mlSchema.js`
- `Models/orderSchema.js`
- `Models/productSchema.js`
- `Models/searchQuerySchema.js`
- `Models/usersSchema.js`
- `Models/walletSchema.js`
- `Models/wishlistSchema.js`

## Files you already own (not included here)
`Models/cartSchema.js`, `Models/systemLog.js`, `MongoDb/cloudinary.js`, `utils/stripe.js`, `utils/sendEmail.js`, `utils/cron.js`, `Controllers/Helper/logAction.js`, `Controllers/logsApis/logsController.js`
