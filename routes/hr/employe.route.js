import express from "express";
import multer from "multer";
import {
  getDeptAll,
  getEmpByNIK,
  getEmpByNIKKTP,
  getEmployeAktif,
  getPositionAll,
  getSalaryType,
  getSection,
  getSubDeptAll,
  postNewEmploye,
  updateEmp,
} from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";
import {
  CheckPassKey,
  GeneratePassKey,
  getLamaranByDate,
  getMasterAlamat,
  getMasterKabkota,
  getMasterKecamatan,
  getMasterKelurahan,
  getMasterProv,
  postApproveLamaran,
  postLamaran,
} from "../../controllers/hr/recruitment.js";
import {
  getJobPosting,
  getJobPostingByID,
  postJobActive,
  updateJobPosting,
} from "../../controllers/hr/jobposting.js";
import {
  getApprovedPelamar,
  postNewEmp,
} from "../../controllers/hr/acceptance.js";
import {
  getKontrakKerjaByRange,
  newKontrakKerja,
  newMassKontrakKerja,
  updateKontrakKerja,
} from "../../controllers/hr/kontrakkerja.js";
import {
  getMutasiEmpByDate,
  newMutasi,
  newMutasiMass,
  updateMutasi,
} from "../../controllers/hr/mutasi.js";
import {
  getCutiByDate,
  getCutiSummary,
  postCutiNew,
} from "../../controllers/hr/hrcuti.js";
import {
  downloadPhotosEmp,
  uploadPhotosEmp,
} from "../../controllers/hr/empPhoto.js";
import { postNewJamKerja } from "../../controllers/hr/JadwalJamKerja.js";

const router = express.Router();

// master hr
router.get("/master-address", getMasterAlamat);
router.get("/master-address-provinsi", getMasterProv);
router.get("/master-address-kabkota", getMasterKabkota);
router.get("/master-address-kecamatan", getMasterKecamatan);
router.get("/master-address-kelurahan", getMasterKelurahan);
router.get("/master-dept", getDeptAll);
router.get("/master-subdept", getSubDeptAll);
router.get("/master-position", getPositionAll);
router.get("/master-saltype", getSalaryType);
router.get("/master-section", getSection);
router.get("/master-jam-kerja", postNewJamKerja);

// job posting
router.post("/post-active-job", postJobActive);
router.get("/get-active-job", getJobPosting);
router.get("/get-job-by-id/:id", getJobPostingByID);
router.post("/put-job-by-id", updateJobPosting);

// recruitment
router.get("/generate-passkey", GeneratePassKey);
router.post("/check-passkey", CheckPassKey);
router.post("/submit-lamaran", postLamaran);
router.post("/approval-recruitment", postApproveLamaran);
router.get("/get-lamaran/:startDate/:endDate", getLamaranByDate);

// acceptance
router.get("/get-approved-pelamar/:startDate/:endDate", getApprovedPelamar);
router.post("/new-emp", postNewEmp);

// kontrak kerj
router.get(
  "/get-kontrakkerja-range/:startDate/:endDate",
  getKontrakKerjaByRange
);
router.post("/new-kontrakkerja", newKontrakKerja);
router.post("/new-mass-kontrakkerja", newMassKontrakKerja);
router.post("/update-kontrakkerja", updateKontrakKerja);

// employee management
router.get("/all-employe", getEmployeAktif);
router.post("/new-employee", postNewEmploye);
router.get("/find-emp-nik/:empnik", getEmpByNIK);
router.get("/find-emp-ktp/:nikktp", getEmpByNIKKTP);
router.post("/update-emp", updateEmp);
router.post("/update-photos/:nikEmp", uploadPhotosEmp);
router.get("/get-photos/:nik", downloadPhotosEmp);

// mutasi karyawan
router.get("/mutasi-employee/:startDate/:endDate", getMutasiEmpByDate);
router.post("/mutasi-employee", newMutasi);
router.post("/mutasi-mass-employee", newMutasiMass);
router.put("/mutasi-employee", updateMutasi);

// cuti karyawan
router.get("/cuti-employee/:startDate/:endDate", getCutiByDate);
router.get("/cuti-summary", getCutiSummary);
router.post("/cuti-employee", postCutiNew);

// event
router.get("/event/:year", getEventList);

//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);

export default router;
