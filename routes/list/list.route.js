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

export default router;
