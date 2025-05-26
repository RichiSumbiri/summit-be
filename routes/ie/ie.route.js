import express from "express";
import { deletIeOb, getDataTreeStyleOb, getlistObApi, getListStyleByOb, getSizesOb, getSizesObSelected, patchIeOb, postIeOb } from "../../controllers/production/ie/IeOpBreakdown.js";
const router = express.Router();

router.get("/style-three", getDataTreeStyleOb);
router.get("/list-style/:buyer", getListStyleByOb);
router.get("/list-sizes/:prodType", getSizesOb);

router.post("/ob", postIeOb);
router.patch("/ob", patchIeOb);
router.delete("/ob/:obId", deletIeOb);
router.get("/ob/:prodItemId", getlistObApi);
router.get("/ob-sizes/:obId", getSizesObSelected);



export default router;
