import express from "express";
import {
  deleteGroup,
  empToGroup,
  getAllEmpForGrp,
  getAllGroup,
  getCldrType,
  getGroupSchedule,
  getMemberGroup,
  getRefEmpByQry,
  getSchIndividu,
  patchGroup,
  postGroupSch,
  postNewGroup,
  postSchIndividu,
} from "../../controllers/hr/JadwalJamKerja.js";
import {
  deltSchPunchAttd,
  getListMasterPunch,
  getLogAttdSummit,
  getSchPunchAttd,
  getWdmsToAmano,
  getWdmsToSummit,
  postDataLogAttd,
  postSchPunchAttd,
  punchAttdLog,
} from "../../controllers/hr/attandance.js";

const router = express.Router();

router.get("/group", getAllGroup);
router.post("/group", postNewGroup);
router.patch("/group", patchGroup);
router.delete("/group/:groupId", deleteGroup);

//get employee rote
router.get("/employe-active", getAllEmpForGrp);
router.get("/member-group/:groupId", getMemberGroup);
router.post("/emp-to-group", empToGroup);

//jadwal group
router.get("/calendar-type", getCldrType);
router.get("/jadwal-group/:groupId/:startDate/:endDate", getGroupSchedule);
router.post("/jadwal-group", postGroupSch);

//jadwal individu
router.get("/jadwal-indivdu-emp/:qrytext", getRefEmpByQry);
router.get("/jadwal-individu/:nik/:startDate/:endDate", getSchIndividu);
router.post("/jadwal-individu", postSchIndividu);

//log attandance
router.get('/log-wdms-to-amano/:start/:end',getWdmsToAmano)
router.get('/log-wdms-to-summit/:start/:end',getWdmsToSummit)
router.get('/log-summit/:start/:end',getLogAttdSummit)
router.get("/sch-attd", getSchPunchAttd);
router.get("/lits-master-punch", getListMasterPunch);
router.delete("/sch-attd/:id", deltSchPunchAttd);
router.post("/sch-attd", postSchPunchAttd);
router.post("/log-attd", postDataLogAttd);
router.post("/punch-absens", punchAttdLog);
export default router;
