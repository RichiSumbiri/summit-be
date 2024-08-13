import express from "express";
import { getEmployeAktif } from "../../controllers/hr/employe.js";
import { getEventList, getRefGuest } from "../../controllers/hr/eventHr.js";

const router = express.Router();

router.get("/all-employe", getEmployeAktif);

// event
router.get("/event/:year", getEventList);

//ref query for typehead
router.get("/event/query-guest/:strQuery", getRefGuest);

export default router;
