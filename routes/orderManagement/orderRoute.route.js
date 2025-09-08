import express from "express";
import { getOrderDataRoute, getOrderDefaultRoute, postOrderDataRoute } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/default-route", getOrderDefaultRoute);
router.get("/order", getOrderDataRoute);
router.post("/order", postOrderDataRoute);

export default router;
