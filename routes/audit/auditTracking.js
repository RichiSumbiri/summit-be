import express from "express";
import { getAuditTrack } from "../../controllers/production/reports/AuditReport.js";
const router = express.Router();

router.get("/main/:listMonth", getAuditTrack);

export default router;
