import express from "express";
import {
  getListMachine,
  getOneMachine,
  postMachine,
} from "../../controllers/mecahnics/machine.js";
const router = express.Router();

router.get("/machines", getListMachine);
router.get("/machines/:code", getOneMachine);
router.post("/machines", postMachine);

export default router;
