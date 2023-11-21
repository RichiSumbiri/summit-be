import express from "express";
import {
  deleteDataZd,
  getDataDetailZd,
  getDataHeaderZd,
  getListDefPvh,
  getListLineZd,
  getListSiteZd,
  getPoSearchZd,
  posDataZd,
  updateDataZd,
} from "../../controllers/production/quality/QcZeroDefect.js";
const router = express.Router();

router.get("/listsite", getListSiteZd);
router.get("/listline", getListLineZd);
router.get("/po-number", getPoSearchZd);
router.get("/list-def-pvh", getListDefPvh);
router.get("/data-detail-byid/:zdId", getDataDetailZd);
router.get("/data-header/:startDate/:endDate", getDataHeaderZd);

router.post("/add-data", posDataZd);
router.patch("/update-data", updateDataZd);
router.delete("/delete-data/:zdId", deleteDataZd);

export default router;
