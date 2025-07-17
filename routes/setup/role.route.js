import express from "express";
import { createRole, getAllDept, getAllRole, updateRole } from "../../controllers/setup/users.js";
const router = express.Router();


router.get("/getListDept", getAllDept);
router.get("/getall", getAllRole);
router.post("/create", createRole);
router.patch("/create", updateRole);

export default router;
