import express from "express";
import { getListOrderHeaderByStatus, postOrderHeader } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/:status", getListOrderHeaderByStatus);
router.post("/", postOrderHeader);

export default router;
