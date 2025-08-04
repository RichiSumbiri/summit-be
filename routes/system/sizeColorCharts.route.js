import express from "express";
import {
  getSizes,
  createSize,
  showSize,
  editSize,
  deleteSize, getAllFGSizeCharts, createFGSizeChart, updateFGSizeChart, getFGSizeChartById, deleteFGSizeChart,
} from "../../controllers/system/sizeChart.js";

import {
  getColors,
  createColor,
  showColor,
  editColor,
  deleteColor, getFGColorChartById, getAllFGColorCharts, createFGColorChart, updateFGColorChart, deleteFGColorChart,
} from "../../controllers/system/colorChart.js";
import {
  createSizeChartTemplate,
  deleteSizeChartTemplate,
  getAllSizeChartTemplates,
  getSizeChartTemplateById,
  updateSizeChartTemplate,
} from "../../controllers/system/sizeTemplate.js";
import {
  createOrEditSizeItemCategory,
  getSizeItemCategories,
  deleteSizeItemCategory,
} from "../../controllers/system/sizeItemCategory.js";

const router = express.Router();

//size
router.get("/size/", getSizes);
router.post("/size/", createSize);
router.get("/size/:SIZE_ID", showSize);
router.put("/size/:SIZE_ID", editSize);
router.post("/size/delete", deleteSize);

// fg size
router.get("/fg-size", getAllFGSizeCharts);
router.post("/fg-size",  createFGSizeChart);
router.get("/fg-size/:id", getFGSizeChartById);
router.put("/fg-size/:id", updateFGSizeChart);
router.delete("/fg-size/:id", deleteFGSizeChart);


// size template
router.get("/size-template", getAllSizeChartTemplates);
router.post("/size-template", createSizeChartTemplate);
router.get("/size-template/:id", getSizeChartTemplateById);
router.put("/size-template/:id", updateSizeChartTemplate);
router.delete("/size-template/:id", deleteSizeChartTemplate);

//size item category
router.get("/size-item-category", getSizeItemCategories);
router.put("/size-item-category/:SIZE_ID", createOrEditSizeItemCategory);
router.post("/size-item-category/delete", deleteSizeItemCategory);

//color
router.get("/color/", getColors);
router.post("/color/", createColor);
router.get("/color/:COLOR_ID", showColor);
router.put("/color/:COLOR_ID", editColor);
router.post("/color/delete", deleteColor);
router.get("/fg-color", getAllFGColorCharts);
router.post("/fg-color", createFGColorChart);
router.get("/fg-color/:id", getFGColorChartById);
router.put("/fg-color/:id",  updateFGColorChart);
router.delete("/fg-color/:id", deleteFGColorChart);

export default router;
