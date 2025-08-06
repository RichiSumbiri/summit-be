import express from "express";
import { getProjectionOrder, postProjectionOrder } from "../../controllers/orderManagement/ProjectionOrder.js";
const router = express.Router();

// Projection Order
router.get("/", getProjectionOrder);
router.post("/", postProjectionOrder);


export default router;
