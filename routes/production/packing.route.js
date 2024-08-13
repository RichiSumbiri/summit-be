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
  PostOneDtlRowPpid,
  addNewRowSolid,
  chgCtnStartNo,
  copyFromStyle,
  delOneDetailPpid,
  delPackPosum,
  deletePPIDEntire,
  deletePackBox,
  deleteRowSolid,
  deleteSetCartonStyle,
  deleteSetCtnStyleDetail,
  editDataPackPlanChild,
  getDataPoSizeForPack,
  getDataPolistPoBuyer,
  getLisPoPPID,
  getListRowDtlPo,
  getListSetCtnStyle,
  getListSizeCodeByProdId,
  getListStylePack,
  getPackBox,
  getPackPlanMethod,
  getPackingPlanHd,
  getPackingPlanId,
  getPoByrBox,
  getQryListPo,
  getQrySumDetail,
  getRefPackPlanByByr,
  getResltBoxStyle,
  getRowIdAndIndex,
  getSequanceId,
  postCstmSetSortSize,
  postDataPackPlanChild,
  postDataPackPlanHeader,
  postGenPrePack,
  postGenerateRowBox,
  postPackBox,
  postPackBuyerPo,
  postPackPosum,
  postSetCartonStyle,
  postSetCtnPrepack,
  setBoxIdRow,
  setStartCtnSatu,
  switchGenToMnl,
  updateBoxCtnStylDetail,
  updateDataPackPlanHeader,
  updateOneRowPpid,
  updatePpackRowNdetail,
} from "../../controllers/production/packing/PackingPlan.js";
import {
  genShipLabelCtn,
  getContainerList,
  getListShipPlanScan,
  getQryListShipId,
  scanShipmentBox,
} from "../../controllers/production/packing/PackShipScan.js";
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
router.get("/list-size-code/:styleOrder", getListSizeCodeByProdId);
router.get("/list-set-ctn-result/:styleOrder", getListSetCtnStyle);
router.get("/getresult-box-style/:prodItemCode", getResltBoxStyle);
router.post("/list-box-buyer", postPackBox);
router.post("/set-box-style-size", postSetCartonStyle);
router.post("/copy-setbox-from", copyFromStyle);
router.patch("/set-box-style-size", updateBoxCtnStylDetail);
router.post("/set-box-style-delete", deleteSetCartonStyle); //untuk delete pake array
router.post("/set-box-style-delete-detail", deleteSetCtnStyleDetail); //untuk delete pake array detail
router.post("/set-box-style-size-prepack/:prodItemCode", postSetCtnPrepack);
router.delete("/list-box-buyer/:BOX_ID/:BUYER_CODE", deletePackBox);

// packing plan

router.get("/plann/id", getPackingPlanId);
router.get("/plann-seq-no/:ppid", getSequanceId);
router.get("/plann-pack-methode", getPackPlanMethod);
router.get(`/plann-header/:customer/:startDate/:endDate`, getPackingPlanHd);
// data utama tiap render page packing plan input detail
router.get("/plann-polist-for-ppid/:ppid", getLisPoPPID);

//list ref packing plan modal
router.get("/plann-referensi/:customer", getRefPackPlanByByr);
router.get("/plann-ref-ponumber/:buyer/:poNum", getQryListPo);
router.get("/plann-poList-buyer/:poNum/:seqID", getDataPolistPoBuyer);
router.get("/plann-podetail-size/:ppidSeqId", getDataPoSizeForPack);
router.get("/plann-podetail-summary/:ppidSeqId", getQrySumDetail);
router.get("/plann-poboxdetail/:seqPoPpid", getPoByrBox);
router.get("/plann-rowDetail/:ppid", getListRowDtlPo);

router.post("/plann-data/", postDataPackPlanHeader);
router.post("/plan-data-child/", postDataPackPlanChild);
router.post("/plan-data-child-edit/", editDataPackPlanChild);
router.patch("/plann-data/", updateDataPackPlanHeader);
router.post("/plann-detail-size/", PosPackPlanDetail);
router.post("/plann-po-summary/", postPackPosum);
router.post("/plann-po-summary/", postPackPosum);
router.post("/custom-sort-size/", postCstmSetSortSize);

router.patch("/update-one-rows-ppid/", updateOneRowPpid);
router.patch("/update-one-rows-manual/:rowsId", switchGenToMnl);

router.delete("/plann-po-summary", delPackPosum);
router.delete("/plann-data/:PPID", deletePPIDEntire);

// detail row manual add and delete
router.post("/packing-add-detail-one", PostOneDtlRowPpid);
router.delete("/packing-delete-detail-one/:rowId/:size", delOneDetailPpid);

//post data generate row
router.post("/generate-row-box/", postGenerateRowBox);
router.post("/generate-row-box-prepack/", postGenPrePack);
router.post("/change-row-box-prepack/", chgCtnStartNo);
router.post("/update-prepack-row/", updatePpackRowNdetail);

//get new row manua;
router.get("/get-row-id-data/:seqIds/:colorCodes", getRowIdAndIndex);
router.post("/new-row-data", addNewRowSolid);

//action by selected
router.post("/plann-row-array-delete/", deleteRowSolid);
router.post("/plann-row-array-update-start-ctn/", setStartCtnSatu);
router.post("/plann-row-array-update-box-row/", setBoxIdRow);

//shipment
router.get("/shipment-scan/container-ship/:sid", getContainerList);
router.get("/shipment-scan/base-data/:sid/:conId", getListShipPlanScan);
router.get("/shipment-scan/ref-list/:sidKey", getQryListShipId);

router.post("/shipment-scan/generate-label/", genShipLabelCtn);

router.post("/shipment-scan/box-scan", scanShipmentBox);

export default router;
