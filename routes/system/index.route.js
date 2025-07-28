import express from "express";
import sizeColorChartsRoute from "./sizeColorCharts.route.js";
import serviceAttributeValuesRoute from "./serviceAttributeValues.route.js";
import serviceAttributesRoute from "./serviceAttributes.route.js";

const router = express.Router();

// SIZE AND COLOR
router.use("/size-color-chart", sizeColorChartsRoute);


// SERVICE ATTRIBUTES
router.use("/service-attributes", serviceAttributesRoute);


// SERVICE ATTRIBUTES
router.use("/service-attribute-values", serviceAttributeValuesRoute);




export default router;
