import express from "express";
import {
    getAllPODetailHeader,
    getListPODetailByOrderID,
    getPOListingSizeByPOID
} from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/listing-po/:orderID", getListPODetailByOrderID);
router.get("/listing-size/:poid", getPOListingSizeByPOID);
router.get("/detail-header", getAllPODetailHeader);

export default router;
