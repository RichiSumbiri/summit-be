import express from "express";
import { deleteAbsen, getAbsenDaily, getVerifAbsenDaily, updateAbsen, verifAbsenCtr } from "../../controllers/hr/absensi.js";
const router = express.Router();


router.get("/daily/:date", getAbsenDaily);
router.get("/daily-verif/:date", getVerifAbsenDaily);
router.post("/verif-absen", verifAbsenCtr );
router.patch("/update-absen", updateAbsen );
router.patch("/delete-absen", deleteAbsen );

export default router;
