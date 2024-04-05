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
  delHeadCutSch,
  delHeadCutSchSize,
  DelQrScanSupIN,
  DelQrScanSupOUT,
  getCutDailySizePlan,
  getCutSupReport,
  getCuttingSchedule,
  getCuttingSchReal,
  getDailyCutSch,
  getDailyCutSchSize,
  getExlPlanLoad,
  getInfoDetailSize,
  getResulSacnSupIN,
  getResulSacnSupOut,
  getSchSewForCut,
  PostDetailCutSch,
  postSchCutFromLoad,
  postSewToCutSchd,
  QRScanSuperMarketIn,
  QRScanSuperMarketOut,
} from "../../controllers/production/planning/CutSchedule.js";

// ROUTE CUTTING

router.get("/planning/:startDate/:endDate/:site", getSchSewForCut);
router.get("/planning-loading/:startDate/:endDate/:site", getCuttingSchedule);
router.get(
  "/planning-loading-real/:startDate/:endDate/:site",
  getCuttingSchReal
);
router.post("/sewing-to-planning", postSewToCutSchd);
router.post("/planing/schedule-detail/", PostDetailCutSch);
router.post("/planing/get-schedule/", postSchCutFromLoad);
router.delete("/planing/schedule/:cutSch", delHeadCutSch);
router.delete("/planing/schedule-size/:cutSch/:sizeCode", delHeadCutSchSize);
router.get(
  "/planing-info-schedule-size/:cutIdSize/:schId/:sizeCode",
  getInfoDetailSize
);
router.get("/planning-daily-plan-size/:schDate/:site", getCutDailySizePlan);

//daily plan cutting
router.get("/planning-supermarket/:schDate/:site", getDailyCutSch);
router.get("/planning-supermarket-size/:schDate/:site", getDailyCutSchSize);
router.get("/result-supermarket-in/:schDate/:site", getResulSacnSupIN);
router.get("/result-supermarket-out/:schDate/:site", getResulSacnSupOut);

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
router.post("/qr/scan-supermarket-in", QRScanSuperMarketIn);
router.post("/qr/scan-supermarket-out", QRScanSuperMarketOut);
router.delete("/qr/scan-sewing-in/:barcodeserial", DelQrScanSewIN);
router.delete("/qr/scan-supermarket-in/:barcodeserial", DelQrScanSupIN);
router.delete("/qr/scan-supermarket-out/:barcodeserial", DelQrScanSupOUT);

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

//export excel loading schedule
router.get("/excel-loading-schedule/:startDate/:endDate/:site", getExlPlanLoad);

//cutting supermarket report
router.get(
  "/cutting-supermarket-report/:startDate/:endDate/:site",
  getCutSupReport
);

export default router;
