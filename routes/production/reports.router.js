import express from "express";
import {
  getSewDayRepPO,
  getSewDayRepSchd,
  getSewDayRepSize,
  getSewDayRepSizePo,
} from "../../controllers/production/reports/SewOutDayRep.js";
import {
  getBlkTrace,
  getTrackQrSplit,
  getWorkerDoneRep,
} from "../../controllers/production/reports/WorkerdoneRep.js";
import { getSewRepEff } from "../../controllers/production/reports/SewDailyEffRep.js";
import { getDataQrTrackOne } from "../../controllers/production/reports/QrTrackingOne.js";
const router = express.Router();

router.get("/workerdone/:startDate/:endDate", getWorkerDoneRep);
router.get("/bundletracking/:startDate/:endDate", getBlkTrace);
router.get("/bundletracking-split/:barcodeserial", getTrackQrSplit);

// sewing dayli output report
router.get("/sewing-day-ouput/:schDate/:sitename/:shift", getSewDayRepSchd);
router.get(
  "/sewing-day-ouput-size/:schDate/:sitename/:shift",
  getSewDayRepSize
);
router.get("/sewing-day-ouput-bypo/:schDate/:sitename/:shift", getSewDayRepPO);
router.get(
  "/sewing-day-ouput-size-bypo/:schDate/:sitename/:shift",
  getSewDayRepSizePo
);

//sewin daily eff
router.get("/sewing-day-eff/:schDate/:sitename", getSewRepEff);

//tracking qr one
router.get("/tracking-qr-one/:barcodeserial", getDataQrTrackOne);

export default router;
