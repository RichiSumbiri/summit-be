import express from "express";
import {
    createPurchaseOrder, createPurchaseOrderRev, deletePurchaseOrder, deletePurchaseOrderRev, getAllPurchaseOrderRevs,
    getAllPurchaseOrders,
    getPurchaseOrderById, getPurchaseOrderRevById, updatePurchaseOrder, updatePurchaseOrderRev
} from "../../controllers/system/purchaseOrder.js";
import {
    createPurchaseOrderDetail, deletePurchaseOrderDetail,
    getAllPurchaseOrderDetails,
    getPurchaseOrderDetailById, updatePurchaseOrderDetail
} from "../../controllers/system/purchaseOrderDetail.js";

const router = express.Router();


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


export default router