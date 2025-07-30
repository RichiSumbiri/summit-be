import express from "express";
import itemSMVDetailRoute from "./itemSMVDetail.route.js";

const router = express.Router();

// SIZE AND COLOR
router.use("/product-item-smv-detail", itemSMVDetailRoute);

export default router;
