import {
  approveRMLabDipStrikeOff,
  createRMLabDipStrikeOff,
  deleteRMLabDipStrikeOff,
  deleteRMLabDipStrikeOffApprovalSubmission,
  editRMLabDipStrikeOff,
  getRMLabDipStrikeOff,
  showRMLabDipStrikeOff,
  updateRMLabDipStrikeOffApprovalSubmission,
  verifyRMLabDipStrikeOffApproval,
} from "../../../controllers/materialManagement/rmLabDipStrikeOff/rmLabDipStrikeOff.js";

import express from "express";
const router = express.Router();

//header
router.get("/rm-lab-dip-strike-off/", getRMLabDipStrikeOff);
router.post("/rm-lab-dip-strike-off/", createRMLabDipStrikeOff);
router.get("/rm-lab-dip-strike-off/:ID", showRMLabDipStrikeOff);
router.put("/rm-lab-dip-strike-off/:ID", editRMLabDipStrikeOff);
router.post("/rm-lab-dip-strike-off/delete", deleteRMLabDipStrikeOff);

router.put("/rm-lab-dip-strike-off/approve/:ID", approveRMLabDipStrikeOff);
router.put("/rm-lab-dip-strike-off/approval/:ID", updateRMLabDipStrikeOffApprovalSubmission);
router.post("/rm-lab-dip-strike-off/approval/delete", deleteRMLabDipStrikeOffApprovalSubmission);
router.put("/rm-lab-dip-strike-off/approval/verify/:ID", verifyRMLabDipStrikeOffApproval);

export default router;
