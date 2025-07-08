import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanSewing = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SEWING_SCANTIME: {
      type: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanSewing.removeAttribute("id");

export const SewingListSite = `SELECT DISTINCT a.SITE, a.SITE_NAME, a.CUS_NAME FROM item_siteline a ORDER BY a.SITE_NAME`;
export const SewingListLine = `SELECT a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER, a.FOREMAN, a.START_TIME, a.END_TIME FROM  item_siteline a`;
export const SewingListLineFilter = `SELECT a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER, a.FOREMAN, a.START_TIME, a.END_TIME FROM  item_siteline a WHERE a.SITE_NAME = :siteLine AND a.SHIFT LIKE '%_A'`;
export const SewingListLineByGroup = `SELECT DISTINCT a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER,
a.FOREMAN, a.START_TIME, a.END_TIME 
FROM  item_siteline a
GROUP BY a.SITE, a.SITE_NAME, a.LINE_NAME`;
export const SewingListShift = `SELECT DISTINCT a.SHIFT FROM item_siteline a`;

export const SewingWorkdoneByDate = `SELECT * FROM ViewWorkdoneSewing WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const SiteLine = db.define(
  "item_siteline",
  {
    ID_SITELINE: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    SITE: { type: DataTypes.STRING, allowNull: true },
    LINE: { type: DataTypes.STRING, allowNull: true },
    SITE_NAME: { type: DataTypes.STRING, allowNull: true },
    LINE_NAME: { type: DataTypes.STRING, allowNull: true },
    SHIFT: { type: DataTypes.STRING },
    DEFAULT_MANPOWER: { type: DataTypes.STRING },
    FOREMAN: { type: DataTypes.STRING },
    START_TIME: { type: DataTypes.TIME },
    END_TIME: { type: DataTypes.TIME },
    CREATE_BY: { type: DataTypes.INTEGER },
    CREATE_DATE: { type: DataTypes.DATE },
    UPDATE_BY: { type: DataTypes.INTEGER },
    UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const GetMpPlanVsActual = `SELECT b.ID_MPD, b.MP_DATE, a.ID_SITELINE, a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME, a.SHIFT, a.DEFAULT_MANPOWER, b.PLAN_WH, b.PLAN_MP, ROUND(b.PLAN_MP*0.0909) PLAN_AB, 
b.ACT_WH,b.ACT_MP, ((b.PLAN_MP - b.ACT_MP)/b.PLAN_MP)*100 ACTUAL_AB,  b.OT_WH, b.OT_MP
FROM  item_siteline a
LEFT JOIN manpower_detail b ON a.ID_SITELINE = b.ID_SITELINE AND b.MP_DATE = :date
WHERE a.SITE = :site AND a.SHIFT = :shift`;

export const ManPoerDetail = db.define(
  "manpower_detail",
  {
    ID_MPD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    MP_DATE: { type: DataTypes.DATE },
    ID_SITELINE: { type: DataTypes.STRING },
    PLAN_WH: { type: DataTypes.INTEGER },
    PLAN_MP: { type: DataTypes.INTEGER },
    ACT_WH: { type: DataTypes.INTEGER },
    ACT_MP: { type: DataTypes.INTEGER },
    OT_WH: { type: DataTypes.INTEGER },
    OT_MP: { type: DataTypes.INTEGER },
    CREATE_BY: { type: DataTypes.INTEGER },
    CREATE_DATE: { type: DataTypes.DATE },
    UPDATE_BY: { type: DataTypes.INTEGER },
    UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const WorkingHoursDetail = db.define(
  "workinghour_detail",
  {
    ID_WHD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    LINE_NAME: { type: DataTypes.STRING },
    SHIFT: { type: DataTypes.STRING },
    PLAN_WH: { type: DataTypes.INTEGER },
    ACT_WH: { type: DataTypes.INTEGER },
    PLAN_WH_OT: { type: DataTypes.INTEGER },
    ACT_WH_OT: { type: DataTypes.INTEGER },
    PLAN_WH_X_OT: { type: DataTypes.INTEGER },
    ACT_WH_X_OT: { type: DataTypes.INTEGER },
    CREATE_BY: { type: DataTypes.INTEGER },
    CREATE_DATE: { type: DataTypes.DATE },
    UPDATE_BY: { type: DataTypes.INTEGER },
    UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const ManpowewrDailyDetail = db.define(
  "mp_daily_detail",
  {
    ID_MPD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    SHIFT: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    PLAN_MP: { type: DataTypes.INTEGER },
    ACT_MP: { type: DataTypes.INTEGER },
    PLAN_MP_OT: { type: DataTypes.INTEGER },
    ACT_MP_OT: { type: DataTypes.INTEGER },
    PLAN_MP_X_OT: { type: DataTypes.INTEGER },
    ACT_MP_X_OT: { type: DataTypes.INTEGER },
    CREATE_BY: { type: DataTypes.INTEGER },
    CREATE_DATE: { type: DataTypes.DATE },
    UPDATE_BY: { type: DataTypes.INTEGER },
    UPDATE_DATE: { type: DataTypes.DATE },
    date_create_date: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const RemarkDailyDetail = db.define(
  "remark_detail",
  {
    ID_REMARK: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    SHIFT: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    PLAN_REMARK: { type: DataTypes.STRING },
    ACT_REMARK: { type: DataTypes.STRING },
    ACT_OT_REMARK: { type: DataTypes.STRING },
    CREATE_BY: { type: DataTypes.INTEGER },
    CREATE_DATE: { type: DataTypes.DATE },
    UPDATE_BY: { type: DataTypes.INTEGER },
    UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const GetQrlistAftrScan = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, a.SEWING_SCAN_BY, d.USER_INISIAL, g.SCHD_PROD_DATE, DATE(a.SEWING_SCAN_TIME) SCAN_DATE, TIME(a.SEWING_SCAN_TIME) SCAN_TIME
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.SEWING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE g.SCHD_PROD_DATE = :schDate AND a.SEWING_SCAN_LOCATION = :sitename  AND 
e.LINE_NAME LIKE :linename  AND a.BARCODE_SERIAL LIKE :barcodeserial`;

export const ScanSewingOut = db.define(
  "scan_sewing_out",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    BARCODE_MAIN: {
      type: DataTypes.STRING,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    SCHD_ID: { type: DataTypes.BIGINT },
    SEWING_SCAN_BY: { type: DataTypes.BIGINT },
    SEWING_SCAN_LOCATION: { type: DataTypes.STRING },
    SEWING_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "SEWING_SCAN_TIME",
    updatedAt: false,
  }
);

export const ScanSewingQrSplit = db.define(
  "scan_sewing_qr_split",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    BARCODE_MAIN: {
      type: DataTypes.STRING,
    },
    BARCODE_SEQ: {
      type: DataTypes.INTEGER,
    },
    NEW_QTY: {
      type: DataTypes.INTEGER,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    SCHD_ID: { type: DataTypes.BIGINT },
    PRINT_STATUS: { type: DataTypes.INTEGER },
    PRINT_BY: { type: DataTypes.BIGINT },
    SEWING_SCAN_BY: { type: DataTypes.BIGINT },
    SEWING_SCAN_LOCATION: { type: DataTypes.STRING },
    SEWING_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "SEWING_SCAN_TIME",
    updatedAt: false,
  }
);

export const QuerySewingInQr = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, a.SEWING_SCAN_BY, d.USER_INISIAL, g.SCHD_PROD_DATE, DATE(a.SEWING_SCAN_TIME) SCAN_DATE, TIME(a.SEWING_SCAN_TIME) SCAN_TIME, 
i.BARCODE_SERIAL BARCODE_TRANSFER, DATE(a.SEWING_SCAN_TIME) TRANSFER_DATE, TIME(i.SEWING_SCAN_TIME) TRANSFER_TIME	
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.SEWING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE g.SCHD_PROD_DATE = :schDate AND a.SEWING_SCAN_LOCATION = :sitename  AND 
e.LINE_NAME LIKE :linename  AND a.BARCODE_SERIAL LIKE :barcodeserial
ORDER BY  b.ORDER_SIZE, h.BUNDLE_SEQUENCE`;

export const CheckQrExist = `SELECT a.SCHD_ID, b.ORDER_SIZE, b.ORDER_QTY, date(a.SEWING_SCAN_TIME) SCAN_DATE
FROM scan_sewing_in a 
LEFT JOIN order_detail b ON b.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE a.BARCODE_SERIAL = :barcodeSerial`;

export const CheckQtyBcdVsOut = `	SELECT 
	a.BARCODE_SERIAL,
	DATE(a.ENDLINE_MOD_TIME)  outdate,
	SUM(a.ENDLINE_OUT_QTY) output ,
	od.ORDER_QTY
	FROM qc_endline_output a 
	LEFT JOIN order_detail od ON od.BARCODE_SERIAL = a.BARCODE_SERIAL
	WHERE a.BARCODE_SERIAL = :barcodeSerial   AND a.ENDLINE_OUT_UNDO IS NULL  
	GROUP BY a.BARCODE_SERIAL, DATE(a.ENDLINE_MOD_TIME) `

export const CheckWipBfrOut = `SELECT m.PLANSIZE_ID,  a.SCH_ID, a.SCHD_ID,  a.ORDER_SIZE,
a.BDL_COUNT BDL_TOTAL, l.BDl_COUNT BDL_TFR, a.SEWIN_QTY QTY, m.OUTPUT_QTY, l.TFR_QTY,
IFNULL(m.OUTPUT_QTY, 0) - IFNULL(l.TFR_QTY,0) BALANCE
FROM viewsewingscaninqty a
LEFT JOIN viewsewingtfrqty l ON l.SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = l.ORDER_SIZE
LEFT JOIN  viewplansizeoutput m ON m.ENDLINE_SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = m.ENDLINE_PLAN_SIZE
WHERE a.SCHD_ID = :schdId AND a.ORDER_SIZE = :orderSize 
GROUP BY a.SCHD_ID,  a.ORDER_SIZE`;

export const qryGetMpPlan = `SELECT * FROM mp_daily_detail a WHERE a.SCHD_ID = :schdId AND a.SHIFT = :shift `;
export const qryGetWhPlan = `SELECT * FROM workinghour_detail a WHERE a.SCHD_ID = :schdId AND a.SHIFT = :shift `;
export const qryGetSmvPlan = `SELECT * FROM smv_daily_plan a WHERE a.SCHD_ID = :schdId AND a.SHIFT = :shift `;
