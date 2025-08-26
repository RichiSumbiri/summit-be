import express from "express";
import { changeMOListingStatus, getListMOIDByOrderID, postMOListing } from "../../controllers/orderManagement/OrderManagement.js";

const router = express.Router();


router.get("/:orderID", getListMOIDByOrderID);
router.post("/", postMOListing);
router.put("/", changeMOListingStatus);

export default router;