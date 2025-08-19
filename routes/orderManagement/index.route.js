import express from "express";
import itemSMVDetailRoute from "./itemSMVDetail.route.js";
import projectionOrderRoute from "./projectionOrder.route.js";
import orderHeaderRoute from "./orderHeader.route.js";
import orderPODetailRoute from "./orderDetail.route.js";
import supplyChainPlannningRoute from "./supplyChainPlanning.route.js";
import { getSupplyChainPlanningByOrderID, postSupplyChainPlanning } from "../../controllers/orderManagement/OrderManagement.js";

const router = express.Router();

// PRODUCT ITEM SMV DETAIL
router.use("/product-item-smv-detail", itemSMVDetailRoute);


// PROJECTION ORDER
router.use("/projection-order", projectionOrderRoute);


// ORDER MANAGEMENT 
router.use("/order-header", orderHeaderRoute);
router.use("/order-detail", orderPODetailRoute);
router.use("/supply-chain-planning", supplyChainPlannningRoute);


export default router;
