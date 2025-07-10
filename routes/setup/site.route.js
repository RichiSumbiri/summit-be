import express from "express"
import {createSite, deleteSite, getAllSites, getSiteByIdSection, updateSite} from "../../controllers/setup/site.js";

const router = express.Router();

router.post("/", createSite)
router.get("/", getAllSites)
router.get("/:idsection", getSiteByIdSection)
router.put("/:idsection", updateSite)
router.delete("/:idsection", deleteSite)

export default router