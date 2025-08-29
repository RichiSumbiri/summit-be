import express from "express";
import {
    approveStatusBomStructure,
    createBomStructure,
    deleteBomStructure,
    getAllBomStructures,
    getBomStructureById, importBomTemplateListToStructure,
    updateBomStructure,
} from "../../controllers/system/bomStructure/bomStructure.js";
import {
    createPendingDimension, deletePendingDimension,
    getAllPendingDimensions,
    getPendingDimensionById, updatePendingDimension
} from "../../controllers/system/bomTemplatePandingDimension.js";
import {
    createBomStructureListDetail, deleteBomStructureListDetail,
    getAllBomStructureListDetails,
    getBomStructureListDetailById, updateBomStructureListDetail
} from "../../controllers/system/bomStructure/bomStructureLIstDetail.js";
import {
    createBomStructureNote, deleteBomStructureNote,
    getAllBomStructureNotes,
    getBomStructureNoteById, updateBomStructureNote
} from "../../controllers/system/bomStructure/bomStructureNote.js";
import {
    createBomStructureList, createBomStructureListBulk, deleteBomStructureList,
    getAllBomStructureList,
    getBomStructureListById, updateBomStructureList
} from "../../controllers/system/bomStructure/bomStructureList.js";
import {
    createBomStructureRev, deleteBomStructureRev,
    getAllBomStructureRevs,
    getBomStructureRevById, updateBomStructureRev
} from "../../controllers/system/bomStructure/bomStructureRev.js";
import {
    createBomStructureColor,
    createBomStructureSize, deleteBomStructureSize, getAllBomStructureColors,
    getAllBomStructureSizes, getBomStructureColorById,
    getBomStructureSizeById, updateBomStructureColor, updateBomStructureSize,
    deleteBomStructureColor
} from "../../controllers/system/bomStructure/bomStructureColorAndSize.js";

const router = express.Router();

router.get("/master/", getAllBomStructures);
router.get("/master/:id", getBomStructureById);
router.post("/master/", createBomStructure);
router.put("/master/:id", updateBomStructure);
router.patch("/master/status/:ID", approveStatusBomStructure)
router.delete("/master/:id", deleteBomStructure);

router.get("/list", getAllBomStructureList);
router.get("/list/:id", getBomStructureListById);
router.post("/list", createBomStructureList);
router.post("/list/bulk", createBomStructureListBulk);
router.put("/list/:id", updateBomStructureList);
router.delete("/list/:id", deleteBomStructureList);
router.patch("/list/:id", importBomTemplateListToStructure);

router.get("/revisions", getAllBomStructureRevs);
router.get("/revisions/:id", getBomStructureRevById);
router.post("/revisions", createBomStructureRev);
router.put("/revisions/:id", updateBomStructureRev);
router.delete("/revisions/:id", deleteBomStructureRev);

router.get("/notes", getAllBomStructureNotes);
router.get("/notes/:id", getBomStructureNoteById);
router.post("/notes", createBomStructureNote);
router.put("/notes/:id", updateBomStructureNote);
router.delete("/notes/:id", deleteBomStructureNote);

router.get("/list-details", getAllBomStructureListDetails);
router.get("/list-details/:id", getBomStructureListDetailById);
router.post("/list-details", createBomStructureListDetail);
router.put("/list-details/:id", updateBomStructureListDetail);
router.delete("/list-details/:id", deleteBomStructureListDetail);

router.get("/pending-dimensions", getAllPendingDimensions);
router.get("/pending-dimensions/:id", getPendingDimensionById);
router.post("/pending-dimensions", createPendingDimension);
router.put("/pending-dimensions/:id", updatePendingDimension);
router.delete("/pending-dimensions/:id", deletePendingDimension);

router.get("/size", getAllBomStructureSizes);
router.get("/size/:id", getBomStructureSizeById);
router.post("/size", createBomStructureSize);
router.put("/size/:id", updateBomStructureSize);
router.delete("/size/:id", deleteBomStructureSize);


router.get("/color", getAllBomStructureColors);
router.get("/color/:id", getBomStructureColorById);
router.post("/color", createBomStructureColor);
router.put("/color/:id", updateBomStructureColor);
router.delete("/color/:id", deleteBomStructureColor);

export default router;