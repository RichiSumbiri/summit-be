import express from "express";
import {
  deleteCountryList,
  deleteImgStyle,
  deleteListItemStyle,
  getListCountry,
  getListItemCode,
  getListItemStyle,
  patchListItemStyle,
  postListCountry,
  postListItemStyle,
} from "../../controllers/list/listReferensi.js";
import { getMasterLocation } from "../../controllers/list/listLocation.js";
import { getMasterItemCategory, getMasterItemGroup, getMasterItemType, getMasterWarehouseClassAll, postMasterItemCategory, postMasterItemGroup, postMasterItemType, postMasterWarehouseClass } from "../../controllers/setup/TypeWarehouseClass.js";
import { MasterItemTypes } from "../../models/setup/TypeWarehouseClass.js";

const router = express.Router();
router.get("/country/:buyer", getListCountry);
router.post("/country", postListCountry);
router.delete("/country/:COUNTRY_ID/:BUYER_CODE", deleteCountryList);


//item style
router.post("/style", postListItemStyle);
router.patch("/style", patchListItemStyle);
router.delete("/style/:idStyle", deleteListItemStyle);
router.delete("/image-style/:id/:imgPosition", deleteImgStyle);
router.get("/style/:buyer", getListItemStyle);
router.get("/item-code", getListItemCode);

//item location
router.get("/location", getMasterLocation);

// item group
router.get("/item-group", getMasterItemGroup);
router.post("/item-group", postMasterItemGroup);

// item types
router.get("/item-type/:id", getMasterItemType);
router.post("/item-type", postMasterItemType);

// item categoryes
router.get("/item-category/:id", getMasterItemCategory);
router.post("/item-category", postMasterItemCategory);

// warehouse class
router.get("/warehouse-class", getMasterWarehouseClassAll);
router.post("/warehouse-class", postMasterWarehouseClass);

export default router;
