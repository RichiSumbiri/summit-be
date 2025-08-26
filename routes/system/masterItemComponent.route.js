import express from "express";
import {getAllMasterItems, getMasterItemById} from "../../controllers/system/masterItemComponent.js";

const router = express.Router();

router.get("/", getAllMasterItems);
router.get("/:id", getMasterItemById);

export default router;