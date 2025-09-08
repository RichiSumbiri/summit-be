import express from "express";
import { getOrderDataRoute, getOrderDefaultRoute } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/default-route", getOrderDefaultRoute);
router.get("/order", getOrderDataRoute);

export default router;
