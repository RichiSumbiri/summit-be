import express from "express";
import { getDailyHrDash, getDataDashSewMp, getExpandEmpIn } from "../../controllers/hr/hrDashboard.js";
const router = express.Router();


router.get("/daily/:date", getDailyHrDash);


//sewing dashboard manpower
router.get("/manpower-daily/:date", getDataDashSewMp);
router.get("/expand-emp-card/:date/:type", getExpandEmpIn);


export default router;
