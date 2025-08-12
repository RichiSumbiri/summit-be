import express from "express";
import {
    createOrderType, deleteOrderType,
    getAllOrderTypes,
    getOrderTypeById,
    updateOrderType
} from "../../controllers/system/orderType.js";
const router = express.Router();

router.get("/", getAllOrderTypes);
router.get("/:id", getOrderTypeById);
router.post("/", createOrderType);
router.put("/:id", updateOrderType);
router.delete("/:id", deleteOrderType);

export default router;