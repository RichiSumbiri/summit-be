import express from "express";
import { getAllVendorDetail, getVendorShipperLocationByVDC, postVendorDetail, postVendorShipperLocation } from "../../controllers/system/VendorDetail.js";

const router = express.Router();

router.get("/all", getAllVendorDetail);
router.post("/", postVendorDetail);

router.get("/shipper-location/:vdc", getVendorShipperLocationByVDC);
router.post("/shipper-location", postVendorShipperLocation);

export default router;