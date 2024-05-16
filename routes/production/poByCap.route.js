import express from "express";
import {
  getPoCapDetailCap,
  getPoCapDetailWeekSch,
  getPoCapListByer,
  getPoCapListLineStyle,
  getPoCapListStyle,
  getSizeAlocPoCap,
} from "../../controllers/production/planning/PoByCapacity.js";
const router = express.Router();

router.get("/detail-cap/:startMonth/:endMonth/:siteName", getPoCapDetailCap);
router.get(
  "/detail-week/:startMonth/:endMonth/:siteName",
  getPoCapDetailWeekSch
);
router.get("/list-cap-buyer/:startMonth/:endMonth/:siteName", getPoCapListByer);
router.get(
  "/list-cap-style/:startMonth/:endMonth/:siteName",
  getPoCapListStyle
);
router.get(
  "/list-line-style/:startMonth/:endMonth/:siteName",
  getPoCapListLineStyle
);
router.get("/po-size-alocation/:capId", getSizeAlocPoCap);

export default router;
