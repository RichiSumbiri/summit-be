import express from "express";
import {
  PackInScanInDayRep,
  PackInScanInDayRepPo,
  PackInScanInDaySize,
  PackInScanInDaySizePo,
} from "../../controllers/production/packing/PackingReport.js";
import {
  getDailyPlanPackIn,
  QrListAftrPackingIn,
  ScanPackingQrIn,
} from "../../controllers/production/packing/PackingScan.js";
import {
  generateSplitByScan,
  getPackingQrSplitList,
  qrSplitGenerate,
} from "../../controllers/production/packing/PackingQrSplit.js";
const router = express.Router();

router.get(
  "/qr/scanin-result/:scanDate/:linename/:barcodeserial",
  QrListAftrPackingIn
);
router.get("/scanin/daily-schedule/:schDate", getDailyPlanPackIn);
router.get("/qr-split-list/:startDate/:endDate/:site", getPackingQrSplitList);

router.post("/qr-split-print/", qrSplitGenerate);
router.post("/qr-split-print-by-scan/", generateSplitByScan);

router.post("/qr/scanin", ScanPackingQrIn);

//packing in report
router.get("/daily/scaninRep/:scanDate", PackInScanInDayRep);
router.get("/daily/scaninRepSize/:scanDate", PackInScanInDaySize);
router.get("/daily/scaninRepPo/:scanDate", PackInScanInDayRepPo);
router.get("/daily/scaninRepSizePo/:scanDate", PackInScanInDaySizePo);
export default router;
