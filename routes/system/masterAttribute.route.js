import express from "express";
import {
    createAttributeSetting, deleteAttributeSetting,
    getAllAttributeSettings,
    getAttributeSettingById, updateAttributeSetting, updateAttributeSettingAction
} from "../../controllers/system/masterAttributeSetting.js";
import {
    createAttributeValue, deleteAttributeValue,
    getAllAttributeValues,
    getAttributeValueById, updateAttributeValue
} from "../../controllers/system/masterAttributeValue.js";

const router = express.Router();

router.get("/setting", getAllAttributeSettings);
router.get("/setting/:id", getAttributeSettingById);
router.post("/setting", createAttributeSetting);
router.patch("/setting/action/:id", updateAttributeSettingAction)
router.put("/setting/:id", updateAttributeSetting);
router.delete("/setting/:id", deleteAttributeSetting);


router.get("/value", getAllAttributeValues);
router.get("/value/:id", getAttributeValueById);
router.post("/value", createAttributeValue);
router.put("/value/:id", updateAttributeValue);
router.delete("/value/:id", deleteAttributeValue);

export default router;