import express from "express";
import { ConfirmVerifAbs, deleteAbsen, delteHrVerifAbs, getAbsenDaily, getAbsenIndividu, getTblConfirm, getVerifAbsDayNik, getVerifAbsenDaily, updateAbsen, verifAbsenCtr, verifAbsenCtr1, getViewDetailLog, deleteIndvAbsen } from "../../controllers/hr/absensi.js";
const router = express.Router();

//all absensi daily
router.get("/daily/:date", getAbsenDaily);
router.patch("/update-absen", updateAbsen );
router.patch("/delete-absen", deleteAbsen );

//verifikasi absen
router.get("/daily-verif/:date", getVerifAbsenDaily);
router.get("/daily-confirm-tbl/:date", getTblConfirm);
router.get("/view-detail-log/:nik/:date", getViewDetailLog);
router.post("/verif-absen", verifAbsenCtr1 , getVerifAbsDayNik);
// router.post("/verif-absen", verifAbsenCtr );
router.post("/delete-verif", delteHrVerifAbs );
router.post("/confirm-verif", ConfirmVerifAbs );

//absensi individu
router.get("/absens-individu/:nik/:startDate/:endDate", getAbsenIndividu);
router.patch("/absens-individu", deleteIndvAbsen);


export default router;
