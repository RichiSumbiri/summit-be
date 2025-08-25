import {
  changeEventDiaryStatus,
  createOrEditEventDiary,
  deleteEventDiary,
  showEventDiary,
} from "../../../controllers/tna/eventFramework/eventDiary.js";
import {
  generatetEventFramework,
  getEventFramework,
  getOrderManagementDropdown,
} from "../../../controllers/tna/eventFramework/eventFramework.js";
import express from "express";
const router = express.Router();

//framework
router.get("/", getEventFramework);
router.post("/generate", generatetEventFramework);

//order dropdown
router.get("/order-dropdown", getOrderManagementDropdown);

//diary
router.post("/diary/", createOrEditEventDiary);
router.get("/diary/:ORDER_PO_ID/:ORDER_ID/:EVENT_ID", showEventDiary);
router.post("/diary/delete", deleteEventDiary);
router.post("/diary/change-status", changeEventDiaryStatus);

export default router;
