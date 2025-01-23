import express from "express";
import { ConfirmVerifAbs, deleteAbsen, delteHrVerifAbs, getAbsenDaily, getTblConfirm, getVerifAbsenDaily, updateAbsen, verifAbsenCtr } from "../../controllers/hr/absensi.js";
const router = express.Router();


router.get("/daily/:date", getAbsenDaily);
router.get("/daily-verif/:date", getVerifAbsenDaily);
router.get("/daily-confirm-tbl/:date", getTblConfirm);
router.post("/verif-absen", verifAbsenCtr );
router.post("/delete-verif", delteHrVerifAbs );
router.post("/confirm-verif", ConfirmVerifAbs );
router.patch("/update-absen", updateAbsen );
router.patch("/delete-absen", deleteAbsen );

export default router;
