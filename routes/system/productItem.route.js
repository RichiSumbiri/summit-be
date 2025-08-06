import express from "express";
import {getAllProductItems, getProductItemById} from "../../controllers/system/productItem.js";

const router = express.Router();

router.get("/", getAllProductItems);
router.get("/:id", getProductItemById);

export default router;