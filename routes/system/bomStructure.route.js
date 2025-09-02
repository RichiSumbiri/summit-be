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
    createBomStructureNote, deleteBomStructureNote,
    getAllBomStructureNotes,
    getBomStructureNoteById, updateBomStructureNote
} from "../../controllers/system/bomStructure/bomStructureNote.js";
import {
    createBomStructureList,
    createBomStructureListBulk,
    deleteBomStructureList,
    getAllBomStructureList,
    getBomStructureListById,
    getBomTemplateListByBomStructureList,
    updateBomStructureList, updateBomStructureListStatus,
    updateBomStructureListStatusBulk
} from "../../controllers/system/bomStructure/bomStructureList.js";
import {
    createBomStructureRev, deleteBomStructureRev,
    getAllBomStructureRevs,
    getBomStructureRevById, updateBomStructureRev
} from "../../controllers/system/bomStructure/bomStructureRev.js";

import {
    createBomStructureListDetail, createBomStructureListDetailBulk, deleteBomStructureListDetail,
    getAllBomStructureListDetails,
    getBomStructureListDetailById, revertBomStructureListDetail, updateBomStructureListDetail
} from "../../controllers/system/bomStructure/bomStructureLIstDetail.js";
import {
    createPendingDimensionFromBomTemplateList,
    createPendingDimensionStructure, deletePendingDimensionStructure,
    getAllPendingDimensionStructure,
    getPendingDimensionStructureById, updatePendingDimensionStructure, updatePendingDimensionStructureCustom
} from "../../controllers/system/bomStructure/bomStructurePendingDimension.js";
import {
    createSourcingDetail, deleteSourcingDetail,
    getAllSourcingDetails,
    getSourcingDetailById, updateSourcingDetail
} from "../../controllers/system/bomStructure/bomStructureSourcingDetail.js";

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
router.post("/list/bulk", createBomStructureListBulk);
router.put("/list/:id", updateBomStructureList);
router.delete("/list/:id", deleteBomStructureList);
router.patch("/list/:id", importBomTemplateListToStructure);

router.get("/list-template/:id", getBomTemplateListByBomStructureList);
router.put("/list-status/bulk", updateBomStructureListStatusBulk)
router.put("/list-status", updateBomStructureListStatus)

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
router.post("/list-detail/bulk", createBomStructureListDetailBulk);
router.post("/list-detail/revert", revertBomStructureListDetail);
router.put("/list-details/:id", updateBomStructureListDetail);
router.delete("/list-details/:id", deleteBomStructureListDetail);

router.get("/pending-dimensions", getAllPendingDimensionStructure);
router.get("/pending-dimensions/:id", getPendingDimensionStructureById);
router.post("/pending-dimensions", createPendingDimensionStructure);
router.put("/pending-dimensions/:id", updatePendingDimensionStructure);
router.patch("/pending-dimensions/:id", updatePendingDimensionStructureCustom);
router.post("/pending-dimension/import", createPendingDimensionFromBomTemplateList);
router.delete("/pending-dimensions/:id", deletePendingDimensionStructure);

router.get("/sourcing", getAllSourcingDetails);
router.get("/sourcing/:id", getSourcingDetailById);
router.post("/sourcing", createSourcingDetail);
router.put("/sourcing/:id", updateSourcingDetail);
router.delete("/sourcing/:id", deleteSourcingDetail);

export default router;