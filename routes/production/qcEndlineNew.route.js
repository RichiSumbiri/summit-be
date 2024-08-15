import express from "express";
import {
  addAndTransferSplit,
  checkSchdId,
  getDailyPlanningQCendNew,
  getEndlineSchSize,
  getListQrSplit,
  getLogInputQcEndline,
  getQrDefectList,
  getQrListActive,
  getQrListPenddingNew,
  getQrSelected,
  getUndoCount,
  handleExeUndo,
  postEndlineQc,
  rapairedPost,
  sewingScanOutQrSplit,
} from "../../controllers/production/quality/QcEndlineNew.js";
const router = express.Router();

//planning size endline
router.get(
  "/dailyplanning/:plannDate/:sitename/:linename/:idstieline/:shift/",
  getDailyPlanningQCendNew
);
router.get("/schedule-size/:schDate/:sitename/:linename", getEndlineSchSize);
router.get("/schedule-size-qr/:schDate/:sitename/:linename", getQrListActive);
router.get("/qr-pendding/:schDate/:sitename/:linename", getQrListPenddingNew);
router.get("/qr-selected/:barcodeSerial", getQrSelected);
router.get("/qr-selected-defect/:barcodeSerial", getQrDefectList);
router.get("/count-undo/:barcodeSerial/:userQc", getUndoCount);
router.get("/qr-splited/:barcodeSerial", getListQrSplit);
router.get("/log-tablet/:schDate/:sitename/:linename", getLogInputQcEndline);
router.get("/log-tablet/:schDate/:sitename/:linename", getLogInputQcEndline);
router.get("/check-schedule/:SCHD_ID", checkSchdId);

//post
router.post("/output/", postEndlineQc);
router.post("/qr/split-transfer/", addAndTransferSplit);
router.post("/qr/split-transfer-one/", sewingScanOutQrSplit);
router.patch("/repaired/", rapairedPost);
router.patch("/exe-undo/", handleExeUndo);
export default router;
