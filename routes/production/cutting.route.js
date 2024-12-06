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
  QRScanSewingInSpesifik,
} from "../../controllers/production/cutting/CuttingScan.js";
import {
  generateBdlOrder,
  newQRCutting,
} from "../../controllers/production/cutting/CuttingGenerateQR.js";
import {
  getCuttingOrder,
  getOrderByBLK,
} from "../../controllers/production/cutting/CuttingGetOrder.js";
import {
  getBaseRepCutLoad,
  getCuttingPOStatdtl,
  getCuttingPOstatus,
} from "../../controllers/production/cutting/CuttingLoadinRep.js";
import {
  delHeadCutSch,
  delHeadCutSchSize,
  delHeadCutSchSizeDtil,
  DelQrScanMolIN,
  DelQrScanMolOUT,
  DelQrScanSupIN,
  DelQrScanSupOUT,
  getCutDailySizePlan,
  getCutSupReport,
  getCuttingSchedule,
  getCuttingSchReal,
  getDailyCutSch,
  getDailyCutSchSize,
  getExlPlanLoad,
  getExlPlanSpread,
  getInfoDetailSize,
  getMolReport,
  getRepCutSupSummary,
  getResulSacnMolIN,
  getResulSacnMolOut,
  getResulSacnSupIN,
  getResulSacnSupOut,
  getSchSewForCut,
  PostDetailCutSch,
  postSchCutFromLoad,
  postSewToCutSchd,
  QRScanMolIn,
  QRScanMolOut,
  QRScanSuperMarketIn,
  QRScanSuperMarketOut,
} from "../../controllers/production/planning/CutSchedule.js";
import { getCutDeptPrepWip, getCutDeptSewingWip, getCutDeptWipProccess, getDataDashCutting, getDetailCutOutput, getLoadPlanVsActual, getLowWipLoad, getMolSupSewDtl, getPlanVSactDtl } from "../../controllers/production/dashAnalitycs/DashCutting.js";

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
router.delete(
  "/planing/schedule-size-detail/:cutSch/:sizeCode/:detailIdSize",
  delHeadCutSchSizeDtil
);
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
router.get("/result-molding-in/", getResulSacnMolIN);
router.get("/result-molding-out/", getResulSacnMolOut);

// router.get("/order/list/:startDate/:endDate", getCuttingOrder);
router.get("/order/bundle/:orderNo", getOrderByBLK);
router.get(
  "/qr/scan-sewing-in/:schDate/:sitename/:linename/:barcodeserial",
  QrListAftrSewingIn
);

router.post("/bundle/generate", generateBdlOrder);
router.post("/order/qrgenerate", newQRCutting);
router.post("/order/scan", QRScanCutting);
router.post("/qr/scan-sewing-in", QRScanSewingIn);
router.post("/qr/scan-sewing-in-spesifik", QRScanSewingInSpesifik);
router.post("/qr/scan-supermarket-in", QRScanSuperMarketIn);
router.post("/qr/scan-supermarket-out", QRScanSuperMarketOut);
router.post("/qr/scan-molding-in", QRScanMolIn);
router.post("/qr/scan-molding-out", QRScanMolOut);
router.delete("/qr/scan-sewing-in/:barcodeserial", DelQrScanSewIN);
router.delete("/qr/scan-supermarket-in/:barcodeserial", DelQrScanSupIN);
router.delete("/qr/scan-supermarket-out/:barcodeserial", DelQrScanSupOUT);
router.delete("/qr/scan-molding-in/:barcodeserial", DelQrScanMolIN);
router.delete("/qr/scan-molding-out/:barcodeserial", DelQrScanMolOUT);

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
router.get(
  "/excel-sprading-schedule/:startDate/:endDate/:site",
  getExlPlanSpread
);

//cutting supermarket report
router.get(
  "/cutting-supermarket-report/:startDate/:endDate/:site",
  getCutSupReport
);
router.get(
  "/cutting-supermarket-summary/:startDate/:endDate/:lastDate",
  getRepCutSupSummary
);

//cutting molding in out
router.get("/molding-report/:startDate/:endDate", getMolReport);
// router.get("/molding-report/:startDate/:endDate/:site", getMolReport);

//cutting po status report
router.get("/cutting-po-status/:poNum/:date", getCuttingPOstatus);
router.get("/cutting-po-status-detail/:poId/:size", getCuttingPOStatdtl);


//cutting dashboard
router.get("/cutting-dashboard", getDataDashCutting);
router.get("/cutting-dashboard-plan-vs-actual", getLoadPlanVsActual);
router.get("/cutting-dashboard-sewing-wip/:date", getCutDeptSewingWip);
router.get("/cutting-dashboard-prep-wip/:date", getCutDeptPrepWip);
router.get("/cutting-dashboard-cut-wip/:date", getCutDeptWipProccess);
router.get("/cutting-dashboard-prepline-wip/:date", getLowWipLoad);

//cutting dashboard chart action
router.get("/cutting-dashboard-detail-output", getDetailCutOutput);
router.get("/cutting-dashboard-dtl-out-excuting", getMolSupSewDtl);
router.get("/cutting-dashboard-dtl-plan-vs-actual", getPlanVSactDtl);


export default router;
