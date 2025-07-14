import express from "express";
import {
  getArrHolidayByDate,
  getHolidaysByYear,
  getCalendarHolidays,
  createHoliday,
  getWorkingDays,
  updateWorkingDays,
  getWorkingDaysById,
  updateHoliday,
  deleteHoliday,
  generateWorkingDays,
  getGenerateWorkingDays,
  saveGeneratedWorkDaysFlag,
} from "../../controllers/setup/Holidays.js";
// import { verifyToken } from '../midleware/VerifyToken.js';
const router = express.Router();

router.get("/getCalendarHolidays/:year", getCalendarHolidays);
router.post("/", createHoliday);
router.post("/update", updateHoliday);
router.post("/delete", deleteHoliday);
router.post("/getGenerateWorkingDays/:year", getGenerateWorkingDays);
router.post("/generateWorkingDays", generateWorkingDays);
router.post("/saveGeneratedWorkDaysFlag", saveGeneratedWorkDaysFlag);
router.post("/workingDays/update", updateWorkingDays);
router.get("/workingDays/:id", getWorkingDaysById);
router.get("/getWorkingDays", getWorkingDays);
router.get("/:startYear/:endYear", getHolidaysByYear);
router.get("/arrayholiday/:startDate/:endDate", getArrHolidayByDate);

export default router;
