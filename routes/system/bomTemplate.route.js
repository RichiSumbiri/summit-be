import express from "express";
import {
    cloneBomTemplateList,
    createBomTemplateList, deleteBomTemplateList,
    getAllBomTemplateLists,
    getBomTemplateListById, updateBomTemplateList, updateBomTemplateListSingle, updateBomTemplateListStatus
} from "../../controllers/system/bomTemplateList.js";
import {
    bomTemplateCreateColor,
    bomTemplateCreateSize,
    bomTemplateUpdateSize,
    bomTemplateDeleteSize,
    bomTemplateDeleteColor,
    bomTemplateGetAllColors,
    bomTemplateGetAllSizes,
    bomTemplateGetColorById,
    bomTemplateGetSizeById,
    bomTemplateUpdateColor,
    cloneBomTemplate,
    createBomTemplate,
    createBomTemplateRev,
    deleteBomTemplate,
    deleteBomTemplateRev,
    getAllBomTemplateRevs,
    getAllBomTemplates,
    getBomTemplateById,
    getBomTemplateRevById,
    updateBomTemplate,
    updateBomTemplateRev,
    getAllFGColorCharts,
    getAllFGSizeCharts,
    bulkDeleteBomTemplateColor,
    bulkCreateBomTemplateSize,
    bulkDeleteBomTemplateSize,
    bulkCreateBomTemplateColor,
    bulkToggleBomTemplateColor,
    bulkToggleBomTemplateSize,
    saveNewRevision,
    getNoteByRevision,
    updateNoteByBomTemplateIdAndRevId
} from "../../controllers/system/bomTemplate.js";
import {
    createBomTemplateListDetail, createBomTemplateListDetailBulk, deleteBomTemplateListDetail,
    getAllBomTemplateListDetails,
    getBomTemplateListDetailById, revertListDetailBulk, updateBomTemplateListDetail
} from "../../controllers/system/bomTemplateListDetail.js";
import {
    createCustomPendingDimensionDetail,
    createPendingDimension, createPendingDimensionDetail, deletePendingDimension,
    getAllPendingDimensions,
    getPendingDimensionById, updatePendingDimension, updatePendingDimensionCustom
} from "../../controllers/system/bomTemplatePandingDimension.js";

const router = express.Router();

router.post("/list", createBomTemplateList);
router.get("/list", getAllBomTemplateLists);
router.get("/list/:id", getBomTemplateListById);
router.patch("/list-single/:id", updateBomTemplateListSingle);
router.patch("/list/:id", cloneBomTemplateList);
router.put("/list/:id", updateBomTemplateList);
router.put("/list-bulk", updateBomTemplateListStatus);
router.delete("/list/:id", deleteBomTemplateList);

router.get("/list-details", getAllBomTemplateListDetails);
router.get("/list-details/:id", getBomTemplateListDetailById);
router.post("/list-details", createBomTemplateListDetail);
router.post("/list-details/bulk", createBomTemplateListDetailBulk);
router.post("/list-details/revert", revertListDetailBulk);
router.put("/list-details/:id", updateBomTemplateListDetail);
router.delete("/list-details/:id", deleteBomTemplateListDetail);

router.post("/master", createBomTemplate);
router.get("/master", getAllBomTemplates);
router.get("/master/:id", getBomTemplateById);
router.put("/master/:id", updateBomTemplate);
router.patch("/master/:id", cloneBomTemplate);
router.patch("/master-new/:id", saveNewRevision);
router.delete("/master/:id", deleteBomTemplate);

router.put("/master-approve/:BOM_TEMPLATE_ID/:REV_ID", updateNoteByBomTemplateIdAndRevId);

router.post("/rev", createBomTemplateRev);
router.get("/rev", getAllBomTemplateRevs);
router.get("/rev/:id", getBomTemplateRevById);
router.put("/rev/:id", updateBomTemplateRev);
router.delete("/rev/:id", deleteBomTemplateRev);

router.get("/colors", bomTemplateGetAllColors);
router.get("/colors/:id", bomTemplateGetColorById);
router.post("/colors", bomTemplateCreateColor);
router.put("/colors/:id", bomTemplateUpdateColor);
router.delete("/colors/:id", bomTemplateDeleteColor);

router.get("/sizes", bomTemplateGetAllSizes);
router.get("/sizes/:id", bomTemplateGetSizeById);
router.post("/sizes", bomTemplateCreateSize);
router.put("/sizes/:id", bomTemplateUpdateSize);
router.delete("/sizes/:id", bomTemplateDeleteSize);

router.get("/color", getAllFGColorCharts)
router.get("/size", getAllFGSizeCharts)
router.get("/notes", getNoteByRevision)

router.post("/color/toggle", bulkToggleBomTemplateColor);
router.post("/size/toggle", bulkToggleBomTemplateSize);

router.post("/color/bulk", bulkCreateBomTemplateColor);
router.patch("/color/bulk-delete", bulkDeleteBomTemplateColor);

router.post("/size/bulk", bulkCreateBomTemplateSize);
router.patch("/size/bulk-delete", bulkDeleteBomTemplateSize);

router.get("/pending-dimensions", getAllPendingDimensions);
router.get("/pending-dimensions/:id", getPendingDimensionById);
router.post("/pending-dimensions/custom", createCustomPendingDimensionDetail);
router.post("/pending-dimensions/detail", createPendingDimensionDetail);
router.patch("/pending-dimension/:id", updatePendingDimensionCustom)
router.post("/pending-dimensions", createPendingDimension);
router.put("/pending-dimensions/:id", updatePendingDimension);
router.delete("/pending-dimensions/:id", deletePendingDimension);


export default router;