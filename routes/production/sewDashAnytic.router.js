import express from "express";
import {
  getDataAllSiteDash,
  getDefRate,
  getEffYtdOverAll,
  getThreeTop,
  splitDataDashboard,
  sumByLine,
} from "../../controllers/production/dashAnalitycs/DashboardAll.js";
import {
  getDataDashSite,
  getDataDashSiteYestd,
  getDataQcSite,
  getRftPerhour,
  getTopDefectPart,
} from "../../controllers/production/dashAnalitycs/DashboardSite.js";
import {
  findStyleCode,
  getDataWeekly,
  getYtdListWe,
} from "../../controllers/production/dashAnalitycs/DashYtd.js";
import { getDataMtd } from "../../controllers/production/dashAnalitycs/DashMtd.js";
import {
  getDataQcDash,
  getTarget,
  getTopDefectPartYes,
} from "../../controllers/production/dashAnalitycs/DashQcDay.js";
import { getDataQcSum } from "../../controllers/production/dashAnalitycs/DashQcSum.js";
import { getSewFullYear } from "../../controllers/production/dashAnalitycs/DashFullYear.js";

const router = express.Router();

router.get("/allsite", getDataAllSiteDash, sumByLine, splitDataDashboard);
router.get("/effYesAll", getEffYtdOverAll);
router.get("/defRate", getDefRate);
router.get("/topthree", getThreeTop);
router.get("/style-code", findStyleCode);

//site route
router.get("/sitedash/:schDate/:sitename", getDataDashSite);
router.get("/sitedash/yesterday/:schDate/:sitename", getDataDashSiteYestd);
router.get("/sitedash/defrate/:schDate/:sitename", getDataQcSite);

//detil line
router.get("/sitedash/topdefpart/:schDate/:idSiteline", getTopDefectPart);
router.get("/sitedash/defHourShift/:schDate/:idSiteLine/:shift", getRftPerhour);

//QC dashboard route
router.get(
  "/qcdashboard/target/:startDate/:endDate/:dept/:category",
  getTarget
);
router.get("/qcdashboard/daily", getDataQcDash);
router.get(
  "/qcdashboard/topdefpart-yestd/:schDate/:idSiteline",
  getTopDefectPartYes
);

//QC weekly
router.get("/qcdashboard/summary", getDataQcSum);

//YTD route
router.get("/ytd/list-we/:year", getYtdListWe);
router.get("/ytd/weekly", getDataWeekly);
router.get("/ytd/monthly", getDataMtd);
router.get("/ytd/year", getSewFullYear);

export default router;
