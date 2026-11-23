import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../MongoDb/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "aliexpress/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only image uploads are allowed")),
});

export default upload;

// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../MongoDb/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     let folder = "uploads/others";

//     if (file.mimetype.startsWith("image/")) {
//       folder = "uploads/images";
//     } else if (
//       file.mimetype === "application/pdf"
//     ) {
//       folder = "uploads/pdfs";
//     } else if (
//       file.mimetype === "application/msword" ||
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//     ) {
//       folder = "uploads/docs";
//     } else if (
//       file.mimetype ===
//         "application/vnd.ms-excel" ||
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       folder = "uploads/excels";
//     } else if (
//       file.mimetype === "application/zip"
//     ) {
//       folder = "uploads/zips";
//     }

//     return {
//       folder,
//       allowed_formats: [
//         "jpg",
//         "jpeg",
//         "png",
//         "webp",
//         "pdf",
//         "doc",
//         "docx",
//         "xls",
//         "xlsx",
//         "zip",
//       ],
//     };
//   },
// });

// const upload = multer({
//   storage,
//   limits: {
//     fileSize:
//       10 * 1024 * 1024, // 10MB
//   },
// });

// export default upload;


// import multer from "multer";
// import {
//   CloudinaryStorage,
// } from "multer-storage-cloudinary";

// import cloudinary from "../MongoDb/cloudinary.js";
// import path from "path";
// import fs from "fs";



// function getFolderByItsMimeType(mimetype) {
//   if (mimetype.startsWith("image/")) return "uploads/images";
//   if (mimetype === "application/pdf") return "uploads/pdfs";
//   if (mimetype === "application/msword") return "uploads/docs";
//   if (
//     mimetype ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//   )
//     return "uploads/docs";
//   if (mimetype === "application/vnd.ms-excel") return "uploads/excels";
//   if (
//     mimetype ===
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   )
//     return "uploads/excels";
//   if (mimetype === "application/zip") return "uploads/zips";

//   // ✅ Always fallback
//   return "uploads/others";
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const dynamicFolder = getFolderByItsMimeType(file.mimetype);

//     // ✅ Make sure all parent folders exist
//     if (!fs.existsSync(dynamicFolder)) {
//       fs.mkdirSync(dynamicFolder, { recursive: true }); // <--- fix
//     }

//     //otherwise, save the file
//     cb(null, dynamicFolder);
//   },

//   filename: function (req, file, cb) {
//     const dynamicFolder = getFolderByItsMimeType(file.mimetype);

//     const ext = path.extname(file.originalname);
//     const safeBaseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");

//     const finalName = `${file.fieldname}-${Date.now()}${ext}`;

//     const filePath = path.join(dynamicFolder, finalName);

//     if (fs.existsSync(filePath)) {
//       // ❗️ Correct: just pass the error — no `false`
//       return cb(new Error("File already exists"));
//     }

//      //otherwise, save the file
//     cb(null, finalName);
//   },
// });


// const storage =
// new CloudinaryStorage({

//   cloudinary: cloudinary,

//   params: {

//     folder: 
//     "alieexpress-products",

//     allowed_formats: [
//       "jpg",
//       "jpeg",
//       "png",
//       "webp",
//     ],
//   },
// });

// const upload = multer({ storage });

// export default upload;


