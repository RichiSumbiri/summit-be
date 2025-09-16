import express from "express";
import {
  getEventListingDiary,
  getEventListingMaster,
} from "../../../controllers/tna/reports/eventListing.js";
import {
  getEventAchievementAnalysisDepartment,
  getEventAchievementAnalysisDetail,
  getEventAchievementAnalysisEvent,
  getEventAchievementAnalysisOwner,
} from "../../../controllers/tna/reports/eventAchievementView.js";
import {
  getEventAgingAnalysisAging,
  getEventAgingAnalysisCommitment,
  getEventAgingAnalysisTarget,
} from "../../../controllers/tna/reports/eventAgingAnalysis.js";
import {
  getEventSheduleStatusDepartment,
  getEventSheduleStatusDetail,
  getEventSheduleStatusEvent,
} from "../../../controllers/tna/reports/eventScheduleStatus.js";
const router = express.Router();

//event listing
router.get("/event-listing/master-event", getEventListingMaster);
router.get("/event-listing/diary-event", getEventListingDiary);

//event achievement analysis
router.get(
  "/event-achievement-analysis/event-view",
  getEventAchievementAnalysisEvent
);
router.get(
  "/event-achievement-analysis/owner-view",
  getEventAchievementAnalysisOwner
);
router.get(
  "/event-achievement-analysis/department-view",
  getEventAchievementAnalysisDepartment
);
router.get(
  "/event-achievement-analysis/detail-view",
  getEventAchievementAnalysisDetail
);

//event aging analysis
router.get(
  "/event-aging-analysis/target-due-date",
  getEventAgingAnalysisTarget
);
router.get(
  "/event-aging-analysis/commitment-due-date",
  getEventAgingAnalysisCommitment
);
router.get("/event-aging-analysis/aging-detail", getEventAgingAnalysisAging);

//event schedule status
router.get("/event-schedule-status/event-view", getEventSheduleStatusEvent);
router.get(
  "/event-schedule-status/department-view",
  getEventSheduleStatusDepartment
);
router.get("/event-schedule-analysis/detail-view", getEventSheduleStatusDetail);

export default router;
