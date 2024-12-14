import express from "express";
import { getAbsenDaily } from "../../controllers/hr/absensi.js";
const router = express.Router();


router.get("/daily/:date", getAbsenDaily);

export default router;
