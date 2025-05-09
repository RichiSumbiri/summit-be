import express from "express";
import {
  getDeptAll,
  getEmpBurekol,
  getEmpByNIK,
  getEmpByNIKActive,
  getEmpByNIKKTP,
  getEmpDetailByNik,
  getEmpKontrak,
  getEmpLikeNIK,
  getEmployeAktif,
  getEmployeAll,
  getEmpNewEmpAmipay,
  getPositionAll,
  getSalaryType,
  getSection,
  getSubDeptAll,
  updateEmp,
  updateEmpMass,
  updateEmpMassGroup,
} from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";
import {
  CheckPassKey,
  GeneratePassKey,
  getLamaranByDate,
  getMasterAgama,
  getMasterAlamat,
  getMasterEducation,
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
  postCancelEmp,
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
  postCutiBersama,
  postCutiNew,
} from "../../controllers/hr/hrcuti.js";
import {
  downloadPhotosEmp,
  uploadPhotosEmp,
} from "../../controllers/hr/empPhoto.js";
// import { postNewJamKerja } from "../../controllers/hr/JadwalJamKerja.js";
import { getCheckEmpLemburan, getLemburanApprovalComplete, getLemburanCreated, getLemburanDetail, getLemburanExportAmano, getLemburanPending, getLemburanPendingAll, getLemburanPendingHead, getLemburanPendingHRD, getLemburanPendingManager, getLemburanPendingReject, getLemburanPendingSPV, getLemburanReport, getLemburanSummaryDeptReport, getSPLAccess, postApproveLemburan, postDeleteLemburan, postLemburan, postPrintLemburan, postRejectLemburan, ReleaseLemburan } from "../../controllers/hr/lemburan.js";
import {
  deleteJamKerja,
  deleteJamKerjaDtl,
  getAllJamKerja,
  getGroupJamKerja,
  getGroupJamKerjaDetail,
  patchJamKerja,
  postNewJamKerja,
  postNewJamKerjaDetail,
} from "../../controllers/hr/JadwalJamKerja.js";
import { getKarTap, getKarTapByNIK, newKarTap, updateKarTap } from "../../controllers/hr/kartap.js";
import { deleteEmpResignSPK, getEmpResignSPK, postNewEmpResignSPK } from "../../controllers/hr/empResign.js";
import { deleteCategorySkills, deleteSkillData, getCategorySkills, getEmpSkillDataByCat, getSkillByCategoryID, postNewCategorySkills, postNewSkills } from "../../controllers/hr/skills.js";

const router = express.Router();


// master hr
router.get("/master-agama", getMasterAgama);
router.get("/master-education", getMasterEducation);
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
router.get("/master-group-jam-kerja", getGroupJamKerja);
router.get("/master-jam-kerja", getAllJamKerja);
router.post("/master-jam-kerja", postNewJamKerja);
router.patch("/master-jam-kerja", patchJamKerja);
router.delete("/master-jam-kerja/:jkId", deleteJamKerja);

//jam kerja detail
router.get("/master-jam-kerja-detail/:jk_id", getGroupJamKerjaDetail);
router.post("/master-jam-kerja-detail", postNewJamKerjaDetail);
router.delete("/master-jam-kerja-detail/:jk_dtl_id", deleteJamKerjaDtl);


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
router.post("/cancel-emp", postCancelEmp);

// kontrak kerj
router.get( "/get-kontrakkerja-range/:startDate/:endDate", getKontrakKerjaByRange);
router.get( "/get-kontrakkerja-nik/:nik", getKontrakKerjaByNik);
router.post("/new-kontrakkerja", newKontrakKerja);
router.post("/new-mass-kontrakkerja", newMassKontrakKerja);
router.post("/update-kontrakkerja", updateKontrakKerja);
router.delete("/delete-kontrakkerja/:idspkk", deleteKontrakKerja);


// employee management
router.get("/all-employe", getEmployeAll);
router.get("/all-employe-active", getEmployeAktif);
router.get("/all-employe-kontrak", getEmpKontrak);
router.get("/find-emp-nik/:empnik", getEmpByNIK);
router.get("/find-emp-nik-active/:empnik", getEmpByNIKActive);
router.get("/find-emp-like/:inputQry", getEmpLikeNIK);
router.get("/find-emp-ktp/:nikktp", getEmpByNIKKTP);
router.get("/find-emp-burekol/:empnik", getEmpBurekol);
router.get("/find-emp-for-amipay/:empnik", getEmpNewEmpAmipay);
router.get("/find-emp-for-findscan/:empnik", getEmpDetailByNik);

router.post("/update-emp", updateEmp);
router.post("/update-photos/:nikEmp", uploadPhotosEmp);
router.get("/get-photos/:nik", downloadPhotosEmp);
router.post("/update-emp-mass-group", updateEmpMassGroup);
router.post("/update-emp-mass", updateEmpMass);

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
router.post("/cuti-bersama", postCutiBersama);


// lemburan / spl overtime
router.get("/lemburan-access/:userName", getSPLAccess);
router.get("/lemburan-detail/:splnumber", getLemburanDetail);
router.get("/lemburan-check-emp/:splDate/:empNik", getCheckEmpLemburan);
router.post("/lemburan-print", postPrintLemburan);
router.post("/lemburan-new", postLemburan);
router.post("/lemburan-release/:splNumber", ReleaseLemburan);
router.post("/lemburan-approve", postApproveLemburan);
router.post("/lemburan-reject", postRejectLemburan);
router.post("/lemburan-delete/:SPLID", postDeleteLemburan);
router.get("/lemburan-pending", getLemburanPending);
router.get("/lemburan-created/:userName", getLemburanCreated);
router.get("/lemburan-pending-all", getLemburanPendingAll);
router.get("/lemburan-pending-spv/:nik", getLemburanPendingSPV);
router.get("/lemburan-pending-head/:nik", getLemburanPendingHead);
router.get("/lemburan-pending-manager/:nik", getLemburanPendingManager);
router.get("/lemburan-pending-hrd/:nik", getLemburanPendingHRD);
router.get("/lemburan-pending-reject", getLemburanPendingReject);
router.get("/lemburan-approval-complete/:startDate/:endDate", getLemburanApprovalComplete);
router.get("/lemburan-export-amano/:startDate/:endDate", getLemburanExportAmano);
router.get("/lemburan-report/:startDate/:endDate", getLemburanReport);
router.get("/lemburan-summary-report/:startDate/:endDate", getLemburanSummaryDeptReport);


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

// employee skill
router.get("/category-skills", getCategorySkills);
router.post("/category-skills", postNewCategorySkills)
router.delete("/category-skills/:id", deleteCategorySkills);
router.get("/skills/:id", getSkillByCategoryID);
router.post("/skills", postNewSkills);
router.delete("/skills/:id", deleteSkillData);
router.get("/emp-skills/:idcategory", getEmpSkillDataByCat);




export default router;
