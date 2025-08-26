import { getEventManagement } from "../../../controllers/tna/eventManagement/eventManagement.js";

import express from "express";
const router = express.Router();

//management
router.get("/", getEventManagement);

export default router;
