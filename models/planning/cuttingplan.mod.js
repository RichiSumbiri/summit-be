import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryViewSchSewingForCutting = `SELECT a.SCH_ID, d.CUT_ID, a.SCH_ID_SITELINE,  c.SITE_NAME, c.LINE_NAME, b.MO_NO,
CASE WHEN d.CUT_ID IS NOT NULL THEN 'POSTED' ELSE 'UNPOSTED' END AS STATUS_SCH,
b.ORDER_REFERENCE_PO_NO ORDER_REF,
a.SCH_CAPACITY_ID, a.SCH_START_PROD, a.SCH_FINISH_PROD,
b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
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
WHERE (a.SCH_SITE = :site AND a.SCH_ID IN  (
	  SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
	  WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
	) )OR (a.SCH_START_PROD IS NULL AND a.SCH_SITE = :site)
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
WHERE  (a.SCH_SITE = :site AND a.SCH_ID IN  (
  SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
  WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
) )OR (a.SCH_START_PROD IS NULL AND a.SCH_SITE = :site)
GROUP BY  a.SCH_ID, a.SCH_ID_SITELINE, b.SIZE_CODE
ORDER BY a.SCH_ID_SITELINE,  a.SCH_START_PROD ASC
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

export const queryGetSchCutLoad = `SELECT 	
na.CUT_ID, c.SCH_ID, na.CUT_SCH_ID, na.CUT_ID_CAPACITY, na.CUT_SITE_NAME, na.LINE_NAME,
b.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION, c.SCH_START_PROD, b.MO_QTY,CUT_SCH_QTY, 
na.CUT_SIZE_TYPE, IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
na.CUT_LOADING_START, na.CUT_LOADING_FINISH, na.CUT_SEW_SCH_QTY, na.LOADING_QTY, na.CUT_SEW_SCH_QTY - IFNULL(na.LOADING_QTY, 0) BAL,
CASE WHEN (IFNULL(na.LOADING_QTY,0) - na.CUT_SEW_SCH_QTY) < 0 THEN "Open"
     WHEN (IFNULL(na.LOADING_QTY,0) - na.CUT_SEW_SCH_QTY) = 0 THEN "Completed"
     ELSE "Over" END AS STATUS
FROM (
    SELECT a.CUT_ID, a.CUT_SCH_ID, a.CUT_ID_CAPACITY, a.CUT_SITE_NAME, c.LINE_NAME, 
      a.CUT_SCH_QTY, a.CUT_SIZE_TYPE, a.CUT_LOADING_START, a.CUT_LOADING_FINISH,
      a.CUT_SEW_SCH_QTY, SUM(s.ORDER_QTY) LOADING_QTY
    FROM cuting_loading_schedule a
    LEFT JOIN item_siteline c ON a.CUT_ID_SITELINE = c.ID_SITELINE
	 LEFT JOIN (
			SELECT  
				b.SCH_ID, c.ORDER_SIZE,  SUM(c.ORDER_QTY) ORDER_QTY
			FROM scan_sewing_in b
			LEFT JOIN view_order_detail c ON c.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE b.SCH_ID IN (
				SELECT s.CUT_SCH_ID  
				FROM (
					 SELECT DISTINCT
					 cls.CUT_SCH_ID
					 FROM cuting_loading_sch_detail cls 
					 LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
					 WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
					 UNION ALL 
					 SELECT DISTINCT
					 chead.CUT_SCH_ID
					 FROM cuting_loading_schedule chead 
					 LEFT JOIN item_siteline st ON chead.CUT_ID_SITELINE = st.ID_SITELINE 
					 WHERE  st.SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
				) s GROUP BY s.CUT_SCH_ID  
			) GROUP BY 	b.SCH_ID, c.ORDER_SIZE
	 ) s ON s.SCH_ID = a.CUT_SCH_ID 
    WHERE (a.CUT_SITE_NAME =  :site AND a.CUT_SCH_ID IN (
          SELECT DISTINCT	cls.CUT_SCH_ID
          FROM cuting_loading_sch_detail cls 
          LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
          WHERE  cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
    ) )OR (a.CUT_LOADING_START IS NULL AND  a.CUT_SITE_NAME =  :site)
    GROUP BY a.CUT_SCH_ID
    ORDER BY a.CUT_ID_SITELINE, a.CUT_SEW_START, a.CUT_LOADING_START
) na
LEFT JOIN viewcapacity b ON b.ID_CAPACITY = na.CUT_ID_CAPACITY
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = na.CUT_SCH_ID
ORDER BY na.LINE_NAME, c.SCH_START_PROD`;

export const qryGetCutSchSize = `SELECT 
a.CUT_ID_SIZE, b.SCH_SIZE_ID,  a.CUT_ID, a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE, a.CUT_SEW_SCH_QTY, a.CUT_ID_SITELINE ,
IFNULL(SUM(s.ORDER_QTY) ,0) LOADING_QTY,
a.CUT_SEW_SCH_QTY - IFNULL(SUM(s.ORDER_QTY) ,0) BAL,
CASE WHEN (IFNULL(SUM(s.ORDER_QTY) ,0) - a.CUT_SEW_SCH_QTY) < 0 THEN "Open"
	  WHEN (IFNULL(SUM(s.ORDER_QTY) ,0) - a.CUT_SEW_SCH_QTY) = 0 THEN "Completed"
	  ELSE "Over" END AS STATUS
FROM  cuting_loading_sch_size  a
LEFT JOIN (
	SELECT  
		b.SCH_ID, c.ORDER_SIZE,  SUM(c.ORDER_QTY) ORDER_QTY
	FROM scan_sewing_in b
	LEFT JOIN view_order_detail c ON c.BARCODE_SERIAL = b.BARCODE_SERIAL 
	WHERE b.SCH_ID IN (
		SELECT s.CUT_SCH_ID  
		FROM (
			 SELECT DISTINCT
			 cls.CUT_SCH_ID
			 FROM cuting_loading_sch_detail cls 
			 LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
			 WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
			 UNION ALL 
			 SELECT DISTINCT
			 chead.CUT_SCH_ID
			 FROM cuting_loading_schedule chead 
			 LEFT JOIN item_siteline st ON chead.CUT_ID_SITELINE = st.ID_SITELINE 
			 WHERE  st.SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
		) s GROUP BY s.CUT_SCH_ID  
	) GROUP BY 	b.SCH_ID, c.ORDER_SIZE
) s ON s.SCH_ID = a.CUT_SCH_ID  AND a.CUT_SEW_SIZE_CODE = s.ORDER_SIZE
LEFT JOIN weekly_sch_size b ON b.SCH_ID = a.CUT_SCH_ID AND a.CUT_SEW_SIZE_CODE = b.SIZE_CODE AND b.SCH_SIZE_QTY <> 0
WHERE a.CUT_ID IN (
  SELECT s.CUT_ID  
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
  ) s GROUP BY s.CUT_ID  
) 
GROUP BY a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE 
ORDER BY  a.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE`;

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

export const CuttingSchDetails = db.define(
  "cuting_loading_sch_detail",
  {
    CUT_ID_DETAIL: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    CUT_LOAD_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CUT_ID_SIZE: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_SCH_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    CUT_ID_SITELINE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_SCH_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CUT_ADD_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CUT_MOD_ID: {
      type: DataTypes.INTEGER,
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

export const qryCekQtyCutSch = `	SELECT 
b.CUT_ID_DETAIL, b.CUT_ID_SIZE, b.CUT_LOAD_DATE, b.CUT_SCH_ID, c.CUT_SEW_SCH_QTY ORDER_QTY, sum(b.CUT_SCH_QTY) SCH_QTY
FROM cuting_loading_sch_detail b
LEFT JOIN cuting_loading_sch_size c ON c.CUT_ID_SIZE = b.CUT_ID_SIZE 
WHERE b.CUT_ID_SIZE = :cutSizeId
GROUP BY 	b.CUT_ID_SIZE`;

export const findOneScanIn = `SELECT n.* FROM (
  	SELECT  
    b.SCH_ID, c.ORDER_SIZE,  SUM(c.ORDER_QTY) ORDER_QTY
    FROM scan_sewing_in b
    LEFT JOIN view_order_detail c ON c.BARCODE_SERIAL = b.BARCODE_SERIAL 
    WHERE b.SCH_ID = :cutSch AND c.ORDER_SIZE = :sizeCode
  ) n WHERE n.SCH_ID IS NOT NULL
    `;
