import express from "express";
import {
    getAllPODetailHeader,
    getListPODetailByOrderID,
    getListPOIDByMOID,
    getLogOrderPOIDStatus,
    getOrderExecuteInfo,
    getOrderHeaderLogStatus,
    getOrderInventoryDetail,
    getOrderPOAlteration,
    getPOListingSizeByPOID, getPOListingSizeLogRevisionByRevID, getPOSizeListingCheck, getPOSizeLogRevisionDetailByRevID, getReportPOListing, postOrderPOAlteration, postPOListing, postPOSizeListing,
    postUpdateOrderPOIDStatus
} from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/listing-po/:orderID", getListPODetailByOrderID);
router.get("/listing-size/:poid", getPOListingSizeByPOID);
router.get("/listing-size-length", getPOSizeListingCheck);
router.get("/detail-header", getAllPODetailHeader);

router.post("/po-detail", postPOListing);
router.post("/po-size", postPOSizeListing);

router.get("/po-header-status", getOrderHeaderLogStatus);
router.get("/po-detail-status", getLogOrderPOIDStatus);
router.post("/po-detail-status", postUpdateOrderPOIDStatus);

router.get("/listing-mo", getListPOIDByMOID);
router.get("/listing-inventory", getOrderInventoryDetail);
router.get("/po-size-revision-log", getPOListingSizeLogRevisionByRevID);
router.get("/po-size-revision-detail", getPOSizeLogRevisionDetailByRevID);

router.get("/order-execute-info", getOrderExecuteInfo);

router.get("/order-alteration", getOrderPOAlteration);
router.post("/order-alteration", postOrderPOAlteration);

router.post("/report-po-listing", getReportPOListing);

export default router;
