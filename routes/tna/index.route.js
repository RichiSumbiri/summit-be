import eventMasterRoute from "./eventMaster/eventMaster.route.js";
import eventTemplateRoute from "./eventTemplate/eventTemplate.route.js";
import eventFrameworkRoute from "./eventFramework/eventFramework.route.js";
import eventManagementRoute from "./eventManagement/eventManagement.route.js";
import reportsRoute from "./reports/reports.route.js";
import express from "express";

const router = express.Router();

// EVENT MASTER
router.use("/event-master", eventMasterRoute);

//EVENT TEMPLATE
router.use("/event-template", eventTemplateRoute);  

//EVENT FRAMEWORK
router.use("/event-framework", eventFrameworkRoute);

//EVENT MANAGEMENT
router.use("/event-management", eventManagementRoute);

//REPORTS
router.use("/reports", reportsRoute);

export default router;