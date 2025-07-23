import express from "express";
import {
  getServiceAttributeValues,
  createServiceAttributeValues,
  editServiceAttributeValues,
  deleteServiceAttributeValues,
} from "../../controllers/system/serviceAttributeValues.js";

const router = express.Router();

router.get("/service-attribute-values/", getServiceAttributeValues);
router.post("/service-attribute-values/", createServiceAttributeValues);
router.post("/service-attribute-values/edit", editServiceAttributeValues);
router.post("/service-attribute-values/delete", deleteServiceAttributeValues);

export default router;
