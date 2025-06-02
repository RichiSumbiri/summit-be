import express from "express";
import { deleteIeObDetail, deleteIeObSketch, deletIeOb, getDataTreeStyleOb, getListFeatures, getlistObApi, getListObDetail, getListStyleByOb, getObData, getRefObDetail, getSizesOb, getSizesObSelected, patchIeOb, postFeatures, postIeOb, postIeObDetail, postIeObSketch, prePostIeObDetail, reNoIeObDetail, returnPostIeObDetail } from "../../controllers/production/ie/IeOpBreakdown.js";
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
router.get("/ob-features/:prodType/:obId", getListFeatures);
router.get("/ob-referensi", getRefObDetail);
router.post("/ob-detail", prePostIeObDetail, postIeObDetail, reNoIeObDetail, returnPostIeObDetail); //post dan update
router.delete("/ob-detail/:obDetailId", deleteIeObDetail, reNoIeObDetail, returnPostIeObDetail); //delete
router.get("/ob-detail/:obId", getListObDetail);
router.post("/ob-sketch", postIeObSketch);
router.delete("/ob-sketch/:obId", deleteIeObSketch);




export default router;
