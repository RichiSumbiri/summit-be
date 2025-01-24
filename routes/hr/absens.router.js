import express from "express";
import { ConfirmVerifAbs, deleteAbsen, delteHrVerifAbs, getAbsenDaily, getAbsenIndividu, getTblConfirm, getVerifAbsenDaily, updateAbsen, verifAbsenCtr } from "../../controllers/hr/absensi.js";
const router = express.Router();

//all absensi daily
router.get("/daily/:date", getAbsenDaily);
router.patch("/update-absen", updateAbsen );
router.patch("/delete-absen", deleteAbsen );

//verifikasi absen
router.get("/daily-verif/:date", getVerifAbsenDaily);
router.get("/daily-confirm-tbl/:date", getTblConfirm);
router.post("/verif-absen", verifAbsenCtr );
router.post("/delete-verif", delteHrVerifAbs );
router.post("/confirm-verif", ConfirmVerifAbs );

//absensi individu
router.get("/absens-individu/:nik/:startDate/:endDate", getAbsenIndividu);


export default router;
