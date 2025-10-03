import express from "express";
import {
  createMasterLabDipCode,
  getBOMLabDipCode,
  getMasterLabDipCode,
  getMaterialLabDipCode,
  getOrderDropdown,
  showMasterLabDipCode,
  updateMasterLabDipCode,
  updateMaterialLabDipCode,
} from "../../controllers/procurement/masterLabDipCode.js";

const router = express.Router();

//MASTER
router.get("/lab-dip/master", getMasterLabDipCode);
router.post("/lab-dip/master", createMasterLabDipCode);
router.get("/lab-dip/master/:ID", showMasterLabDipCode);
router.put("/lab-dip/master/:ID", updateMasterLabDipCode);
// router.post("/lab-dip/master", deleteMasterLabDipCode);

//MATERIAL
router.get("/lab-dip/material", getMaterialLabDipCode);
router.get("/lab-dip/bom/:ORDER_ID", getBOMLabDipCode);
router.post("/lab-dip/material/update", updateMaterialLabDipCode);
router.get("/lab-dip/order-dropdown", getOrderDropdown);

export default router;
