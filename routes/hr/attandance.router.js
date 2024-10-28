import express from "express";
import {
  getAllGroup,
  patchGroup,
  postNewGroup,
} from "../../controllers/hr/JadwalJamKerja.js";

const router = express.Router();

router.get("/group", getAllGroup);
router.post("/group", postNewGroup);
router.patch("/group", patchGroup);

export default router;
