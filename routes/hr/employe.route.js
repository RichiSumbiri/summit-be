import express from "express";
import {
  getDeptAll,
  getEmpByNIK,
  getEmpByNIKKTP,
  getEmpKontrak,
  getEmpLikeNIK,
  getEmployeAktif,
  getPositionAll,
  getSalaryType,
  getSection,
  getSubDeptAll,
  updateEmp,
  updateEmpMassGroup,
} from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";
import {
  CheckPassKey,
  GeneratePassKey,
  getLamaranByDate,
  getMasterAgama,
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
  deleteKontrakKerja,
  getKontrakKerjaByNik,
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
  deleteCuti,
  getCutiByDate,
  getCutiQuota,
  getCutiSummary,
  getMasterAbsentee,
  getMasterCuti,
  postCutiNew,
} from "../../controllers/hr/hrcuti.js";
import {
  downloadPhotosEmp,
  uploadPhotosEmp,
} from "../../controllers/hr/empPhoto.js";
// import { postNewJamKerja } from "../../controllers/hr/JadwalJamKerja.js";
import { getLemburanApprovalComplete, getLemburanCreated, getLemburanDetail, getLemburanPending, getLemburanPendingAll, getLemburanPendingHead, getLemburanPendingHRD, getLemburanPendingManager, getLemburanPendingSPV, getSPLAccess, postApproveLemburan, postLemburan } from "../../controllers/hr/lemburan.js";
import {
  deleteJamKerja,
  getAllJamKerja,
  patchJamKerja,
  postNewJamKerja,
} from "../../controllers/hr/JadwalJamKerja.js";
import { getKarTap, getKarTapByNIK, newKarTap, updateKarTap } from "../../controllers/hr/kartap.js";
import { deleteEmpResignSPK, getEmpResignSPK, postNewEmpResignSPK } from "../../controllers/hr/empResign.js";

const router = express.Router();


// master hr
router.get("/master-agama", getMasterAgama);
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
router.get("/master-cuti", getMasterCuti);
router.get("/master-absentee", getMasterAbsentee);

//jam kerja
router.get("/master-jam-kerja", getAllJamKerja);
router.post("/master-jam-kerja", postNewJamKerja);
router.patch("/master-jam-kerja", patchJamKerja);
router.delete("/master-jam-kerja/:jkId", deleteJamKerja);


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
router.get( "/get-kontrakkerja-range/:startDate/:endDate", getKontrakKerjaByRange);
router.get( "/get-kontrakkerja-nik/:nik", getKontrakKerjaByNik);
router.post("/new-kontrakkerja", newKontrakKerja);
router.post("/new-mass-kontrakkerja", newMassKontrakKerja);
router.post("/update-kontrakkerja", updateKontrakKerja);
router.delete("/delete-kontrakkerja/:idspkk", deleteKontrakKerja);


// employee management
router.get("/all-employe", getEmployeAktif);
router.get("/all-employe-kontrak", getEmpKontrak);
router.get("/find-emp-nik/:empnik", getEmpByNIK);
router.get("/find-emp-like/:inputQry", getEmpLikeNIK);
router.get("/find-emp-ktp/:nikktp", getEmpByNIKKTP);
router.post("/update-emp", updateEmp);
router.post("/update-photos/:nikEmp", uploadPhotosEmp);
router.get("/get-photos/:nik", downloadPhotosEmp);
router.post("/update-emp-mass-group", updateEmpMassGroup);

// mutasi karyawan
router.get("/mutasi-employee/:startDate/:endDate", getMutasiEmpByDate);
router.post("/mutasi-employee", newMutasi);
router.post("/mutasi-mass-employee", newMutasiMass);
router.put("/mutasi-employee", updateMutasi);


// cuti karyawan
router.get("/cuti-employee/:startDate/:endDate", getCutiByDate);
router.get("/cuti-summary", getCutiSummary);
router.get("/cuti-quota/:empNik", getCutiQuota);
router.post("/cuti-employee", postCutiNew);
router.get("/cuti-delete/:cutiid", deleteCuti);


// lemburan / spl overtime
router.get("/lemburan-access/:userId", getSPLAccess);
router.get("/lemburan-detail/:splnumber", getLemburanDetail);
router.post("/lemburan-new", postLemburan);
router.put("/lemburan-update/:splNumber");
router.delete("/lemburan-delete/:splNumber")
router.post("/lemburan-approve", postApproveLemburan);
router.get("/lemburan-pending", getLemburanPending);
router.get("/lemburan-created/:userId", getLemburanCreated);
router.get("/lemburan-pending-all", getLemburanPendingAll);
router.get("/lemburan-pending-spv/:nik", getLemburanPendingSPV);
router.get("/lemburan-pending-head/:nik", getLemburanPendingHead);
router.get("/lemburan-pending-manager/:nik", getLemburanPendingManager);
router.get("/lemburan-pending-hrd", getLemburanPendingHRD);
router.get("/lemburan-approval-complete/:startDate/:endDate", getLemburanApprovalComplete);


// set pengangkatan karyawan tetap
router.get("/get-kartap/:startDate/:endDate", getKarTap);
router.get("/get-kartap-emp/:empNik", getKarTapByNIK);
router.post("/new-kartap", newKarTap);
router.put("/update-kartap", updateKarTap);



// employee resignation dan pembuatan surat pengalaman kerja
router.get("/get-empresign/:startDate/:endDate", getEmpResignSPK);
router.post("/new-empresign", postNewEmpResignSPK);
router.delete("/delete-empresign/:idSPK", deleteEmpResignSPK);

// event
router.get("/event/:year", getEventList);

//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);

export default router;
