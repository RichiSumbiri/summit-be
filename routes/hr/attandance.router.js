import express from "express";
import {
  deleteGroup,
  getAllGroup,
  patchGroup,
  postNewGroup,
} from "../../controllers/hr/JadwalJamKerja.js";

const router = express.Router();

router.get("/group", getAllGroup);
router.post("/group", postNewGroup);
router.patch("/group", patchGroup);
router.delete("/group/:groupId", deleteGroup);

export default router;
