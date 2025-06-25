import express from "express";
import { getBaseMpMonthly, getBaseSewMpMonthly, getChartMpDtlByLine, getDailyHrDash, getDataDashSewMp, getExpandEmpIn, getRecapEmpTotalMonthly } from "../../controllers/hr/hrDashboard.js";
import { getLogMatrixSkillDaily } from "../../controllers/hr/skills.js";
const router = express.Router();


router.get("/daily/:date", getDailyHrDash);


//sewing dashboard manpower
router.get("/manpower-daily/:date", getDataDashSewMp);
router.get("/expand-emp-card/:date/:type", getExpandEmpIn);
router.get("/emp-detail-by-line/:date/:site", getChartMpDtlByLine);

//monthly
router.get("/manpower-monthly/:monthYear", getBaseSewMpMonthly);
router.get("/monthly/:monthYear", getBaseMpMonthly);

//yearly
router.get("/current-year", getRecapEmpTotalMonthly);

// matrix skill dashboard
router.get("/matrix-skill-daily/:tanggal", getLogMatrixSkillDaily);
export default router;
