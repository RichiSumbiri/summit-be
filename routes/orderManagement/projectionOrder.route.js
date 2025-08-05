import express from "express";
import { postProjectionOrder } from "../../controllers/orderManagement/ProjectionOrder.js";
const router = express.Router();

// Projection Order
router.post("/", postProjectionOrder);


export default router;
