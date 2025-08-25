import eventMasterRoute from "./eventMaster/eventMaster.route.js";
import eventTemplateRoute from "./eventTemplate/eventTemplate.route.js";
import eventFrameworkRoute from "./eventFramework/eventFramework.route.js";
import express from "express";

const router = express.Router();

// EVENT MASTER
router.use("/event-master", eventMasterRoute);

//EVENT TEMPLATE
router.use("/event-template", eventTemplateRoute);  

//EVENT FRAMEWORK
router.use("/event-framework", eventFrameworkRoute);

export default router;
