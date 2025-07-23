import express from "express";
import {
  getSizes,
  createSize,
  showSize,
  editSize,
  deleteSize,
} from "../../controllers/system/sizeChart.js";

import {
  getColors,
  createColor,
  showColor,
  editColor,
  deleteColor,
} from "../../controllers/system/colorChart.js";

const router = express.Router();

//size
router.get("/size/", getSizes);
router.post("/size/", createSize);
router.get("/size/:SIZE_ID", showSize);
router.put("/size/:SIZE_ID", editSize);
router.post("/size/delete", deleteSize);



//color
router.get("/color/", getColors);
router.post("/color/", createColor);
router.get("/color/:COLOR_ID", showColor);
router.put("/color/:COLOR_ID", editColor);
router.post("/color/delete", deleteColor);


export default router;
