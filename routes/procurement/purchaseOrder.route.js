import express from "express";
import {
    createPurchaseOrder,
    createPurchaseOrderNote,
    createPurchaseOrderRev,
    deletePurchaseOrder, deletePurchaseOrderNote,
    deletePurchaseOrderRev, getAllPurchaseOrderNotes,
    getAllPurchaseOrderRevs,
    getAllPurchaseOrders,
    getPurchaseOrderById, getPurchaseOrderNoteById,
    getPurchaseOrderRevById,
    updatePurchaseOrder, updatePurchaseOrderNote,
    updatePurchaseOrderRev, updatePurchaseOrderStatus
} from "../../controllers/procurement/purchaseOrder.js";
import {
    createPurchaseOrderDetail, createPurchaseOrderDetailBulk, deletePurchaseOrderDetail,
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
router.patch("/order/:id", updatePurchaseOrderStatus);
router.delete("/order/:id", deletePurchaseOrder);

router.post("/rev", createPurchaseOrderRev);
router.get("/rev", getAllPurchaseOrderRevs);
router.get("/rev/:id", getPurchaseOrderRevById);
router.put("/rev/:id", updatePurchaseOrderRev);
router.delete("/rev/:id", deletePurchaseOrderRev);

router.post("/detail", createPurchaseOrderDetail);
router.post("/detail/bulk", createPurchaseOrderDetailBulk);
router.get("/detail", getAllPurchaseOrderDetails);
router.get("/detail/:id", getPurchaseOrderDetailById);
router.put("/detail/:id", updatePurchaseOrderDetail);
router.delete("/detail/:id", deletePurchaseOrderDetail);


router.post("/note", createPurchaseOrderNote);
router.get("/note", getAllPurchaseOrderNotes);
router.get("/note/:id", getPurchaseOrderNoteById);
router.put("/note/:id", updatePurchaseOrderNote);
router.delete("/note/:id", deletePurchaseOrderNote);

export default router