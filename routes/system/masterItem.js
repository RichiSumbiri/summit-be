import express from "express";
import {
    createAttribute,
    createItem, createService, deleteAttribute,

    deleteItem, deleteService, getAllAttributes,
    getAllItems, getAllServices, getAttributeById,
    getItemById, getServiceById, updateAttribute, updateCloneItem,
    updateItem, updateService,
} from "../../controllers/system/masterItemId.js";
import {
    createItemDimension, deleteItemDimension,
    getAllItemDimensions,
    getItemDimensionById, updateItemDimension
} from "../../controllers/system/itemDimention.js";

const router = express.Router();
router.post("/id", createItem);
router.get("/id", getAllItems);
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


router.post("/dimension", createItemDimension);
router.get("/dimension", getAllItemDimensions);
router.get("/dimension/:id", getItemDimensionById);
router.put("/dimension/:id", updateItemDimension);
router.delete("/dimension/:id", deleteItemDimension);

export default router;