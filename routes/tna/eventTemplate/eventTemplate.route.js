import { getEventTemplate, showEventTemplate, updateOrCreateEventTemplate } from "../../../controllers/tna/eventTemplate/eventTemplate.js";
import express from "express";

const router = express.Router();

router.get("/", getEventTemplate);
router.get("/:id", showEventTemplate);
router.post("/", updateOrCreateEventTemplate);

export default router;
