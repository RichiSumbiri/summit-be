import express from "express";
import { getMasterStatus } from "../../controllers/system/masterStatus.js";

const router = express.Router();

router.get("/", getMasterStatus);

export default router;