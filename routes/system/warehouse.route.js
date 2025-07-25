import express from "express";
import { getMasterWarehouseDetail, getWarehouseDetailQuality, getWarehouseDetailStatus, postMasterWarehouseDetail } from "../../controllers/system/WarehouseDetail.js";

const router = express.Router();

router.get("/all", getMasterWarehouseDetail);
router.post("/", postMasterWarehouseDetail);
router.get("/quality/:id", getWarehouseDetailQuality);
router.get("/status/:id", getWarehouseDetailStatus);


export default router;