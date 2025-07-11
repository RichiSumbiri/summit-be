import express from "express";
import {
  ListTypeMachine,
  delMachItemIn,
  delMachItemOut,
  deleteMachine,
  getDtlMecTrans,
  getEmploye,
  getListMachine,
  getListTypeMec,
  getMacItemIn,
  getMacItemOut,
  getMachineNo,
  getMachinesByStorageInventoryId,
  getMecRepSaldoAwl,
  getOneMachForIN,
  getOneMachine,
  getPartNNeedle,
  postMacPartOut,
  postMachItemIn,
  postMachine,
  updateMachine,
  updateMachineAndStorage,
  updateSequenceByStorageAndMachine, getTypeMachineByCategory, getAllDownTimeWithOutput, getMecDownTimeValidation,
} from "../../controllers/mecahnics/machine.js";
const router = express.Router();

router.get("/machines", getListMachine);
router.get("/machines/:code", getOneMachine);
router.get("/machines-inpt/:macId", getOneMachForIN);
router.get('/storage/:storageInventoryId', getMachinesByStorageInventoryId);
router.get("/type-machines", getListTypeMec);
router.post("/machines", postMachine);
router.patch("/machines", updateMachine);
router.put("/storage/change-location/:serialNumberInventory", updateMachineAndStorage);
router.patch("/storage/change-sequence/:storageInventoryId", updateSequenceByStorageAndMachine);


router.delete("/machines/:macId", deleteMachine);

router.post("/item-in", postMachItemIn);
router.delete("/item-in/:LOG_ID/:inputDate", delMachItemIn);
router.get("/item-in/:date", getMacItemIn);

router.get("/sparepart-needle", getPartNNeedle);
router.post("/item-out", postMacPartOut);
router.get("/employe/:nik", getEmploye);
router.get("/machine-no/:macId", getMachineNo);
router.get("/item-out/:date", getMacItemOut);
router.delete("/item-out/:LOG_ID/:inputDate", delMachItemOut);
router.get("/list-type", ListTypeMachine)

router.get('/type-summary', getTypeMachineByCategory)
router.get('/report-downtime', getAllDownTimeWithOutput)
router.get('/check-downtime', getMecDownTimeValidation)

//report
router.get(
  "/report-saldo-awal/:startDate/:endDate/:lastDate",
  getMecRepSaldoAwl
);
router.get("/report-detail/:startDate/:endDate", getDtlMecTrans);

export default router;
