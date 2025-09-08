import express from "express";
import { createOrderCompDetail, getComFgColorList, getCompRmList, getListCompDetail, getListOrderCompDetail } from "../../controllers/orderManagement/orderCompDetail.js";
const router = express.Router();

router.post("/list-component/", createOrderCompDetail);
router.get("/list-component/:productId", getListCompDetail);
router.get("/component-detail/:orderId", getListOrderCompDetail);
router.get("/list-component-raw-list/:orderId", getCompRmList);
router.get("/list-component-fg-color/:orderId", getComFgColorList);


export default router;
