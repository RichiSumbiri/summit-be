import express from "express";
import { getListPODetailByOrderID, getPOListingSizeByPOID } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/listing-po/:orderID", getListPODetailByOrderID);
router.get("/listing-size/:poid", getPOListingSizeByPOID);

export default router;
