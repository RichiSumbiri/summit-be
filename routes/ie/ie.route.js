import express from "express";
import { deletIeOb, getDataTreeStyleOb, getListFeatures, getlistObApi, getListStyleByOb, getObData, getRefObDetail, getSizesOb, getSizesObSelected, patchIeOb, postFeatures, postIeOb } from "../../controllers/production/ie/IeOpBreakdown.js";
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




export default router;
