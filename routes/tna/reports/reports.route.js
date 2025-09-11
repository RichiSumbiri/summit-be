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
import { getEventAgingAnalysisAging, getEventAgingAnalysisCommitment, getEventAgingAnalysisTarget } from "../../../controllers/tna/reports/eventAgingAnalysis.js";
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
router.get(
  "/event-aging-analysis/aging-detail",
  getEventAgingAnalysisAging
);

export default router;
