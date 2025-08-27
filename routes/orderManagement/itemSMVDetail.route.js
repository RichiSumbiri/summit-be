import express from "express";
import {
  createItemSMV,
  showItemSMV,
  editItemSMV,
  createOrderItemSMV,
  getOrderItemSMV,
  showOrderItemSMV,
} from "../../controllers/orderManagement/itemSMVDetail.js";
const router = express.Router();

// //Product Item SMV Detail
router.post("/", createItemSMV);
router.get("/:FG_ITEM_ID", showItemSMV);
router.put("/:FG_ITEM_ID", editItemSMV);

router.get("/order-item-smv/:ITEM_ID", getOrderItemSMV);
router.get("/item-smv/:ITEM_ID", showOrderItemSMV);
router.post("/order-item-smv/update", createOrderItemSMV);

export default router;
