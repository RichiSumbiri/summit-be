import express from "express";
import {
  delMachItemIn,
  delMachItemOut,
  getDtlMecTrans,
  getEmploye,
  getListMachine,
  getListTypeMec,
  getMacItemIn,
  getMacItemOut,
  getMachineNo,
  getMecRepSaldoAwl,
  getOneMachForIN,
  getOneMachine,
  getPartNNeedle,
  postMacPartOut,
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

router.get("/sparepart-needle", getPartNNeedle);
router.post("/item-out", postMacPartOut);
router.get("/employe/:nik", getEmploye);
router.get("/machine-no/:macId", getMachineNo);
router.get("/item-out/:date", getMacItemOut);
router.delete("/item-out/:LOG_ID/:inputDate", delMachItemOut);

//report
router.get(
  "/report-saldo-awal/:startDate/:endDate/:lastDate",
  getMecRepSaldoAwl
);
router.get("/report-detail/:startDate/:endDate", getDtlMecTrans);

export default router;
