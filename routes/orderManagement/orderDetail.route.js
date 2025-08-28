import express from "express";
import {
    getAllPODetailHeader,
    getListPODetailByOrderID,
    getListPOIDByMOID,
    getLogOrderPOIDStatus,
    getOrderHeaderLogStatus,
    getOrderInventoryDetail,
    getPOListingSizeByPOID, postPOListing, postPOSizeListing,
    postUpdateOrderPOIDStatus
} from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/listing-po/:orderID", getListPODetailByOrderID);
router.get("/listing-size/:poid", getPOListingSizeByPOID);
router.get("/detail-header", getAllPODetailHeader);

router.post("/po-detail", postPOListing);
router.post("/po-size", postPOSizeListing);

router.get("/po-header-status", getOrderHeaderLogStatus);
router.get("/po-detail-status", getLogOrderPOIDStatus);
router.post("/po-detail-status", postUpdateOrderPOIDStatus);

router.get("/listing-mo", getListPOIDByMOID);
router.get("/listing-inventory", getOrderInventoryDetail);


export default router;
