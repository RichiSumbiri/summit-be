import express from "express";
import {
  getServiceAttributes,
  createServiceAttributes,
  editServiceAttributes,
  deleteServiceAttributes,
  getServiceAttributesDropdown,
} from "../../controllers/system/serviceAttributes.js";

const router = express.Router();

router.get("/", getServiceAttributes);
router.post("/", createServiceAttributes);
router.post("/edit", editServiceAttributes);
router.post("/delete", deleteServiceAttributes);


//get custom query service attribute for service attribute values dropdown
router.get("/dropdown-list", getServiceAttributesDropdown);

export default router;
