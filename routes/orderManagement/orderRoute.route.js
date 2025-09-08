import express from "express";
import { getOrderDefaultRoute } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/default-route", getOrderDefaultRoute);


export default router;
