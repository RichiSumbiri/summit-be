import express from "express";
import {
    createPurchaseOrder,
    createPurchaseOrderMoq,
    createPurchaseOrderRev,
    deletePurchaseOrder, deletePurchaseOrderMoq,
    deletePurchaseOrderRev, getAllPurchaseOrderMoqs,
    getAllPurchaseOrderRevs,
    getAllPurchaseOrders,
    getPurchaseOrderById, getPurchaseOrderMoqById,
    getPurchaseOrderRevById,
    updatePurchaseOrder, updatePurchaseOrderMoq,
    updatePurchaseOrderRev
} from "../../controllers/procurement/purchaseOrder.js";
import {
    createPurchaseOrderDetail, deletePurchaseOrderDetail,
    getAllPurchaseOrderDetails,
    getPurchaseOrderDetailById, updatePurchaseOrderDetail
} from "../../controllers/procurement/purchaseOrderDetail.js";
import { postMaterialPurchaseOrder } from "../../controllers/procurement/materialPurchasePlanning.js";

const router = express.Router();

router.post("/mpo", postMaterialPurchaseOrder);

router.post("/order", createPurchaseOrder);
router.get("/order", getAllPurchaseOrders);
router.get("/order/:id", getPurchaseOrderById);
router.put("/order/:id", updatePurchaseOrder);
router.delete("/order/:id", deletePurchaseOrder);

router.post("/rev", createPurchaseOrderRev);
router.get("/rev", getAllPurchaseOrderRevs);
router.get("/rev/:id", getPurchaseOrderRevById);
router.put("/rev/:id", updatePurchaseOrderRev);
router.delete("/rev/:id", deletePurchaseOrderRev);

router.post("/detail", createPurchaseOrderDetail);
router.get("/detail", getAllPurchaseOrderDetails);
router.get("/detail/:id", getPurchaseOrderDetailById);
router.put("/detail/:id", updatePurchaseOrderDetail);
router.delete("/detail/:id", deletePurchaseOrderDetail);

router.post("/moq", createPurchaseOrderMoq);
router.get("/moq", getAllPurchaseOrderMoqs);
router.get("/moq/:id", getPurchaseOrderMoqById);
router.put("/moq/:id", updatePurchaseOrderMoq);
router.delete("/moq/:id", deletePurchaseOrderMoq);

export default router