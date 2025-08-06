import express from "express";
import itemSMVDetailRoute from "./itemSMVDetail.route.js";
import projectionOrderRoute from "./projectionOrder.route.js";

const router = express.Router();

// PRODUCT ITEM SMV DETAIL
router.use("/product-item-smv-detail", itemSMVDetailRoute);


// PROJECTION ORDER
router.use("/projection-order", projectionOrderRoute);


export default router;
