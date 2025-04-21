import express from "express";
import { getBaseMpMonthly, getBaseSewMpMonthly, getChartMpDtlByLine, getDailyHrDash, getDataDashSewMp, getExpandEmpIn } from "../../controllers/hr/hrDashboard.js";
const router = express.Router();


router.get("/daily/:date", getDailyHrDash);


//sewing dashboard manpower
router.get("/manpower-daily/:date", getDataDashSewMp);
router.get("/expand-emp-card/:date/:type", getExpandEmpIn);
router.get("/emp-detail-by-line/:date/:site", getChartMpDtlByLine);

//monthly
router.get("/manpower-monthly/:monthYear", getBaseSewMpMonthly);
router.get("/monthly/:monthYear", getBaseMpMonthly);

export default router;
