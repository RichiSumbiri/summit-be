import express from "express";
import sizeColorChartsRoute from "./sizeColorCharts.route.js";
import warehouseDetail from "./warehouse.route.js";
import vendorDetail from "./vendordetail.route.js";


const router = express.Router();

router.use("/size-color-chart", sizeColorChartsRoute);

router.use("/warehouse-detail", warehouseDetail);
router.use("/vendor-detail", vendorDetail);


export default router;
