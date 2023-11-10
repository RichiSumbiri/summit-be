import express from "express";
import {
  getListLineZd,
  getListSiteZd,
} from "../../controllers/production/quality/QcZeroDefect.js";
const router = express.Router();

router.get("/listsite", getListSiteZd);
router.get("/listline", getListLineZd);

export default router;
