import express from "express";
import {
  PackInScanInDayRep,
  PackInScanInDayRepPo,
  PackInScanInDaySize,
  PackInScanInDaySizePo,
  packingInSizeSum,
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
import {
  PosPackPlanDetail,
  delPackPosum,
  getDataPoSizeForPack,
  getDataPolistPoBuyer,
  getLisPoPPID,
  getListRowDtlPo,
  getListSizeCodeByProdId,
  getListStylePack,
  getPackBox,
  getPackingPlanHd,
  getPackingPlanId,
  getPoByrBox,
  getQryListPo,
  getQrySumDetail,
  getRefPackPlanByByr,
  getResltBoxStyle,
  postDataPackPlanHeader,
  postGenerateRowBox,
  postPackBox,
  postPackBuyerPo,
  postPackPosum,
  postSetCartonStyle,
  postSetCtnPrepack,
} from "../../controllers/production/packing/PackingPlan.js";
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
router.get("/daily/scaninRep/:startDate/:endDate", PackInScanInDayRep);
router.get("/daily/scanInSumSize/:startDate/:endDate", packingInSizeSum);
router.get("/daily/scaninRepSize/:startDate/:endDate", PackInScanInDaySize);
router.get("/daily/scaninRepPo/:scanDate", PackInScanInDayRepPo);
router.get("/daily/scaninRepSizePo/:scanDate", PackInScanInDaySizePo);

//packing style
router.get("/list-style-setup/:buyer", getListStylePack);
router.get("/list-box-buyer/:buyer", getPackBox);
router.get("/list-size-code/:prodItemCode", getListSizeCodeByProdId);
router.get("/getresult-box-style/:prodItemCode", getResltBoxStyle);
router.post("/list-box-buyer", postPackBox);
router.post("/set-box-style-size/:prodItemCode", postSetCartonStyle);
router.post("/set-box-style-size-prepack/:prodItemCode", postSetCtnPrepack);

// packing plan

router.get("/plann/id", getPackingPlanId);
router.get(`/plann-header/:customer/:startDate/:endDate`, getPackingPlanHd);
router.get("/plann-polist-for-ppid/:ppid", getLisPoPPID);

//list ref packing plan modal
router.get("/plann-referensi/:customer", getRefPackPlanByByr);
router.get("/plann-ref-ponumber/:buyer/:poNum", getQryListPo);
router.get("/plann-poList-buyer/:poNum", getDataPolistPoBuyer);
router.get("/plann-podetail-size/:poNum/:ppid", getDataPoSizeForPack);
router.get("/plann-podetail-summary/:poNum/:ppid", getQrySumDetail);
router.get("/plann-poboxdetail/:poNum/:ppid", getPoByrBox);
router.get("/plann-rowDetail/:ppid", getListRowDtlPo);

router.post("/plann-data/", postDataPackPlanHeader);
router.post("/plann-detail-size/", PosPackPlanDetail);
router.post("/plann-po-summary/", postPackPosum);
router.post("/po-buyer-data/", postPackBuyerPo);

router.delete("/plann-po-summary", delPackPosum);

//post data generate row
router.post("/generate-row-box/", postGenerateRowBox);
export default router;
