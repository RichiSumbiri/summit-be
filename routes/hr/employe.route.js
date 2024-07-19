import express from "express";
import { getEmployeAktif } from "../../controllers/hr/employe.js";

const router = express.Router();

router.get("/all-employe", getEmployeAktif);

export default router;
