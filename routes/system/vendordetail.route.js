import express from "express";
import { getAllVendorDetail } from "../../controllers/system/VendorDetail.js";

const router = express.Router();

router.get("/all", getAllVendorDetail);


export default router;