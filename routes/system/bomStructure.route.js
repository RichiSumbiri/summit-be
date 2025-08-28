import express from "express";
import {
    createBomStructure,
    deleteBomStructure,
    getAllBomStructures,
    getBomStructureById,
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


export default router;