import express from "express";
import { deleteAbsen, getAbsenDaily, updateAbsen } from "../../controllers/hr/absensi.js";
const router = express.Router();


router.get("/daily/:date", getAbsenDaily);
router.patch("/update-absen", updateAbsen );
router.patch("/delete-absen", deleteAbsen );

export default router;
