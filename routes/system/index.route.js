import express from "express";
import sizeColorChartsRoute from "./sizeColorCharts.route.js";

const router = express.Router();

router.use("/size-color-chart", sizeColorChartsRoute);

export default router;
