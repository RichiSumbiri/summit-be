import express from "express";
import {
    createDepartmentFx,
    deleteDepartmentFx,
    getAllDepartmentsFx, getDepartmentByFxId,
    updateDepartmentFx
} from "../../controllers/setup/departmentFx.js";


const router = express.Router();
router.post("/", createDepartmentFx);
router.get("/", getAllDepartmentsFx);
router.get("/:id", getDepartmentByFxId);
router.put("/:id", updateDepartmentFx);
router.delete("/:id", deleteDepartmentFx);

export default router;