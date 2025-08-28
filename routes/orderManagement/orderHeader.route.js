import express from "express";
import { changeOrderHeaderStatus, getListOrderHeaderByStatus, getOrderHeaderLogStatus, postOrderHeader } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/:status", getListOrderHeaderByStatus);
router.post("/change-status", changeOrderHeaderStatus);
router.post("/", postOrderHeader);


export default router;
