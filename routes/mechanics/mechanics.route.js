import express from "express";
import {
  delMachItemIn,
  getListMachine,
  getListTypeMec,
  getMacItemIn,
  getOneMachForIN,
  getOneMachine,
  postMachItemIn,
  postMachine,
  updateMachine,
} from "../../controllers/mecahnics/machine.js";
const router = express.Router();

router.get("/machines", getListMachine);
router.get("/machines/:code", getOneMachine);
router.get("/machines-inpt/:macId", getOneMachForIN);
router.get("/type-machines", getListTypeMec);
router.post("/machines", postMachine);
router.patch("/machines", updateMachine);

router.post("/item-in", postMachItemIn);
router.delete("/item-in/:LOG_ID/:inputDate", delMachItemIn);
router.get("/item-in/:date", getMacItemIn);

export default router;
