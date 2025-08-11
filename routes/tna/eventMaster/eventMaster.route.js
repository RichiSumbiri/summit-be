import {
  createEventMaster,
  deleteEventMaster,
  editEventMaster,
  getEventMaster,
  showEventMaster,
} from "../../../controllers/tna/eventMaster/eventMaster.js";
import express from "express";
import {
  createEventMasterComments,
  deleteEventMasterComments,
  editEventMasterComments,
  getEventMasterComments,
  showEventMasterComments,
} from "../../../controllers/tna/eventMaster/eventMasterComments.js";

const router = express.Router();

//master
router.get("/", getEventMaster);
router.post("/", createEventMaster);
router.get("/:id", showEventMaster);
router.put("/:id", editEventMaster);
router.post("/delete", deleteEventMaster);

//comments
router.get("/comments/get", getEventMasterComments);
router.post("/comments", createEventMasterComments);
router.get("/comments/:id", showEventMasterComments);
router.put("/comments/:id", editEventMasterComments);
router.post("/comments/delete", deleteEventMasterComments);

export default router;
