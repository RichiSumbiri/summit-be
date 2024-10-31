import express from "express";
import {
  deleteGroup,
  getAllEmpForGrp,
  getAllGroup,
  patchGroup,
  postNewGroup,
} from "../../controllers/hr/JadwalJamKerja.js";

const router = express.Router();

router.get("/group", getAllGroup);
router.post("/group", postNewGroup);
router.patch("/group", patchGroup);
router.delete("/group/:groupId", deleteGroup);

//get employee rote
router.get("/employe-active", getAllEmpForGrp);

export default router;
