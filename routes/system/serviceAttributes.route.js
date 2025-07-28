import express from "express";
import {
  getServiceAttributes,
  createServiceAttributes,
  editServiceAttributes,
  deleteServiceAttributes,
  getServiceAttributesDropdown, getServiceAttributesParam,
} from "../../controllers/system/serviceAttributes.js";

const router = express.Router();

router.get("/service-attributes/", getServiceAttributes);
router.post("/service-attributes/", createServiceAttributes);
router.post("/service-attributes/edit", editServiceAttributes);
router.post("/service-attributes/delete", deleteServiceAttributes);
router.get("/service-attributes/param", getServiceAttributesParam)

//get custom query service attribute for service attribute values dropdown
router.get("/service-attributes/dropdown-list", getServiceAttributesDropdown);

export default router;
