import express from "express";
import { getListPODetailByOrderID, getPOListingSizeByPOID, postPOListing } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/listing-po/:orderID", getListPODetailByOrderID);
router.get("/listing-size/:poid", getPOListingSizeByPOID);

router.post("/", postPOListing);

export default router;
