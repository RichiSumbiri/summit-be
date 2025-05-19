import express from "express";
import { getDataTreeStyleOb, getListStyleByOb } from "../../controllers/production/ie/IeOpBreakdown.js";
const router = express.Router();

router.get("/style-three", getDataTreeStyleOb);
router.get("/list-style/:buyer", getListStyleByOb);


export default router;
