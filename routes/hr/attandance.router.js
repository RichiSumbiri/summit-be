import express from "express";
import {
  deleteGroup,
  empToGroup,
  getAllEmpForGrp,
  getAllGroup,
  getGroupSchedule,
  getMemberGroup,
  patchGroup,
  postGroupSch,
  postNewGroup,
} from "../../controllers/hr/JadwalJamKerja.js";

const router = express.Router();

router.get("/group", getAllGroup);
router.post("/group", postNewGroup);
router.patch("/group", patchGroup);
router.delete("/group/:groupId", deleteGroup);

//get employee rote
router.get("/employe-active", getAllEmpForGrp);
router.get("/member-group/:groupId", getMemberGroup);
router.post("/emp-to-group", empToGroup);

//jadwal group
router.get("/jadwal-group/:groupId/:startDate/:endDate", getGroupSchedule);
router.post("/jadwal-group", postGroupSch);

export default router;
