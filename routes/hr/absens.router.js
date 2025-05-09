import express from "express";
import { ConfirmVerifAbs, deleteAbsen, delteHrVerifAbs, getAbsenDaily, getAbsenIndividu, getTblConfirm, getVerifAbsDayNik, getVerifAbsenDaily, updateAbsen, verifAbsenCtr, verifAbsenCtr1, getViewDetailLog, deleteIndvAbsen, getMonthAttd, getListSecAndSubdept, genSumAbsen, getSumAbsen, deleteSchHoliday, validasiAbsensi, getAbsenAmano, getMonthAttdAll } from "../../controllers/hr/absensi.js";
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

//delete jadwal 
router.post("/delete-jadwal", deleteSchHoliday );

//absensi individu
router.get("/absens-individu/:nik/:startDate/:endDate", getAbsenIndividu);
router.patch("/absens-individu", deleteIndvAbsen);

//montly absensi
router.get("/absens-list-sec-subdept/:yearNum/:monthNum", getListSecAndSubdept);
router.get("/absens-month/:idSection/:idSubDept/:yearNum/:monthNum", getMonthAttd);
router.get("/absens-month-all/:start/:end", getMonthAttdAll);


//generate summary 
router.get("/absens-summary/:yearNum/:monthNum", getSumAbsen);
router.post("/absens-summary/:monthYear/:userId", genSumAbsen);

//validas absensi
router.post("/validasi", validasiAbsensi);

// export absen daily csv amano
router.get("/export-amano-daily/:startDate/:endDate", getAbsenAmano);


export default router;
