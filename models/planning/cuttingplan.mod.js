import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const qryViewSchSewingForCutting = `SELECT a.SCH_ID, d.CUT_ID, a.SCH_ID_SITELINE,  c.SITE_NAME, c.LINE_NAME, b.MO_NO,
CASE WHEN d.CUT_ID IS NOT NULL THEN 'POSTED' ELSE 'UNPOSTED' END AS STATUS_SCH,
d.CUT_LOADING_START, d.CUT_LOADING_FINISH,
b.ORDER_REFERENCE_PO_NO ORDER_REF,
a.SCH_CAPACITY_ID, a.SCH_START_PROD, a.SCH_FINISH_PROD,
b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION ORDER_STYLE, b.MO_QTY,
a.SCH_QTY, IFNULL(f.LOADING_QTY,0) LOADING_QTY, a.SCH_QTY-IFNULL(f.LOADING_QTY,0) BALANCE_LOADING,
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
) f ON f.SCH_ID = a.SCH_ID
LEFT JOIN cuting_loading_schedule d ON d.CUT_SCH_ID = a.SCH_ID
WHERE (a.SCH_SITE = :site AND a.SCH_ID IN  (
	  SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
	  WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate
	) )OR (a.SCH_START_PROD IS NULL AND a.SCH_SITE = :site)
ORDER BY a.SCH_ID_SITELINE, a.SCH_START_PROD ASC
`;

export const getSewingSchSize = `SELECT  a.SCH_ID, b.SCH_SIZE_ID, d.CUT_ID_SIZE,  a.SCH_ID_SITELINE, b.SIZE_CODE, SUM(b.SCH_SIZE_QTY) SCH_SIZE_QTY, 
IFNULL(c.LOADING_QTY,0) LOADING_QTY, SUM(b.SCH_SIZE_QTY)-IFNULL(c.LOADING_QTY,0) BALANCE_LOADING
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
LEFT JOIN cuting_loading_sch_size d ON  d.CUT_SCH_ID_SIZE = b.SCH_SIZE_ID -- d.CUT_SCH_ID = b.SCH_ID AND d.CUT_SEW_SIZE_CODE AND b.SIZE_CODE
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
na.CUT_ID, c.SCH_ID, na.CUT_SCH_ID, na.CUT_ID_CAPACITY, b.PRODUCTION_MONTH, na.CUT_SITE_NAME, na.CUT_ID_SITELINE, na.LINE_NAME,
b.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION, c.SCH_START_PROD, b.MO_QTY,
na.CUT_SIZE_TYPE, IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
na.CUT_LOADING_START, na.CUT_LOADING_FINISH, na.CUT_SEW_SCH_QTY, na.LOADING_QTY, na.CUT_SCH_QTY,
na.CUT_SEW_SCH_QTY - IFNULL(na.CUT_SCH_QTY, 0) BAL_SCH_CUT,
na.CUT_SEW_SCH_QTY - IFNULL(na.LOADING_QTY, 0) BAL
-- CASE WHEN (IFNULL(na.LOADING_QTY,0) - na.CUT_SEW_SCH_QTY) < 0 THEN "Open"
--     WHEN (IFNULL(na.LOADING_QTY,0) - na.CUT_SEW_SCH_QTY) = 0 THEN "Completed"
--     ELSE "Over" END AS STATUS
FROM (
    SELECT a.CUT_ID, a.CUT_SCH_ID, a.CUT_ID_CAPACITY, a.CUT_SITE_NAME, a.CUT_ID_SITELINE, c.LINE_NAME, 
      a.CUT_SIZE_TYPE, a.CUT_LOADING_START, a.CUT_LOADING_FINISH,
      a.CUT_SEW_SCH_QTY, SUM(s.ORDER_QTY) LOADING_QTY, clr.CUT_SCH_QTY
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
	 LEFT JOIN (
	 -- cari nilai schedule di hari sebelum start date untuk mencari balance di front end
		 	SELECT 
			cls.CUT_ID, cls.CUT_SCH_ID, cls.CUT_ID_SIZE,  IFNULL(SUM(cls.CUT_SCH_QTY),0) CUT_SCH_QTY
			FROM cuting_loading_sch_detail cls 
			WHERE cls.CUT_ID IN (
					SELECT DISTINCT
				    cls.CUT_ID
				    FROM cuting_loading_sch_detail cls 
				    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
				    WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
				    UNION ALL 
				    SELECT DISTINCT
				    chead.CUT_ID
				    FROM cuting_loading_schedule chead 
				    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
				    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND chead.CUT_SITE_NAME =  :site )
			) -- AND 			cls.CUT_LOAD_DATE  BETWEEN :startDate AND :endDate
			GROUP BY cls.CUT_ID, cls.CUT_SCH_ID
	 ) clr ON clr.CUT_SCH_ID = a.CUT_SCH_ID 
    WHERE (a.CUT_SITE_NAME =  :site AND a.CUT_SCH_ID IN (
          SELECT DISTINCT	cls.CUT_SCH_ID
          FROM cuting_loading_sch_detail cls 
          LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
          WHERE  cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
    ) )OR (a.CUT_LOADING_START IS NULL AND  a.CUT_SITE_NAME =  :site)
    OR  (a.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND a.CUT_SITE_NAME =  :site )
    GROUP BY a.CUT_SCH_ID
    ORDER BY a.CUT_ID_SITELINE, a.CUT_SEW_START, a.CUT_LOADING_START
) na
LEFT JOIN viewcapacity b ON b.ID_CAPACITY = na.CUT_ID_CAPACITY
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = na.CUT_SCH_ID
ORDER BY na.LINE_NAME, c.SCH_START_PROD`;

export const qryGetCutSchSize = `SELECT 
a.CUT_ID_SIZE, b.SCH_SIZE_ID,  a.CUT_ID, a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE,  a.CUT_ID_SITELINE, a.CUT_SEW_SCH_QTY,
IFNULL(SUM(s.ORDER_QTY) ,0) LOADING_QTY, IFNULL(clr.CUT_SCH_QTY,0) CUT_SCH_QTY,
a.CUT_SEW_SCH_QTY - IFNULL(SUM(s.ORDER_QTY) ,0) BAL,
a.CUT_SEW_SCH_QTY -  IFNULL(clr.CUT_SCH_QTY,0) BAL_SCH_CUT
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
			 WHERE  (st.SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  '')
		) s GROUP BY s.CUT_SCH_ID  
	) GROUP BY 	b.SCH_ID, c.ORDER_SIZE
) s ON s.SCH_ID = a.CUT_SCH_ID  AND a.CUT_SEW_SIZE_CODE = s.ORDER_SIZE
LEFT JOIN  (
  SELECT
    b.SCH_ID, b.SCH_SIZE_ID, b.SIZE_CODE, b.SCH_SIZE_QTY
  FROM  weekly_sch_size b WHERE
  b.SCH_ID IN (
    SELECT DISTINCT
    cls.CUT_SCH_ID
    FROM cuting_loading_sch_detail cls 
    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
    WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate  AND st.SITE_NAME = :site
    UNION ALL 
    SELECT DISTINCT
    chead.CUT_SCH_ID
    FROM cuting_loading_schedule chead 
    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate  AND chead.CUT_SITE_NAME =  :site )
  ) AND b.SCH_SIZE_QTY <> 0
  GROUP BY b.SCH_ID, b.SIZE_CODE
) b ON b.SCH_ID = a.CUT_SCH_ID AND a.CUT_SEW_SIZE_CODE = b.SIZE_CODE 
LEFT JOIN (
	SELECT 
	cls.CUT_ID, cls.CUT_SCH_ID, cls.CUT_ID_SIZE,  IFNULL(SUM(cls.CUT_SCH_QTY),0) CUT_SCH_QTY
	FROM cuting_loading_sch_detail cls 
	WHERE cls.CUT_ID IN (
			SELECT DISTINCT
		    cls.CUT_ID
		    FROM cuting_loading_sch_detail cls 
		    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
		    WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
		    UNION ALL 
		    SELECT DISTINCT
		    chead.CUT_ID
		    FROM cuting_loading_schedule chead 
		    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
		    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND chead.CUT_SITE_NAME =  :site )
	) -- AND 	cls.CUT_LOAD_DATE  BETWEEN :startDate AND :endDate
	GROUP BY cls.CUT_ID, cls.CUT_SCH_ID, cls.CUT_ID_SIZE
) clr ON clr.CUT_SCH_ID = a.CUT_SCH_ID AND a.CUT_ID_SIZE = clr.CUT_ID_SIZE
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
    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND chead.CUT_SITE_NAME =  :site )
  ) s GROUP BY s.CUT_ID  
) -- AND a.CUT_SCH_ID = '7184'
GROUP BY a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE 
ORDER BY  a.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE`;

export const qryCutingSchDetail = `SELECT 
n.CUT_SCH_ID, n.CUT_LOAD_DATE, n.CUT_SEW_SIZE_CODE, n.CUT_STATUS, SUM(n.CUT_SCH_QTY)  CUT_SCH_QTY, SUM(n.LOADING_QTY) LOADING_QTY
FROM (
    SELECT DISTINCT
      a.CUT_SCH_ID, a.CUT_LOAD_DATE, b.CUT_SEW_SIZE_CODE, a.CUT_STATUS, a.CUT_SCH_QTY , 0 LOADING_QTY
    FROM cuting_loading_sch_detail a 
    LEFT JOIN cuting_loading_sch_size b ON b.CUT_ID_SIZE = a.CUT_ID_SIZE
    LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
    WHERE a.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
    GROUP BY a.CUT_SCH_ID, a.CUT_LOAD_DATE, b.CUT_SEW_SIZE_CODE
    UNION ALL 
    SELECT 
      a.SCH_ID CUT_SCH_ID, DATE(a.SEWING_SCAN_TIME) CUT_LOAD_DATE, b.ORDER_SIZE CUT_SEW_SIZE_CODE, null CUT_STATUS, 0 CUT_SCH_QTY, SUM(b.ORDER_QTY) LOADING_QTY
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
    CUT_SEW_SIZE_CODE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_STATUS: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_CREATE_STATUS: {
      type: DataTypes.STRING,
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

export const queryInfoSchSize = `
    SELECT 
n.CUT_SCH_ID, n.CUT_LOAD_DATE, n.CUT_SEW_SIZE_CODE, SUM(n.CUT_SCH_QTY)  CUT_SCH_QTY, SUM(n.LOADING_QTY) LOADING_QTY
FROM (
	SELECT DISTINCT
	a.CUT_SCH_ID, a.CUT_LOAD_DATE, b.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY , 0 LOADING_QTY
	FROM cuting_loading_sch_detail a 
	LEFT JOIN cuting_loading_sch_size b ON b.CUT_ID_SIZE = a.CUT_ID_SIZE
	LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
	WHERE a.CUT_ID_SIZE = :cutIdSize
	UNION ALL 
	SELECT 
	a.SCH_ID CUT_SCH_ID, DATE(a.SEWING_SCAN_TIME) CUT_LOAD_DATE, b.ORDER_SIZE CUT_SEW_SIZE_CODE, 0 CUT_SCH_QTY, SUM(b.ORDER_QTY) LOADING_QTY
	FROM scan_sewing_in a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	WHERE a.SCH_ID =  :schId AND b.ORDER_SIZE = :sizeCode
	GROUP BY a.SCH_ID,  DATE(a.SEWING_SCAN_TIME), b.ORDER_SIZE
) n GROUP BY n.CUT_SCH_ID, n.CUT_LOAD_DATE, n.CUT_SEW_SIZE_CODE`;

export const queryInfoSizeDetail = `SELECT 
a.CUT_SCH_ID,
a.CUT_ID_SIZE,
a.CUT_SEW_SIZE_CODE,
a.CUT_SEW_SCH_QTY,
a.CUT_ADD_TIME,
a.CUT_MOD_TIME
FROM 
cuting_loading_sch_size a WHERE a.CUT_SCH_ID = :schId AND a.CUT_SEW_SIZE_CODE = :sizeCode`;

//query ambil CUT ID yang kosong
export const qryGetNoCutId = `-- base query get detail plan loading vs actual
SELECT 
	o.CUT_ID, m.CUT_SCH_ID, m.CUT_LOAD_DATE
FROM (
	SELECT 
	n.CUT_SCH_ID, n.CUT_LOAD_DATE
	FROM (
	    SELECT DISTINCT
	      a.CUT_SCH_ID, a.CUT_LOAD_DATE
	    FROM cuting_loading_sch_detail a 
	    LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
	    WHERE a.CUT_LOAD_DATE = DATE_SUB(CURDATE(), INTERVAL 1 DAY) -- AND CURDATE() AND st.SITE_NAME = 'SBR_01'
	    UNION ALL 
	    SELECT 
	      a.SCH_ID CUT_SCH_ID, DATE(a.SEWING_SCAN_TIME) CUT_LOAD_DATE
	    FROM scan_sewing_in a
	    LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	    WHERE  DATE(a.SEWING_SCAN_TIME)  = DATE_SUB(CURDATE(), INTERVAL 1 DAY) -- AND CURDATE() AND a.SEWING_SCAN_LOCATION = 'SBR_01'
	    GROUP BY a.SCH_ID,  DATE(a.SEWING_SCAN_TIME)
	) n 
	GROUP BY n.CUT_SCH_ID, n.CUT_LOAD_DATE
) m 
LEFT JOIN cuting_loading_schedule o ON o.CUT_SCH_ID = m.CUT_SCH_ID`;

export const qrySchNoPost = (arrSchId) => {
  return `SELECT
n.*
FROM (
  SELECT a.SCH_ID, d.CUT_ID, a.SCH_ID_SITELINE,  c.SITE_NAME, c.LINE_NAME,  b.MO_NO,
  b.ORDER_REFERENCE_PO_NO ORDER_REF,
  a.SCH_CAPACITY_ID, a.SCH_START_PROD, a.SCH_FINISH_PROD,
  b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
  IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
  b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION ORDER_STYLE, b.MO_QTY,
  a.SCH_QTY,
  IF(a.SCH_QTY = b.MO_QTY , 'ALL' ,'PARTIAL') SIZE,
  0 ADD_ID, 0 MOD_ID
  FROM weekly_prod_schedule a  
  LEFT JOIN viewcapacity b ON a.SCH_CAPACITY_ID = b.ID_CAPACITY
  LEFT JOIN item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
  LEFT JOIN cuting_loading_schedule d ON d.CUT_SCH_ID = a.SCH_ID
  WHERE ${arrSchId}
) n 
WHERE n.CUT_ID IS NULL 
`;
};

export const qrySchNoPostSize = (arrSchId) => {
  return `SELECT  a.SCH_ID, b.SCH_SIZE_ID, d.CUT_ID_SIZE,  a.SCH_ID_SITELINE, b.SIZE_CODE, SUM(b.SCH_SIZE_QTY) SCH_SIZE_QTY
  FROM weekly_prod_schedule a
LEFT JOIN  weekly_sch_size b ON a.SCH_ID = b.SCH_ID AND b.SCH_SIZE_QTY <> 0
LEFT JOIN cuting_loading_sch_size d ON  d.CUT_SCH_ID_SIZE = b.SCH_SIZE_ID -- d.CUT_SCH_ID = b.SCH_ID AND d.CUT_SEW_SIZE_CODE AND b.SIZE_CODE
WHERE   ${arrSchId}
GROUP BY  a.SCH_ID, a.SCH_ID_SITELINE, b.SIZE_CODE
ORDER BY a.SCH_ID_SITELINE,  a.SCH_START_PROD ASC`;
};

//query ambil detail cutSch
export const qryCutSchVsAct = `SELECT 
o.CUT_ID, m.*
FROM (
SELECT 
n.CUT_SCH_ID, n.CUT_LOAD_DATE,  n.CUT_SEW_SIZE_CODE, n.CUT_ID_DETAIL, SUM(n.CUT_SCH_QTY)  CUT_SCH_QTY, SUM(n.LOADING_QTY) LOADING_QTY
FROM (
    SELECT DISTINCT
      a.CUT_SCH_ID, a.CUT_LOAD_DATE,  b.CUT_SEW_SIZE_CODE,  a.CUT_ID_DETAIL, a.CUT_SCH_QTY , 0 LOADING_QTY
    FROM cuting_loading_sch_detail a 
    LEFT JOIN cuting_loading_sch_size b ON a.CUT_SEW_SIZE_CODE = b.CUT_SEW_SIZE_CODE
    LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
    WHERE a.CUT_LOAD_DATE = DATE_SUB(CURDATE(), INTERVAL 1 DAY) -- AND CURDATE() AND st.SITE_NAME = 'SBR_01'
    UNION ALL 
    SELECT 
      a.SCH_ID CUT_SCH_ID, DATE(a.SEWING_SCAN_TIME) CUT_LOAD_DATE,  b.ORDER_SIZE CUT_SEW_SIZE_CODE, null CUT_ID_DETAIL, 0 CUT_SCH_QTY, SUM(b.ORDER_QTY) LOADING_QTY
    FROM scan_sewing_in a
    LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
    WHERE  DATE(a.SEWING_SCAN_TIME)  = DATE_SUB(CURDATE(), INTERVAL 1 DAY) -- AND CURDATE() AND a.SEWING_SCAN_LOCATION = 'SBR_01'
    GROUP BY a.SCH_ID,  DATE(a.SEWING_SCAN_TIME), b.ORDER_SIZE
) n 
GROUP BY n.CUT_SCH_ID, n.CUT_LOAD_DATE, n.CUT_SEW_SIZE_CODE
) m 
LEFT JOIN cuting_loading_schedule o ON o.CUT_SCH_ID = m.CUT_SCH_ID
WHERE (m.CUT_SCH_QTY+m.LOADING_QTY)  <> 0`;

export const qrySizeDailyPlan = `SELECT a.CUT_LOAD_DATE, a.CUT_SCH_ID SCH_ID, b.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY 
FROM cuting_loading_sch_detail a 
LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
WHERE a.CUT_LOAD_DATE = :schDate
AND c.CUT_SITE_NAME = :site
AND a.CUT_SCH_QTY <> 0`;

export const qryDailyPlanCut = `SELECT a.CUT_ID, a.CUT_SCH_ID SCH_ID,  a.CUT_SITE_NAME, a.CUT_ID_SITELINE, d.LINE_NAME, 
a.CUT_SIZE_TYPE SIZE, 
a.CUT_SEW_SCH_QTY, c.CUT_SCH_QTY SCHD_QTY,
b.ORDER_REFERENCE_PO_NO ORDER_REF, b.ORDER_NO, b.CUSTOMER_NAME, b.MO_NO, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION ORDER_STYLE
FROM cuting_loading_schedule a 
LEFT JOIN viewcapacity b ON a.CUT_ID_CAPACITY = b.ID_CAPACITY
LEFT JOIN (
    SELECT a.CUT_LOAD_DATE, a.CUT_SCH_ID, SUM(a.CUT_SCH_QTY) CUT_SCH_QTY
    FROM cuting_loading_sch_detail a 
    LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
    LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
    WHERE a.CUT_LOAD_DATE = :schDate
    AND c.CUT_SITE_NAME = :site
    AND a.CUT_SCH_QTY <> 0
    GROUP BY  a.CUT_LOAD_DATE, a.CUT_SCH_ID
) c ON c.CUT_SCH_ID = a.CUT_SCH_ID
LEFT JOIN item_siteline d ON d.ID_SITELINE = a.CUT_ID_SITELINE
WHERE a.CUT_SCH_ID IN (
  SELECT DISTINCT	cls.CUT_SCH_ID
  FROM cuting_loading_sch_detail cls 
  LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
  WHERE  cls.CUT_LOAD_DATE = :schDate AND st.SITE_NAME = :site
  AND cls.CUT_SCH_QTY <> 0
) ORDER BY a.CUT_ID_SITELINE`;

export const qryRsltSupIN = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID,  b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.CUT_SITE_NAME SITE_NAME, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, DATE(a.CUT_SCAN_TIME) SCAN_DATE, TIME(a.CUT_SCAN_TIME) SCAN_TIME
FROM scan_supermarket_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN cuting_loading_schedule g ON a.CUT_ID = g.CUT_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.CUT_ID_CAPACITY
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.CUT_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE DATE(a.CUT_SCAN_TIME)  = :schDate AND a.CUT_SITE = :site`;

// export const qryRsltMolIN = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID,  b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.CUT_SITE_NAME SITE_NAME, e.LINE_NAME,
// b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE,
// b.ORDER_QTY, DATE(a.CUT_SCAN_TIME) SCAN_DATE, TIME(a.CUT_SCAN_TIME) SCAN_TIME
// FROM scan_molding_in a
// LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// LEFT JOIN cuting_loading_schedule g ON a.CUT_ID = g.CUT_ID
// LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.CUT_ID_CAPACITY
// LEFT JOIN item_siteline e ON e.ID_SITELINE = g.CUT_ID_SITELINE
// LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
// WHERE DATE(a.CUT_SCAN_TIME)  = :schDate AND a.CUT_SITE = :site`;

export const qryRsltMolIN = `SELECT a.BARCODE_SERIAL, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, c.ORDER_REFERENCE_PO_NO ORDER_REF,
c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, b.ORDER_QTY, c.ORDER_STYLE_DESCRIPTION ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, 
	SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
	c.PRODUCTION_MONTH, IF(c.NEW_PLAN_EXFACTORY_DATE,c.NEW_PLAN_EXFACTORY_DATE,c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
	d.SITE_NAME, d.LINE_NAME, a.CUT_SCAN_TIME
FROM scan_molding_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1) AND SUBSTRING_INDEX(b.BUYER_PO,',',-1)= c.ORDER_PO_ID
LEFT JOIN item_siteline d ON d.SITE = 	SUBSTRING_INDEX(b.SITE_LINE,' ',1) AND d.LINE =  SUBSTRING_INDEX(b.SITE_LINE,' ',-1)
WHERE  DATE(a.CUT_SCAN_TIME)  = :scanDate
GROUP BY a.BARCODE_SERIAL`;

export const qryRsltSupOut = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID,  b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.CUT_SITE_NAME SITE_NAME, e.LINE_NAME,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, DATE(a.CUT_SCAN_TIME) SCAN_DATE, TIME(a.CUT_SCAN_TIME) SCAN_TIME
FROM scan_supermarket_out a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN cuting_loading_schedule g ON a.CUT_ID = g.CUT_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.CUT_ID_CAPACITY
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.CUT_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE DATE(a.CUT_SCAN_TIME)  = :schDate AND a.CUT_SITE = :site`;

export const qryRsltMolOut = `SELECT a.BARCODE_SERIAL, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, c.ORDER_REFERENCE_PO_NO ORDER_REF,
c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, b.ORDER_QTY, c.ORDER_STYLE_DESCRIPTION ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, 
	SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
	c.PRODUCTION_MONTH, IF(c.NEW_PLAN_EXFACTORY_DATE,c.NEW_PLAN_EXFACTORY_DATE,c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
	d.SITE_NAME, d.LINE_NAME, a.CUT_SCAN_TIME
FROM scan_molding_out a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1) AND SUBSTRING_INDEX(b.BUYER_PO,',',-1)= c.ORDER_PO_ID
LEFT JOIN item_siteline d ON d.SITE = 	SUBSTRING_INDEX(b.SITE_LINE,' ',1) AND d.LINE =  SUBSTRING_INDEX(b.SITE_LINE,' ',-1)
WHERE  DATE(a.CUT_SCAN_TIME)  = :scanDate
GROUP BY a.BARCODE_SERIAL`;
// export const qryRsltMolOut = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID,  b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.CUT_SITE_NAME SITE_NAME, e.LINE_NAME,
// b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE,
// b.ORDER_QTY, DATE(a.CUT_SCAN_TIME) SCAN_DATE, TIME(a.CUT_SCAN_TIME) SCAN_TIME
// FROM scan_molding_in a
// LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// LEFT JOIN cuting_loading_schedule g ON a.CUT_ID = g.CUT_ID
// LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.CUT_ID_CAPACITY
// LEFT JOIN item_siteline e ON e.ID_SITELINE = g.CUT_ID_SITELINE
// LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
// WHERE DATE(a.CUT_SCAN_TIME)  = :schDate AND a.CUT_SITE = :site`;

export const queryChkclSupSchIn = `
-- SELECT * FROM (
  SELECT b.CUT_SCH_ID SCH_ID, b.CUT_ID,
  d.ORDER_NO, d.MO_NO, e.ID_SITELINE,  e.SITE_NAME, e.LINE_NAME, d.MANUFACTURING_SITE,
  d.CUSTOMER_NAME, d.PRODUCT_ITEM_CODE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_CODE, d.ITEM_COLOR_NAME, 
  d.PRODUCT_ITEM_DESCRIPTION, d.ORDER_STYLE_DESCRIPTION, b.CUT_SEW_SIZE_CODE SIZE_CODE, b.CUT_SEW_SCH_QTY SCH_SIZE_QTY, d.PRODUCTION_MONTH, 
  if(d.NEW_PLAN_EXFACTORY_DATE, d.NEW_PLAN_EXFACTORY_DATE, d.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE
  FROM  cuting_loading_sch_size b 
  LEFT JOIN cuting_loading_schedule c ON b.CUT_ID = c.CUT_ID 
  LEFT JOIN viewcapacity d ON d.ID_CAPACITY = c.CUT_ID_CAPACITY
  LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
  WHERE 
  c.CUT_SITE_NAME = :sitename
  AND e.LINE_NAME = :lineName
  AND d.ORDER_NO = :orderNo
  AND d.ORDER_STYLE_DESCRIPTION = :styleDesc
  AND d.ITEM_COLOR_NAME = :colorCode
  AND d.ORDER_REFERENCE_PO_NO = :orderRef 
  AND b.CUT_SEW_SIZE_CODE = :sizeCode 
  AND d.PRODUCTION_MONTH = :prodMonth 
  AND d.MANUFACTURING_SITE = :fxSiteName
  -- AND d.PLAN_EXFACTORY_DATE = :planExFty
-- ) N WHERE N.PLAN_EXFACTORY_DATE = :planExFty
`;
// export const queryChkclSupSchIn = `	SELECT a.CUT_LOAD_DATE, a.CUT_SCH_ID SCH_ID, a.CUT_LOAD_DATE, a.CUT_ID,
// d.ORDER_NO, d.MO_NO, e.ID_SITELINE,  e.SITE_NAME, e.LINE_NAME, d.MANUFACTURING_SITE,
// d.CUSTOMER_NAME, d.PRODUCT_ITEM_CODE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_CODE, d.ITEM_COLOR_NAME,
// d.PRODUCT_ITEM_DESCRIPTION, d.ORDER_STYLE_DESCRIPTION, b.CUT_SEW_SIZE_CODE SIZE_CODE, b.CUT_SEW_SCH_QTY SCH_SIZE_QTY, d.PRODUCTION_MONTH,
// if(d.NEW_PLAN_EXFACTORY_DATE, d.NEW_PLAN_EXFACTORY_DATE, d.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE
// FROM cuting_loading_sch_detail a
// LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
// LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID
// LEFT JOIN viewcapacity d ON d.ID_CAPACITY = c.CUT_ID_CAPACITY
// LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
// WHERE a.CUT_LOAD_DATE = :plannDate
// AND a.CUT_SCH_QTY <> 0
// AND c.CUT_SITE_NAME = :sitename
// AND e.LINE_NAME = :lineName
// AND d.ORDER_NO = :orderNo
// AND d.ORDER_STYLE_DESCRIPTION = :styleDesc
// AND d.ITEM_COLOR_NAME = :colorCode
// AND d.ORDER_REFERENCE_PO_NO = :orderRef
// AND b.CUT_SEW_SIZE_CODE = :sizeCode
// AND d.PRODUCTION_MONTH = :prodMonth
// AND d.MANUFACTURING_SITE = :fxSiteName
// `;

export const CutSchDtlReal = db.define(
  "cuting_schedule_detail",
  {
    CUT_ID_DETAIL: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    CUT_SCH_DATE: {
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
    CUT_SEW_SIZE_CODE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_STATUS: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CUT_CREATE_STATUS: {
      type: DataTypes.STRING,
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

export const qryGetFromLoad = `SELECT a.CUT_ID_DETAIL, a.CUT_LOAD_DATE CUT_SCH_DATE, a.CUT_ID_SIZE, a.CUT_ID, a.CUT_SCH_ID, a.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY,
a.CUT_STATUS, a.CUT_CREATE_STATUS
FROM cuting_loading_sch_detail a 
LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
WHERE a.CUT_LOAD_DATE = :schDate
AND c.CUT_SITE_NAME = :site
AND a.CUT_SCH_QTY <> 0
-- GROUP BY  a.CUT_LOAD_DATE, a.CUT_SCH_ID, `;

export const queryGetSchCutReal = `SELECT 	
na.CUT_ID, c.SCH_ID, na.CUT_SCH_ID, na.CUT_ID_CAPACITY, b.PRODUCTION_MONTH, na.CUT_SITE_NAME, na.CUT_ID_SITELINE, na.LINE_NAME,
b.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.CUSTOMER_NAME, b.CUSTOMER_PROGRAM, b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION, c.SCH_START_PROD, b.MO_QTY,
na.CUT_SIZE_TYPE, IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
na.CUT_LOADING_START, na.CUT_LOADING_FINISH, na.CUT_SEW_SCH_QTY, na.LOADING_QTY, na.CUT_SCH_QTY, 
na.CUT_SEW_SCH_QTY - IFNULL(na.LOADING_QTY, 0) BAL,
na.CUT_SEW_SCH_QTY - IFNULL(na.LOADING_QTY, 0) BAL
FROM (
    SELECT a.CUT_ID, a.CUT_SCH_ID, a.CUT_ID_CAPACITY, a.CUT_SITE_NAME, a.CUT_ID_SITELINE, c.LINE_NAME, 
      a.CUT_SIZE_TYPE, a.CUT_LOADING_START, a.CUT_LOADING_FINISH,
      a.CUT_SEW_SCH_QTY, SUM(s.ORDER_QTY) LOADING_QTY, clr.CUT_SCH_QTY
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
					 FROM cuting_schedule_detail cls 
					 LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
					 WHERE cls.CUT_SCH_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
           -- UNION ALL 
           -- SELECT DISTINCT
           -- chead.CUT_SCH_ID
           -- FROM cuting_loading_schedule chead 
           -- LEFT JOIN item_siteline st ON chead.CUT_ID_SITELINE = st.ID_SITELINE 
					 -- WHERE  st.SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
				) s GROUP BY s.CUT_SCH_ID  
			) GROUP BY 	b.SCH_ID, c.ORDER_SIZE
	 ) s ON s.SCH_ID = a.CUT_SCH_ID 
	 LEFT JOIN (
	 -- cari nilai schedule di hari sebelum start date untuk mencari balance di front end
		 	SELECT 
			cls.CUT_ID, cls.CUT_SCH_ID, cls.CUT_ID_SIZE,  IFNULL(SUM(cls.CUT_SCH_QTY),0) CUT_SCH_QTY
			FROM cuting_schedule_detail cls 
			WHERE cls.CUT_ID IN (
					SELECT DISTINCT
				    cls.CUT_ID
				    FROM cuting_schedule_detail cls 
				    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
				    WHERE cls.CUT_SCH_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
            --    UNION ALL 
            --   SELECT DISTINCT
            --   chead.CUT_ID
            --   FROM cuting_loading_schedule chead 
            --  WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
            --  OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND chead.CUT_SITE_NAME =  :site )
			) -- AND 			cls.CUT_SCH_DATE NOT BETWEEN :startDate AND :endDate
			GROUP BY cls.CUT_ID, cls.CUT_SCH_ID
	 ) clr ON clr.CUT_SCH_ID = a.CUT_SCH_ID 
    WHERE (a.CUT_SITE_NAME =  :site AND a.CUT_SCH_ID IN (
          SELECT DISTINCT	cls.CUT_SCH_ID
          FROM cuting_schedule_detail cls 
          LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
          WHERE  cls.CUT_SCH_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
    ) ) -- OR (a.CUT_LOADING_START IS NULL AND  a.CUT_SITE_NAME =  :site)
  --  OR  (a.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND a.CUT_SITE_NAME =  :site )
    GROUP BY a.CUT_SCH_ID
    ORDER BY a.CUT_ID_SITELINE, a.CUT_SEW_START, a.CUT_LOADING_START
) na
LEFT JOIN viewcapacity b ON b.ID_CAPACITY = na.CUT_ID_CAPACITY
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = na.CUT_SCH_ID
ORDER BY na.LINE_NAME, c.SCH_START_PROD`;

export const qryGetCutSchSizeReal = `SELECT 
a.CUT_ID_SIZE, b.SCH_SIZE_ID,  a.CUT_ID, a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE,  a.CUT_ID_SITELINE, a.CUT_SEW_SCH_QTY,
IFNULL(SUM(s.ORDER_QTY) ,0) LOADING_QTY, IFNULL(clr.CUT_SCH_QTY,0) CUT_SCH_QTY,
a.CUT_SEW_SCH_QTY - IFNULL(SUM(s.ORDER_QTY) ,0) BAL,
a.CUT_SEW_SCH_QTY -  IFNULL(clr.CUT_SCH_QTY,0) BAL_SCH_CUT
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
			 WHERE  (st.SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  '')
		) s GROUP BY s.CUT_SCH_ID  
	) GROUP BY 	b.SCH_ID, c.ORDER_SIZE
) s ON s.SCH_ID = a.CUT_SCH_ID  AND a.CUT_SEW_SIZE_CODE = s.ORDER_SIZE
LEFT JOIN  (
  SELECT
    b.SCH_ID, b.SCH_SIZE_ID, b.SIZE_CODE, b.SCH_SIZE_QTY
  FROM  weekly_sch_size b WHERE
  b.SCH_ID IN (
    SELECT DISTINCT
    cls.CUT_SCH_ID
    FROM cuting_loading_sch_detail cls 
    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
    WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate  AND st.SITE_NAME = :site
    UNION ALL 
    SELECT DISTINCT
    chead.CUT_SCH_ID
    FROM cuting_loading_schedule chead 
    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate  AND chead.CUT_SITE_NAME =  :site )
  ) AND b.SCH_SIZE_QTY <> 0
  GROUP BY b.SCH_ID, b.SIZE_CODE
) b ON b.SCH_ID = a.CUT_SCH_ID AND a.CUT_SEW_SIZE_CODE = b.SIZE_CODE 
LEFT JOIN (
	SELECT 
	cls.CUT_ID, cls.CUT_SCH_ID, cls.CUT_ID_SIZE,  IFNULL(SUM(cls.CUT_SCH_QTY),0) CUT_SCH_QTY
	FROM cuting_loading_sch_detail cls 
	WHERE cls.CUT_ID IN (
			SELECT DISTINCT
		    cls.CUT_ID
		    FROM cuting_loading_sch_detail cls 
		    LEFT JOIN item_siteline st ON cls.CUT_ID_SITELINE = st.ID_SITELINE 
		    WHERE cls.CUT_LOAD_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
		    UNION ALL 
		    SELECT DISTINCT
		    chead.CUT_ID
		    FROM cuting_loading_schedule chead 
		    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
		    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND chead.CUT_SITE_NAME =  :site )
	) -- AND 	cls.CUT_LOAD_DATE  BETWEEN :startDate AND :endDate
	GROUP BY cls.CUT_ID, cls.CUT_SCH_ID, cls.CUT_ID_SIZE
) clr ON clr.CUT_SCH_ID = a.CUT_SCH_ID AND a.CUT_ID_SIZE = clr.CUT_ID_SIZE
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
    WHERE  chead.CUT_SITE_NAME = :site AND IFNULL(chead.CUT_LOADING_START ,'') =  ''
    OR  (chead.CUT_LOADING_START BETWEEN  :startDate AND :endDate AND chead.CUT_SITE_NAME =  :site )
  ) s GROUP BY s.CUT_ID  
) -- AND a.CUT_SCH_ID = '7184'
GROUP BY a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE 
ORDER BY  a.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE`;

export const qryCutingSchDetailReal = `SELECT a.CUT_ID_DETAIL,
a.CUT_SCH_ID, a.CUT_SCH_DATE CUT_LOAD_DATE, b.CUT_SEW_SIZE_CODE, a.CUT_STATUS, a.CUT_SCH_QTY , 0 LOADING_QTY
FROM cuting_schedule_detail a 
LEFT JOIN cuting_loading_sch_size b ON b.CUT_ID_SIZE = a.CUT_ID_SIZE
LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
WHERE a.CUT_SCH_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site`;

export const qryGetDetailId = `SELECT DISTINCT
a.CUT_ID_DETAIL
FROM cuting_schedule_detail a 
LEFT JOIN cuting_loading_sch_size b ON b.CUT_ID_SIZE = a.CUT_ID_SIZE
LEFT JOIN item_siteline st ON a.CUT_ID_SITELINE = st.ID_SITELINE 
WHERE a.CUT_SCH_DATE BETWEEN :startDate AND :endDate AND st.SITE_NAME = :site
GROUP BY a.CUT_ID_DETAIL`;

//CUTTING SUPERMARKET REPORT
export const qryGetHeadCutSupRep = `SELECT a.CUT_ID, a.CUT_SCH_ID SCH_ID,  a.CUT_SITE_NAME SCH_SITE, a.CUT_ID_SITELINE SCH_ID_SITELINE, d.LINE_NAME, 
a.CUT_SIZE_TYPE, 
a.CUT_SEW_SCH_QTY, c.CUTTING_IN, c.CUTTING_OUT, (c.CUTTING_IN-c.CUTTING_OUT) AS WIP,
b.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.CUSTOMER_NAME, b.MO_NO,  b.PRODUCT_ITEM_CODE, 
b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION
FROM cuting_loading_schedule a 
LEFT JOIN viewcapacity b ON a.CUT_ID_CAPACITY = b.ID_CAPACITY
LEFT JOIN (
		SELECT 
			n.SCH_ID,  SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
		FROM (
			SELECT a.SCH_ID, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
			FROM scan_supermarket_in a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE a.SCH_ID IN (
				SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_in a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
				AND a.CUT_SITE = :site
        UNION ALL
        SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_out a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
			)
			GROUP BY a.SCH_ID
			UNION ALL 
			SELECT a.SCH_ID,  0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
			FROM scan_supermarket_out a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE a.SCH_ID IN (
				SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_in a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
				AND a.CUT_SITE = :site
        UNION ALL
        SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_out a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
        UNION ALL 
        SELECT DISTINCT c.CUT_SCH_ID
        FROM cuting_loading_sch_detail c 
        LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
        WHERE c.CUT_LOAD_DATE BETWEEN :startDate AND  :endDate 
        AND e.SITE_NAME = :site
			)
			GROUP BY a.SCH_ID
		) n 
		GROUP BY 
		n.SCH_ID
) c ON c.SCH_ID = a.CUT_SCH_ID
LEFT JOIN item_siteline d ON d.ID_SITELINE = a.CUT_ID_SITELINE
WHERE a.CUT_SCH_ID IN (
		SELECT DISTINCT a.SCH_ID 
		FROM scan_supermarket_in a 
		WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
		AND a.CUT_SITE = :site
		UNION ALL 
		SELECT DISTINCT b.SCH_ID 
		FROM scan_supermarket_out b 
		WHERE DATE(b.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
		AND b.CUT_SITE = :site
) ORDER BY a.CUT_ID_SITELINE`;

export const qrySizeCutSupRep = `SELECT a.CUT_ID, a.CUT_SCH_ID SCH_ID,  d.SITE_NAME SCH_SITE, a.CUT_ID_SITELINE SCH_ID_SITELINE, d.LINE_NAME, 
a.CUT_SEW_SIZE_CODE SIZE_CODE, 
a.CUT_SEW_SCH_QTY, IFNULL(c.CUTTING_IN,0) CUTTING_IN, IFNULL(c.CUTTING_OUT,0) CUTTING_OUT, (IFNULL(c.CUTTING_IN,0)-IFNULL(c.CUTTING_OUT,0)) WIP 
FROM cuting_loading_sch_size a 
LEFT JOIN (
		SELECT 
			n.SCH_ID, n.ORDER_SIZE, SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
		FROM (
			SELECT a.SCH_ID, b.ORDER_SIZE, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
			FROM scan_supermarket_in a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE a.SCH_ID IN (
				SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_in a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
        UNION ALL
        SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_out a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
			)
			GROUP BY a.SCH_ID, b.ORDER_SIZE
			UNION ALL 
			SELECT a.SCH_ID, b.ORDER_SIZE, 0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
			FROM scan_supermarket_out a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE a.SCH_ID IN (
        SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_in a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
        UNION ALL
        SELECT DISTINCT a.SCH_ID 
				FROM scan_supermarket_out a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
			)
			GROUP BY a.SCH_ID, b.ORDER_SIZE
		) n 
		GROUP BY 
		n.SCH_ID,  n.ORDER_SIZE
) c ON c.SCH_ID = a.CUT_SCH_ID AND a.CUT_SEW_SIZE_CODE =  c.ORDER_SIZE
LEFT JOIN item_siteline d ON d.ID_SITELINE = a.CUT_ID_SITELINE
WHERE a.CUT_SCH_ID IN (
		SELECT DISTINCT a.SCH_ID 
		FROM scan_supermarket_in a 
		WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
		AND a.CUT_SITE = :site
		UNION ALL 
		SELECT DISTINCT b.SCH_ID 
		FROM scan_supermarket_out b 
		WHERE DATE(b.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
		AND b.CUT_SITE = :site
    		UNION ALL 
		SELECT DISTINCT c.CUT_SCH_ID
		FROM cuting_loading_sch_detail c 
		LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
		WHERE c.CUT_LOAD_DATE BETWEEN :startDate AND  :endDate 
		AND e.SITE_NAME = :site
) ORDER BY a.CUT_ID_SITELINE`;

export const qryCutSupDetailDate = `SELECT 
n.SCH_ID, n.SCAN_DATE, n.ORDER_SIZE, SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
FROM (
  SELECT a.SCH_ID, DATE(a.CUT_SCAN_TIME) SCAN_DATE,  b.ORDER_SIZE, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
  FROM scan_supermarket_in a
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
  WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
  AND a.CUT_SITE = :site
  GROUP BY a.SCH_ID, DATE(a.CUT_SCAN_TIME), b.ORDER_SIZE
  UNION ALL 
  SELECT a.SCH_ID, DATE(a.CUT_SCAN_TIME) SCAN_DATE,  b.ORDER_SIZE, 0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
  FROM scan_supermarket_out a
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
  WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
  AND a.CUT_SITE = :site
  GROUP BY a.SCH_ID, DATE(a.CUT_SCAN_TIME), b.ORDER_SIZE
) n 
GROUP BY 
n.SCH_ID, n.SCAN_DATE, n.ORDER_SIZE`;

export const qryGetHeadMolRep = `SELECT b.MANUFACTURING_SITE, 
	b.CUSTOMER_NAME, b.ORDER_REFERENCE_PO_NO,  b.ORDER_NO, b.ORDER_PO_ID,  b.MO_NO,  b.PRODUCT_ITEM_CODE, 
	b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION, b.SIZE_CODE, b.ORDER_QTY, g.CUTTING_IN, g.CUTTING_OUT,
  (g.CUTTING_IN-g.CUTTING_OUT) AS WIP
FROM order_po_listing_size b 
JOIN (
			SELECT 
			L.BUYER_PO, L.BUYER_CODE, L.ORDER_NO, L.ORDER_STYLE, L.ORDER_COLOR, L.ORDER_SIZE, 
			SUM(L.CUTTING_IN) AS CUTTING_IN, SUM(L.CUTING_OUT) AS CUTTING_OUT
		FROM (
			SELECT SUBSTRING_INDEX(e.BUYER_PO,',',-1) BUYER_PO, e.BUYER_CODE, e.ORDER_NO, e.ORDER_STYLE, e.ORDER_COLOR, e.ORDER_SIZE, 
			 SUM(e.ORDER_QTY) CUTTING_IN, 0 CUTING_OUT
			FROM order_detail e
			JOIN scan_molding_in d ON d.BARCODE_SERIAL = e.BARCODE_SERIAL
			WHERE  SUBSTRING_INDEX(e.BUYER_PO,',',-1) IN (
					SELECT DISTINCT 
						SUBSTRING_INDEX(b.BUYER_PO,',',-1)
					FROM(
						SELECT c.BARCODE_SERIAL
						FROM scan_molding_in c 
						WHERE DATE(c.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
						UNION ALL 
						SELECT c.BARCODE_SERIAL
						FROM scan_molding_out c 
						WHERE DATE(c.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
					) AS a 
					LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
			)
			GROUP BY e.BUYER_CODE, e.ORDER_NO, SUBSTRING_INDEX(e.BUYER_PO,',',-1), e.ORDER_STYLE, e.ORDER_COLOR, e.ORDER_SIZE
			UNION ALL 
			SELECT SUBSTRING_INDEX(e.BUYER_PO,',',-1) BUYER_PO, e.BUYER_CODE, e.ORDER_NO, e.ORDER_STYLE, e.ORDER_COLOR, e.ORDER_SIZE, 
			0 CUTTING_IN, SUM(e.ORDER_QTY)  CUTING_OUT
			FROM order_detail e
			JOIN scan_molding_out d ON d.BARCODE_SERIAL = e.BARCODE_SERIAL
			WHERE  SUBSTRING_INDEX(e.BUYER_PO,',',-1) IN (
					SELECT DISTINCT 
						SUBSTRING_INDEX(b.BUYER_PO,',',-1)
					FROM(
						SELECT c.BARCODE_SERIAL
						FROM scan_molding_in c 
						WHERE DATE(c.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
						UNION ALL 
						SELECT c.BARCODE_SERIAL
						FROM scan_molding_out c 
						WHERE DATE(c.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
					) AS a 
					LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
			)
			GROUP BY e.BUYER_CODE, e.ORDER_NO, SUBSTRING_INDEX(e.BUYER_PO,',',-1), e.ORDER_STYLE, e.ORDER_COLOR, e.ORDER_SIZE
		) AS L
		GROUP BY L.BUYER_PO, L.BUYER_CODE, L.ORDER_NO, L.ORDER_STYLE, L.ORDER_COLOR, L.ORDER_SIZE

) AS g ON g.BUYER_PO = b.ORDER_PO_ID 
		 AND g.ORDER_SIZE = b.SIZE_CODE
WHERE b.ORDER_PO_ID IN (
	 SELECT  N.BUYER_PO
	 FROM (
		SELECT DISTINCT SUBSTRING_INDEX(b.BUYER_PO,',',-1) AS BUYER_PO
		FROM scan_molding_in c 
		LEFT JOIN order_detail b ON c.BARCODE_SERIAL = b.BARCODE_SERIAL
		WHERE DATE(c.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
		UNION ALL 
		SELECT DISTINCT SUBSTRING_INDEX(b.BUYER_PO,',',-1) AS BUYER_PO
		FROM scan_molding_out c 
		LEFT JOIN order_detail b ON c.BARCODE_SERIAL = b.BARCODE_SERIAL
		WHERE DATE(c.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
		) N GROUP BY N.BUYER_PO
)`;
// export const qryGetHeadMolRep = `SELECT a.CUT_ID, a.CUT_SCH_ID SCH_ID,  a.CUT_SITE_NAME SCH_SITE, a.CUT_ID_SITELINE SCH_ID_SITELINE, d.LINE_NAME,
// a.CUT_SIZE_TYPE,
// a.CUT_SEW_SCH_QTY, c.CUTTING_IN, c.CUTTING_OUT, (c.CUTTING_IN-c.CUTTING_OUT) AS WIP,
// b.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.CUSTOMER_NAME, b.MO_NO,  b.PRODUCT_ITEM_CODE,
// b.ITEM_COLOR_CODE,  b.ITEM_COLOR_NAME, b.ORDER_STYLE_DESCRIPTION
// FROM cuting_loading_schedule a
// LEFT JOIN viewcapacity b ON a.CUT_ID_CAPACITY = b.ID_CAPACITY
// LEFT JOIN (
// 		SELECT
// 			n.SCH_ID,  SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
// 		FROM (
// 			SELECT a.SCH_ID, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
// 			FROM scan_molding_in a
// 			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// 			WHERE a.SCH_ID IN (
// 				SELECT DISTINCT a.SCH_ID
// 				FROM scan_molding_in a
// 				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
// 				AND a.CUT_SITE = :site
//         UNION ALL
//         SELECT DISTINCT a.SCH_ID
// 				FROM scan_molding_out a
// 				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
// 				AND a.CUT_SITE = :site
// 			)
// 			GROUP BY a.SCH_ID
// 			UNION ALL
// 			SELECT a.SCH_ID,  0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
// 			FROM scan_molding_out a
// 			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// 			WHERE a.SCH_ID IN (
// 				SELECT DISTINCT a.SCH_ID
// 				FROM scan_molding_in a
// 				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
// 				AND a.CUT_SITE = :site
//         UNION ALL
//         SELECT DISTINCT a.SCH_ID
// 				FROM scan_molding_out a
// 				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
// 				AND a.CUT_SITE = :site
// 			)
// 			GROUP BY a.SCH_ID
// 		) n
// 		GROUP BY
// 		n.SCH_ID
// ) c ON c.SCH_ID = a.CUT_SCH_ID
// LEFT JOIN item_siteline d ON d.ID_SITELINE = a.CUT_ID_SITELINE
// WHERE a.CUT_SCH_ID IN (
// 		SELECT DISTINCT a.SCH_ID
// 		FROM scan_molding_in a
// 		WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
// 		AND a.CUT_SITE = :site
// 		UNION ALL
// 		SELECT DISTINCT b.SCH_ID
// 		FROM scan_molding_out b
// 		WHERE DATE(b.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
// 		AND b.CUT_SITE = :site
//     		UNION ALL
// 		SELECT DISTINCT c.CUT_SCH_ID
// 		FROM cuting_loading_sch_detail c
// 		LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
// 		WHERE c.CUT_LOAD_DATE BETWEEN :startDate AND  :endDate
// 		AND e.SITE_NAME = :site
// ) ORDER BY a.CUT_ID_SITELINE`;

export const qryGetSizeMolRep = `SELECT a.CUT_ID, a.CUT_SCH_ID SCH_ID,  d.SITE_NAME SCH_SITE, a.CUT_ID_SITELINE SCH_ID_SITELINE, d.LINE_NAME, 
a.CUT_SEW_SIZE_CODE SIZE_CODE, 
a.CUT_SEW_SCH_QTY, IFNULL(c.CUTTING_IN,0) CUTTING_IN, IFNULL(c.CUTTING_OUT,0) CUTTING_OUT, (IFNULL(c.CUTTING_IN,0)-IFNULL(c.CUTTING_OUT,0)) WIP 
FROM cuting_loading_sch_size a 
LEFT JOIN (
		SELECT 
			n.SCH_ID, n.ORDER_SIZE, SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
		FROM (
			SELECT a.SCH_ID, b.ORDER_SIZE, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
			FROM scan_molding_in a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE a.SCH_ID IN (
				SELECT DISTINCT a.SCH_ID 
				FROM scan_molding_in a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
        UNION ALL
        SELECT DISTINCT a.SCH_ID 
				FROM scan_molding_out a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
			)
			GROUP BY a.SCH_ID, b.ORDER_SIZE
			UNION ALL 
			SELECT a.SCH_ID, b.ORDER_SIZE, 0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
			FROM scan_molding_out a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			WHERE a.SCH_ID IN (
        SELECT DISTINCT a.SCH_ID 
				FROM scan_molding_in a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
        UNION ALL
        SELECT DISTINCT a.SCH_ID 
				FROM scan_molding_out a 
				WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
				AND a.CUT_SITE = :site
			)
			GROUP BY a.SCH_ID, b.ORDER_SIZE
		) n 
		GROUP BY 
		n.SCH_ID,  n.ORDER_SIZE
) c ON c.SCH_ID = a.CUT_SCH_ID AND a.CUT_SEW_SIZE_CODE =  c.ORDER_SIZE
LEFT JOIN item_siteline d ON d.ID_SITELINE = a.CUT_ID_SITELINE
WHERE a.CUT_SCH_ID IN (
		SELECT DISTINCT a.SCH_ID 
		FROM scan_molding_in a 
		WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
		AND a.CUT_SITE = :site
		UNION ALL 
		SELECT DISTINCT b.SCH_ID 
		FROM scan_molding_out b 
		WHERE DATE(b.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
		AND b.CUT_SITE = :site
    		UNION ALL 
		SELECT DISTINCT c.CUT_SCH_ID
		FROM cuting_loading_sch_detail c 
		LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
		WHERE c.CUT_LOAD_DATE BETWEEN :startDate AND  :endDate 
		AND e.SITE_NAME = :site
) ORDER BY a.CUT_ID_SITELINE`;

export const qryGetDtlMolRep = `SELECT 
	l.SCAN_DATE,
	l.BUYER_CODE,
	l.ORDER_NO,
	l.BUYER_PO ORDER_PO_ID,
	l.ORDER_REFERENCE_PO_NO,
	l.ITEM_COLOR_NAME,
	l.ORDER_STYLE_DESCRIPTION,
	l.PLAN_EXFACTORY_DATE,
--	l.SITE_NAME,
--	l.LINE_NAME,
	l.ORDER_SIZE,
	SUM(SCAN_IN) SCAN_IN,
	SUM(SCAN_OUT) SCAN_OUT
FROM (
	SELECT DISTINCT  DATE(a.CUT_SCAN_TIME) SCAN_DATE,  b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, 
	c.ORDER_REFERENCE_PO_NO,
	c.ITEM_COLOR_NAME,  c.ORDER_STYLE_DESCRIPTION, b.SITE_LINE SITE_LINE_FX, 
	SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, -- SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
	c.PRODUCTION_MONTH, IF(c.NEW_PLAN_EXFACTORY_DATE,c.NEW_PLAN_EXFACTORY_DATE,c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
--	d.SITE_NAME, -- d.LINE_NAME,
	 b.ORDER_SIZE, SUM(b.ORDER_QTY) SCAN_IN, 0 SCAN_OUT
	FROM scan_molding_in a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1) AND SUBSTRING_INDEX(b.BUYER_PO,',',-1)= c.ORDER_PO_ID
--	LEFT JOIN item_siteline d ON d.SITE = 	SUBSTRING_INDEX(b.SITE_LINE,' ',1) AND d.LINE =  SUBSTRING_INDEX(b.SITE_LINE,' ',-1)
	WHERE  DATE(a.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
	GROUP BY  DATE(a.CUT_SCAN_TIME), SUBSTRING_INDEX(b.BUYER_PO,',',-1), b.ORDER_SIZE
	UNION ALL
	SELECT DISTINCT  DATE(a.CUT_SCAN_TIME) SCAN_DATE,  b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, 
	c.ORDER_REFERENCE_PO_NO,
	c.ITEM_COLOR_NAME,  c.ORDER_STYLE_DESCRIPTION, b.SITE_LINE SITE_LINE_FX, 
	SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, -- SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
	c.PRODUCTION_MONTH, IF(c.NEW_PLAN_EXFACTORY_DATE,c.NEW_PLAN_EXFACTORY_DATE,c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
--	d.SITE_NAME, -- d.LINE_NAME,
	 b.ORDER_SIZE, 0 SCAN_IN, SUM(b.ORDER_QTY) SCAN_OUT
	FROM scan_molding_out a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1) AND SUBSTRING_INDEX(b.BUYER_PO,',',-1)= c.ORDER_PO_ID
--	LEFT JOIN item_siteline d ON d.SITE = 	SUBSTRING_INDEX(b.SITE_LINE,' ',1) AND d.LINE =  SUBSTRING_INDEX(b.SITE_LINE,' ',-1)
	WHERE  DATE(a.CUT_SCAN_TIME)  BETWEEN :startDate AND :endDate
	GROUP BY  DATE(a.CUT_SCAN_TIME), SUBSTRING_INDEX(b.BUYER_PO,',',-1), b.ORDER_SIZE
) l
GROUP BY l.SCAN_DATE,
	l.BUYER_CODE,
	l.ORDER_NO,
	l.BUYER_PO,
	l.ORDER_REFERENCE_PO_NO,
	l.ITEM_COLOR_NAME,
	l.ORDER_STYLE_DESCRIPTION,
	l.PLAN_EXFACTORY_DATE,
-- 	l.SITE_NAME,
--	l.LINE_NAME,
	l.ORDER_SIZE`;
// export const qryGetDtlMolRep = `SELECT
// n.SCH_ID, n.SCAN_DATE, n.ORDER_SIZE, SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
// FROM (
//   SELECT a.SCH_ID, DATE(a.CUT_SCAN_TIME) SCAN_DATE,  b.ORDER_SIZE, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
//   FROM scan_molding_in a
//   LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
//   WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
//   AND a.CUT_SITE = :site
//   GROUP BY a.SCH_ID, DATE(a.CUT_SCAN_TIME), b.ORDER_SIZE
//   UNION ALL
//   SELECT a.SCH_ID, DATE(a.CUT_SCAN_TIME) SCAN_DATE,  b.ORDER_SIZE, 0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
//   FROM scan_molding_out a
//   LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
//   WHERE DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND  :endDate
//   AND a.CUT_SITE = :site
//   GROUP BY a.SCH_ID, DATE(a.CUT_SCAN_TIME), b.ORDER_SIZE
// ) n
// GROUP BY
// n.SCH_ID, n.SCAN_DATE, n.ORDER_SIZE`;

export const qryExportCutLoadSum = `SELECT
n.SITE_NAME, n.ORDER_NO, n.MO_NO, n.ITEM_COLOR_CODE, n.CUT_SEW_SIZE_CODE, n.CUT_ID_SITELINE, n.LINE_NAME,
n.ORDER_REFERENCE_PO_NO,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION, n.CUSTOMER_NAME,
MIN(n.CUT_SCH_DATE) CUT_SCH_DATE, SUM(n.CUT_SCH_QTY) CUT_SCH_QTY
FROM (
    SELECT a.CUT_ID_DETAIL, a.CUT_LOAD_DATE CUT_SCH_DATE, a.CUT_ID_SIZE, a.CUT_ID, a.CUT_SCH_ID,
    c.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY,
    a.CUT_STATUS, a.CUT_CREATE_STATUS,
    d.ORDER_NO, d.MO_NO, e.ID_SITELINE,  e.SITE_NAME, e.LINE_NAME, d.MANUFACTURING_SITE,
    d.CUSTOMER_NAME, d.PRODUCT_ITEM_CODE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_CODE, d.ITEM_COLOR_NAME, 
    d.PRODUCT_ITEM_DESCRIPTION, d.ORDER_STYLE_DESCRIPTION
    FROM cuting_loading_sch_detail a 
    LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
    LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
    LEFT JOIN viewcapacity d ON d.ID_CAPACITY = c.CUT_ID_CAPACITY
    LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
    WHERE a.CUT_LOAD_DATE BETWEEN :startDate AND :endDate 
    AND c.CUT_SITE_NAME = :site
    AND a.CUT_SCH_QTY <> 0
    -- GROUP BY  a.CUT_LOAD_DATE, a.CUT_SCH_ID
    ORDER BY c.CUT_ID_SITELINE, a.CUT_LOAD_DATE, a.CUT_SEW_SIZE_CODE
) n
GROUP BY  n.ORDER_NO, n.CUT_ID_SITELINE, n.ITEM_COLOR_CODE, n.CUT_SEW_SIZE_CODE `;

export const qryExportCutLoadDtl = `SELECT a.CUT_ID_DETAIL, a.CUT_LOAD_DATE CUT_SCH_DATE, a.CUT_ID_SIZE, a.CUT_ID, a.CUT_SCH_ID,
c.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY,
a.CUT_STATUS, a.CUT_CREATE_STATUS,
d.ORDER_NO, d.MO_NO, e.ID_SITELINE,  e.SITE_NAME, e.LINE_NAME, d.MANUFACTURING_SITE,
d.CUSTOMER_NAME, d.PRODUCT_ITEM_CODE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_CODE, d.ITEM_COLOR_NAME, 
d.PRODUCT_ITEM_DESCRIPTION, d.ORDER_STYLE_DESCRIPTION
FROM cuting_loading_sch_detail a 
LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
LEFT JOIN viewcapacity d ON d.ID_CAPACITY = c.CUT_ID_CAPACITY
LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
WHERE a.CUT_LOAD_DATE BETWEEN :startDate AND :endDate 
AND c.CUT_SITE_NAME = :site
AND a.CUT_SCH_QTY <> 0
-- GROUP BY  a.CUT_LOAD_DATE, a.CUT_SCH_ID, a.CUT_SEW_SIZE_CODE
ORDER BY d.ORDER_NO, a.CUT_LOAD_DATE, a.CUT_SEW_SIZE_CODE`;

export const qryExportCutSpredSum = `SELECT
n.SITE_NAME,  n.LINE_NAME, n.ORDER_NO, n.MO_NO, n.ITEM_COLOR_CODE, n.CUT_SEW_SIZE_CODE, 
n.ORDER_REFERENCE_PO_NO,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION, n.CUSTOMER_NAME,
MIN(n.CUT_SCH_DATE) CUT_SCH_DATE,
SUM(n.CUT_SCH_QTY) CUT_SCH_QTY
FROM (
    SELECT a.CUT_ID_DETAIL, a.CUT_SCH_DATE, a.CUT_ID_SIZE, a.CUT_ID, a.CUT_SCH_ID,
    c.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY,
    a.CUT_STATUS, a.CUT_CREATE_STATUS,
    d.ORDER_NO, d.MO_NO, e.ID_SITELINE,  e.SITE_NAME, e.LINE_NAME, d.MANUFACTURING_SITE,
    d.CUSTOMER_NAME, d.PRODUCT_ITEM_CODE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_CODE, d.ITEM_COLOR_NAME, 
    d.PRODUCT_ITEM_DESCRIPTION, d.ORDER_STYLE_DESCRIPTION
    FROM cuting_schedule_detail a 
    LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
    LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
    LEFT JOIN viewcapacity d ON d.ID_CAPACITY = c.CUT_ID_CAPACITY
    LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
    WHERE a.CUT_SCH_DATE BETWEEN :startDate AND :endDate 
    AND c.CUT_SITE_NAME = :site
    AND a.CUT_SCH_QTY <> 0
  --  GROUP BY  a.CUT_LOAD_DATE, a.CUT_SCH_ID
    ORDER BY c.CUT_ID_SITELINE, a.CUT_SCH_DATE, a.CUT_SEW_SIZE_CODE
) n
GROUP BY  n.ORDER_NO, n.CUT_ID_SITELINE, n.ITEM_COLOR_CODE, n.CUT_SEW_SIZE_CODE`;

export const qryExportCutSpredDtl = `SELECT a.CUT_ID_DETAIL, a.CUT_SCH_DATE, a.CUT_ID_SIZE, a.CUT_ID, a.CUT_SCH_ID,
c.CUT_ID_SITELINE, a.CUT_SEW_SIZE_CODE, a.CUT_SCH_QTY,
a.CUT_STATUS, a.CUT_CREATE_STATUS,
d.ORDER_NO, d.MO_NO, e.ID_SITELINE,  e.SITE_NAME, e.LINE_NAME, d.MANUFACTURING_SITE,
d.CUSTOMER_NAME, d.PRODUCT_ITEM_CODE, d.ORDER_REFERENCE_PO_NO, d.ITEM_COLOR_CODE, d.ITEM_COLOR_NAME, 
d.PRODUCT_ITEM_DESCRIPTION, d.ORDER_STYLE_DESCRIPTION
FROM cuting_schedule_detail a 
LEFT JOIN cuting_loading_sch_size b ON a.CUT_ID_SIZE = b.CUT_ID_SIZE
LEFT JOIN cuting_loading_schedule c ON a.CUT_ID = c.CUT_ID 
LEFT JOIN viewcapacity d ON d.ID_CAPACITY = c.CUT_ID_CAPACITY
LEFT JOIN item_siteline e ON e.ID_SITELINE = c.CUT_ID_SITELINE
WHERE a.CUT_SCH_DATE BETWEEN :startDate AND :endDate
AND c.CUT_SITE_NAME = :site
AND a.CUT_SCH_QTY <> 0`;

export const qrySumRepCutSaldoAwal = `
SELECT 
	m.*, 	(m.WIP_TANGGAL+m.CUTTING_IN)-m.CUTTING_OUT AS SALDO_AKHIR
FROM (
  SELECT n.CUT_SITE, 
  SUM(n.CUTTING_IN_AWAL)-SUM(n.CUTTING_OUT_AWAL) WIP_TANGGAL, SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
  FROM (
      SELECT a.CUT_SITE, SUM(b.ORDER_QTY) CUTTING_IN_AWAL, 0 CUTTING_OUT_AWAL,  0 CUTTING_IN, 0 CUTTING_OUT
      FROM scan_supermarket_in a 
      LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
      WHERE  DATE(a.CUT_SCAN_TIME) <= :lastDate
      GROUP BY a.CUT_SITE
    UNION ALL 
      SELECT a.CUT_SITE, 0 CUTTING_IN_AWAL, SUM(b.ORDER_QTY) CUTTING_OUT_AWAL, 0 CUTTING_IN, 0 CUTTING_OUT
      FROM scan_supermarket_out a 
      LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
      WHERE  DATE(a.CUT_SCAN_TIME) <= :lastDate
      GROUP BY a.CUT_SITE
    UNION ALL 
      SELECT a.CUT_SITE, 0  CUTTING_IN_AWAL, 0 CUTTING_OUT_AWAL, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
      FROM scan_supermarket_in a 
      LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
      WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
      GROUP BY a.CUT_SITE
    UNION ALL 
      SELECT a.CUT_SITE, 0  CUTTING_IN_AWAL, 0 CUTTING_OUT_AWAL, 0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
      FROM scan_supermarket_out a 
      LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
      WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
      GROUP BY a.CUT_SITE
  ) n 
  GROUP BY n.CUT_SITE
) m`;

export const qryGetDtlCutSum = `SELECT 
n.SCAN_DATE, n.CUT_SITE,  SUM(n.CUTTING_IN) CUTTING_IN, SUM(n.CUTTING_OUT) CUTTING_OUT
FROM (
  SELECT DATE(a.CUT_SCAN_TIME) SCAN_DATE, a.CUT_SITE, SUM(b.ORDER_QTY) CUTTING_IN, 0 CUTTING_OUT
  FROM scan_supermarket_in a 
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
  WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
  GROUP BY DATE(a.CUT_SCAN_TIME), a.CUT_SITE
  UNION ALL 
  SELECT DATE(a.CUT_SCAN_TIME) SCAN_DATE, a.CUT_SITE,  0 CUTTING_IN, SUM(b.ORDER_QTY) CUTTING_OUT
  FROM scan_supermarket_out a 
  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
  WHERE  DATE(a.CUT_SCAN_TIME) BETWEEN :startDate AND :endDate
  GROUP BY DATE(a.CUT_SCAN_TIME), a.CUT_SITE
) n 
GROUP BY n.SCAN_DATE, n.CUT_SITE`;

export const qryCheckTtlSewScanIn = `SELECT a.SEWING_SCAN_LOCATION, b.ORDER_SIZE, SUM(b.ORDER_QTY) TOTAL_SCAN
FROM scan_sewing_in a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  a.SCH_ID = :schId AND b.ORDER_SIZE = :size
GROUP BY a.SCH_ID, b.ORDER_SIZE`;

export const qryCheckTtlSupScanIn = `SELECT a.CUT_SITE, b.ORDER_SIZE, SUM(b.ORDER_QTY) TOTAL_SCAN
FROM scan_supermarket_in a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  a.SCH_ID = :schId AND b.ORDER_SIZE = :size
GROUP BY a.SCH_ID, b.ORDER_SIZE`;

export const qryCheckTtlSupScanOut = `SELECT a.CUT_SITE, b.ORDER_SIZE, SUM(b.ORDER_QTY) TOTAL_SCAN
FROM scan_supermarket_out a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  a.SCH_ID = :schId AND b.ORDER_SIZE = :size
GROUP BY a.SCH_ID, b.ORDER_SIZE`;

export const qryCheckTtlMolScanIn = `SELECT a.CUT_SITE, b.ORDER_SIZE, SUM(b.ORDER_QTY) TOTAL_SCAN
FROM scan_molding_in a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  a.SCH_ID = :schId AND b.ORDER_SIZE = :size
GROUP BY a.SCH_ID, b.ORDER_SIZE`;

export const qryCheckTtlMolScanOut = `SELECT a.CUT_SITE, b.ORDER_SIZE, SUM(b.ORDER_QTY) TOTAL_SCAN
FROM scan_molding_out a 
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  a.SCH_ID = :schId AND b.ORDER_SIZE = :size
GROUP BY a.SCH_ID, b.ORDER_SIZE`;
