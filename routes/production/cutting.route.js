import express from "express";
const router = express.Router();

import {
  adjustPlanByReturn,
  confrmReturn,
  deleteDataSewIn,
  DelQrScanSewIN,
  ListQrReturnFrmSewing,
  QrListAftrSewingIn,
  QRScanCutting,
  QRScanSewingIn,
} from "../../controllers/production/cutting/CuttingScan.js";
import {
  generateBdlOrder,
  newQRCutting,
} from "../../controllers/production/cutting/CuttingGenerateQR.js";
import {
  getCuttingOrder,
  getOrderByBLK,
} from "../../controllers/production/cutting/CuttingGetOrder.js";
import { getBaseRepCutLoad } from "../../controllers/production/cutting/CuttingLoadinRep.js";
import {
  getSchSewForCut,
  postSewToCutSchd,
} from "../../controllers/production/planning/CutSchedule.js";

// ROUTE CUTTING

router.get("/planning/:startDate/:endDate/:site", getSchSewForCut);
router.post("/sewing-to-planning", postSewToCutSchd);

router.get("/order/list/:startDate/:endDate", getCuttingOrder);
router.get("/order/bundle/:orderNo", getOrderByBLK);
router.get(
  "/qr/scan-sewing-in/:schDate/:sitename/:linename/:barcodeserial",
  QrListAftrSewingIn
);

router.post("/bundle/generate", generateBdlOrder);
router.post("/order/qrgenerate", newQRCutting);
router.post("/order/scan", QRScanCutting);
router.post("/qr/scan-sewing-in", QRScanSewingIn);
router.delete("/qr/scan-sewing-in/:barcodeserial", DelQrScanSewIN);

//return qr from sewing
router.get(
  "/qr/req-return/:sitename/:startDate/:endDate/:status",
  ListQrReturnFrmSewing
);
//return qr cnfirm in preparation
router.post(
  "/qr/req-return/",
  adjustPlanByReturn,
  deleteDataSewIn,
  confrmReturn
);

//cutting loading report
router.get("/baseReport/:startDate/:endDate/:site", getBaseRepCutLoad);

export default router;
