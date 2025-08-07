import express from "express";
import {
    cloneBomTemplateList,
    createBomTemplateList, deleteBomTemplateList,
    getAllBomTemplateLists,
    getBomTemplateListById, updateBomTemplateList
} from "../../controllers/system/bomTemplateList.js";
import {
    cloneBomTemplate,
    createBomTemplate, createBomTemplateRev, deleteBomTemplate, deleteBomTemplateRev, getAllBomTemplateRevs,
    getAllBomTemplates,
    getBomTemplateById, getBomTemplateRevById,
    updateBomTemplate, updateBomTemplateRev
} from "../../controllers/system/bomTemplate.js";

const router = express.Router();

router.post("/list", createBomTemplateList);
router.get("/list", getAllBomTemplateLists);
router.get("/list/:id", getBomTemplateListById);
router.patch("/list/:id", cloneBomTemplateList);
router.put("/list/:id", updateBomTemplateList);
router.delete("/list/:id", deleteBomTemplateList);

router.post("/master", createBomTemplate);
router.get("/master", getAllBomTemplates);
router.get("/master/:id", getBomTemplateById);
router.put("/master/:id", updateBomTemplate);
router.patch("/master/:id", cloneBomTemplate);
router.delete("/master/:id", deleteBomTemplate);


router.post("/rev", createBomTemplateRev);
router.get("/rev", getAllBomTemplateRevs);
router.get("/rev/:id", getBomTemplateRevById);
router.put("/rev/:id", updateBomTemplateRev);
router.delete("/rev/:id", deleteBomTemplateRev);


export default router;