import express from "express";
import { createOrderCompDetail, getComFgColorList, getCompRmList, getDimiensionItem, getListCompDetail, getListOrderCompDetail, getListProdServices, putMainComponent, revertCompDetail, setActived, setComponentDim } from "../../controllers/orderManagement/orderCompDetail.js";
const router = express.Router();

router.post("/list-component/", createOrderCompDetail);
router.patch("/list-component/", putMainComponent);
router.patch("/revert-comp-detail/", revertCompDetail);
router.patch("/set-dim-comp-detail/", setComponentDim);
router.patch("/active-flag/", setActived);


router.get("/list-component/:productId", getListCompDetail);
router.get("/list-product-services/:productId", getListProdServices);
router.get("/component-detail/:orderId", getListOrderCompDetail);
router.get("/list-component-raw-list/:orderId", getCompRmList);
router.get("/list-component-fg-color/:orderId", getComFgColorList);
router.get("/list-dimension-by-structure/:itemId", getDimiensionItem);


export default router;
