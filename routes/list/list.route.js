import express from "express";
import {
  deleteCountryList,
  deleteImgStyle,
  deleteListItemStyle,
  getListCountry,
  getListItemCode,
  getListItemStyle,
  getRefInterCountry,
  getRefInterCountrySpecific,
  patchListItemStyle,
  postListCountry,
  postListItemStyle,
} from "../../controllers/list/listReferensi.js";
import { getMasterLocation } from "../../controllers/list/listLocation.js";
import { getMasterLocationType, getMasterOperationType, getMasterWarehouseClassAll, postMasterWarehouseClass } from "../../controllers/system/WarehouseClass.js";

import { getMasterItemGroup, postMasterItemGroup } from "../../controllers/setup/ItemGroups.js";
import { getMasterItemType, postMasterItemType, getAllMasterItemType } from "../../controllers/setup/ItemTypes.js";
import { getMasterItemCategory, postMasterItemCategory, getAllMasterItemCategory } from "../../controllers/setup/ItemCategories.js";
import { getMasterItemQuality } from "../../controllers/setup/ItemQuality.js";
import { getMasterItemStatus } from "../../controllers/setup/ItemStatus.js";

import { getMasterServiceGroup } from "../../controllers/setup/ServiceGroups.js";
import { getMasterServiceType } from "../../controllers/setup/ServiceTypes.js";
import { getMasterServiceCategory } from "../../controllers/setup/ServiceCategories.js";
import { getAllShippingTerms } from "../../controllers/system/shippingTerms.js";
import { getAllDeliveryMode } from "../../controllers/system/deliveryMode.js";
import { getAllFOBPoint } from "../../controllers/system/FOBPoint.js";
import { getListCurrency, getListPayMethode } from "../../controllers/system/masterFinance.js";

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
router.get("/item-type", getAllMasterItemType);
router.get("/item-type/:id", getMasterItemType);
router.post("/item-type", postMasterItemType);

// item categoryes
router.get("/item-category", getAllMasterItemCategory);
router.get("/item-category/:id", getMasterItemCategory);
router.post("/item-category", postMasterItemCategory);



// service group
router.get("/service-group", getMasterServiceGroup);

// service types
router.get("/service-type", getMasterServiceType);

// service categoryes
router.get("/service-category", getMasterServiceCategory);



// warehouse class
router.get("/warehouse-class", getMasterWarehouseClassAll);
router.post("/warehouse-class", postMasterWarehouseClass);

// list & type operation
router.get("/operation-type", getMasterOperationType);
router.get("/location-type", getMasterLocationType);

// list master quality 
router.get("/item-quality", getMasterItemQuality);
router.get("/item-status", getMasterItemStatus);

// list shipping terms
router.get("/shipping-terms", getAllShippingTerms);

// list delivery model
router.get("/delivery-mode", getAllDeliveryMode);

// list fob point
router.get("/fob-point", getAllFOBPoint);


//get list country international
router.get("/country-code/:query", getRefInterCountry);
router.get("/country-specific/:query", getRefInterCountrySpecific);


//get list currency
router.get("/currency", getListCurrency)
;
//get payment methode
router.get("/payment-methode", getListPayMethode);

export default router;
