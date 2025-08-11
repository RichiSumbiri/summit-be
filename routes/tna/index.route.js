import eventMasterRoute from "./eventMaster/eventMaster.route.js";
import express from "express";

const router = express.Router();

// EVENT MASTER
router.use("/event-master", eventMasterRoute);

// EVENT TEMPLATE

export default router;
