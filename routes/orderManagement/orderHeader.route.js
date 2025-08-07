import express from "express";
import { getListOrderHeaderByStatus } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/:status", getListOrderHeaderByStatus);


export default router;
