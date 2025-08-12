import express from "express";
import {
    getAllItemsWithVendors,
    getAllVendorDetail,
    getVendorPurchaseByFilter,
    getVendorPurchaseDetailByVDC,
    getVendorShipperLocationByVDC,
    postVendorDetail,
    postVendorPurchaseDetail,
    postVendorShipperLocation
} from "../../controllers/system/VendorDetail.js";

const router = express.Router();

// Vendor Detail
router.get("/all", getAllVendorDetail);
router.post("/", postVendorDetail);

// Vendor Shipper Location
router.get("/shipper-location/:vdc", getVendorShipperLocationByVDC);
router.post("/shipper-location", postVendorShipperLocation);

// Vendor Purchase Detail
router.get("/purchase-detail/:vdc", getVendorPurchaseDetailByVDC);
router.post("/purchase-detail", postVendorPurchaseDetail);
router.get("/purchase-detail-filter", getVendorPurchaseByFilter);
router.get("/purchase-detail-vendor", getAllItemsWithVendors);

export default router;