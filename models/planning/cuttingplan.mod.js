import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryViewSchSewingForCutting = `SELECT a.SCH_ID, d.CUT_ID, a.SCH_ID_SITELINE,  c.SITE_NAME, c.LINE_NAME, b.MO_NO,
b.ORDER_REFERENCE_PO_NO ORDER_REF,
a.SCH_CAPACITY_ID, a.SCH_START_PROD, a.SCH_FINISH_PROD,
b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION ORDER_STYLE, b.MO_QTY,
a.SCH_QTY, IFNULL(d.LOADING_QTY,0) LOADING_QTY, a.SCH_QTY-IFNULL(d.LOADING_QTY,0) BALANCE_LOADING,
IF(a.SCH_QTY = b.MO_QTY , 'ALL' ,'PARTIAL') SIZE
FROM weekly_prod_schedule a  
LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
LEFT JOIN (
	SELECT a.SCH_ID,  SUM(b.ORDER_QTY) LOADING_QTY
	FROM scan_sewing_in a 
	LEFT JOIN view_order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
	WHERE a.SCH_ID IN (
				SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
  				WHERE a.SCHD_SITE = :site AND  a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
	) GROUP BY a.SCH_ID
) d ON d.SCH_ID = a.SCH_ID
LEFT JOIN cuting_loading_schedule d ON d.CUT_SCH_ID = a.SCH_ID
WHERE a.SCH_SITE = :site AND a.SCH_ID IN  (
	  SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
	  WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
	) OR IFNULL(a.SCH_START_PROD ,'') =  ''
ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC
`;

export const getSewingSchSize = `SELECT  a.SCH_ID, b.SCH_SIZE_ID, d.CUT_ID_SIZE,  a.SCH_ID_SITELINE, b.SIZE_CODE, SUM(b.SCH_SIZE_QTY) SCH_SIZE_QTY, 
IFNULL(c.LOADING_QTY,0) LOADING_QTY, b.SCH_SIZE_QTY-IFNULL(c.LOADING_QTY,0) BALANCE_LOADING
FROM weekly_prod_schedule a
LEFT JOIN  weekly_sch_size b ON a.SCH_ID = b.SCH_ID AND b.SCH_SIZE_QTY <> 0
LEFT JOIN (
    SELECT a.SCH_ID, b.ORDER_SIZE, SUM(b.ORDER_QTY) LOADING_QTY
    FROM scan_sewing_in a 
    LEFT JOIN view_order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
    WHERE a.SCH_ID IN (
      SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
      WHERE a.SCHD_SITE = :site AND  a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
    ) GROUP BY a.SCH_ID, b.ORDER_SIZE
  ) c ON (c.SCH_ID = b.SCH_ID AND b.SIZE_CODE = c.ORDER_SIZE )
LEFT JOIN cuting_loading_sch_size d ON d.CUT_SCH_ID_SIZE = b.SCH_SIZE_ID
WHERE  a.SCH_SITE = :site AND a.SCH_ID IN  (
    SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
    WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
) OR IFNULL(a.SCH_START_PROD ,'') =  '' 
GROUP BY  a.SCH_ID, a.SCH_ID_SITELINE, b.SIZE_CODE
`;

export const CutingLoadingSchedule = db.define(
  "cuting_loading_schedule",
  {
    CUT_ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    CUT_SCH_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_ID_CAPACITY: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_ID_SITELINE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_SITE_NAME: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_SCH_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CUT_SEW_SCH_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CUT_SIZE_TYPE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_SEW_START: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_SEW_FINISH: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_LOADING_START: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_LOADING_FINISH: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_ADD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_MOD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CUT_ADD_TIME",
    updatedAt: "CUT_MOD_TIME",
  }
);

export const CutingLoadingSchSize = db.define(
  "cuting_loading_sch_size",
  {
    CUT_ID_SIZE: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    CUT_SCH_ID_SIZE: {
      type: DataTypes.BIGINT,
    },
    CUT_ID: {
      type: DataTypes.BIGINT,
    },
    CUT_SCH_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_SEW_SIZE_CODE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_ID_SITELINE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_SEW_SCH_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CUT_ADD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_MOD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CUT_ADD_TIME",
    updatedAt: "CUT_MOD_TIME",
  }
);

export const queryGetSchCutLoad = `SELECT a.CUT_ID, a.CUT_SCH_ID, a.CUT_ID_CAPACITY, a.CUT_SITE_NAME, c.LINE_NAME,
a.CUT_SCH_QTY, a.CUT_SIZE_TYPE, a.CUT_LOADING_START, a.CUT_LOADING_FINISH,
b.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION, b.MO_QTY, a.CUT_SEW_SCH_QTY, s.LOADING_QTY,
IFNULL(a.CUT_SEW_SCH_QTY,0) - IFNULL(s.LOADING_QTY,0) BAL,
d.USER_INISIAL USER_ADD, e.USER_INISIAL USER_MOD  
FROM cuting_loading_schedule a
LEFT JOIN viewcapacity b ON a.CUT_ID_CAPACITY = b.ID_CAPACITY
LEFT JOIN item_siteline c ON a.CUT_ID_SITELINE = c.ID_SITELINE
LEFT JOIN xref_user_web d ON d.USER_ID = a.CUT_ADD_ID
LEFT JOIN xref_user_web e ON e.USER_ID = a.CUT_MOD_ID
LEFT JOIN (
      SELECT a.SCH_ID,  SUM(b.ORDER_QTY) LOADING_QTY
      FROM scan_sewing_in a 
      LEFT JOIN view_order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
      WHERE a.SCH_ID IN (
          SELECT DISTINCT
          cls.CUT_SCH_ID
          FROM cuting_loading_sch_detail cls 
          LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
          WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
      ) GROUP BY a.SCH_ID
    ) s ON s.SCH_ID = a.CUT_SCH_ID
WHERE (a.CUT_SITE_NAME =  :site AND a.CUT_ID IN (
	SELECT DISTINCT
	cls.CUT_ID
	FROM cuting_loading_sch_detail cls 
	LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
	WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
) )OR (IFNULL(a.CUT_LOADING_START ,'') =  '' AND  a.CUT_SITE_NAME =  :site)
ORDER BY a.CUT_ID_SITELINE, a.CUT_SEW_START, a.CUT_LOADING_START`;

export const qryGetCutSchSize = `SELECT 
a.CUT_ID_SIZE, a.CUT_ID, a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE, a.CUT_SEW_SCH_QTY, IFNULL(b.LOADING_QTY,0) LOADING_QTY,
a.CUT_SEW_SCH_QTY-IFNULL(b.LOADING_QTY,0) BAL
FROM  cuting_loading_sch_size  a
LEFT JOIN (
  SELECT a.SCH_ID, b.ORDER_SIZE,  SUM(b.ORDER_QTY) LOADING_QTY
  FROM scan_sewing_in a 
  LEFT JOIN view_order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
  WHERE a.SCH_ID IN (
      SELECT DISTINCT
      cls.CUT_SCH_ID
      FROM cuting_loading_sch_detail cls 
      LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
      WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
  ) GROUP BY a.SCH_ID, b.ORDER_SIZE
) b ON b.SCH_ID = a.CUT_SCH_ID AND a.CUT_SEW_SIZE_CODE = b.ORDER_SIZE
WHERE a.CUT_ID IN (
  SELECT DISTINCT s.CUT_ID  
  FROM (
    SELECT DISTINCT
    cls.CUT_ID
    FROM cuting_loading_sch_detail cls 
    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
    WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
    UNION ALL 
    SELECT DISTINCT
    chead.CUT_ID
    FROM cuting_loading_schedule chead 
    LEFT JOIN item_siteline st ON chead.CUT_ID_SITELINE = st.ID_SITELINE 
    WHERE  st.SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
  ) s
)  `;

export const qryCutingSchDetail = `SELECT 
n.CUT_SCH_ID, n.CUT_LOAD_DATE, n.CUT_SEW_SIZE_CODE, SUM(n.CUT_SCH_QTY)  CUT_SCH_QTY, SUM(n.LOADING_QTY) LOADING_QTY
FROM (
SELECT DISTINCT
  a.CUT_SCH_ID, a.CUT_LOAD_DATE, b.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY , 0 LOADING_QTY
FROM cuting_loading_sch_detail a 
LEFT JOIN cuting_loading_sch_size b ON b.CUT_ID_SIZE = a.CUT_ID_SIZE
LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
WHERE a.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
UNION ALL 
SELECT 
  a.SCH_ID CUT_SCH_ID, DATE(a.SEWING_SCAN_TIME) CUT_LOAD_DATE, b.ORDER_SIZE CUT_SEW_SIZE_CODE, 0 CUT_SCH_QTY, SUM(b.ORDER_QTY) LOADING_QTY
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  DATE(a.SEWING_SCAN_TIME)  BETWEEN :startDate AND :endDate AND a.SEWING_SCAN_LOCATION = :site
GROUP BY a.SCH_ID,  DATE(a.SEWING_SCAN_TIME), b.ORDER_SIZE
) n GROUP BY n.CUT_SCH_ID, n.CUT_LOAD_DATE, n.CUT_SEW_SIZE_CODE`;
