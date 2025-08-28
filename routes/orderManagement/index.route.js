import express from "express";
import itemSMVDetailRoute from "./itemSMVDetail.route.js";
import projectionOrderRoute from "./projectionOrder.route.js";
import orderHeaderRoute from "./orderHeader.route.js";
import orderPODetailRoute from "./orderDetail.route.js";
import orderMORoute from "./orderMO.route.js";
import supplyChainPlannningRoute from "./supplyChainPlanning.route.js";
import masterOrderPlanningRoute from "./masterOrderPlanning.js";
import orderCompDetailRoute from "./orderCompDtl.route.js";


const router = express.Router();

// PRODUCT ITEM SMV DETAIL
router.use("/product-item-smv-detail", itemSMVDetailRoute);


// PROJECTION ORDER
router.use("/projection-order", projectionOrderRoute);


// ORDER MANAGEMENT 
router.use("/order-header", orderHeaderRoute);
router.use("/order-detail", orderPODetailRoute);
router.use("/order-mo", orderMORoute);
router.use("/supply-chain-planning", supplyChainPlannningRoute);
router.use("/master-order-planning", masterOrderPlanningRoute);



router.use("/order-comp-detail", orderCompDetailRoute);


export default router;
