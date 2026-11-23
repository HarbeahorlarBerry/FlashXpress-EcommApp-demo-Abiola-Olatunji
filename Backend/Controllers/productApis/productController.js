import mongoose from "mongoose";
import Product from "../../Models/productSchema.js";
import { getIO } from "../../core/socket.js";

const EDITABLE = ["name", "description", "price", "color", "size", "category", "stock", "isActive"];
const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const bad = (res, code, message) => res.status(code).json({ status: "error", message });
const validId = (id) => mongoose.isValidObjectId(id);
const canManage = (user, product) =>
  user.role === "admin" || String(product.userId) === String(user._id);

export const createProduct = async (req, res) => {
  const data = pick(req.body, EDITABLE);
  data.price = Number(data.price);
  data.stock = Number(data.stock) || 0;

  if (!data.name || !data.description || !data.category || Number.isNaN(data.price) || data.price < 0) {
    return bad(res, 400, "name, description, category and a valid price are required");
  }

  const product = await Product.create({
    ...data,
    images: req.files?.map((f) => f.path) || [],
    userId: req.user._id,
  });
  getIO()?.emit("productCreated", { _id: product._id, name: product.name });
  res.status(201).json({ status: "success", product });
};

// Public listing: ?q=&category=&minPrice=&maxPrice=&minRating=&inStock=true&sort=&page=&limit=
export const listProducts = async (req, res) => {
  const { q, category, minPrice, maxPrice, minRating, inStock, seller, sort } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));

  const filter = { isActive: true };
  if (q) filter.$text = { $search: String(q) };
  if (category) filter.category = String(category).toLowerCase();
  if (seller && validId(seller)) filter.userId = seller;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (minRating) filter.averageRating = { $gte: Number(minRating) };
  if (inStock === "true") filter.stock = { $gt: 0 };

  const sorts = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { averageRating: -1, reviewCount: -1 },
    popular: { soldCount: -1 },
  };
  const order = sorts[sort] || (q ? { score: { $meta: "textScore" } } : sorts.newest);

  const projection = { reviews: 0 };
  if (q) projection.score = { $meta: "textScore" };

  const [products, total] = await Promise.all([
    Product.find(filter, projection)
      .sort(order)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "username")
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ status: "success", total, page, pages: Math.ceil(total / limit), products });
};

export const getCategories = async (req, res) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ status: "success", categories: categories.map((c) => ({ name: c._id, count: c.count })) });
};

export const getSingleProduct = async (req, res) => {
  if (!validId(req.params.id)) return bad(res, 400, "Invalid product id");
  const product = await Product.findOne({ _id: req.params.id, isActive: true })
    .populate("userId", "username")
    .populate("reviews.userId", "username");
  if (!product) return bad(res, 404, "Product not found");
  res.json({ status: "success", product });
};

export const getSimilarProducts = async (req, res) => {
  if (!validId(req.params.id)) return bad(res, 400, "Invalid product id");
  const product = await Product.findById(req.params.id);
  if (!product) return bad(res, 404, "Product not found");

  const products = await Product.find(
    { _id: { $ne: product._id }, isActive: true, category: product.category },
    { reviews: 0 }
  )
    .sort({ averageRating: -1, soldCount: -1 })
    .limit(8)
    .lean();
  res.json({ status: "success", products });
};

export const getMyProducts = async (req, res) => {
  const products = await Product.find({ userId: req.user._id }, { reviews: 0 }).sort({ createdAt: -1 });
  res.json({ status: "success", products });
};

export const editProduct = async (req, res) => {
  if (!validId(req.params.id)) return bad(res, 400, "Invalid product id");
  const product = await Product.findById(req.params.id);
  if (!product) return bad(res, 404, "Product not found");
  if (!canManage(req.user, product)) return bad(res, 403, "You can only edit your own products");

  const updates = pick(req.body, EDITABLE);
  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.stock !== undefined) updates.stock = Number(updates.stock);
  Object.assign(product, updates);
  if (req.files?.length) product.images = req.files.map((f) => f.path);

  await product.save();
  res.json({ status: "success", message: "Product updated successfully", product });
};

// Soft delete keeps order history intact
export const deleteProduct = async (req, res) => {
  if (!validId(req.params.id)) return bad(res, 400, "Invalid product id");
  const product = await Product.findById(req.params.id);
  if (!product) return bad(res, 404, "Product not found");
  if (!canManage(req.user, product)) return bad(res, 403, "You can only delete your own products");

  product.isActive = false;
  await product.save();
  res.json({ status: "success", message: "Product deleted successfully" });
};


// import Product from "../../Models/productSchema.js";

// import { io } from "../../server.js";


// // ======================
// // CREATE PRODUCT
// // ======================

// export const createProduct =
//   async (req, res) => {

//     try {

//       console.log(
//         "REQ BODY:",
//         req.body
//       );


//       const {
//         name,
//         description,
//         price,
//         color,
//         size,
//         category,
//         stock,
//       } = req.body || {};

//       const images = 
//       req.files?.map(
//         file => file.path
//       ) || [];

      


//       // ======================
//       // AUTH CHECK
//       // ======================

//       if (!req.user) {

//         return res
//           .status(401)
//           .json({
//             status: "error",
//             message:
//               "Not authenticated",
//           });
//       }


//       // ======================
//       // VALIDATION
//       // ======================

//       if (
//         !name ||
//         !description ||
//         !price ||
//         !category
//       ) {

//         return res
//           .status(400)
//           .json({
//             status: "error",
//             message:
//               "Missing required fields",
//           });
//       }


//       // ======================
//       // PRICE FIX
//       // ======================

//       const numericPrice =
//         Number(price);


//       if (
//         isNaN(
//           numericPrice
//         )
//       ) {

//         return res
//           .status(400)
//           .json({
//             status: "error",
//             message:
//               "Invalid price",
//           });
//       }


//       // ======================
//       // CREATE PRODUCT
//       // ======================

//       const newProduct =
//         await Product.create({

//           name,

//           description,

//           price:
//             numericPrice,

//           category,

//           color,

//           size,

//           stock:
//           Number(stock)  || 0, 

//           images,

//           userId:
//             req.user._id,
//         });

      

//       // ======================
//       // SOCKET EVENT
//       // ======================

//       if (io) {

//         io.emit(
//           "productCreated",
//           newProduct
//         );
//       }


//       return res
//         .status(201)
//         .json({

//           status:
//             "success",

//           message:
//             "Product created successfully",

//           product:
//             newProduct,
//         });

//     } catch (error) {

//       console.log(
//         "CREATE PRODUCT ERROR:",
//         error
//       );

//       return res
//         .status(500)
//         .json({

//           status:
//             "error",

//           message:
//             error.message,
//         });
//     }
//   };


// // ======================
// // USER PRODUCTS
// // ======================

// export const getuserProducts =
//   async (req, res) => {

//     try {

//       const products =
//         await Product.find({
//           userId:
//             req.user._id,
//         });

//       return res
//         .status(200)
//         .json({
//           status:
//             "success",
//           products,
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",
//           message:
//             error.message,
//         });
//     }
//   };



// // ======================
// // SINGLE PRODUCT
// // ======================

// export const getSingleProduct =
//   async (req, res) => {

//     try {

//       const product =
//         await Product.findById(
//           req.params.id
//         );

//       if (!product) {

//         return res
//           .status(404)
//           .json({
//             status: "error",
//             message:
//               "Product not found",
//           });
//       }

//       return res
//         .status(200)
//         .json({
//           status: "success",
//           product,
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({
//           status: "error",
//           message:
//             error.message,
//         });
//     }
//   };


//   // ======================
// // SIMILAR PRODUCTS
// // ======================

// export const getSimilarProducts =
//   async (req, res) => {

//     try {

//       const product =
//         await Product.findById(
//           req.params.id
//         );

//       if (!product) {

//         return res
//           .status(404)
//           .json({
//             status: "error",
//             message:
//               "Product not found",
//           });
//       }


//       // ======================
//       // AI MATCHING
//       // ======================

//       const similarProducts =
//         await Product.find({

//           _id: {
//             $ne: product._id,
//           },

//           $or: [

//             {
//               category:
//                 product.category,
//             },

//             {
//               color:
//                 product.color,
//             },

//             {
//               size:
//                 product.size,
//             },

//           ],

//         }).limit(8);


//       return res
//         .status(200)
//         .json({

//           status:
//             "success",

//           products:
//             similarProducts,
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({

//           status:
//             "error",

//           message:
//             error.message,
//         });
//     }
//   };



// // ======================
// // ALL PRODUCTS
// // ======================

// export const getAllProducts =
//   async (req, res) => {

//     try {

//       const products =
//         await Product.find()
//           .populate(
//             "userId",
//             "-password"
//           );

//       return res
//         .status(200)
//         .json({
//           status:
//             "success",
//           products,
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",
//           message:
//             error.message,
//         });
//     }
//   };


// // ======================
// // SEARCH
// // ======================

// export const getByqueryParams =
//   async (req, res) => {

//     try {

//       const {
//         productName,
//         category,
//         color,
//         size,
//       } = req.query;

//       const filter = {};

//       if (productName) {
//         filter.name =
//           productName;
//       }

//       if (color) {
//         filter.color =
//           color;
//       }

//       if (size) {
//         filter.size =
//           size;
//       }

//       if (category) {
//         filter.category =
//           category;
//       }

//       const products =
//         await Product.find(
//           filter
//         );

//       return res
//         .status(200)
//         .json({
//           status:
//             "success",
//           products,
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",
//           message:
//             error.message,
//         });
//     }
//   };


// // ======================
// // UPDATE
// // ======================

// export const editProduct =
//   async (req, res) => {

//     try {

//       const product =
//         await Product.findById(

//             req.params.id,
//         ).populate(
//           "userId",
//           "-password"
//         )



//       if (!product) {

//         return res
//           .status(404)
//           .json({
//             status:
//               "error",
//             message:
//               "Product not found",
//           });
//       }


//       if (
//         req.files &&
//         req.files.length > 0
//       ) {
//         product.images = 
//         req.files.map(
//           (files) => files.path
//         );
//       }


//       Object.assign(
//         product,
//         req.body
//       );

//       await product.save();


//       return res
//         .status(200)
//         .json({
//           status:
//             "success",
//           message:
//             "Product updated successfully",
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",
//           message:
//             error.message,
//         });
//     }
//   };


// // ======================
// // DELETE
// // ======================

// export const deleteProduct =
//   async (req, res) => {

//     try {

//       const deleted =
//         await Product.findOneAndDelete({

//           _id:
//             req.params.id,

//           userId:
//             req.user._id,
//         });


//       if (!deleted) {

//         return res
//           .status(404)
//           .json({
//             status:
//               "error",
//             message:
//               "Product not found",
//           });
//       }


//       return res
//         .status(200)
//         .json({
//           status:
//             "success",
//           message:
//             "Product deleted successfully",
//         });

//     } catch (error) {

//       return res
//         .status(500)
//         .json({
//           status:
//             "error",
//           message:
//             error.message,
//         });
//     }
//   };