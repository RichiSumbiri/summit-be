import express from "express";
import { getDeptAll, getEmployeAktif, getSubDeptAll, postNewEmploye } from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";

const router = express.Router();

// departemen management
router.get("/master-dept", getDeptAll);
router.get("/master-subdept", getSubDeptAll);


// employee management
router.get("/all-employe", getEmployeAktif);
router.post("/new-employee", postNewEmploye);


// event
router.get("/event/:year", getEventList);

//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);



export default router;
