import express from "express";
import {
    createProductItemComponent,
    deleteProductItemComponent, getAllProductItemComponents,
    getProductItemComponentById,
    updateProductItemComponent
} from "../../controllers/system/productItemComponent.js";

const router = express.Router();

router.get("/", getAllProductItemComponents);
router.post("/", createProductItemComponent);
router.get("/:id", getProductItemComponentById);
router.put("/:id", updateProductItemComponent);
router.delete("/:id", deleteProductItemComponent);

export default router;