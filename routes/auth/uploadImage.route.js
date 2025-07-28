import express from "express";
const router = express.Router();
import {uploadImageController} from "../../controllers/auth/UploadImage.js";

router.post("/image", uploadImageController);

export default router;
