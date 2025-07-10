import express from "express";
import {
    createSiteDepartment, deleteSiteDepartment,
    getAllSiteDepartments,
    getSiteDepartmentById, updateSiteDepartment
} from "../../controllers/setup/siteDepartment.js";


const router = express.Router();
router.post("/", createSiteDepartment);
router.get("/", getAllSiteDepartments);
router.get("/:id", getSiteDepartmentById);
router.put("/:id", updateSiteDepartment);
router.delete("/:id", deleteSiteDepartment);

export default router;