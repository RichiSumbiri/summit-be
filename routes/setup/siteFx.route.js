import express from "express";
import {
    createSiteFx,
    deleteSiteFx,
    getAllSitesFx,
    getSiteFxById,
    updateSiteFx
} from "../../controllers/setup/siteFx.js";


const router = express.Router();
router.post("/", createSiteFx);
router.get("/", getAllSitesFx);
router.get("/:id", getSiteFxById);
router.put("/:id", updateSiteFx);
router.delete("/:id", deleteSiteFx);

export default router;