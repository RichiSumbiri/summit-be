import express from "express";
import {
  deleteCountryList,
  getListCountry,
  getListItemStyle,
  postListCountry,
} from "../../controllers/list/listReferensi.js";

const router = express.Router();
router.get("/country/:buyer", getListCountry);
router.post("/country", postListCountry);
router.delete("/country/:COUNTRY_ID/:BUYER_CODE", deleteCountryList);


//item style
router.get("/style/:buyer", getListItemStyle);

export default router;
