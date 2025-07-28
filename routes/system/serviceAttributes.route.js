import express from "express";
import {
  getServiceAttributes,
  createServiceAttributes,
  editServiceAttributes,
  deleteServiceAttributes,
  getServiceAttributesDropdown, getServiceAttributesParam,
} from "../../controllers/system/serviceAttributes.js";

const router = express.Router();

router.get("/", getServiceAttributes);
router.post("/", createServiceAttributes);
router.post("/edit", editServiceAttributes);
router.post("/delete", deleteServiceAttributes);
router.get("/service-attributes/param", getServiceAttributesParam)

//get custom query service attribute for service attribute values dropdown
router.get("/dropdown-list", getServiceAttributesDropdown);

export default router;
