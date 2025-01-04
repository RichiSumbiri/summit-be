import express from "express";
import { getDailyHrDash } from "../../controllers/hr/hrDashboard.js";
const router = express.Router();


router.get("/daily/:date", getDailyHrDash);

export default router;
