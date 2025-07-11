import express from "express";
import { addNewListSize, chgStatusIeOb, deleteFeatures, deleteIeObDetail, deleteIeObSketch, deleteMultipleIeObDetail, deleteOneObFtrs, deletIeOb, getDataTreeStyleOb, getImageOb, getListFeatures, getlistObApi, getListObDetail, getListObHistory, getlistObItemCode, getListStyleByOb, getListSugesObRow, getObData, getObFeatures, getRefObDetail, getSizesOb, getSizesObSelected, patchIeOb, postFeatures, postIeOb, postIeObDetail, postIeObSketch, postImportObDetail, postNewFeatures, postObRemark, prePostIeObDetail, reNoIeObDetail, returnPostIeObDetail, sortFeatures, sortObDetail } from "../../controllers/production/ie/IeOpBreakdown.js";
import { afterPostHeaderCt, deleteCtHeader, deleteCtMp, deleteIeCtDetailCount, deleteIeCtMpProccesses, getBaseDataIeCyc, getIeCtBarChartSeries, getIeCtDetailCount, getIeCtGroupCount, getIeCtMppGroupCount, getListCtHeader, getSewRepEffforCt, midGetAvgMpp, patchHeaderIeCt, patchIeCtMpProccesses, postHeaderIeCt, postIeCtDetailCount, postIeCtMp, postIeCtMpProccesses, postIeGroupCount, qryGetEmpForCt } from "../../controllers/production/ie/IeCycleTime.js";
const router = express.Router();

router.get("/style-three", getDataTreeStyleOb);
router.get("/list-style/:buyer", getListStyleByOb);
router.post("/list-sizes", addNewListSize);
router.get("/list-sizes/:prodType", getSizesOb);

router.post("/ob", postIeOb);
router.patch("/ob", patchIeOb);
router.post("/ob-remarks", postObRemark);
router.post("/ob-change-status", chgStatusIeOb);
router.delete("/ob/:obId", deletIeOb);
router.get("/list-ob/:prodItemId", getlistObApi);
router.get("/ob-sizes/:obId", getSizesObSelected);
router.get("/ob/:obId", getObData);
router.post("/ob-features", postFeatures);
router.delete("/ob-features/:idObFeatures/:obId/:userId", deleteOneObFtrs );
router.patch("/ob-sort-features", sortFeatures);
router.post("/list-features", postNewFeatures);
router.delete("/list-features/:prodType/:obId/:featuresId", deleteFeatures);
router.get("/ob-features/:prodType/:obId", getListFeatures); //ini untuk modal ob
router.get("/ob-features-use/:obId", getObFeatures); // ini yang sudah dipilih
router.get("/ob-referensi", getRefObDetail);
router.post("/ob-detail", prePostIeObDetail, postIeObDetail, reNoIeObDetail, returnPostIeObDetail); //post dan update
router.delete("/ob-detail/:obDetailId/:userId", deleteIeObDetail, reNoIeObDetail, returnPostIeObDetail); //delete
router.get("/ob-detail/:obId", getListObDetail);
router.get("/ob-sugest-list/:featId", getListSugesObRow);
router.post("/ob-sketch", postIeObSketch);
router.delete("/ob-sketch/:obId/:tabsSketch", deleteIeObSketch);
router.post("/ob-detail/delete-multiple", deleteMultipleIeObDetail, reNoIeObDetail, returnPostIeObDetail); //delete multiple sketches
router.post("/ob-sort-detail", sortObDetail); //sort based on features
router.get("/ob-history/:obId", getListObHistory); //get history of ob detail
router.post("/ob-import-detail-excel", postImportObDetail, returnPostIeObDetail);
router.get("/ob-image/:obid/:skecthStatus", getImageOb);


//ie cycle time
// router.get("/ob-header-by-item-code/:buyer/:prodItemCode", getlistObItemCode);
router.get("/sewing-day-eff/:schDate/:sitename", getSewRepEffforCt);
router.get("/list-ct-site/:schDate/:sitename", getListCtHeader);
router.get("/get-emp-for-ct/:inputQry", qryGetEmpForCt);
router.get("/get-base-detail-ct/:ctId", getBaseDataIeCyc);
router.get("/get-barchart-ct/:ctId", getIeCtBarChartSeries);
// router.get("/get-mpp-group-ct/:ctId", getIeCtMppGroupCount);
router.get("/cycle-time-group-count/:ctId/:ieMpId", getIeCtGroupCount);
router.get("/cycle-time-detail-count/:ctId/:ieMpId/:ieMppId", getIeCtDetailCount);

router.post("/cycle-time-header", postHeaderIeCt, afterPostHeaderCt)
router.patch("/cycle-time-header", patchHeaderIeCt)

router.post("/cycle-time-manpower", postIeCtMp)
router.post("/cycle-time-manpower-proccesses", postIeCtMpProccesses)
router.patch("/cycle-time-manpower-proccesses", patchIeCtMpProccesses) //edit untuk remark
router.post("/cycle-time-group-count", postIeGroupCount)
router.post("/cycle-time-detail-count", postIeCtDetailCount, midGetAvgMpp)
router.delete("/cycle-time-detail-count/:ctDetailId", deleteIeCtDetailCount, midGetAvgMpp)
router.delete("/cycle-time-heade/:ctId", deleteCtHeader)
router.delete("/cycle-time-manpower/:ctMpId", deleteCtMp)
router.delete("/cycle-time-manpower-proccesses/:ctId/:ctMpId", deleteIeCtMpProccesses)



export default router;
