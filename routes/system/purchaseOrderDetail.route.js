
import express from "express";
import {
    createPurchaseOrderDetail, deletePurchaseOrderDetail,
    getAllPurchaseOrderDetails,
    getPurchaseOrderDetailById, updatePurchaseOrderDetail
} from "../../controllers/system/purchaseOrderDetail.js";

const router = express.Router();
router.post("/", createPurchaseOrderDetail);
router.get("/", getAllPurchaseOrderDetails);
router.get("/:id", getPurchaseOrderDetailById);
router.put("/:id", updatePurchaseOrderDetail);
router.delete("/:id", deletePurchaseOrderDetail);

export default router;