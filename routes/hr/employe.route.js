import express from "express";
import { getDeptAll, getEmployeAktif, getSubDeptAll, postNewEmploye } from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";
import { CheckPassKey, GeneratePassKey, getLamaranByDate, getMasterAlamat, getMasterKabkota, getMasterKecamatan, getMasterKelurahan, getMasterProv, postLamaran } from "../../controllers/hr/recruitment.js";
import { getJobPosting, getJobPostingByID, postJobActive, updateJobPosting } from "../../controllers/hr/jobposting.js";

const router = express.Router();

// departemen management
router.get("/master-dept", getDeptAll);
router.get("/master-subdept", getSubDeptAll);
router.get("/master-address", getMasterAlamat);
router.get("/master-address-provinsi", getMasterProv);
router.get("/master-address-kabkota", getMasterKabkota);
router.get("/master-address-kecamatan", getMasterKecamatan);
router.get("/master-address-kelurahan", getMasterKelurahan);

// job posting
router.post("/post-active-job", postJobActive);
router.get("/get-active-job", getJobPosting);
router.get("/get-job-by-id/:id", getJobPostingByID);
router.post("/put-job-by-id", updateJobPosting)

// recruitment
router.get("/generate-passkey", GeneratePassKey);
router.post("/check-passkey", CheckPassKey);
router.post("/submit-lamaran", postLamaran);
router.get("/get-lamaran/:startDate/:endDate", getLamaranByDate);

// employee management
router.get("/all-employe", getEmployeAktif);
router.post("/new-employee", postNewEmploye);


// event
router.get("/event/:year", getEventList);


//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);



export default router;
