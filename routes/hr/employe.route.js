import express from "express";
import { getDeptAll, getEmpByNIK, getEmpByNIKKTP, getEmployeAktif, getPositionAll, getSalaryType, getSection, getSubDeptAll, postNewEmploye } from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";
import { CheckPassKey, GeneratePassKey, getLamaranByDate, getMasterAlamat, getMasterKabkota, getMasterKecamatan, getMasterKelurahan, getMasterProv, postApproveLamaran, postLamaran } from "../../controllers/hr/recruitment.js";
import { getJobPosting, getJobPostingByID, postJobActive, updateJobPosting } from "../../controllers/hr/jobposting.js";
import { getApprovedPelamar, postNewEmp } from "../../controllers/hr/acceptance.js";
import { getKontrakKerjaByRange, newKontrakKerja, updateKontrakKerja } from "../../controllers/hr/kontrakkerja.js";

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
router.get("/master-saltype", getSalaryType)
router.get("/master-section", getSection);

// job posting
router.post("/post-active-job", postJobActive);
router.get("/get-active-job", getJobPosting);
router.get("/get-job-by-id/:id", getJobPostingByID);
router.post("/put-job-by-id", updateJobPosting)

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
router.get("/get-kontrakkerja-range/:startDate/:endDate", getKontrakKerjaByRange);
router.post("/new-kontrakkerja", newKontrakKerja);
router.post("/update-kontrakkerja", updateKontrakKerja);

// employee management
router.get("/all-employe", getEmployeAktif);
router.post("/new-employee", postNewEmploye);
router.get("/find-emp-nik/:empnik", getEmpByNIK);
router.get("/find-emp-ktp/:nikktp", getEmpByNIKKTP);


// event
router.get("/event/:year", getEventList);


//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);



export default router;
