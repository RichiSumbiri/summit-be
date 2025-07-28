import express from "express";
import { getAllVendorDetail, postVendorDetail } from "../../controllers/system/VendorDetail.js";

const router = express.Router();

router.get("/all", getAllVendorDetail);
router.post("/", postVendorDetail);

export default router;