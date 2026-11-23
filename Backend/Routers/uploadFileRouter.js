import  router  from "express";
import upload from "../Middlewares/fileuploadMiddleware.js";

const Router = router();

Router.post("/uploadFile", upload.array("images", 5), (req, res) => {
    console.log(req.files);
    
    if (req.file) {
        res.status(200).json({
            message: "File uploaded successfully",
            file: req.file,
        });
    } else {
        res.status(400).json({
            message: "No file uploaded"
        });
    }
});

export default Router;