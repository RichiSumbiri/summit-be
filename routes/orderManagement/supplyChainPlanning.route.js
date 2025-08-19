import express from "express";
import { getSupplyChainPlanningByOrderID, postSupplyChainPlanning } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.get("/", getSupplyChainPlanningByOrderID);
router.post("/", postSupplyChainPlanning);


export default router;
