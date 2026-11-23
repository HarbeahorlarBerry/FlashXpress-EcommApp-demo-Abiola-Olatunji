import { Router } from "express";
import {
  createProduct, listProducts, getCategories, getSingleProduct,
  getSimilarProducts, getMyProducts, editProduct, deleteProduct,
} from "../Controllers/productApis/productController.js";
import { addReview } from "../Controllers/productApis/reviewController.js";
import { authMiddleware, sellerMiddleware } from "../Middlewares/authMiddleware.js";
import upload from "../Middlewares/imageUpload.js";

const r = Router();

// Static routes first
r.get("/", listProducts);
r.get("/categories", getCategories);
r.get("/my-products", authMiddleware, sellerMiddleware, getMyProducts);
r.post("/create", authMiddleware, sellerMiddleware, upload.array("image", 5), createProduct);

r.get("/similar/:id", getSimilarProducts);
r.post("/review/:id", authMiddleware, addReview);
r.put("/update/:id", authMiddleware, sellerMiddleware, upload.array("image", 5), editProduct);
r.delete("/delete/:id", authMiddleware, sellerMiddleware, deleteProduct);

r.get("/:id", getSingleProduct);

export default r;


// import { Router } from "express";

// import {
//   createProduct,
//   getSingleProduct,
//   getAllProducts,
//   getByqueryParams,
//   getuserProducts,
//   editProduct,
//   deleteProduct,
//   getSimilarProducts,
// } from "../Controllers/productApis/productController.js";

// import {
//   authMiddleware,
// } from "../Middlewares/authMiddleware.js";

// import upload from "../Middlewares/fileuploadMiddleware.js";

// import {
//   addReview,
// } from "../Controllers/productApis/reviewController.js";

// const productRouter = Router();


// // ======================
// // CREATE PRODUCT
// // ======================

// productRouter.post(
//   "/create",
//   authMiddleware,
//   upload.array("image", 5),
//   createProduct
// );


// // ======================
// // ADD REVIEW
// // ======================

// productRouter.post(
//   "/review/:id",
//   authMiddleware,
//   addReview
// );


// // ======================
// // GET LOGGED USER PRODUCTS
// // ======================

// productRouter.get(
//   "/my-products",
//   authMiddleware,
//   getuserProducts
// );


// // ======================
// // SEARCH PRODUCTS
// // ======================

// productRouter.get(
//   "/search",
//   getByqueryParams
// );


// // ======================
// // SIMILAR PRODUCTS
// // ======================

// productRouter.get(
//   "/similar/:id",
//   getSimilarProducts
// );


// // ======================
// // SINGLE PRODUCT
// // ======================

// productRouter.get(
//   "/:id",
//   getSingleProduct
// );


// // ======================
// // ALL PRODUCTS
// // ======================

// productRouter.get(
//   "/",
//   getAllProducts
// );


// // ======================
// // UPDATE PRODUCT
// // ======================

// productRouter.put(
//   "/update/:id",
//   authMiddleware,
//   upload.array("image", 5),
//   editProduct
// );


// // ======================
// // DELETE PRODUCT
// // ======================

// productRouter.delete(
//   "/delete/:id",
//   authMiddleware,
//   deleteProduct
// );

// export default productRouter;