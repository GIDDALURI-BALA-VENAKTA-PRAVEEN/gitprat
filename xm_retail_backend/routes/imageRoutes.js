import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadImage,
  getImages,
  deleteImage,
} from "../controllers/imageController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);
router.get("/images", getImages);
router.delete("/images/:id", deleteImage);

export default router;