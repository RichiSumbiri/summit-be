import express from "express";
import {
    createStorageInventory,
    getAllStorageInventory,
    getStorageInventoryById,
    updateStorageInventory,
    deleteStorageInventory,
    getStorageInventoryBySerialNumber,
    getStorageInventoryBySitelineId, getStorageInventoryByIdCountMachine
} from "../../controllers/storage/storageInventory.js"
const router = express.Router();

router.post("/inventory", createStorageInventory);
router.get("/inventory", getAllStorageInventory);
router.get("/inventory/:id", getStorageInventoryById);
router.get("/inventory-sitline/:idSiteline",getStorageInventoryBySitelineId)
router.get("/inventory-serial/:serialNumber", getStorageInventoryBySerialNumber);
router.get("/inventory-serial-count/:id", getStorageInventoryByIdCountMachine);
router.put("/inventory/:id", updateStorageInventory);
router.delete("/inventory/:id", deleteStorageInventory);
export default router;


