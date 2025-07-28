import express from "express";
import sizeColorChartsRoute from "./sizeColorCharts.route.js";
import warehouseDetail from "./warehouse.route.js";
import vendorDetail from "./vendordetail.route.js";
import customer from "./customer.route.js";
import masterAttributeRoute from "./masterAttribute.route.js";
import masterItemId from "./masterItem.js";
import serviceAttributeValuesRoute from "./serviceAttributeValues.route.js";
import serviceAttributesRoute from "./serviceAttributes.route.js";

const router = express.Router();

// SIZE AND COLOR
router.use("/size-color-chart", sizeColorChartsRoute);


// SERVICE ATTRIBUTES
router.use("/service-attributes", serviceAttributesRoute);


// SERVICE ATTRIBUTES
router.use("/service-attribute-values", serviceAttributeValuesRoute);



router.use("/attribute", masterAttributeRoute);
router.use("/master-item", masterItemId);
router.use("/warehouse-detail", warehouseDetail);
router.use("/vendor-detail", vendorDetail);
router.use("/customer", customer);


export default router;
