import {
  createRMLabDipStrikeOff,
  deleteRMLabDipStrikeOff,
  editRMLabDipStrikeOff,
  getRMLabDipStrikeOff,
  showRMLabDipStrikeOff,
} from "../../../controllers/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOff.js";

import express from "express";
const router = express.Router();

//header
router.get("/rm-lab-dip-strike-off/", getRMLabDipStrikeOff);
router.post("/rm-lab-dip-strike-off/", createRMLabDipStrikeOff);
router.get("/rm-lab-dip-strike-off/:ID", showRMLabDipStrikeOff);
router.put("/rm-lab-dip-strike-off/:ID", editRMLabDipStrikeOff);
router.post("/rm-lab-dip-strike-off/delete", deleteRMLabDipStrikeOff);

export default router;
