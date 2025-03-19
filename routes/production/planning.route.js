import express from "express";
import {
  getCheckHoliday,
  getDailyPlanning,
  getDailyPlanningQCend,
  getDailySchSewIn,
  getOneSchDailyPlan,
  postSwitchToOt,
  syncLogDailyOutput,
} from "../../controllers/production/planning/DailyPlanning.js";
import {
  checkBdllBfrDel,
  checkSchBforAdd,
  deleteSchDataDetail,
  deleteSchHeader,
  getCapacity,
  getDayliSch,
  getGroupHeaderWeekSch,
  getHeaderWeekSch,
  getOneCapacity,
  getOneGroupDayliSch,
  getOneHeaderWeekSch,
  getPlanSizeAlocUpd,
  patchSchDataDetail,
  postSchDataDetail,
  postSchDataHeader,
  updateDataHeader,
} from "../../controllers/production/planning/WeeklyPlaning.js";
import { ListSizeSewingScanIn } from "../../controllers/production/cutting/CuttingScan.js";

const router = express.Router();
router.post("/header", postSchDataHeader);
router.patch("/header", updateDataHeader);
router.delete("/header/:id", deleteSchHeader);
router.post("/check-header", checkSchBforAdd);

router.get("/capacity/:capId", getOneCapacity);
router.get("/capacity/:startMonth/:endMonth", getCapacity);
router.get("/header/:startDate/:endDate/:site", getHeaderWeekSch);
router.get("/one/header/:schId", getOneHeaderWeekSch);
router.get("/group-header/header/:capId", getGroupHeaderWeekSch);
router.get("/size-alocation/:capId/:schId", getPlanSizeAlocUpd);

router.post("/daily", postSchDataDetail);
router.patch("/daily", patchSchDataDetail);
router.delete("/daily/:schId/:schdId", checkBdllBfrDel, deleteSchDataDetail);
router.get("/daily/:startDate/:endDate/:site/:schId", getDayliSch);
router.get("/group/:schId", getOneGroupDayliSch);

//daily-planning
router.get("/planning-daily/:plannDate/:sitename/:shift", getDailyPlanning);
router.get("/planning-daily-one/:plannDate/:schdId/:shift", getOneSchDailyPlan);
router.get("/planning-daily-ceheckholiday/:plannDate", getCheckHoliday);
// router.get("/planning-sycn-log/:schDate/:sitename/:shift", syncLogDailyOutput);
//daily-planning sewing in
router.get("/planning-daily-sewin/:plannDate/:sitename", getDailySchSewIn);
router.get(
  "/planning-daily-sewin-size/:schDate/:sitename",
  ListSizeSewingScanIn
);

router.post("/planning-daily-switch-to-ot", postSwitchToOt);

//daily-planning qcEndLine
router.get(
  "/planning-daily-qcend/:plannDate/:sitename/:linename/:idstieline/:shift/",
  getDailyPlanningQCend
);

export default router;
