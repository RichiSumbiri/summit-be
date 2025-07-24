import express from "express";
import {createItem, deleteItem, getAllItems, getItemById, updateItem} from "../../controllers/system/masterItemId.js";

const router = express.Router();
router.post("/", createItem);
router.get("/", getAllItems);
router.get("/:itemId", getItemById);
router.put("/:itemId", updateItem);
router.delete("/:itemId", deleteItem);

export default router;