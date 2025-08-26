import express from "express";
import { getListMOIDByOrderID, postMOListing } from "../../controllers/orderManagement/OrderManagement.js";

const router = express.Router();


router.get("/:orderID", getListMOIDByOrderID);
router.post("/", postMOListing);

export default router;