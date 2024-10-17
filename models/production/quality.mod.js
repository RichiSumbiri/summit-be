import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanQuality = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    QC_SCANTIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

ScanQuality.removeAttribute("id");

export const QCWorkdoneByDate = `SELECT * FROM ViewWorkdoneQC WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const QcType = db.define(
  "qc_inspection_type",
  {
    QC_TYPE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    QC_TYPE_NAME: { type: DataTypes.STRING, allowNull: false },
    QC_CATEGORY: { type: DataTypes.STRING },
    QC_SAMPLING_RULE: { type: DataTypes.DECIMAL },
    QC_TYPE_ADD_ID: { type: DataTypes.INTEGER },
    QC_TYPE_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const listGroupShift = db.define(
  "item_group_shift",
  {
    GROUP_SHIFT_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    GROUP_SHIFT_NAME: { type: DataTypes.STRING, allowNull: false },
    GROUP_SHIFT_DEPT: { type: DataTypes.STRING },
    GROUP_SHIFT_DESC: { type: DataTypes.STRING },
    GROUP_SHIFT_COLOR: { type: DataTypes.STRING },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

export const QcRemarks = db.define(
  "qc_endline_remark",
  {
    SCHD_ID: {
      type: DataTypes.INTEGER,
    },
    ID_SITELINE: { type: DataTypes.STRING, allowNull: false },
    TYPE_PROD: { type: DataTypes.STRING, allowNull: false },
    REMARK: { type: DataTypes.TEXT },
    PROD_DATE: { type: DataTypes.DATE },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_DATE: { type: DataTypes.DATE },
    MOD_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_DATE",
    updatedAt: "MOD_DATE",
  }
);

QcRemarks.removeAttribute("id");

export const QcUsers = db.define(
  "qc_inspection_user",
  {
    QC_USER_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    QC_USERNAME: { type: DataTypes.STRING, allowNull: false },
    QC_NAME: { type: DataTypes.STRING },
    QC_TYPE_ID: { type: DataTypes.INTEGER },
    SITE_NAME: { type: DataTypes.STRING },
    ID_SITELINE: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    QC_USER_PASSWORD: { type: DataTypes.STRING },
    QC_USER_REF_TOKEN: { type: DataTypes.STRING },
    QC_USER_ACTIVE: { type: DataTypes.STRING },
    QC_BYPASS_LOGIN: { type: DataTypes.STRING },
    QC_USER_ADD_ID: { type: DataTypes.INTEGER },
    QC_USER_DEL: { type: DataTypes.INTEGER },
    QC_USER_MOD_ID: { type: DataTypes.INTEGER },
    QC_USER_MOD_ID: { type: DataTypes.INTEGER },
    GROUP_SHIFT_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const QcUsersSchedule = db.define(
  "qc_user_schedule",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    GROUP_ID: { type: DataTypes.INTEGER, allowNull: false },
    SHIFT: { type: DataTypes.STRING },
    START_DATE: { type: DataTypes.DATE },
    END_DATE: { type: DataTypes.DATE },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const QueryGetListUserQc = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_TYPE_ID, c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_BYPASS_LOGIN, a.QC_USER_DEL, d.GROUP_SHIFT_NAME, d.GROUP_SHIFT_ID
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
LEFT JOIN item_group_shift d ON d.GROUP_SHIFT_ID = a.GROUP_SHIFT_ID
WHERE a.QC_USER_DEL <> '1'
`;

export const QueryGetListGroupSch = `SELECT 
	a.ID AS id,
	a.GROUP_ID AS groupId,
	a.SHIFT AS category,
	a.START_DATE AS startDate,
	a.END_DATE AS endDate,
	b.GROUP_SHIFT_NAME AS title,
	b.GROUP_SHIFT_COLOR AS color
  FROM qc_user_schedule a 
  LEFT JOIN item_group_shift b ON a.GROUP_ID = b.GROUP_SHIFT_ID
  WHERE ( a.START_DATE BETWEEN :startDate AND :endDate ) OR 
  ( a.END_DATE BETWEEN :startDate AND  :endDate )
`;

export const QueryCheckSchQc = `SELECT 
	a.ID AS id,
	a.GROUP_ID AS groupId,
	a.SHIFT AS category,
	a.START_DATE AS startDate,
	a.END_DATE AS endDate,
	b.GROUP_SHIFT_NAME AS title,
	b.GROUP_SHIFT_COLOR AS color
  FROM qc_user_schedule a 
  LEFT JOIN item_group_shift b ON a.GROUP_ID = b.GROUP_SHIFT_ID
  WHERE a.GROUP_ID = :groupId AND a.SHIFT = :shift
     AND (
    (START_DATE BETWEEN :startDate AND :endDate) 
    OR (END_DATE BETWEEN :startDate AND :endDate)
    OR (:startDate BETWEEN START_DATE AND END_DATE)
    OR (:endDate BETWEEN START_DATE AND END_DATE)
  )`;

export const QueryGetUserQc = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD, a.QC_USER_REF_TOKEN, a.QC_TYPE_ID,
c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_BYPASS_LOGIN, a.QC_USER_DEL,
b.START_TIME, b.END_TIME 
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USERNAME = :userNameQc`;

export const QryGetUserQcWhGroup = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD,
 a.QC_USER_REF_TOKEN, a.QC_TYPE_ID, d.QC_TYPE_NAME, a.GROUP_SHIFT_ID, b.GROUP_ID,
a.QC_USER_ACTIVE, a.QC_BYPASS_LOGIN, a.QC_USER_DEL, a.SITE_NAME, a.LINE_NAME, b.SHIFT, c.ID_SITELINE,
c.START_TIME, c.END_TIME 
FROM qc_inspection_user a
LEFT JOIN qc_user_schedule b ON b.GROUP_ID = a.GROUP_SHIFT_ID
JOIN item_siteline c ON a.SITE_NAME = c.SITE_NAME
	AND a.LINE_NAME = c.LINE_NAME
	AND b.SHIFT = c.SHIFT
LEFT JOIN qc_inspection_type d ON d.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USERNAME = :userNameQc
AND CURDATE() BETWEEN b.START_DATE AND b.END_DATE;`;

export const QueryGetUserQcReftok = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD, a.QC_USER_REF_TOKEN, a.QC_TYPE_ID,
c.QC_TYPE_NAME, a.ID_SITELINE,  b.SITE_NAME, b.LINE_NAME, b.SHIFT, a.QC_USER_ACTIVE, a.QC_USER_DEL 
FROM qc_inspection_user a
LEFT JOIN item_siteline b ON a.ID_SITELINE = b.ID_SITELINE
LEFT JOIN qc_inspection_type c ON c.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USER_REF_TOKEN = :reftoken`;

export const QueryGetUserQcReftok13 = `SELECT a.QC_USER_ID, a.QC_USERNAME, a.QC_NAME, a.QC_USER_PASSWORD,
a.QC_USER_REF_TOKEN, a.QC_TYPE_ID, d.QC_TYPE_NAME, a.GROUP_SHIFT_ID, b.GROUP_ID,
a.QC_USER_ACTIVE, a.QC_BYPASS_LOGIN, a.QC_USER_DEL, a.SITE_NAME, a.LINE_NAME, b.SHIFT, c.ID_SITELINE,
c.START_TIME, c.END_TIME 
FROM qc_inspection_user a
LEFT JOIN qc_user_schedule b ON b.GROUP_ID = a.GROUP_SHIFT_ID
JOIN item_siteline c ON a.SITE_NAME = c.SITE_NAME
 AND a.LINE_NAME = c.LINE_NAME
 AND b.SHIFT = c.SHIFT
LEFT JOIN qc_inspection_type d ON d.QC_TYPE_ID = a.QC_TYPE_ID 
WHERE a.QC_USER_DEL <> '1' AND a.QC_USER_REF_TOKEN = :reftoken
AND CURDATE() BETWEEN b.START_DATE AND b.END_DATE;`;

export const QueryGetListPart = `SELECT a.PART_CODE, a.PART_NAME FROM item_part a ORDER BY a.PART_ORDER`;
export const QueryGetListDefect = `SELECT a.DEFECT_SEW_CODE, a.DEFECT_NAME FROM item_defect_internal a WHERE a.DEFECT_SEW_CODE IS NOT NULL`;

export const QcEndlineOutput = db.define(
  "qc_endline_output",
  {
    ENDLINE_OUT_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    PLANSIZE_ID: { type: DataTypes.INTEGER, allowNull: true },
    BARCODE_SERIAL: { type: DataTypes.STRING },
    ENDLINE_OUT_TYPE: { type: DataTypes.STRING, allowNull: false },
    ENDLINE_PORD_TYPE: { type: DataTypes.STRING, allowNull: false },
    ENDLINE_PLAN_SIZE: { type: DataTypes.STRING, allowNull: false },
    ENDLINE_OUT_QTY: { type: DataTypes.INTEGER },
    ENDLINE_DEFECT_CODE: { type: DataTypes.STRING },
    ENDLINE_PART_CODE: { type: DataTypes.STRING },
    ENDLINE_ID_SITELINE: { type: DataTypes.STRING },
    ENDLINE_LINE_NAME: { type: DataTypes.STRING },
    ENDLINE_SCH_ID: { type: DataTypes.INTEGER },
    ENDLINE_SCHD_ID: { type: DataTypes.INTEGER },
    ENDLINE_ACT_SCHD_ID: { type: DataTypes.INTEGER },
    ENDLINE_ACT_RPR_SCHD_ID: { type: DataTypes.INTEGER },
    ENDLINE_SCHD_DATE: { type: DataTypes.DATE },
    ENDLINE_SEQUANCE: { type: DataTypes.INTEGER },
    ENDLINE_TIME: { type: DataTypes.TIME },
    ENDLINE_OUT_UNDO: { type: DataTypes.STRING },
    ENDLINE_REPAIR: { type: DataTypes.STRING },
    GROUP_ID: { type: DataTypes.INTEGER },
    ENDLINE_ADD_ID: { type: DataTypes.INTEGER },
    ENDLINE_MOD_ID: { type: DataTypes.INTEGER },
    ENDLINE_ADD_TIME: { type: DataTypes.DATE },
    ENDLINE_MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ENDLINE_ADD_TIME",
    updatedAt: "ENDLINE_MOD_TIME",
  }
);

export const getEndllineQROutput = `SELECT 
SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) AS RTT,
SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) AS DEFECT,
SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'BS' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) AS BS,
SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) AS REPAIRED,
(SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) + SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) + SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'BS' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY
    ELSE 0
END) + SUM(CASE 
    WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' THEN a.ENDLINE_OUT_QTY
    ELSE 0
END)) AS TOTAL_CHECKED
FROM qc_endline_output a
WHERE 
a.ENDLINE_SCHD_ID = :schdid AND 
a.ENDLINE_PLAN_SIZE = :size AND 
(a.ENDLINE_OUT_TYPE IN ('RTT', 'DEFECT', 'BS')) AND 
(a.ENDLINE_OUT_UNDO IS NULL OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y'));
`;

//get data planning size di endline berdasarkan size yang sudah di scan, grouping by size
export const QueryEndlinePlanSize = `SELECT a.SCH_ID, a.SCHD_ID,  i.PLANSIZE_ID, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE,
b.ORDER_SIZE, SUM(b.ORDER_QTY) QTY, l.TFR_QTY, COUNT(*) BDL_TOTAL, (k.RTT+k.REPAIRED) GOOD, k.RTT, k.DEFECT, k.REPAIRED, k.BS, k.TOTAL_CHECKED, 
g.SCHD_PROD_DATE, u.UNDO_RTT, u.UNDO_DEFECT, u.UNDO_BS, u.UNDO_REPAIR, m.RETURN_COUNT
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.SEWING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN (
  SELECT DISTINCT *  FROM qc_endline_plansize 
  WHERE SCHD_PROD_DATE = :schDate AND SITE_NAME = :sitename AND LINE_NAME = :linename  
  GROUP BY SCHD_ID, ORDER_SIZE 
) i ON i.SCHD_ID = a.SCHD_ID AND i.ORDER_SIZE = b.ORDER_SIZE
LEFT JOIN qc_endline_undo u ON u.SCHD_ID = g.SCHD_ID AND i.PLANSIZE_ID = u.PLANSIZE_ID AND u.USER_ID = :userId
LEFT JOIN (
		SELECT a.SCH_ID, a.SCHD_ID, b.ORDER_STYLE, b.ORDER_SIZE, b.ORDER_COLOR,  SUM(b.ORDER_QTY) TFR_QTY
		FROM scan_sewing_out a 
		LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
		LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
		LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
		WHERE g.SCHD_PROD_DATE = :schDate AND a.SEWING_SCAN_LOCATION = :sitename AND 
		e.LINE_NAME LIKE :linename 
		GROUP BY a.SCH_ID, a.SCHD_ID, b.ORDER_STYLE, b.ORDER_SIZE, b.ORDER_COLOR
) l ON l.SCHD_ID = a.SCHD_ID AND b.ORDER_SIZE = l.ORDER_SIZE AND b.ORDER_COLOR = l.ORDER_COLOR
LEFT JOIN (
	SELECT
	    a.ENDLINE_SCHD_ID,
	    a.ENDLINE_PLAN_SIZE,
	    SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS RTT,
	    SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS DEFECT,
	    SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'BS' AND a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS BS,
	    SUM(CASE WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y' THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS REPAIRED,
	    SUM(CASE WHEN a.ENDLINE_OUT_UNDO IS NULL THEN a.ENDLINE_OUT_QTY ELSE 0 END) AS TOTAL_CHECKED
	FROM qc_endline_output a
	WHERE a.ENDLINE_SCHD_DATE = :schDate AND a.ENDLINE_LINE_NAME = :linename 
	GROUP BY a.ENDLINE_SCHD_ID, a.ENDLINE_PLAN_SIZE
) k ON k.ENDLINE_SCHD_ID = a.SCHD_ID AND  k.ENDLINE_PLAN_SIZE = b.ORDER_SIZE
LEFT JOIN (
  SELECT a.SCH_ID, b.ORDER_SIZE, COUNT(*) RETURN_COUNT
  FROM scan_sewing_return a 
  LEFT JOIN order_detail b ON b.BARCODE_SERIAL = a.BARCODE_SERIAL
  LEFT JOIN weekly_prod_sch_detail c  ON a.SCHD_ID = c.SCHD_ID
  LEFT JOIN item_siteline f ON f.ID_SITELINE = c.SCHD_ID_SITELINE
  WHERE c.SCHD_SITE = :sitename AND f.LINE_NAME = :linename  AND  a.CONFIRM_STATUS = '0'
  GROUP BY a.SCH_ID, b.ORDER_SIZE
) m ON m.SCH_ID = a.SCH_ID AND m.ORDER_SIZE = b.ORDER_SIZE 
WHERE g.SCHD_PROD_DATE = :schDate AND a.SEWING_SCAN_LOCATION = :sitename AND 
e.LINE_NAME LIKE :linename 
GROUP BY a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, 
b.ORDER_NO, f.ORDER_REFERENCE_PO_NO, f.ITEM_COLOR_NAME, b.ORDER_STYLE, b.ORDER_SIZE`;
// b.ORDER_NO, SUBSTRING_INDEX(b.MO_NO,',',-1), f.ORDER_REFERENCE_PO_NO, f.ITEM_COLOR_NAME, b.ORDER_STYLE, b.ORDER_SIZE`;

//get data defect for repaired
export const QueryGetDefForRepair = `SELECT a.ENDLINE_OUT_ID, a.ENDLINE_SCHD_ID, a.ENDLINE_OUT_TYPE, a.ENDLINE_PORD_TYPE, a.ENDLINE_PLAN_SIZE, a.ENDLINE_DEFECT_CODE, a.ENDLINE_PART_CODE,
c.PART_NAME, b.DEFECT_NAME, 
 a.ENDLINE_SCHD_DATE, DATE(a.ENDLINE_ADD_TIME) ADD_DATE, a.ENDLINE_TIME , a.ENDLINE_ID_SITELINE
FROM   qc_endline_output a
LEFT JOIN item_defect_internal b ON b.DEFECT_SEW_CODE = a.ENDLINE_DEFECT_CODE
LEFT JOIN item_part c ON c.PART_CODE = a.ENDLINE_PART_CODE
WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size 
AND a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL
ORDER BY a.ENDLINE_TIME`;

//plan size for undo and history
export const PlanSize = db.define(
  "qc_endline_plansize",
  {
    PLANSIZE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    SCH_ID: { type: DataTypes.INTEGER, allowNull: false },
    SCHD_ID: { type: DataTypes.INTEGER, allowNull: false },
    SCHD_PROD_DATE: { type: DataTypes.DATE, allowNull: false },
    // BUYER_CODE: { type: DataTypes.STRING },
    // SITE_NAME: { type: DataTypes.STRING },
    // LINE_NAME: { type: DataTypes.STRING },
    // ORDER_NO: { type: DataTypes.STRING },
    // MO_NO: { type: DataTypes.STRING },
    // ORDER_REF: { type: DataTypes.STRING },
    // ORDER_COLOR: { type: DataTypes.STRING },
    // ORDER_STYLE: { type: DataTypes.STRING },
    ORDER_SIZE: { type: DataTypes.STRING, allowNull: false },
    LINE_NAME: { type: DataTypes.STRING },
    SITE_NAME: { type: DataTypes.STRING },
    COMPLETE_STATUS: { type: DataTypes.STRING },
    // QTY: { type: DataTypes.INTEGER },
    // BDL_TOTAL: { type: DataTypes.INTEGER },
    BDL_TOTAL: { type: DataTypes.INTEGER },
    QTY: { type: DataTypes.INTEGER },
    RTT: { type: DataTypes.INTEGER },
    DEFECT: { type: DataTypes.INTEGER },
    BS: { type: DataTypes.INTEGER },
    REPAIRED: { type: DataTypes.INTEGER },
    // UNDO_RTT: { type: DataTypes.INTEGER },
    // UNDO_DEFECT: { type: DataTypes.INTEGER },
    // UNDO_BS: { type: DataTypes.INTEGER },
    // UNDO_REPAIR: { type: DataTypes.INTEGER },
    PLANSIZE_ADD_ID: { type: DataTypes.INTEGER },
    PLANSIZE_MOD_ID: { type: DataTypes.INTEGER },
    PLANSIZE_ADD_TIME: { type: DataTypes.DATE },
    PLANSIZE_MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "PLANSIZE_ADD_TIME",
    updatedAt: "PLANSIZE_MOD_TIME",
  }
);

//qc endline undo
export const EndlineUndo = db.define(
  "qc_endline_undo",
  {
    PLANSIZE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    SCHD_ID: { type: DataTypes.INTEGER, allowNull: false },
    USER_ID: { type: DataTypes.INTEGER, allowNull: false },
    UNDO_RTT: { type: DataTypes.INTEGER },
    UNDO_DEFECT: { type: DataTypes.INTEGER },
    UNDO_BS: { type: DataTypes.INTEGER },
    UNDO_REPAIR: { type: DataTypes.INTEGER },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_DATE: { type: DataTypes.DATE },
    MOD_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_DATE",
    updatedAt: "MOD_DATE",
  }
);
EndlineUndo.removeAttribute("id");
//query for find last record Defect RTT BS
export const QueryGetLastRttDefBS = `SELECT * FROM qc_endline_output a 
WHERE a.ENDLINE_SCHD_ID = :schdid 
  AND a.ENDLINE_OUT_TYPE = :type  
  AND a.ENDLINE_PLAN_SIZE = :size
  AND a.ENDLINE_PORD_TYPE = :prodtype
  AND DATE(a.ENDLINE_ADD_TIME) = CURDATE()
  AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR IS NULL 
ORDER BY a.ENDLINE_OUT_ID DESC LIMIT 1`;

//query for fin last record Repaird
export const QueryGetLastRepaird = `SELECT * FROM qc_endline_output a 
WHERE a.ENDLINE_SCHD_ID = :schdid 
  AND a.ENDLINE_OUT_TYPE = 'DEFECT' 
  AND a.ENDLINE_PLAN_SIZE = :size
  AND a.ENDLINE_PORD_TYPE = :prodtype
  AND DATE(a.ENDLINE_ADD_TIME) = CURDATE()
AND a.ENDLINE_OUT_UNDO IS NULL AND a.ENDLINE_REPAIR = 'Y'
ORDER BY a.ENDLINE_OUT_ID DESC LIMIT 1`;

export const QueryPlanSizePending = `-- for scan in vs tfr 
SELECT a.SCHD_PROD_DATE, a.PLANSIZE_ID, c.*, a.COMPLETE_STATUS, a.RTT, a.DEFECT, a.BS, a.REPAIRED, 
		( a.RTT+a.REPAIRED) GOOD,
		( a.RTT+a.DEFECT+a.BS+a.REPAIRED) TOTAL_CHECKED,   m.RETURN_COUNT,
		u.UNDO_RTT, u.UNDO_DEFECT, u.UNDO_BS, u.UNDO_REPAIR
FROM (
	SELECT   a.SCH_ID, a.SCHD_ID,  a.ORDER_SIZE, 
	f.CUSTOMER_NAME BUYER_CODE, e.SITE_NAME, e.LINE_NAME, 
	f.ORDER_NO, f.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, f.ORDER_STYLE_DESCRIPTION ORDER_STYLE,
	a.BDL_COUNT BDL_TOTAL, l.BDl_COUNT BDL_TFR, a.SEWIN_QTY QTY, l.TFR_QTY
	FROM viewsewingscaninqty a
	LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
	LEFT JOIN weekly_prod_schedule gg ON g.SCH_ID = gg.SCH_ID
	LEFT JOIN viewcapacity f ON f.ID_CAPACITY = gg.SCH_CAPACITY_ID
	LEFT JOIN item_siteline e ON e.ID_SITELINE = gg.SCH_ID_SITELINE
	LEFT JOIN viewsewingtfrqty l ON l.SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = l.ORDER_SIZE
	WHERE g.ENDLINE_VER IS NULL AND g.SCHD_PROD_DATE < :schDate AND a.SEWING_SCAN_LOCATION = :sitename   AND 
	e.LINE_NAME = :linename  -- AND a.SEWIN_QTY <> l.TFR_QTY 
	GROUP BY a.SCHD_ID, f.ORDER_NO, f.MO_NO, f.ORDER_REFERENCE_PO_NO, a.ORDER_COLOR, a.ORDER_STYLE, a.ORDER_SIZE
) c 
LEFT JOIN  qc_endline_plansize a  ON c.SCHD_ID = a.SCHD_ID AND c.ORDER_SIZE = a.ORDER_SIZE 
LEFT JOIN qc_endline_undo u ON a.PLANSIZE_ID = u.PLANSIZE_ID AND u.USER_ID = :userId
LEFT JOIN (
  SELECT a.SCH_ID, b.ORDER_SIZE, COUNT(*) RETURN_COUNT
  FROM scan_sewing_return a 
  LEFT JOIN order_detail b ON b.BARCODE_SERIAL = a.BARCODE_SERIAL
  LEFT JOIN weekly_prod_sch_detail c  ON a.SCHD_ID = c.SCHD_ID
  LEFT JOIN item_siteline f ON f.ID_SITELINE = c.SCHD_ID_SITELINE
  WHERE c.SCHD_SITE = :sitename AND f.LINE_NAME = :linename  AND  a.CONFIRM_STATUS = '0'
  GROUP BY a.SCH_ID, b.ORDER_SIZE
) m ON m.SCH_ID = a.SCH_ID AND m.ORDER_SIZE = a.ORDER_SIZE 
WHERE c.QTY <> c.TFR_QTY OR c.TFR_QTY IS NULL`;

// export const QueryPlanSizePending = `SELECT a.SCH_ID, a.SCHD_ID,  a.PLANSIZE_ID, f.CUSTOMER_NAME BUYER_CODE, e.SITE_NAME, e.LINE_NAME,
// f.ORDER_NO, f.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, f.ORDER_STYLE_DESCRIPTION ORDER_STYLE,
//  a.SCHD_PROD_DATE, a.LINE_NAME, a.SITE_NAME, a.ORDER_SIZE, a.COMPLETE_STATUS, l.TFR_QTY, a.BDL_TOTAL,
// a.QTY, a.RTT, a.DEFECT, a.BS, a.REPAIRED, u.UNDO_RTT, u.UNDO_DEFECT, u.UNDO_BS, u.UNDO_REPAIR,
// ( a.RTT+a.REPAIRED) GOOD,
// ( a.RTT+a.DEFECT+a.BS+a.REPAIRED) TOTAL_CHECKED, i.NOTYET_TFR_BARCODE, m.RETURN_COUNT
// FROM  qc_endline_plansize a
// LEFT JOIN (
//   SELECT DISTINCT a.SCHD_ID, a.SCH_ID, a.ID_SITELINE, a.SITE_NAME, a.LINE_NAME
//   FROM log_daily_output a
//   WHERE a.SCHD_PROD_DATE < :schDate AND a.SITE_NAME = :sitename   AND a.LINE_NAME = :linename
// ) b ON a.SCHD_ID = b.SCHD_ID
// LEFT JOIN weekly_prod_schedule bb ON bb.SCH_ID = b.SCH_ID
// LEFT JOIN viewcapacity f ON f.ID_CAPACITY = bb.SCH_CAPACITY_ID
// LEFT JOIN item_siteline e ON e.ID_SITELINE = b.ID_SITELINE
// LEFT JOIN viewsewingtfrqty l ON l.SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = l.ORDER_SIZE
// LEFT JOIN qc_endline_undo u ON a.PLANSIZE_ID = u.PLANSIZE_ID AND u.USER_ID = :userId
// LEFT JOIN (
// -- QUERY INI UNTNUK CARI DATA QR YANG BELUM DI TFR
// 		SELECT N.SCH_ID, N.SCHD_ID, N.BUYER_CODE, N.SITE_NAME,
// 		N.LINE_NAME, N.ORDER_COLOR, N.ORDER_STYLE, N.ORDER_SIZE,
// 		N.ORDER_QTY, N.SCHD_PROD_DATE, COUNT(N.BARCODE_SERIAL) NOTYET_TFR_BARCODE
// 		FROM (
// 		   SELECT a.BARCODE_SERIAL, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, g.SITE_NAME SITE_NAME,
// 		   e.LINE_NAME, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE,
// 		   b.ORDER_QTY, g.SCHD_PROD_DATE,
// 		   i.BARCODE_SERIAL BARCODE_TRANSFER
// 		   FROM scan_sewing_in a
// 		   LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// 		   LEFT JOIN log_daily_output g ON a.SCHD_ID = g.SCHD_ID
// 		   LEFT JOIN weekly_prod_schedule gg ON gg.SCH_ID = g.SCH_ID
// 		   LEFT JOIN viewcapacity f ON f.ID_CAPACITY = gg.SCH_CAPACITY_ID
// 		   LEFT JOIN item_siteline e ON e.ID_SITELINE = g.ID_SITELINE
// 		   LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
// 		   WHERE g.SCHD_PROD_DATE < DATE(:schDate) AND a.SEWING_SCAN_LOCATION = :sitename  AND
// 		   e.LINE_NAME = :linename AND ISNULL(i.BARCODE_SERIAL)
// 		) N
// 		GROUP BY N.SCH_ID, N.SCHD_ID, N.BUYER_CODE, N.SITE_NAME,
// 		N.LINE_NAME, N.ORDER_COLOR, N.ORDER_STYLE, N.ORDER_SIZE,
// 		N.SCHD_PROD_DATE
// ) i ON i.SCHD_ID = a.SCHD_ID AND a.ORDER_SIZE = i.ORDER_SIZE AND  f.ITEM_COLOR_NAME = i.ORDER_COLOR
// LEFT JOIN (
//   SELECT  b.ORDER_SIZE, d.ORDER_REFERENCE_PO_NO,
//    d.ITEM_COLOR_NAME, COUNT(*) RETURN_COUNT
//   FROM scan_sewing_return a
//   LEFT JOIN order_detail b ON b.BARCODE_SERIAL = a.BARCODE_SERIAL
//   LEFT JOIN weekly_prod_sch_detail c  ON a.SCHD_ID = c.SCHD_ID
//   LEFT JOIN viewcapacity d ON c.SCHD_CAPACITY_ID = d.ID_CAPACITY
//   LEFT JOIN item_siteline f ON f.ID_SITELINE = c.SCHD_ID_SITELINE
//   WHERE c.SCHD_SITE =:sitename  AND f.LINE_NAME = :linename AND  a.CONFIRM_STATUS = '0'
//   GROUP BY b.ORDER_SIZE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_NAME
// ) m ON m.ORDER_REFERENCE_PO_NO = f.ORDER_REFERENCE_PO_NO AND m.ORDER_SIZE = a.ORDER_SIZE AND m.ITEM_COLOR_NAME = f.ITEM_COLOR_NAME
// WHERE a.SCHD_PROD_DATE < DATE(:schDate) AND a.SITE_NAME = :sitename
// AND a.LINE_NAME = :linename AND i.NOTYET_TFR_BARCODE IS NOT NULL`;

export const QueryGetQrPendding = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE, g.SCHD_SITE, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, a.SEWING_SCAN_BY, d.USER_INISIAL, g.SCHD_PROD_DATE, DATE(a.SEWING_SCAN_TIME) SCAN_DATE, TIME(a.SEWING_SCAN_TIME) SCAN_TIME, 
i.BARCODE_SERIAL BARCODE_TRANSFER, DATE(i.SEWING_SCAN_TIME) TRANSFER_DATE, TIME(i.SEWING_SCAN_TIME) TRANSFER_TIME	
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID 
LEFT JOIN weekly_prod_schedule gg ON g.SCH_ID = gg.SCH_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = gg.SCH_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.SEWING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = gg.SCH_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE g.SCHD_PROD_DATE < :schDate AND a.SEWING_SCAN_LOCATION = :sitename  AND 
e.LINE_NAME = :linename AND g.SCHD_ID IN (
	SELECT a.SCHD_ID FROM scan_sewing_in a
	LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID 
	LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
	LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
	WHERE g.SCHD_PROD_DATE < :schDate AND a.SEWING_SCAN_LOCATION = :sitename  AND 
	e.LINE_NAME = :linename AND ISNULL(i.BARCODE_SERIAL) 
)
ORDER BY  b.ORDER_SIZE, h.BUNDLE_SEQUENCE`;

//qc endline undo
export const SewingBdlReturn = db.define(
  "scan_sewing_return",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCH_ID: { type: DataTypes.INTEGER },
    SCHD_ID: { type: DataTypes.INTEGER },
    SEWING_RETURN_BY: { type: DataTypes.INTEGER },
    PLANSIZE_ID: { type: DataTypes.INTEGER },
    SEWING_RETURN_BY: { type: DataTypes.INTEGER },
    CONFIRM_RETURN_BY: { type: DataTypes.INTEGER },
    CONFIRM_STATUS: { type: DataTypes.INTEGER },
    SEWING_SCAN_LOCATION: { type: DataTypes.STRING },
    SEWING_SCAN_TIME: { type: DataTypes.DATE },
    CONFRIM_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "SEWING_SCAN_TIME",
    updatedAt: false,
  }
);

export const queryTotalCheck = `SELECT m.SCH_ID, m.SCHD_ID, m.BUYER_CODE, m.ORDER_NO,
m.ORDER_COLOR, m.ORDER_STYLE, m.ORDER_SIZE,
COUNT(*) BDL_TOTAL, SUM(m.ORDER_QTY) QTY_SEW_IN, m.TOTAL_CHECKED
FROM (
  SELECT a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, 
  b.ORDER_NO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, b.ORDER_COLOR, 
  b.ORDER_STYLE, b.ORDER_SIZE, b.ORDER_QTY, k.TOTAL_CHECKED
  -- , g.SCHD_PROD_DATE
  FROM scan_sewing_in a
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
  -- LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
  -- LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
  -- LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
  LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
  LEFT JOIN qc_endline_plansize i ON i.SCHD_ID = a.SCHD_ID AND i.ORDER_SIZE = b.ORDER_SIZE
  LEFT JOIN (
        SELECT a.ENDLINE_SCHD_ID, ENDLINE_PLAN_SIZE, SUM(a.ENDLINE_OUT_QTY) AS TOTAL_CHECKED 
        FROM   qc_endline_output a
        WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size 
        AND a.ENDLINE_OUT_UNDO IS NULL
      ) k ON k.ENDLINE_SCHD_ID = a.SCHD_ID AND  k.ENDLINE_PLAN_SIZE = b.ORDER_SIZE
    WHERE a.SCHD_ID = :schdid AND  b.ORDER_SIZE = :size
) m
GROUP BY m.SCH_ID, m.SCHD_ID, m.BUYER_CODE, 
m.ORDER_NO, m.ORDER_COLOR, m.ORDER_STYLE, m.ORDER_SIZE`;

// export const queryTotalCheck = `SELECT a.SCH_ID, a.SCHD_ID,  i.PLANSIZE_ID, b.ORDER_SIZE, COUNT(*) BDL_TOTAL, SUM(b.ORDER_QTY) QTY_SEW_IN, k.TOTAL_CHECKED
// -- , g.SCHD_PROD_DATE
// FROM scan_sewing_in a
// LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// -- LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
// -- LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
// -- LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
// LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
// LEFT JOIN qc_endline_plansize i ON i.SCHD_ID = a.SCHD_ID AND i.ORDER_SIZE = b.ORDER_SIZE
// LEFT JOIN (
// 	SELECT a.ENDLINE_SCHD_ID, ENDLINE_PLAN_SIZE, SUM(a.ENDLINE_OUT_QTY) AS TOTAL_CHECKED
// 	FROM   qc_endline_output a
// 	WHERE a.ENDLINE_SCHD_ID = :schdid AND a.ENDLINE_PLAN_SIZE = :size
// 	AND a.ENDLINE_OUT_UNDO IS NULL
// ) k ON k.ENDLINE_SCHD_ID = a.SCHD_ID AND  k.ENDLINE_PLAN_SIZE = b.ORDER_SIZE
// WHERE a.SCHD_ID = :schdid AND  b.ORDER_SIZE = :size
// GROUP BY a.SCH_ID, a.SCHD_ID, b.BUYER_CODE,
// b.ORDER_NO, b.MO_NO, b.ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE`;

//qc endline undo
export const logEndlineCheck = db.define(
  "log_endline_check",
  {
    SCH_ID: { type: DataTypes.INTEGER },
    SCHD_ID: { type: DataTypes.INTEGER },
    SCHD_PROD_DATE: { type: DataTypes.DATE },
    ID_SITELINE: { type: DataTypes.STRING },
    CHECKED: { type: DataTypes.INTEGER },
    RTT: { type: DataTypes.INTEGER },
    DEFECT: { type: DataTypes.INTEGER },
    REPAIRED: { type: DataTypes.INTEGER },
    BS: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

logEndlineCheck.removeAttribute("id");

export const queryQcLogCheck = `SELECT
c.ENDLINE_SCH_ID SCH_ID,
c.ENDLINE_ACT_SCHD_ID SCHD_ID,
c.ENDLINE_SCHD_DATE SCHD_PROD_DATE,
c.ENDLINE_ID_SITELINE ID_SITELINE,
SUM(c.RFT) + SUM(c.DEFECT) + SUM(c.BS) AS CHECKED,
SUM(c.RFT) AS RTT,
SUM(c.DEFECT) AS DEFECT,
SUM(c.REPAIRED) AS REPAIRED,
SUM(c.BS) AS BS
FROM (
SELECT
    DATE(a.ENDLINE_SCHD_DATE) AS ENDLINE_SCHD_DATE,
    a.ENDLINE_ID_SITELINE,
    a.ENDLINE_SCH_ID,
    a.ENDLINE_ACT_SCHD_ID,
    CASE
        WHEN a.ENDLINE_OUT_TYPE = 'RTT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
        ELSE 0
    END AS RFT,
    CASE
        WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
        ELSE 0
    END AS DEFECT,
    CASE
        WHEN a.ENDLINE_OUT_TYPE = 'BS' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' THEN a.ENDLINE_OUT_QTY
        ELSE 0
    END AS BS,
    CASE
        WHEN a.ENDLINE_OUT_TYPE = 'DEFECT' AND IFNULL(a.ENDLINE_OUT_UNDO, 'OK') <> 'Y' AND a.ENDLINE_REPAIR = 'Y' 
        AND DATE(a.ENDLINE_MOD_TIME)  = CURDATE() THEN a.ENDLINE_OUT_QTY
        ELSE 0
    END AS REPAIRED
FROM qc_endline_output a
LEFT JOIN item_siteline b ON b.ID_SITELINE = a.ENDLINE_ID_SITELINE
WHERE DATE(a.ENDLINE_ADD_TIME) = CURDATE()
AND (a.ENDLINE_OUT_TYPE = 'RTT' OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y') OR a.ENDLINE_OUT_TYPE = 'BS'
OR (a.ENDLINE_OUT_TYPE = 'DEFECT' AND a.ENDLINE_REPAIR = 'Y' AND DATE(a.ENDLINE_MOD_TIME) = CURDATE()))
) c
GROUP BY c.ENDLINE_SCHD_DATE, c.ENDLINE_ID_SITELINE, c.ENDLINE_ACT_SCHD_ID`;
