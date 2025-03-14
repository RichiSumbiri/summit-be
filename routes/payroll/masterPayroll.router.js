import express from "express";
import { deleteListTypePayroll, getListTypePayroll, patchListTypePayroll, postListTypePayroll } from "../../controllers/payroll/masterPayroll.js";
const router = express.Router();

router.get("/master-list/type-gaji", getListTypePayroll);
router.post("/master-list/type-gaji", postListTypePayroll);
router.patch("/master-list/type-gaji", patchListTypePayroll);
router.delete("/master-list/type-gaji/:id", deleteListTypePayroll);


export default router;
