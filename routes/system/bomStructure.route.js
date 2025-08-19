import express from "express";
import {
    createBomStructure,
    createBomStructureList,
    createBomStructureListBulk,
    deleteBomStructure,
    deleteBomStructureList,
    getAllBomStructureList,
    getAllBomStructures,
    getBomStructureById,
    getBomStructureListById,
    updateBomStructure,
    updateBomStructureList
} from "../../controllers/system/bomStructure.js";

const router = express.Router();

router.get("/master/", getAllBomStructures);
router.get("/master/:id", getBomStructureById);
router.post("/master/", createBomStructure);
router.put("/master/:id", updateBomStructure);
router.delete("/master/:id", deleteBomStructure);

router.get("/list", getAllBomStructureList);
router.get("/list/:id", getBomStructureListById);
router.post("/list", createBomStructureList);
router.post("/list/bulk", createBomStructureListBulk);
router.put("/list/:id", updateBomStructureList);
router.delete("/list/:id", deleteBomStructureList);


export default router;