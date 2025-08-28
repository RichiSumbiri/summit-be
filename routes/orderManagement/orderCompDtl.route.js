import express from "express";
import { getListCompDetail } from "../../controllers/orderManagement/orderCompDetail.js";
const router = express.Router();

router.post("/list-component/:productId", getListCompDetail);


export default router;
