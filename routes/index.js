import express from "express";
import userRoute from "./setup/user.route.js";

import {
  Login,
  Logout,
  LoginQc,
  LogoutQc,
  LoginQc13,
} from "../controllers/auth/Login.js";
import {
  refreshToken,
  refreshTokenQc,
  refreshTokenQc13,
} from "../controllers/auth/RefreshToken.js";
import userAccesRoute from "./auth/userAccess.route.js";
import getMenu from "../controllers/setup/Menu.js";
import { getDept, getDeptById } from "../controllers/setup/Dept.js";
import holidaysRoute from "./setup/holidays.route.js";
import orderRoute from "./production/order.route.js";
import cuttingRoute from "./production/cutting.route.js";
import systemServiceAttributesRoute from "./system/serviceAttributes.route.js";
import systemServiceAttributeValuesRoute from "./system/serviceAttributeValues.route.js";
import systemRoutes from "./system/index.route.js";
import sewingRoute from "./production/sewing.route.js";
import planningRoute from "./production/planning.route.js";
import pocapacityRoute from "./production/poByCap.route.js";
import reportsrouter from "./production/reports.router.js";
import qcroutes from "./production/qc.route.js";
import qcEndlineRoute from "./production/qcEndlineNew.route.js";
import packingroute from "./production/packing.route.js";
import measurement from "./production/measurement.route.js";
import sewDashboard from "./production/sewDashAnytic.router.js";
import zerodefectRoute from "./production/qcZeroD.route.js";
import auditRoute from "./audit/auditTracking.js";
import mechanicsRoute from "./mechanics/mechanics.route.js";
import listRoute from "./list/list.route.js";
import hrRoute from "./hr/employe.route.js";
import attandance from "./hr/attandance.router.js";
import absen from "./hr/absens.router.js";
import hrdashboard from "./hr/hrDash.route.js";
import payroll from "./payroll/masterPayroll.router.js";
import ie from "./ie/ie.route.js";
import reservation from "./hr/reservation.route.js";
import storage from "./storage/storage.route.js"
import building from "./list/building.route.js"
import company from "./setup/company.route.js"
import unit from "./setup/unit.route.js"
import site from "./setup/site.route.js"
import role from "./setup/role.route.js"
import department from "./setup/department.route.js"
import departmentFx from "./setup/departmentFx.route.js"
import siteFxRoute from "./setup/siteFx.route.js";
import siteDepartmentRoute from "./setup/siteDepartment.route.js";
import masterAttributeRoute from "./system/masterAttribute.route.js";
import warehouseDetail from "./setup/warehouse.route.js";

import "../models/associations.js";


const router = express.Router();

router.post("/login", Login);
router.post("/loginqc", LoginQc);
router.post("/loginqc13", LoginQc13);
router.delete("/logout", Logout);
router.delete("/logoutqc", LogoutQc);
router.get("/token", refreshToken);
router.get("/tokenQc", refreshTokenQc);
router.get("/tokenQc13", refreshTokenQc13);
router.get("/menu", getMenu);
router.get("/dept", getDept);
router.get("/dept/:id", getDeptById);
router.use("/useraccess", userAccesRoute);
router.use("/user", userRoute);
router.use("/holidays", holidaysRoute);
router.use("/order", orderRoute);
router.use("/cutting", cuttingRoute);
router.use("/system", systemServiceAttributesRoute);
router.use("/system", systemServiceAttributeValuesRoute);
router.use("/system", systemRoutes);
router.use("/sewing", sewingRoute);
router.use("/planning", planningRoute);
router.use("/pocapacity", pocapacityRoute);
router.use("/qc", qcroutes);
router.use("/qc-endline", qcEndlineRoute);
router.use("/reports", reportsrouter);
router.use("/packing", packingroute);
router.use("/measurement", measurement);
router.use("/sewdashboard", sewDashboard);
router.use("/zerodefect", zerodefectRoute);
router.use("/audit", auditRoute);
router.use("/mechanics", mechanicsRoute);
router.use("/list", listRoute);
router.use("/hr", hrRoute);
router.use("/attandance", attandance);
router.use("/absensi", absen);
router.use("/hrdashboard", hrdashboard);
router.use("/payroll", payroll);
router.use("/ie", ie);
router.use("/reservation", reservation)
router.use("/storage", storage)
router.use("/building", building)
router.use("/company", company)
router.use("/unit", unit)
router.use("/site", site)
router.use("/role", role)
router.use("/site-fx", siteFxRoute)
router.use("/department", department)
router.use("/department-fx", departmentFx)
router.use("/site-department", siteDepartmentRoute)
router.use("/attribute", masterAttributeRoute)
router.use("/warehouse-detail", warehouseDetail);

router.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

router.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Wrong!!";
  res.status(statusCode).json({ message: err });
});

export default router;
