import eventMasterRoute from "./eventMaster/eventMaster.route.js";
import eventTemplateRoute from "./eventTemplate/eventTemplate.route.js";
import express from "express";

const router = express.Router();

// EVENT MASTER
router.use("/event-master", eventMasterRoute);
router.use("/event-template", eventTemplateRoute);

// EVENT TEMPLATE

export default router;
