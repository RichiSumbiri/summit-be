import express from "express";
import {
  getEventListingDiary,
  getEventListingMaster,
} from "../../../controllers/tna/reports/eventListing.js";
const router = express.Router();

//event listing
router.get("/event-listing/master-event", getEventListingMaster);
router.get("/event-listing/diary-event", getEventListingDiary);

export default router;
