import express from "express";
import {
  createItemSMV,
  showItemSMV,
  editItemSMV,
} from "../../controllers/orderManagement/itemSMVDetail.js";
const router = express.Router();

//Product Item SMV Detail
router.post("/", createItemSMV);
router.get("/:FG_ITEM_ID", showItemSMV);
router.put("/:FG_ITEM_ID", editItemSMV);

export default router;
