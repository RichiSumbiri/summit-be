import express from "express";
import sizeColorChartsRoute from "./sizeColorCharts.route.js";
import warehouseDetail from "./warehouse.route.js";
import vendorDetail from "./vendordetail.route.js";
import customer from "./customer.route.js";
import masterAttributeRoute from "./masterAttribute.route.js";
import masterItemId from "./masterItem.js";
import masterItemComponentRoute from "./masterItemComponent.route.js";
import serviceAttributeValuesRoute from "./serviceAttributeValues.route.js";
import serviceAttributesRoute from "./serviceAttributes.route.js";
import productItemRoute from "./productItem.route.js";
import productItemComponentRoute from "./productItemComponent.route.js";
import bomTemplateRoute from "./bomTemplate.route.js";
import orderTypeRoute from "./orderType.route.js";
import bomStructureRoute from "./bomStructure.route.js";

const router = express.Router();

// SIZE AND COLOR
router.use("/size-color-chart", sizeColorChartsRoute);


// SERVICE ATTRIBUTES
router.use("/service-attributes", serviceAttributesRoute);


// SERVICE ATTRIBUTES
router.use("/service-attribute-values", serviceAttributeValuesRoute);


router.use("/bom-template", bomTemplateRoute)
router.use("/product-item", productItemRoute)
router.use("/product-item-component", productItemComponentRoute)
router.use("/attribute", masterAttributeRoute);
router.use("/master-item", masterItemId);
router.use("/master-item-component", masterItemComponentRoute)
router.use("/warehouse-detail", warehouseDetail);
router.use("/vendor-detail", vendorDetail);
router.use("/customer", customer);
router.use("/order-types", orderTypeRoute);
router.use("/bom-structure", bomStructureRoute)

export default router;
