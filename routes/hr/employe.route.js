import express from "express";
import { getDeptAll, getEmployeAktif, getSubDeptAll, postNewEmploye } from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";
import { CheckPassKey, GeneratePassKey, getLamaranByDate, getMasterAlamat, getMasterKabkota, getMasterKecamatan, getMasterProv, postLamaran } from "../../controllers/hr/recruitment.js";
import { getJobPosting } from "../../controllers/hr/jobposting.js";

const router = express.Router();

// departemen management
router.get("/master-dept", getDeptAll);
router.get("/master-subdept", getSubDeptAll);
router.get("/master-address", getMasterAlamat);
router.get("/master-address-provinsi", getMasterProv);
router.get("/master-address-kabkota", getMasterKabkota);
router.get("/master-address-kecamatan", getMasterKecamatan);


// recruitment
router.get("/generate-passkey", GeneratePassKey);
router.post("/check-passkey", CheckPassKey);
router.post("/submit-lamaran", postLamaran);
router.get("/get-lamaran/:tanggal", getLamaranByDate);
router.get("/get-active-job", getJobPosting);

// employee management
router.get("/all-employe", getEmployeAktif);
router.post("/new-employee", postNewEmploye);


// event
router.get("/event/:year", getEventList);


//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);



export default router;
