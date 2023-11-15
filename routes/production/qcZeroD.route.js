import express from "express";
import {
  getListDefPvh,
  getListLineZd,
  getListSiteZd,
  getPoSearchZd,
} from "../../controllers/production/quality/QcZeroDefect.js";
const router = express.Router();

router.get("/listsite", getListSiteZd);
router.get("/listline", getListLineZd);
router.get("/po-number", getPoSearchZd);
router.get("/list-def-pvh", getListDefPvh);

export default router;
