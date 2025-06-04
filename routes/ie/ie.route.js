import express from "express";
import { deleteIeObDetail, deleteIeObSketch, deleteMultipleIeObDetail, deletIeOb, getDataTreeStyleOb, getListFeatures, getlistObApi, getListObDetail, getListObHistory, getListStyleByOb, getListSugesObRow, getObData, getObFeatures, getRefObDetail, getSizesOb, getSizesObSelected, patchIeOb, postFeatures, postIeOb, postIeObDetail, postIeObSketch, postImportObDetail, prePostIeObDetail, reNoIeObDetail, returnPostIeObDetail, sortObDetail } from "../../controllers/production/ie/IeOpBreakdown.js";
const router = express.Router();

router.get("/style-three", getDataTreeStyleOb);
router.get("/list-style/:buyer", getListStyleByOb);
router.get("/list-sizes/:prodType", getSizesOb);

router.post("/ob", postIeOb);
router.patch("/ob", patchIeOb);
router.delete("/ob/:obId", deletIeOb);
router.get("/list-ob/:prodItemId", getlistObApi);
router.get("/ob-sizes/:obId", getSizesObSelected);
router.get("/ob/:obId", getObData);
router.post("/ob-features", postFeatures);
router.get("/ob-features/:prodType/:obId", getListFeatures); //ini untuk modal ob
router.get("/ob-features-use/:obId", getObFeatures); // ini yang sudah dipilih
router.get("/ob-referensi", getRefObDetail);
router.post("/ob-detail", prePostIeObDetail, postIeObDetail, reNoIeObDetail, returnPostIeObDetail); //post dan update
router.delete("/ob-detail/:obDetailId/:userId", deleteIeObDetail, reNoIeObDetail, returnPostIeObDetail); //delete
router.get("/ob-detail/:obId", getListObDetail);
router.get("/ob-sugest-list/:featId", getListSugesObRow);
router.post("/ob-sketch", postIeObSketch);
router.delete("/ob-sketch/:obId", deleteIeObSketch);
router.post("/ob-detail/delete-multiple", deleteMultipleIeObDetail, reNoIeObDetail, returnPostIeObDetail); //delete multiple sketches
router.post("/ob-sort-detail", sortObDetail); //sort based on features
router.get("/ob-history/:obId", getListObHistory); //get history of ob detail
router.post("/ob-import-detail-excel", postImportObDetail, returnPostIeObDetail);





export default router;
