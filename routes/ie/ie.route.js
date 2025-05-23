import express from "express";
import { getDataTreeStyleOb, getlistObApi, getListStyleByOb, getSizesOb, postIeOb } from "../../controllers/production/ie/IeOpBreakdown.js";
const router = express.Router();

router.get("/style-three", getDataTreeStyleOb);
router.get("/list-style/:buyer", getListStyleByOb);
router.get("/list-sizes/:prodType", getSizesOb);

router.post("/ob", postIeOb);
router.get("/ob/:prodItemId", getlistObApi);



export default router;
