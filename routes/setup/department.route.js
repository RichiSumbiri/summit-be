import express from "express";
import {
    createDepartment, deleteDepartment,
    getAllDepartments,
    getDepartmentByIdDept,
    updateDepartment
} from "../../controllers/setup/department.js";


const router = express.Router();
router.post("/", createDepartment);
router.get("/", getAllDepartments);
router.get("/:iddept", getDepartmentByIdDept);
router.put("/:iddept", updateDepartment);
router.delete("/:iddept", deleteDepartment);

export default router;