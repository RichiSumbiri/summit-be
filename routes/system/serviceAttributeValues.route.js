import express from "express";
import {
  getServiceAttributeValues,
  createServiceAttributeValues,
  editServiceAttributeValues,
  deleteServiceAttributeValues, getServiceAttributeValuesParam,
} from "../../controllers/system/serviceAttributeValues.js";

const router = express.Router();

router.get("/", getServiceAttributeValues);
router.post("/", createServiceAttributeValues);
router.post("/edit", editServiceAttributeValues);
router.post("/delete", deleteServiceAttributeValues);

router.get("/param", getServiceAttributeValuesParam);

export default router;
