import express from "express";
import { getListPODetailByOrderID } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/:orderID", getListPODetailByOrderID);


export default router;
