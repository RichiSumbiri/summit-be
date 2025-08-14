import express from "express";
import {
    getAllPODetailHeader,
    getListPODetailByOrderID,
    getPOListingSizeByPOID, postPOListing, postPOSizeListing
} from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/listing-po/:orderID", getListPODetailByOrderID);
router.get("/listing-size/:poid", getPOListingSizeByPOID);
router.get("/detail-header", getAllPODetailHeader);

router.post("/po-detail", postPOListing);
router.post("/po-size", postPOSizeListing);

export default router;
