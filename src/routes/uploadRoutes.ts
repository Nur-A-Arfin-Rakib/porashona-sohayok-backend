import express from "express";
import { uploadImage } from "../controllers/uploadController";
import { protect } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/image", protect, upload.single("image"), uploadImage);

export default router;
