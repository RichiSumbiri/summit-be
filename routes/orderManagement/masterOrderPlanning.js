import express from "express";
import { postMasterOrderPlanning } from "../../controllers/orderManagement/OrderManagement.js";
const router = express.Router();

router.post("/", postMasterOrderPlanning);


export default router;
