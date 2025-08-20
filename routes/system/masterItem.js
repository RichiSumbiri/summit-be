import express from "express";
import {
    createAttribute,
    createItem, createService, deleteAttribute,

    deleteItem, deleteService, getAllAttributes,
    getAllItems, getAllServices, getAttributeById,
    getItemById, getListFGItemID, getListFGItemIDByProductID, getServiceById, updateAttribute, updateCloneItem,
    updateItem, updateService,
} from "../../controllers/system/masterItemId.js";
import {
    createMasterItemDimension, deleteMasterItemDimension,
    getAllMasterItemDimensions,
    getMasterItemDimensionById, updateMasterItemDimension
} from "../../controllers/system/masterItemDimention.js";

const router = express.Router();
router.post("/id", createItem);
router.get("/id", getAllItems);
router.get("/finish-good", getListFGItemID);
router.get("/finish-good-product", getListFGItemIDByProductID);
router.get("/id/:itemId", getItemById);
router.put("/id/:itemId", updateItem);
router.put("/id-clone", updateCloneItem);
router.delete("/id/:itemId", deleteItem);

router.post("/att", createAttribute);
router.get("/att", getAllAttributes);
router.get("/att/:id", getAttributeById);
router.put("/att/:id", updateAttribute);
router.delete("/att/:id", deleteAttribute);

router.post("/svc", createService);
router.get("/svc", getAllServices);
router.get("/svc/:id", getServiceById);
router.put("/svc/:id", updateService);
router.delete("/svc/:id", deleteService);


router.post("/dimension", createMasterItemDimension);
router.get("/dimension", getAllMasterItemDimensions);
router.get("/dimension/:id", getMasterItemDimensionById);
router.put("/dimension/:id", updateMasterItemDimension);
router.delete("/dimension/:id", deleteMasterItemDimension);

export default router;