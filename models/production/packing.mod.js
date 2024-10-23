import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanPackingIn = db.define(
  "scan_packing_in",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    BARCODE_MAIN: {
      type: DataTypes.STRING,
    },
    SCHD_ID: { type: DataTypes.BIGINT },
    SCH_ID: { type: DataTypes.BIGINT },
    PACKING_SCAN_BY: { type: DataTypes.BIGINT },
    PACKING_SCAN_LOCATION: { type: DataTypes.STRING },
    PACKING_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "PACKING_SCAN_TIME",
    updatedAt: false,
  }
);

export const PackingWorkdoneByDate = `SELECT * FROM ViewWorkdonePacking WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const FindTransferData = `SELECT  N.BUYER_CODE, N.SCHD_ID, N.SCH_ID, N.ORDER_NO, N.PRODUCT_TYPE, N.BUYER_PO, N.MO_NO,N.ORDER_REF,
N.ORDER_COLOR, N.ORDER_SIZE, N.ORDER_QTY, N.ORDER_STYLE, N.BARCODE_SERIAL, N.BARCODE_MAIN, N.SITE_LINE_FX, 
CONCAT(f.SITE_NAME, ' ', f.LINE_NAME) SITE_LINE, N.SEWING_SCAN_TIME, N.SCHD_PROD_DATE
FROM  (
	SELECT DISTINCT a.BARCODE_SERIAL, a.BARCODE_MAIN, a.SCHD_ID, a.SCH_ID, d.SCHD_ID_SITELINE, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, 
	c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, 
	CASE WHEN e.NEW_QTY THEN e.NEW_QTY ELSE  b.ORDER_QTY END AS ORDER_QTY,
	b.ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, b.SHIPMENT_DATE,
	c.ORDER_REFERENCE_PO_NO ORDER_REF,
	SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, 
	SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, 
	SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
	a.SEWING_SCAN_TIME, d.SCHD_PROD_DATE
	FROM scan_sewing_out a
	LEFT JOIN order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL -- join dengna main karena barcode serial bisa jadi split qr
	LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1)
	LEFT JOIN weekly_prod_sch_detail d ON a.SCHD_ID = d.SCHD_ID
	LEFT JOIN scan_sewing_qr_split e ON e.BARCODE_SERIAL = a.BARCODE_SERIAL -- join dengna seriak karena bisajadi sudah split
	WHERE a.BARCODE_SERIAL = :barcodeserial
) N LEFT JOIN item_siteline f ON f.ID_SITELINE = N.SCHD_ID_SITELINE`;

export const QueryResPackScanIn = `SELECT a.BARCODE_SERIAL, h.BUNDLE_SEQUENCE, a.SCH_ID, a.SCHD_ID, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, CONCAT(g.SCHD_SITE,' ',e.LINE_NAME)  SITE_LINE,
b.ORDER_NO, b.MO_NO, f.ORDER_REFERENCE_PO_NO ORDER_REF, f.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_STYLE, b.ORDER_SIZE, 
b.ORDER_QTY, a.PACKING_SCAN_BY, d.USER_INISIAL, b.SHIPMENT_DATE, g.SCHD_PROD_DATE, DATE(a.PACKING_SCAN_TIME) SCAN_DATE, TIME(a.PACKING_SCAN_TIME) SCAN_TIME
FROM scan_packing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = g.SCHD_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.PACKING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate h ON  h.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE DATE(a.PACKING_SCAN_TIME) = :scanDate AND 
e.LINE_NAME LIKE :linename AND a.BARCODE_SERIAL LIKE :barcodeserial
ORDER BY a.PACKING_SCAN_TIME`;

export const TemporaryQrPackIn = `SELECT  N.BUYER_CODE, N.SCHD_ID, N.SCH_ID, N.ORDER_NO, N.PRODUCT_TYPE, N.BUYER_PO, N.MO_NO,N.ORDER_REF, 
N.ORDER_COLOR, N.ORDER_SIZE, N.ORDER_QTY, N.ORDER_STYLE, N.BARCODE_SERIAL, N.SITE_LINE_FX, 
CONCAT(f.SITE_NAME, ' ', f.LINE_NAME) SITE_LINE, N.SEWING_SCAN_TIME, N.SCHD_PROD_DATE, N.BUNDLE_SEQUENCE,
N.COUNTRY
FROM  (
	SELECT DISTINCT a.BARCODE_SERIAL, a.SCHD_ID, a.SCH_ID, d.SCHD_ID_SITELINE, b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, 
	c.ITEM_COLOR_NAME ORDER_COLOR, b.ORDER_SIZE, b.ORDER_QTY, b.ORDER_STYLE, b.SITE_LINE SITE_LINE_FX, b.SHIPMENT_DATE, c.COUNTRY,
	c.ORDER_REFERENCE_PO_NO ORDER_REF, g.BUNDLE_SEQUENCE,
	SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, 
	f.SITE_NAME SITE, 
	f.LINE_NAME LINE,
	a.SEWING_SCAN_TIME, d.SCHD_PROD_DATE
	FROM scan_sewing_in a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1)
	LEFT JOIN weekly_prod_sch_detail d ON a.SCHD_ID = d.SCHD_ID
	LEFT JOIN item_siteline f ON f.ID_SITELINE = d.SCHD_ID_SITELINE
	LEFT JOIN order_qr_generate g ON g.BARCODE_SERIAL = a.BARCODE_SERIAL
	WHERE a.BARCODE_SERIAL = :barcodeserial
) N LEFT JOIN item_siteline f ON f.ID_SITELINE = N.SCHD_ID_SITELINE`;

export const QueryPackInDaily = `SELECT a.SCH_ID, c.SCH_QTY, f.MO_QTY, a.PACKING_IN_QTY,
CASE WHEN f.MO_QTY = c.SCH_QTY THEN 'ALL_SIZE' ELSE 'PARTIAL' END AS SIZES,
f.PRODUCTION_MONTH, f.CUSTOMER_NAME, e.SITE_NAME, e.LINE_NAME, c.SCH_ID_SITELINE,
f.ORDER_NO,	f.ORDER_REFERENCE_PO_NO, f.ITEM_COLOR_NAME, f.ORDER_STYLE_DESCRIPTION, 
IFNULL(f.NEW_PLAN_EXFACTORY_DATE, f.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
CASE WHEN (c.SCH_QTY - a.PACKING_IN_QTY) > 0 THEN "Open"
    		WHEN (c.SCH_QTY - a.PACKING_IN_QTY) = 0 THEN "Completed"
     		ELSE "Over" END AS STATUS
FROM (
SELECT a.SCH_ID, SUM(a.ORDER_QTY) AS PACKING_IN_QTY 
 FROM (
	 SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
	 a.BARCODE_MAIN AS BARCODE_SERIAL,
	 CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
	 FROM scan_packing_in a 
	 LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
	 LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
	 WHERE a.SCH_ID IN (
		   SELECT DISTINCT a.SCH_ID  FROM scan_packing_in a 
			 WHERE DATE(a.PACKING_SCAN_TIME) BETWEEN :startDate AND :endDate
	 ) 
	 GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
) a  GROUP BY a.SCH_ID
) a 
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = a.SCH_ID
LEFT JOIN item_siteline e ON e.ID_SITELINE = c.SCH_ID_SITELINE
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = c.SCH_CAPACITY_ID
order by e.SITE_NAME, e.LINE_NAME, a.SCH_ID`;

export const QyrPackInSumSize = `SELECT  n.SCH_ID, n.SCH_SITE, n.SCH_ID_SITELINE,  n.SIZE_CODE,
n.SCH_SIZE_QTY,  n.PACKING_IN_QTY, (n.SCH_SIZE_QTY - n.PACKING_IN_QTY) AS BAL,
CASE WHEN (n.SCH_SIZE_QTY - n.PACKING_IN_QTY) > 0 THEN "Open"
WHEN (n.SCH_SIZE_QTY - n.PACKING_IN_QTY) = 0 THEN "Completed"
 ELSE "Over" END AS STATUS
FROM (
SELECT 
a.SCH_ID, a.SCH_SITE, a.SCH_ID_SITELINE,  b.SIZE_CODE, -- c.MO_QTY, 
SUM(b.SCH_SIZE_QTY) SCH_SIZE_QTY, IFNULL(d.PACKING_IN_QTY,0) PACKING_IN_QTY
FROM weekly_prod_schedule a
LEFT JOIN  weekly_sch_size b ON a.SCH_ID = b.SCH_ID AND b.SCH_SIZE_QTY <> 0
-- LEFT JOIN viewcapacity c ON a.SCH_CAPACITY_ID = c.ID_CAPACITY
LEFT JOIN (
SELECT a.SCH_ID, a.ORDER_SIZE, SUM(a.ORDER_QTY) AS PACKING_IN_QTY
FROM (
 SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
 a.BARCODE_MAIN AS BARCODE_SERIAL,
 CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
 FROM scan_packing_in a 
 LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
 LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
 WHERE a.SCH_ID IN (
	 SELECT DISTINCT a.SCH_ID  FROM scan_packing_in a 
		WHERE DATE(a.PACKING_SCAN_TIME) BETWEEN :startDate AND :endDate  
 ) 
	 GROUP BY a.SCH_ID, b.ORDER_SIZE, a.BARCODE_MAIN
) a
GROUP BY a.SCH_ID, a.ORDER_SIZE
)  d ON a.SCH_ID = d.SCH_ID AND d.ORDER_SIZE =  b.SIZE_CODE
WHERE a.SCH_ID IN (
SELECT DISTINCT a.SCH_ID  FROM scan_packing_in a 
WHERE DATE(a.PACKING_SCAN_TIME) BETWEEN :startDate AND :endDate 
) 
GROUP BY a.SCH_ID,  b.SIZE_CODE
) n

`;

export const QueryPackInDailySize = `SELECT a.SCH_ID, a.SCAN_DATE, a.ORDER_SIZE, a.PACKING_IN_QTY
FROM (
		SELECT a.SCH_ID, a.SCAN_DATE, a.ORDER_SIZE, SUM(a.ORDER_QTY) AS PACKING_IN_QTY 
		FROM (
			SELECT DISTINCT a.SCH_ID, b.ORDER_SIZE, 
				a.BARCODE_MAIN AS BARCODE_SERIAL, DATE(a.PACKING_SCAN_TIME) SCAN_DATE,
				CASE WHEN  c.BARCODE_SERIAL IS NOT NULL THEN SUM(c.NEW_QTY) ELSE b.ORDER_QTY END AS ORDER_QTY
				FROM scan_packing_in a 
				LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
				LEFT JOIN scan_sewing_qr_split c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
				WHERE DATE(a.PACKING_SCAN_TIME) BETWEEN :startDate AND :endDate 
				GROUP BY a.SCH_ID, DATE(a.PACKING_SCAN_TIME), b.ORDER_SIZE, a.BARCODE_MAIN
		) a GROUP BY a.SCH_ID, a.SCAN_DATE, a.ORDER_SIZE
	) a 
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = a.SCH_ID
LEFT JOIN item_siteline e ON e.ID_SITELINE = c.SCH_ID_SITELINE
ORDER BY a.SCAN_DATE, e.SITE_NAME, e.LINE_NAME, a.SCH_ID       
`;

export const QueryPackInDailyPO = `SELECT  f.PRODUCTION_MONTH, b.BUYER_CODE, 
f.ORDER_REFERENCE_PO_NO, f.ITEM_COLOR_NAME, b.ORDER_STYLE, 
sum(b.ORDER_QTY) PACKING_IN_QTY 
FROM scan_packing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = a.SCH_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = c.SCH_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.PACKING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = c.SCH_ID_SITELINE
WHERE DATE(a.PACKING_SCAN_TIME) = :scanDate
GROUP BY f.PRODUCTION_MONTH, f.ORDER_REFERENCE_PO_NO,  b.ORDER_STYLE, f.ITEM_COLOR_NAME
ORDER BY  f.PRODUCTION_MONTH, f.ORDER_REFERENCE_PO_NO,  b.ORDER_STYLE, f.ITEM_COLOR_NAME`;

export const QueryPackInDailySizePo = `SELECT  a.SCH_ID, a.SCHD_ID, f.PRODUCTION_MONTH, b.BUYER_CODE, e.SITE_NAME, e.LINE_NAME, 
f.ORDER_REFERENCE_PO_NO, f.ITEM_COLOR_NAME, b.ORDER_STYLE, b.ORDER_SIZE, -- c.SCH_QTY, l.SEWING_TFR,
sum(b.ORDER_QTY) PACKING_IN_QTY
FROM scan_packing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_schedule c ON c.SCH_ID = a.SCH_ID
LEFT JOIN viewcapacity f ON f.ID_CAPACITY = c.SCH_CAPACITY_ID
LEFT JOIN xref_user_web d ON a.PACKING_SCAN_BY = d.USER_ID 
LEFT JOIN item_siteline e ON e.ID_SITELINE = c.SCH_ID_SITELINE
WHERE DATE(a.PACKING_SCAN_TIME) = :scanDate
GROUP BY a.SCH_ID,  b.ORDER_SIZE
ORDER BY e.SITE_NAME, e.LINE_NAME,  b.BUYER_CODE, a.SCH_ID`;

export const PackingQrSplit = `SELECT a.SCH_ID, a.SCHD_ID,  a.SEWING_SCAN_LOCATION SITE_NAME, a.BARCODE_SERIAL, 
a.BARCODE_MAIN, a.BARCODE_SEQ, a.NEW_QTY, a.PRINT_STATUS,
b.ORDER_NO, b.ORDER_SIZE, b.ORDER_QTY, b.MO_NO, b.BUYER_CODE,
c.BUNDLE_SEQUENCE SEQUENCE, 
e.ITEM_COLOR_NAME, e.ORDER_REFERENCE_PO_NO ORDER_REF, e.ORDER_STYLE_DESCRIPTION,
f.LINE_NAME
FROM scan_sewing_qr_split a 
LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
LEFT JOIN order_qr_generate c ON c.BARCODE_SERIAL = a.BARCODE_MAIN
LEFT JOIN weekly_prod_schedule d ON d.SCH_ID = a.SCH_ID
LEFT JOIN viewcapacity e ON d.SCH_CAPACITY_ID = e.ID_CAPACITY
LEFT JOIN item_siteline f ON f.ID_SITELINE = d.SCH_ID_SITELINE
WHERE DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate AND a.SEWING_SCAN_LOCATION = :site
`;

export const getQrByMain = `SELECT a.SCH_ID, a.SCHD_ID,  a.SEWING_SCAN_LOCATION SITE_NAME, a.BARCODE_SERIAL, 
a.BARCODE_MAIN, a.BARCODE_SEQ, a.NEW_QTY, a.PRINT_STATUS,
b.ORDER_NO, b.ORDER_SIZE, b.ORDER_QTY, b.MO_NO, b.BUYER_CODE,
c.BUNDLE_SEQUENCE SEQUENCE, 
e.ITEM_COLOR_NAME, e.ORDER_REFERENCE_PO_NO ORDER_REF, e.ORDER_STYLE_DESCRIPTION,
f.LINE_NAME
FROM scan_sewing_qr_split a 
LEFT JOIN view_order_detail b ON a.BARCODE_MAIN = b.BARCODE_SERIAL
LEFT JOIN order_qr_generate c ON c.BARCODE_SERIAL = a.BARCODE_MAIN
LEFT JOIN weekly_prod_schedule d ON d.SCH_ID = a.SCH_ID
LEFT JOIN viewcapacity e ON d.SCH_CAPACITY_ID = e.ID_CAPACITY
LEFT JOIN item_siteline f ON f.ID_SITELINE = d.SCH_ID_SITELINE
WHERE a.BARCODE_MAIN = :qrCode
`;

export const queryGetSytleByBuyer = `SELECT DISTINCT a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.PRODUCT_ITEM_ID, a.PRODUCT_TYPE,
a.PRODUCT_ITEM_CODE, a.ORDER_STYLE_DESCRIPTION, a.PRODUCT_ITEM_DESCRIPTION
FROM order_po_listing a
WHERE a.CUSTOMER_NAME = :byr
GROUP BY  a.PRODUCT_ITEM_ID, a.ORDER_STYLE_DESCRIPTION`;

export const CartonBox = db.define(
  "item_carton_list",
  {
    BOX_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BOX_NAME: { type: DataTypes.STRING },
    BUYER_CODE: { type: DataTypes.STRING },
    BOX_CODE: { type: DataTypes.STRING },
    LWH_UOM: { type: DataTypes.STRING },
    LENGTH: { type: DataTypes.DECIMAL },
    WIDTH: { type: DataTypes.DECIMAL },
    HEIGHT: { type: DataTypes.DECIMAL },
    LENGTH_CM: { type: DataTypes.DECIMAL },
    WIDTH_CM: { type: DataTypes.DECIMAL },
    HEIGHT_CM: { type: DataTypes.DECIMAL },
    WEIGHT: { type: DataTypes.DECIMAL },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

export const getSizeCodeByStyleId = `SELECT DISTINCT a.SIZE_CODE, b.SORT_NO
FROM order_po_listing_size a
LEFT JOIN item_list_size b ON a.CUSTOMER_NAME = b.CUSTOMER_NAME AND a.SIZE_CODE = b.SIZE_CODE
WHERE a.ORDER_STYLE_DESCRIPTION = :styleOrder
GROUP BY a.ORDER_STYLE_DESCRIPTION,  a.SIZE_CODE
ORDER BY b.SORT_NO`;

export const PackBoxStyle = db.define(
  "pack_box_style",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BOX_ID: {
      type: DataTypes.INTEGER,
    },
    BUYER_CODE: { type: DataTypes.STRING },
    BOX_CODE: { type: DataTypes.STRING },
    PRODUCT_ITEM_ID: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    TYPE_PACK: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);

export const PackCartonStyle = db.define(
  "pack_carton_style",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BOX_ID: {
      type: DataTypes.INTEGER,
    },
    COUNTRY_ID: {
      type: DataTypes.INTEGER,
    },
    BUYER_CODE: { type: DataTypes.STRING },
    BOX_CODE: { type: DataTypes.STRING },
    PRODUCT_ITEM_ID: { type: DataTypes.STRING },
    ORDER_STYLE_DESCRIPTION: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    PACKING_METHODE: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);

export const PackMethodeList = db.define(
  "item_packing_method",
  {
    PACK_METOD_ID: { type: DataTypes.INTEGER, primaryKey: true },
    PACK_MTD_NAME: { type: DataTypes.STRING },
    PACK_MTD_BASE: { type: DataTypes.STRING },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

export const getCtnStyleCode = `SELECT 
  a.ORDER_STYLE_DESCRIPTION,
	a.COUNTRY_ID,
	b.COUNTRY_CODE,
	b.COUNTRY_NAME,
	a.PACKING_METHODE
FROM pack_carton_style a 
LEFT JOIN item_country b ON b.COUNTRY_ID = a.COUNTRY_ID
WHERE a.ORDER_STYLE_DESCRIPTION = :orderStyle
GROUP BY a.ORDER_STYLE_DESCRIPTION, a.COUNTRY_ID, a.PACKING_METHODE 
ORDER BY a.PACKING_METHODE, a.COUNTRY_ID`;

export const getCtnStyleCodeDetail = `SELECT 
  a.ID,
  a.ORDER_STYLE_DESCRIPTION,
	a.COUNTRY_ID,
	b.COUNTRY_CODE,
	b.COUNTRY_NAME,
	a.PACKING_METHODE,
	a.SIZE_CODE,
	c.BOX_NAME,
	c.BOX_CODE
FROM pack_carton_style a 
LEFT JOIN item_country b ON b.COUNTRY_ID = a.COUNTRY_ID
LEFT JOIN item_carton_list c ON c.BOX_ID = a.BOX_ID
LEFT JOIN item_list_size d ON a.BUYER_CODE = d.CUSTOMER_NAME AND a.SIZE_CODE = d.SIZE_CODE
WHERE a.ORDER_STYLE_DESCRIPTION = :orderStyle
ORDER BY a.COUNTRY_ID, a.PACKING_METHODE, d.SORT_NO`;

export const getBoxStyleCode = `SELECT 
pbs.BOX_ID, pbs.BUYER_CODE, pbs.BOX_CODE, pbs.PRODUCT_ITEM_ID, pbs.SIZE_CODE, pbs.TYPE_PACK 
FROM pack_box_style pbs
WHERE pbs.PRODUCT_ITEM_ID = :prodItemCode `;

export const PackPlanHeader = db.define(
  "packing_plan_header",
  {
    PACKPLAN_ID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    PACKPLAN_BUYER: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PACKPLAN_BUYER_DIVISION: { type: DataTypes.STRING },
    PACK_METOD_ID: { type: DataTypes.INTEGER },
    PACKPLAN_COUNTRY: { type: DataTypes.STRING },
    PACKPLAN_LOCATION: { type: DataTypes.STRING },
    PACKPLAN_DELIVERY_MODE: { type: DataTypes.STRING },
    PACKPLAN_QTY: { type: DataTypes.INTEGER },
    PACKPLAN_EX_FACTORY: { type: DataTypes.DATE },
    PACKPLAN_ACD: { type: DataTypes.DATE },
    PACKPLAN_SBD: { type: DataTypes.DATE },
    PACKPLAN_COMMIT: { type: DataTypes.STRING },
    PACKPLAN_ADD_ID: { type: DataTypes.INTEGER },
    PACKPLAN_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);

export const PackPlanChild = db.define(
  "packing_plan_child",
  {
    ADDING_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    PACKPLAN_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    BUYER_PO: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SEQ_NO: { type: DataTypes.INTEGER },
    PACKING_METHODE: { type: DataTypes.STRING },
    COUNTRY_ID: { type: DataTypes.INTEGER },
    INDEX_NO: { type: DataTypes.INTEGER },
    USER_MOD_ID: { type: DataTypes.INTEGER },
    USER_ADD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);

export const qryGetLastPPI = `SELECT CAST(SUBSTRING(a.PACKPLAN_ID,9) AS INTEGER)+1 LAST_ID, YEAR(a.createdAt) LAST_YEAR 
FROM packing_plan_header a 
WHERE YEAR(a.createdAt) = YEAR(CURDATE())
ORDER BY a.createdAt DESC
LIMIT 1`;

export const qryGetSeqChild = `SELECT 
a.SEQ_NO
FROM packing_plan_child a WHERE a.PACKPLAN_ID = :ppid
ORDER BY a.SEQ_NO DESC
LIMIT 1`;

export const qryGetCusDivision = `SELECT DISTINCT a.CUSTOMER_NAME, a.CUSTOMER_DIVISION
FROM order_po_listing  a 
WHERE a.CUSTOMER_NAME = :customer`;

export const qryGetPackMethod = `SELECT DISTINCT c.CUSTOMER_NAME, c.PACKING_METHOD
FROM order_po_listing  c 
WHERE c.CUSTOMER_NAME = :customer`;

export const qryDeliveryMode = `SELECT DISTINCT a.DELIVERY_MODE_CODE FROM order_po_listing a`;

export const qryGetCustLoaction = `SELECT DISTINCT  d.DELIVERY_LOCATION_ID, d.DELIVERY_LOCATION_NAME, d.COUNTRY
FROM order_po_listing  d 
WHERE d.CUSTOMER_NAME = :customer
ORDER BY d.DELIVERY_LOCATION_ID`;

export const qryGetPackHeader = `SELECT a.PACKPLAN_ID, a.PACKPLAN_BUYER, a.PACKPLAN_BUYER_DIVISION, a.PACK_METOD_ID, c.PACK_MTD_NAME AS PACKPLAN_METHOD, c.PACK_MTD_BASE, a.PACKPLAN_LOCATION,
a.PACKPLAN_EX_FACTORY, a.PACKPLAN_ACD, a.PACKPLAN_SBD, a.PACKPLAN_ADD_ID, b.USER_INISIAL, a.PACKPLAN_COUNTRY, a.PACKPLAN_DELIVERY_MODE, a.PACKPLAN_COMMIT
FROM packing_plan_header a 
LEFT JOIN xref_user_web b ON a.PACKPLAN_ADD_ID = b.USER_ID
LEFT JOIN item_packing_method c ON c.PACK_METOD_ID = a.PACK_METOD_ID
WHERE a.PACKPLAN_BUYER = :customer AND a.PACKPLAN_EX_FACTORY BETWEEN :startDate AND :endDate 
ORDER BY a.createdAt`;

export const qryGetDistcPoBuyer = `SELECT DISTINCT
a.PACKPLAN_ID,
a.BUYER_PO
FROM packing_plan_po_sum a 
WHERE a.PACKPLAN_ID IN (
	SELECT a.PACKPLAN_ID FROM packing_plan_header c	WHERE c.PACKPLAN_BUYER = :customer AND c.PACKPLAN_EX_FACTORY BETWEEN :startDate AND :endDate 
)`;

export const qryGetDistcPoRef = `
SELECT DISTINCT
a.PACKPLAN_ID,
a.ORDER_REFERENCE_PO_NO
FROM packing_plan_po_sum a 
WHERE a.PACKPLAN_ID IN (
	SELECT a.PACKPLAN_ID FROM packing_plan_header c	WHERE c.PACKPLAN_BUYER = :customer AND c.PACKPLAN_EX_FACTORY BETWEEN :startDate AND :endDate 
)`;

export const findPoPlanPack = `SELECT 
	a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_COLOR_CODE, b.BUYER_COLOR_NAME, a.SIZE_CODE, MAX(a.ACT_UNIT_PRICE) ACT_UNIT_PRICE, 
	SUM(a.SHIPMENT_QTY)  AS SHIPMENT_QTY, 
	SUM(a.AMOUNT) AS AMOUNT
FROM packing_plan_detail a 
LEFT JOIN (
		SELECT c.PLAN_SEQUANCE_ID,  c.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME FROM packing_plan_po_buyer c 
		WHERE c.PLAN_SEQUANCE_ID = :ppidSeqId
		GROUP BY c.PLAN_SEQUANCE_ID,  c.BUYER_COLOR_CODE
) b ON b.PLAN_SEQUANCE_ID = a.PLAN_SEQUANCE_ID AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
WHERE a.PLAN_SEQUANCE_ID = :ppidSeqId
GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_COLOR_CODE,  a.SIZE_CODE`;
// export const findPoPlanPack = ` SELECT n.UNIKID,
// n.PRODUCT_ITEM_CODE,
// n.ORDER_REFERENCE_PO_NO, n.PO_REF_CODE,
// n.ORDER_PO_ID,
// n.ITEM_COLOR_CODE,  n.SIZE_CODE,
// n.BUYER_PO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,
// n.ORDER_QTY, n.MO_QTY,
// n.PLAN_EXFACTORY_DATE, n.UNIT_PRICE, n.AMOUNT,
// n.ACT_UNIT_PRICE, SUM(n.PLANED_QTY) PLANED_QTY, n.ORDER_QTY-IFNULL(SUM(n.PLANED_QTY),0) BALANCE,  n.SHIPMENT_QTY
// FROM (
//   SELECT CONCAT(a.ORDER_PO_ID,'.',a.ITEM_COLOR_CODE,'.',a.SIZE_CODE) AS UNIKID,
//   a.PRODUCT_ITEM_CODE,
//   a.ORDER_REFERENCE_PO_NO, a.ORDER_PO_ID, a.PO_REF_CODE,
//   a.ITEM_COLOR_CODE, a.SIZE_CODE, a.ORDER_QTY, a.MO_QTY,
//   c.BUYER_PO, c.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME,
//   a.PLAN_EXFACTORY_DATE, b.UNIT_PRICE,
//   e.ACT_UNIT_PRICE, e.AMOUNT, d.SHIPMENT_QTY PLANED_QTY, e.SHIPMENT_QTY
//   FROM order_po_listing_size a
//   LEFT JOIN order_po_listing b ON a.ORDER_PO_ID = b.ORDER_PO_ID
//   LEFT JOIN order_po_buyer c ON a.ORDER_PO_ID = c.ORDER_PO_ID
//   LEFT JOIN packing_plan_detail d ON d.UNIKID = CONCAT(a.ORDER_PO_ID,'.',a.ITEM_COLOR_CODE,'.',a.SIZE_CODE)
//   AND d.PACKPLAN_ID <> :ppid
//   LEFT JOIN packing_plan_detail e ON e.UNIKID = CONCAT(a.ORDER_PO_ID,'.',a.ITEM_COLOR_CODE,'.',a.SIZE_CODE)
//   AND e.PACKPLAN_ID = :ppid
//   WHERE a.ORDER_REFERENCE_PO_NO = :poNumber
// ) n
// GROUP BY n.UNIKID`;

export const qryGetlistPo = `SELECT DISTINCT a.ORDER_REFERENCE_PO_NO
FROM order_po_listing a WHERE a.CUSTOMER_NAME = :customer AND a.ORDER_REFERENCE_PO_NO LIKE :qryPO`;

export const qryGetReflistPoBuyer = `SELECT DISTINCT a.PO_NUMBER
FROM order_po_buyer a WHERE a.PO_NUMBER LIKE :qryPO`;

export const qryPackPoIdPoBuyer = `SELECT 
  a.PRODUCT_ITEM_CODE,
  a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.PO_REF_CODE, a.DELIVERY_LOCATION_NAME,
  a.ORDER_NO, a.ORDER_REFERENCE_PO_NO, a.ORDER_STYLE_DESCRIPTION,
  a.ITEM_COLOR_CODE, a.ORDER_PO_ID, a.ITEM_COLOR_NAME,
  a.PLAN_EXFACTORY_DATE, a.ORDER_QTY,
  a.PACKING_METHOD,
  b.BUYER_PO, b.BUYER_COLOR_CODE, b.BUYER_COLOR_NAME
FROM order_po_listing a 
LEFT JOIN packing_plan_po_buyer b ON a.ORDER_PO_ID = b.ORDER_PO_ID AND b.PLAN_SEQUANCE_ID = :planSeqId
WHERE a.ORDER_REFERENCE_PO_NO = :poNumber`;

export const OrderPoBuyer = db.define(
  "packing_plan_po_buyer",
  {
    PLAN_SEQUANCE_ID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    PACKPLAN_ID: {
      type: DataTypes.STRING,
    },
    SEQ_NO: {
      type: DataTypes.INTEGER,
    },
    ORDER_PO_ID: {
      type: DataTypes.STRING,
    },
    BUYER_PO: { type: DataTypes.STRING },
    BUYER_COLOR_CODE: { type: DataTypes.STRING },
    BUYER_COLOR_NAME: { type: DataTypes.STRING },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);

export const qryGetPackPlanDtlPo = `SELECT n.UNIKID,
n.PLAN_SEQUANCE_ID,
n.PRODUCT_ITEM_CODE,
n.ORDER_STYLE_DESCRIPTION,
-- n.ORDER_REFERENCE_PO_NO, 
n.PO_REF_CODE,
n.ORDER_PO_ID,
n.ITEM_COLOR_CODE,  n.SIZE_CODE,  
n.BUYER_PO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME, 
n.ORDER_QTY, n.MO_QTY,
n.PLAN_EXFACTORY_DATE, n.UNIT_PRICE, n.AMOUNT,
n.ACT_UNIT_PRICE, SUM(n.PLANED_QTY) PLANED_QTY, n.ORDER_QTY-IFNULL(SUM(n.PLANED_QTY),0) BALANCE,  n.SHIPMENT_QTY
FROM (
  SELECT CONCAT(a.ORDER_PO_ID,'.',a.ITEM_COLOR_CODE,'.',a.SIZE_CODE) AS UNIKID, 
  c.PLAN_SEQUANCE_ID,
  a.PRODUCT_ITEM_CODE,
  a.ORDER_STYLE_DESCRIPTION,
  -- a.ORDER_REFERENCE_PO_NO,
  a.ORDER_PO_ID, a.PO_REF_CODE,
  a.ITEM_COLOR_CODE, a.SIZE_CODE, a.ORDER_QTY, a.MO_QTY,
  c.BUYER_PO, c.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME,
  a.PLAN_EXFACTORY_DATE, b.UNIT_PRICE,
  e.ACT_UNIT_PRICE, e.AMOUNT, d.SHIPMENT_QTY PLANED_QTY, e.SHIPMENT_QTY
  FROM order_po_listing_size a 
  LEFT JOIN order_po_listing b ON a.ORDER_PO_ID = b.ORDER_PO_ID
  LEFT JOIN packing_plan_po_buyer c ON a.ORDER_PO_ID = c.ORDER_PO_ID AND c.PLAN_SEQUANCE_ID = :seqId
  LEFT JOIN packing_plan_detail d ON 
  		d.UNIKID = CONCAT(a.ORDER_PO_ID,'.',a.ITEM_COLOR_CODE,'.',a.SIZE_CODE)
		  AND d.PLAN_SEQUANCE_ID <> :seqId
  LEFT JOIN packing_plan_detail e ON 
  		e.UNIKID = CONCAT(a.ORDER_PO_ID,'.',a.ITEM_COLOR_CODE,'.',a.SIZE_CODE)
  		AND e.PLAN_SEQUANCE_ID =  :seqId
  WHERE a.ORDER_PO_ID IN (:orderPoId)
) n
-- WHERE n.BUYER_COLOR_CODE IS NOT NULL
GROUP BY n.UNIKID`;

export const PackingPlanDetail = db.define(
  "packing_plan_detail",
  {
    PACKPLAN_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PLAN_SEQUANCE_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UNIKID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PACKING_METHODE: { type: DataTypes.STRING },
    COUNTRY_ID: { type: DataTypes.INTEGER },
    ORDER_PO_ID: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    BUYER_PO: { type: DataTypes.STRING },
    BUYER_COLOR_CODE: { type: DataTypes.STRING },
    ACT_UNIT_PRICE: { type: DataTypes.DECIMAL },
    SHIPMENT_QTY: { type: DataTypes.INTEGER },
    AMOUNT: { type: DataTypes.DECIMAL },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);

PackingPlanDetail.removeAttribute("id");

export const qrySumPoDetil = `SELECT 
    n.PACKPLAN_ID, n.PLAN_SEQUANCE_ID, n.BUYER_PO, 
	 n.ORDER_REFERENCE_PO_NO,
	 n.ORDER_STYLE_DESCRIPTION,
    n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,
	   n.PRODUCT_ITEM_ID, n.PRODUCT_ITEM_CODE,
    n.SHIPMENT_QTY, 
    n.ACT_UNIT_PRICE,
    CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE n.SET_PAIR END AS  SET_PAIR,
    CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE IFNULL(n.SHIPMENT_QTY,0)/IFNULL(n.SET_PAIR, 0) END AS PAIR_QTY,
    n.AMOUNT,
    CASE WHEN m.PLAN_SEQUANCE_ID IS NOT NULL THEN 1 ELSE 0 END AS SAVED,
    m.COL_INDEX
FROM (
  SELECT a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, b.ORDER_REFERENCE_PO_NO, 
  a.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME, b.PRODUCT_ITEM_ID, b.PRODUCT_ITEM_CODE,
  b.ORDER_STYLE_DESCRIPTION,
  SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, SUM(a.AMOUNT) AMOUNT, 
  AVG(DISTINCT a.ACT_UNIT_PRICE) ACT_UNIT_PRICE,
  COUNT(DISTINCT b.ITEM_COLOR_CODE) SET_PAIR
  FROM packing_plan_detail a
  LEFT JOIN order_po_listing b ON b.ORDER_PO_ID = a.ORDER_PO_ID
  LEFT JOIN packing_plan_po_buyer c ON c.ORDER_PO_ID = a.ORDER_PO_ID AND a.PLAN_SEQUANCE_ID = c.PLAN_SEQUANCE_ID
  WHERE a.PLAN_SEQUANCE_ID = :ppidSeqId
 AND b.ORDER_PO_ID IN (:orderPoId)
  GROUP BY a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE
) n
LEFT JOIN packing_plan_po_sum m 
	ON m.PLAN_SEQUANCE_ID = n.PLAN_SEQUANCE_ID 
	AND m.BUYER_PO = n.BUYER_PO
	AND m.BUYER_COLOR_CODE = n.BUYER_COLOR_CODE
ORDER BY m.COL_INDEX`;
// export const qrySumPoDetil = `SELECT
//     n.PACKPLAN_ID, n.PLAN_SEQUANCE_ID, n.BUYER_PO, n.ORDER_REFERENCE_PO_NO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,  n.PRODUCT_ITEM_ID, n.PRODUCT_ITEM_CODE,
//     n.SHIPMENT_QTY,
//     n.ACT_UNIT_PRICE,
//     CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE n.SET_PAIR END AS  SET_PAIR,
//     CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE IFNULL(n.SHIPMENT_QTY,0)/IFNULL(n.SET_PAIR, 0) END AS PAIR_QTY,
//     n.AMOUNT,
//     CASE WHEN m.PLAN_SEQUANCE_ID IS NOT NULL THEN 1 ELSE 0 END AS SAVED,
//     m.COL_INDEX
// FROM (
//   SELECT a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, b.ORDER_REFERENCE_PO_NO,
//   a.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME, b.PRODUCT_ITEM_ID, b.PRODUCT_ITEM_CODE,
//   SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, SUM(a.AMOUNT) AMOUNT,
//   AVG(DISTINCT a.ACT_UNIT_PRICE) ACT_UNIT_PRICE,
//   COUNT(DISTINCT b.ITEM_COLOR_CODE) SET_PAIR
//   FROM packing_plan_detail a
//   LEFT JOIN order_po_listing b ON b.ORDER_PO_ID = a.ORDER_PO_ID
//   LEFT JOIN packing_plan_po_buyer c ON c.ORDER_PO_ID = a.ORDER_PO_ID AND a.PLAN_SEQUANCE_ID = c.PLAN_SEQUANCE_ID
//   WHERE a.PLAN_SEQUANCE_ID = :ppidSeqId
//   AND b.ORDER_PO_ID IN (:orderPoId)
//   GROUP BY a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE
// ) n
// LEFT JOIN packing_plan_po_sum m
// 	ON m.PLAN_SEQUANCE_ID = n.PLAN_SEQUANCE_ID
// 	AND m.BUYER_PO = n.BUYER_PO
// 	AND m.BUYER_COLOR_CODE = n.BUYER_COLOR_CODE
// ORDER BY m.COL_INDEX`;

export const qryListSumPo = `
SELECT o.*,
  CASE WHEN o.PAIR_QTY <> 0 THEN o.PAIR_QTY ELSE o.SHIPMENT_QTY END AS FINAL_QTY
FROM (
  SELECT 
      n.PACKPLAN_ID, n.PLAN_SEQUANCE_ID, n.BUYER_PO, n.ORDER_REFERENCE_PO_NO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,  n.PRODUCT_ITEM_ID, n.PRODUCT_ITEM_CODE,
      n.ORDER_STYLE_DESCRIPTION,
      n.SHIPMENT_QTY, 
      n.ACT_UNIT_PRICE,
      CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE n.SET_PAIR END AS  SET_PAIR,
      CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE IFNULL(n.SHIPMENT_QTY,0)/IFNULL(n.SET_PAIR, 0) END AS PAIR_QTY,
      n.AMOUNT,
      o.TTL_BOX,
      n.PACKING_METHODE,
      t.COUNTRY_NAME,
      n.SEQ_NO,
      m.COL_INDEX
  FROM (
    SELECT a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, c.SEQ_NO, a.BUYER_PO, b.ORDER_REFERENCE_PO_NO, 
    a.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME, b.PRODUCT_ITEM_ID, b.PRODUCT_ITEM_CODE, b.ORDER_STYLE_DESCRIPTION,
    a.PACKING_METHODE,
    SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, SUM(a.AMOUNT) AMOUNT, 
    AVG(DISTINCT a.ACT_UNIT_PRICE) ACT_UNIT_PRICE,
    COUNT(DISTINCT b.ITEM_COLOR_CODE) SET_PAIR
    FROM packing_plan_detail a
    LEFT JOIN order_po_listing b ON b.ORDER_PO_ID = a.ORDER_PO_ID
    LEFT JOIN packing_plan_po_buyer c ON c.ORDER_PO_ID = a.ORDER_PO_ID AND a.PLAN_SEQUANCE_ID = c.PLAN_SEQUANCE_ID
    WHERE a.PACKPLAN_ID = :ppid
    GROUP BY a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE
  ) n
  LEFT JOIN packing_plan_po_sum m 
    ON m.PLAN_SEQUANCE_ID = n.PLAN_SEQUANCE_ID 
    AND m.BUYER_PO = n.BUYER_PO
    AND m.BUYER_COLOR_CODE = n.BUYER_COLOR_CODE
  LEFT JOIN item_country t ON t.COUNTRY_ID = m.COUNTRY_ID
  LEFT JOIN (
      SELECT 
        r.PLAN_SEQUANCE_ID,
        r.BUYER_PO,
        r.BUYER_COLOR_CODE,
        SUM(r.TTL_BOX) TTL_BOX
      FROM (
        SELECT SUBSTRING_INDEX(a.ROWID,'|',4) AS PLAN_SEQUANCE_ID,
        a.BUYER_PO,
        a.BUYER_COLOR_CODE,
        a.TTL_BOX
        FROM packing_plan_box_row a 
        WHERE a.PACKPLAN_ID = :ppid
      ) r 
      GROUP BY r.PLAN_SEQUANCE_ID, r.BUYER_PO, r.BUYER_COLOR_CODE
  ) o ON o.PLAN_SEQUANCE_ID = n.PLAN_SEQUANCE_ID 
    AND o.BUYER_PO = n.BUYER_PO
    AND o.BUYER_COLOR_CODE = n.BUYER_COLOR_CODE
  ORDER BY n.SEQ_NO, m.COL_INDEX
) o `;
// SELECT
//     n.PACKPLAN_ID, n.BUYER_PO, n.ORDER_REFERENCE_PO_NO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,  n.PRODUCT_ITEM_ID, n.PRODUCT_ITEM_CODE,
//     n.SHIPMENT_QTY,
//     n.ACT_UNIT_PRICE,
//     CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE n.SET_PAIR END AS  SET_PAIR,
//     CASE WHEN n.SET_PAIR = 1 THEN 0 ELSE IFNULL(n.SHIPMENT_QTY,0)/IFNULL(n.SET_PAIR, 0) END AS PAIR_QTY,
//     n.AMOUNT,
//     CASE WHEN m.PACKPLAN_ID IS NOT NULL THEN 1 ELSE 0 END AS SAVED,
//     m.COL_INDEX
// FROM (
//   SELECT a.PACKPLAN_ID, a.BUYER_PO, b.ORDER_REFERENCE_PO_NO, a.BUYER_COLOR_CODE, c.BUYER_COLOR_NAME, b.PRODUCT_ITEM_ID, b.PRODUCT_ITEM_CODE,
//   SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, SUM(a.AMOUNT) AMOUNT,
//   AVG(DISTINCT a.ACT_UNIT_PRICE) ACT_UNIT_PRICE,
//   COUNT(DISTINCT b.ITEM_COLOR_CODE) SET_PAIR
//   FROM packing_plan_detail a
//   LEFT JOIN order_po_listing b ON b.ORDER_PO_ID = a.ORDER_PO_ID
//   LEFT JOIN order_po_buyer c ON c.ORDER_PO_ID = a.ORDER_PO_ID
//   WHERE a.PACKPLAN_ID = :ppid
//   AND b.ORDER_REFERENCE_PO_NO = :poNumber
//   GROUP BY a.PACKPLAN_ID, a.BUYER_PO, a.BUYER_COLOR_CODE
// ) n
// LEFT JOIN packing_plan_po_sum m
// 	ON m.PACKPLAN_ID = n.PACKPLAN_ID
// 	AND m.BUYER_PO = n.BUYER_PO
// 	AND m.BUYER_COLOR_CODE = n.BUYER_COLOR_CODE
// ORDER BY m.COL_INDEX

export const PackingPlanPoSum = db.define(
  "packing_plan_po_sum",
  {
    PACKPLAN_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PLAN_SEQUANCE_ID: { type: DataTypes.STRING },
    PACKING_METHODE: { type: DataTypes.STRING },
    COUNTRY_ID: { type: DataTypes.INTEGER },
    ORDER_REFERENCE_PO_NO: { type: DataTypes.STRING },
    BUYER_PO: { type: DataTypes.STRING },
    PRODUCT_ITEM_ID: { type: DataTypes.STRING },
    ORDER_STYLE_DESCRIPTION: { type: DataTypes.STRING },
    PRODUCT_ITEM_CODE: { type: DataTypes.STRING },
    BUYER_COLOR_CODE: { type: DataTypes.STRING },
    BUYER_COLOR_NAME: { type: DataTypes.STRING },
    ACT_UNIT_PRICE: { type: DataTypes.DECIMAL },
    PO_INDEX: { type: DataTypes.INTEGER },
    COL_INDEX: { type: DataTypes.INTEGER },
    SHIPMENT_QTY: { type: DataTypes.INTEGER },
    SET_PAIR: { type: DataTypes.INTEGER },
    PAIR_QTY: { type: DataTypes.INTEGER },
    AMOUNT: { type: DataTypes.DECIMAL },
    ADD_ID: { type: DataTypes.INTEGER },
    MOD_ID: { type: DataTypes.INTEGER },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);

PackingPlanPoSum.removeAttribute("id");

export const qryGetLisPOPPID = `SELECT a.ADDING_ID, a.PACKPLAN_ID, a.BUYER_PO, a.INDEX_NO, a.SEQ_NO, a.COUNTRY_ID, a.PACKING_METHODE, b.COUNTRY_CODE, b.COUNTRY_NAME,
CONCAT(a.PACKPLAN_ID, '|', a.SEQ_NO,  '|',   b.COUNTRY_ID, '|', a.PACKING_METHODE ) AS PLAN_SEQUANCE_ID
FROM packing_plan_child a 
LEFT JOIN item_country b ON a.COUNTRY_ID = b.COUNTRY_ID
WHERE a.PACKPLAN_ID = :ppid
ORDER BY a.INDEX_NO, a.SEQ_NO`;

export const qryGetLisSizePPID = `SELECT n.SIZE_CODE, SORT_NO
FROM (
	SELECT DISTINCT a.SIZE_CODE, IFNULL(d.SORT_NO, c.SORT_NO) SORT_NO FROM packing_plan_detail a 
		LEFT JOIN packing_plan_header b ON b.PACKPLAN_ID = a.PACKPLAN_ID
		LEFT JOIN item_list_size c ON b.PACKPLAN_BUYER = c.CUSTOMER_NAME AND a.SIZE_CODE = c.SIZE_CODE
		LEFT JOIN packing_plan_sort_size d ON d.PACKPLAN_ID = a.PACKPLAN_ID AND d.SIZE_CODE = a.SIZE_CODE
	WHERE a.PACKPLAN_ID = :ppid
) n
ORDER BY n.SORT_NO`;

export const qryGetLisColorPPID = `SELECT DISTINCT a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.ORDER_REFERENCE_PO_NO, a.BUYER_COLOR_CODE,  a.ORDER_STYLE_DESCRIPTION, a.COL_INDEX, a.SHIPMENT_QTY
FROM packing_plan_po_sum a WHERE a.PACKPLAN_ID = :ppid
ORDER BY a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.COL_INDEX`;

// export const qryGetSumPoPront = `SELECT DISTINCT
// a.BUYER_PO, b.PRODUCT_ITEM_ID, b.PRODUCT_ITEM_CODE, a.BUYER_COLOR_CODE, a.BUYER_COLOR_NAME,
// a.SHIPMENT_QTY, a.PAIR_QTY, a.ACT_UNIT_PRICE, a.AMOUNT,
// CASE WHEN a.ORDER_REFERENCE_PO_NO <> a.BUYER_PO THEN a.ORDER_REFERENCE_PO_NO END AS OLD_PO
// FROM packing_plan_po_sum a
// LEFT JOIN order_po_listing b ON a.ORDER_REFERENCE_PO_NO = b.ORDER_REFERENCE_PO_NO
// WHERE a.PACKPLAN_ID = :ppid
// GROUP BY a.PACKPLAN_ID, a.BUYER_PO, a.BUYER_COLOR_CODE`;

export const qrySumQtyPoBox = (stringQUery) => {
  return `SELECT 
	n.*,
	m.QTY_PER_BOX,
	m.TTL_QTY_BOX,
	m.TTL_BOX,
	(n.AFTER_SET_QTY - m.TTL_QTY_BOX) AS BALANCE,
   m.CTN_START,
   m.CTN_END,
   IFNULL(m.ROW_TYPE,'GEN') AS ROW_TYPE
FROM (
	SELECT 
	CONCAT(a.PLAN_SEQUANCE_ID,'|',a.BUYER_COLOR_CODE,'|',a.SIZE_CODE) AS ROWID, b.COL_INDEX,
	a.PACKPLAN_ID, c.PRODUCT_ITEM_ID, c.ORDER_STYLE_DESCRIPTION, c.PRODUCT_ITEM_CODE, a.BUYER_PO, 	a.BUYER_COLOR_CODE, b.BUYER_COLOR_NAME, 
	 a.SIZE_CODE, d.BOX_ID, d.BOX_CODE, b.SET_PAIR, IFNULL(g.SORT_NO, f.SORT_NO) SORT_NO,
  SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, -- tanpa set
	CASE WHEN b.SET_PAIR <> 0 THEN SUM(a.SHIPMENT_QTY)/b.SET_PAIR ELSE  SUM(a.SHIPMENT_QTY) END AS AFTER_SET_QTY -- set qty
	FROM packing_plan_detail a 
	LEFT JOIN packing_plan_po_sum b ON b.BUYER_PO = a.BUYER_PO AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE AND a.PLAN_SEQUANCE_ID = b.PLAN_SEQUANCE_ID
	LEFT JOIN order_po_listing c ON c.ORDER_PO_ID = a.ORDER_PO_ID
	LEFT JOIN pack_carton_style d ON d.ORDER_STYLE_DESCRIPTION = c.ORDER_STYLE_DESCRIPTION 
											AND d.COUNTRY_ID = b.COUNTRY_ID
											AND a.SIZE_CODE = d.SIZE_CODE 
                      AND a.PACKING_METHODE = d.PACKING_METHODE
	LEFT JOIN packing_plan_header e ON e.PACKPLAN_ID = a.PACKPLAN_ID
	LEFT JOIN item_list_size f ON e.PACKPLAN_BUYER = f.CUSTOMER_NAME AND a.SIZE_CODE = f.SIZE_CODE 
	LEFT JOIN packing_plan_sort_size g ON g.PACKPLAN_ID = a.PACKPLAN_ID AND g.SIZE_CODE = a.SIZE_CODE
	WHERE  ${stringQUery}
	GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE, a.SIZE_CODE 
) n 
LEFT JOIN packing_plan_box_row m ON m.ROWID = n.ROWID
ORDER BY n.COL_INDEX, n.BUYER_COLOR_CODE, n.SORT_NO`;
};

export const qrySumQtyPoBoxPrepack = (stringQUery) => {
  return `SELECT
	n.*,
	n.AFTER_SET_QTY/n.MIN_QTY AS QTY_PER_BOX,
	n.AFTER_SET_QTY AS TTL_QTY_BOX,
	n.MIN_QTY  AS  TTL_BOX,
  'GEN' AS ROW_TYPE
FROM (
	SELECT 
	CONCAT(a.PLAN_SEQUANCE_ID,'|',a.BUYER_COLOR_CODE) AS ROWID, b.COL_INDEX,
	a.PACKPLAN_ID, c.PRODUCT_ITEM_ID, c.PRODUCT_ITEM_CODE, a.BUYER_PO, 	a.BUYER_COLOR_CODE, b.BUYER_COLOR_NAME, 
   d.BOX_ID, d.BOX_CODE, b.SET_PAIR, f.SORT_TYPE,
   SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, -- tanpa set
   MIN(a.SHIPMENT_QTY) MIN_QTY,
	CASE WHEN b.SET_PAIR <> 0 THEN SUM(a.SHIPMENT_QTY)/b.SET_PAIR ELSE  SUM(a.SHIPMENT_QTY) END AS AFTER_SET_QTY -- set qty
	FROM packing_plan_detail a 
	LEFT JOIN packing_plan_po_sum b ON b.BUYER_PO = a.BUYER_PO AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE AND a.PLAN_SEQUANCE_ID = b.PLAN_SEQUANCE_ID
	LEFT JOIN order_po_listing c ON c.ORDER_PO_ID = a.ORDER_PO_ID
	LEFT JOIN pack_carton_style d ON d.ORDER_STYLE_DESCRIPTION = c.ORDER_STYLE_DESCRIPTION 
											AND d.COUNTRY_ID = b.COUNTRY_ID
                      AND a.PACKING_METHODE = d.PACKING_METHODE
	LEFT JOIN packing_plan_header e ON e.PACKPLAN_ID = a.PACKPLAN_ID
	LEFT JOIN item_buyer_size_sort f ON e.PACKPLAN_BUYER = f.BUYER
	WHERE ${stringQUery}
	GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE
	ORDER BY b.COL_INDEX, a.BUYER_COLOR_CODE
) n`;
};
// export const qrySumQtyPoBox = `SELECT
// 	n.*,
// 	m.QTY_PER_BOX,
// 	m.TTL_QTY_BOX,
// 	m.TTL_BOX,
// 	(n.SHIPMENT_QTY - m.TTL_QTY_BOX) AS BALANCE,
//   m.CTN_START,
//   m.CTN_END
// FROM (
// 	SELECT
// 	CONCAT(a.PACKPLAN_ID,';',a.BUYER_PO,';',a.BUYER_COLOR_CODE,';',a.SIZE_CODE) AS ROWID, b.COL_INDEX,
// 	a.PACKPLAN_ID, c.PRODUCT_ITEM_ID, c.PRODUCT_ITEM_CODE, a.BUYER_PO, 	a.BUYER_COLOR_CODE, b.BUYER_COLOR_NAME,
// 	 a.SIZE_CODE, d.BOX_CODE, SUM(a.SHIPMENT_QTY) SHIPMENT_QTY
// 	FROM packing_plan_detail a
// 	LEFT JOIN packing_plan_po_sum b ON b.BUYER_PO = a.BUYER_PO AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
// 	LEFT JOIN order_po_listing c ON c.ORDER_PO_ID = a.ORDER_PO_ID
// 	LEFT JOIN pack_box_style d ON d.PRODUCT_ITEM_ID = c.PRODUCT_ITEM_ID AND a.SIZE_CODE = d.SIZE_CODE
// 	WHERE a.PACKPLAN_ID = :ppid AND  b.ORDER_REFERENCE_PO_NO = :poNumber
// 	GROUP BY a.PACKPLAN_ID, a.BUYER_PO, a.BUYER_COLOR_CODE, a.SIZE_CODE
// 	ORDER BY b.COL_INDEX, a.BUYER_COLOR_CODE, a.SIZE_CODE
// ) n
// LEFT JOIN packing_plan_box_row m ON m.ROWID = n.ROWID`;

// Definisikan model Anda
export const PackingPlanBoxRow = db.define(
  "packing_plan_box_row",
  {
    ROWID: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    PACKPLAN_ID: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ROW_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    BOX_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ROW_INDEX: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    GW: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    NW: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // PRODUCT_ITEM_ID: {
    //   type: DataTypes.STRING(50),
    //   allowNull: true,
    // },
    // PRODUCT_ITEM_CODE: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true,
    // },
    PO_INDEX: { type: DataTypes.INTEGER },
    CTN_START: { type: DataTypes.INTEGER },
    CTN_END: { type: DataTypes.INTEGER },
    COL_INDEX: { type: DataTypes.INTEGER },
    ROW_INDEX: { type: DataTypes.INTEGER },
    SIZE_CODE: {
      type: DataTypes.STRING(50),
      // allowNull: false,
    },
    BUYER_PO: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    BUYER_COLOR_CODE: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    // BUYER_COLOR_NAME: {
    //   type: DataTypes.STRING(150),
    //   allowNull: true,
    // },
    BOX_CODE: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    PO_ITEM: { type: DataTypes.STRING },
    ARTICLE: { type: DataTypes.STRING },
    UPC_CODE: { type: DataTypes.STRING },
    SHIPMENT_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    AFTER_SET_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    QTY_PER_BOX: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TTL_QTY_BOX: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TTL_BOX: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    COMMIT_STATUS: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ADD_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    MOD_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);

export const PackPlanRowDetail = db.define(
  "pack_plan_row_detail",
  {
    ROWID: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
    },
    PACKPLAN_ID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    SIZE_CODE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    QTY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ADD_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
    MOD_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
    ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);

export const PackShipPlan = db.define(
  "packing_shipment_plan",
  {
    ID: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      autoIncrement: true,
    },
    SHIPMENT_ID: {
      type: DataTypes.STRING(50),
    },
    SHIPMENT_DATE: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    PACKPLAN_ID: {
      type: DataTypes.STRING(50),
    },
    ROWID: {
      type: DataTypes.STRING,
    },
    CONTAINER_ID: {
      type: DataTypes.INTEGER(20),
    },
    PACK_METHODE: {
      type: DataTypes.STRING,
    },
    TTL_CTN: {
      type: DataTypes.INTEGER,
    },
    CTN_START: {
      type: DataTypes.INTEGER,
    },
    CTN_END: {
      type: DataTypes.INTEGER,
    },
    CTN_MEAS: {
      type: DataTypes.STRING,
    },
    L: {
      type: DataTypes.STRING,
    },
    W: {
      type: DataTypes.STRING,
    },
    H: {
      type: DataTypes.STRING,
    },
    STYLE: {
      type: DataTypes.STRING,
    },
    PO_BUYER: {
      type: DataTypes.STRING,
    },
    PACK_UPC: {
      type: DataTypes.STRING,
    },
    ARTICLE: {
      type: DataTypes.STRING,
    },
    PO_ITEM: {
      type: DataTypes.STRING,
    },
    COLOR_CODE: {
      type: DataTypes.STRING,
    },
    COLOR_NAME: {
      type: DataTypes.STRING,
    },
    SIZE: {
      type: DataTypes.STRING,
    },
    QTY: {
      type: DataTypes.INTEGER,
    },
    PRINTED_STATUS: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

PackShipPlan.removeAttribute("id");

export const qryGetRowDtl = `SELECT a.ROWID, a.PACKPLAN_ID, a.ROW_TYPE, a.BOX_ID, a.CTN_START, a.CTN_END, a.PO_INDEX, a.COL_INDEX,
 a.ROW_INDEX, a.BUYER_PO, a.BUYER_COLOR_CODE, a.BOX_CODE, a.SIZE_CODE,    a.SHIPMENT_QTY,
 a.AFTER_SET_QTY, a.QTY_PER_BOX, a.TTL_QTY_BOX, a.TTL_BOX,
 c.LENGTH_CM, c.WIDTH_CM, c.HEIGHT_CM, c.WEIGHT,
 b.PRODUCT_ITEM_CODE, b.BUYER_COLOR_NAME , SUBSTRING_INDEX(a.ROWID, '|', 4) AS PLAN_SEQUANCE_ID,
 IFNULL(a.PO_ITEM,d.PO_ITEM) PO_ITEM, IFNULL(a.ARTICLE, d.ARTICLE) ARTICLE, IFNULL(d.UPC_CODE, a.UPC_CODE) UPC_CODE
 FROM 
packing_plan_box_row a 
LEFT JOIN packing_plan_po_sum b ON b.PACKPLAN_ID = a.PACKPLAN_ID 
		AND a.BUYER_PO = b.BUYER_PO 
		AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
      AND SUBSTRING_INDEX(a.ROWID, '|', 4) = b.PLAN_SEQUANCE_ID
LEFT JOIN item_carton_list c ON c.BOX_ID = a.BOX_ID
LEFT JOIN (
    SELECT 
    f.PO_NUMBER, f.PO_ITEM, f.ARTICLE_GENERIC, f.ARTICLE, f.COLOR_CODE, f.SIZE_CODE, f.UPC_CODE,  f.SEGMENT,
    CASE WHEN f.SEGMENT = 'OTH_E' THEN 'ECOM'
        WHEN f.ARTICLE_TYPE = 'PAC' THEN 'PREPACK'
    ELSE 'SOLID' END AS PACKING_METHODE
    FROM order_po_buyer f
    WHERE f.PO_NUMBER IN (
        SELECT DISTINCT c.BUYER_PO FROM  packing_plan_box_row c WHERE c.PACKPLAN_ID = :ppid
    ) GROUP BY f.PO_NUMBER, f.ARTICLE_GENERIC,  f.COLOR_CODE, f.SIZE_CODE -- , f.PO_ITEM
) d ON d.PO_NUMBER = a.BUYER_PO AND a.BUYER_COLOR_CODE = d.COLOR_CODE AND a.SIZE_CODE = d.SIZE_CODE AND b.PACKING_METHODE = d.PACKING_METHODE AND
FIND_IN_SET( LEFT(d.ARTICLE_GENERIC,6), LEFT(b.PRODUCT_ITEM_CODE, 6)) > 0
WHERE a.PACKPLAN_ID = :ppid
ORDER BY b.ADD_TIME, a.BUYER_PO, a.COL_INDEX, a.ROW_INDEX, a.CTN_START`;
// export const qryGetRowDtl = `SELECT a.*,
//  c.LENGTH_CM, c.WIDTH_CM, c.HEIGHT_CM, c.WEIGHT,
//  b.PRODUCT_ITEM_CODE, b.BUYER_COLOR_NAME , SUBSTRING_INDEX(a.ROWID, '|', 4) AS PLAN_SEQUANCE_ID
//  FROM
// packing_plan_box_row a
// LEFT JOIN packing_plan_po_sum b ON b.PACKPLAN_ID = a.PACKPLAN_ID
// 		AND a.BUYER_PO = b.BUYER_PO
// 		AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
//       AND SUBSTRING_INDEX(a.ROWID, '|', 4) = b.PLAN_SEQUANCE_ID
// LEFT JOIN item_carton_list c ON c.BOX_ID = a.BOX_ID
// WHERE a.PACKPLAN_ID = :ppid
// ORDER BY b.ADD_TIME, a.BUYER_PO, a.COL_INDEX, a.ROW_INDEX, a.CTN_START
// `;

export const qryGetRowDtlOne = `SELECT a.ROWID, a.PACKPLAN_ID, a.ROW_TYPE, a.BOX_ID, a.CTN_START, a.CTN_END, a.PO_INDEX, a.COL_INDEX,
 a.ROW_INDEX, a.BUYER_PO, a.BUYER_COLOR_CODE, a.BOX_CODE, a.SIZE_CODE,    a.SHIPMENT_QTY,
 a.AFTER_SET_QTY, a.QTY_PER_BOX, a.TTL_QTY_BOX, a.TTL_BOX,
 c.LENGTH_CM, c.WIDTH_CM, c.HEIGHT_CM, c.WEIGHT,
 b.PRODUCT_ITEM_CODE, b.BUYER_COLOR_NAME , SUBSTRING_INDEX(a.ROWID, '|', 4) AS PLAN_SEQUANCE_ID,
 IFNULL(a.PO_ITEM,d.PO_ITEM) PO_ITEM, IFNULL(a.ARTICLE, d.ARTICLE) ARTICLE, IFNULL(d.UPC_CODE, a.UPC_CODE) UPC_CODE
 FROM 
packing_plan_box_row a 
LEFT JOIN packing_plan_po_sum b ON b.PACKPLAN_ID = a.PACKPLAN_ID 
		AND a.BUYER_PO = b.BUYER_PO 
		AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
      AND SUBSTRING_INDEX(a.ROWID, '|', 4) = b.PLAN_SEQUANCE_ID
LEFT JOIN item_carton_list c ON c.BOX_ID = a.BOX_ID
LEFT JOIN (
		SELECT 
		f.PO_NUMBER, f.PO_ITEM, f.ARTICLE_GENERIC, f.ARTICLE, f.COLOR_CODE, f.SIZE_CODE, f.UPC_CODE
		FROM order_po_buyer f
		WHERE f.PO_NUMBER IN (
				SELECT DISTINCT c.BUYER_PO FROM  packing_plan_box_row c WHERE c.PACKPLAN_ID =  ROWID = :rowId
		) GROUP BY f.PO_NUMBER, f.ARTICLE_GENERIC, f.PO_ITEM, f.COLOR_CODE, f.SIZE_CODE
) d ON d.PO_NUMBER = a.BUYER_PO AND a.BUYER_COLOR_CODE = d.COLOR_CODE AND a.SIZE_CODE = d.SIZE_CODE AND 
FIND_IN_SET( LEFT(d.ARTICLE_GENERIC,6), LEFT(b.PRODUCT_ITEM_CODE, 6)) > 0
WHERE a.ROWID = :rowId
ORDER BY b.ADD_TIME, a.BUYER_PO, a.COL_INDEX, a.ROW_INDEX, a.CTN_START
`;

export const qryQtySizeRowDtl = `SELECT a.ROWID, a.PACKPLAN_ID, a.SIZE_CODE, a.QTY , (a.QTY*b.TTL_BOX) TTL_QTY
FROM pack_plan_row_detail a 
LEFT JOIN packing_plan_box_row  b ON a.ROWID = b.ROWID
WHERE a.PACKPLAN_ID = :ppid`;

export const qryGetRowColQty = `SELECT 
a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID,  a.BUYER_PO,  b.ORDER_STYLE_DESCRIPTION,	a.BUYER_COLOR_CODE, 
 a.SIZE_CODE,
 CASE WHEN b.SET_PAIR <> 0 THEN SUM(a.SHIPMENT_QTY)/b.SET_PAIR ELSE  SUM(a.SHIPMENT_QTY) END AS AFTER_SET_QTY -- set qty
FROM packing_plan_detail a 
LEFT JOIN packing_plan_po_sum b ON b.BUYER_PO = a.BUYER_PO AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE AND a.PLAN_SEQUANCE_ID = b.PLAN_SEQUANCE_ID
WHERE a.PACKPLAN_ID = :ppid -- AND  b.ORDER_REFERENCE_PO_NO = :poNumber
GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE, a.SIZE_CODE `;

export const qrySumNewQtyRow = `SELECT SUM(a.QTY) QTY FROM pack_plan_row_detail a WHERE a.ROWID = :rowId`;

export const qryGetRowIdAndIndex = `SELECT
    J.PACKPLAN_ID,
		J.PLAN_SEQUANCE_ID,
    J.BUYER_PO,
		J.BUYER_COLOR_CODE,
    J.BUYER_COLOR_NAME,
		J.PRODUCT_ITEM_CODE,
		CONCAT(J.PLAN_SEQUANCE_ID,'|',J.BUYER_COLOR_CODE, '|',ROW_INDEX) AS ROWID,
    0 CTN_START, -- Untuk Front End
    0 CTN_END, -- Untuk Front End
    0 TTL_BOX, -- Untuk Front End
		0 SHIPMENT_QTY,  -- Untuk Front End subtotal
		0 TTL_QTY_BOX, -- Untuk Front End subtotal
		CAST(J.SHIPMENT_QTY-J.TTL_QTY_BOX AS UNSIGNED) AS BALANCE,
    'MNL' ROW_TYPE,
		J.COL_INDEX,
		J.ROW_INDEX
FROM (
	SELECT 
		N.PLAN_SEQUANCE_ID,
		N.BUYER_COLOR_CODE,
		N.BUYER_PO,
		N.PACKPLAN_ID,
    N.BUYER_COLOR_NAME,
		N.PRODUCT_ITEM_CODE,
		CASE WHEN N.PAIR_QTY THEN N.PAIR_QTY ELSE  N.SHIPMENT_QTY END AS SHIPMENT_QTY,
		IFNULL(SUM(M.TTL_QTY_BOX), 0) AS TTL_QTY_BOX,
		N.COL_INDEX,
		COUNT(M.ROWID)+1 AS ROW_INDEX
	FROM packing_plan_po_sum N 
	LEFT JOIN  (
		SELECT 
			a.ROWID,
			SUBSTRING_INDEX(a.ROWID,'|',4) AS PLAN_SEQUANCE_ID,
			-- SUBSTRING_INDEX(a.ROWID,'|',5) AS PLAN_SEQUANCE_COLOR, 
			SUBSTRING_INDEX(SUBSTRING_INDEX(a.ROWID,'|',5),'|',-1) AS BUYER_COLOR_CODE,
			a.PACKPLAN_ID, a.ROW_TYPE, a.COL_INDEX, a.ROW_INDEX, a.TTL_QTY_BOX
		 	FROM packing_plan_box_row a WHERE a.ROWID LIKE :rowColor -- 'PPID2024000005|2|2|SOLID|100%'
	) M ON N.PLAN_SEQUANCE_ID = M.PLAN_SEQUANCE_ID
	 AND N.BUYER_COLOR_CODE = M.BUYER_COLOR_CODE
	WHERE N.PLAN_SEQUANCE_ID  = :seqId
	AND N.BUYER_COLOR_CODE  = :colorCode
) J`;

//shipment scan
export const queryShipPlanScan = `SELECT
 a.*, b.SCAN_RESULT, (a.TTL_CTN - IFNULL(b.SCAN_RESULT, 0)) BALANCE_SCAN
FROM packing_shipment_plan a 
LEFT JOIN (
	SELECT 
		c.SHIPMENT_PLAN_ID, c.SHIPMENT_ID, c.PO_ITEM, c.CONTAINER_ID, c.UPC, IFNULL(SUM(c.SCAN_QTY),0) AS SCAN_RESULT
	FROM packing_shipment_scan c WHERE c.SHIPMENT_ID = :sid AND c.CONTAINER_ID = :conId
	GROUP BY c.SHIPMENT_PLAN_ID, c.SHIPMENT_ID, c.PO_ITEM, c.CONTAINER_ID, c.UPC
) b ON b.SHIPMENT_ID = a.SHIPMENT_ID 
	AND a.PACK_UPC = b.UPC 
	AND a.PO_ITEM = b.PO_ITEM
	AND a.CONTAINER_ID = b.CONTAINER_ID
  AND a.PO_ITEM =  b.PO_ITEM
  AND a.ID =  b.SHIPMENT_PLAN_ID
WHERE a.SHIPMENT_ID = :sid AND a.CONTAINER_ID = :conId`;

export const qryTtlCtnClp = `SELECT SUM(COALESCE(a.SCAN_QTY, 0)) AS TTL_SCAN FROM packing_shipment_scan a WHERE a.SHIPMENT_ID = :sid AND a.CONTAINER_ID = :conId`;

export const PackingShipContainer = db.define(
  "packing_ship_container",
  {
    CONTAINER_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    SHIPMENT_ID: { type: DataTypes.INTEGER },
    CONTAINER_SEQ: { type: DataTypes.INTEGER },
    CONTAINER_NO: { type: DataTypes.STRING },
    CONTAINER_TYPE: { type: DataTypes.STRING },
    USER_ADD: { type: DataTypes.STRING },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);

//shipment scan detail result
export const queryShipPlanScanResult = `SELECT 
	a.*, b.PACK_METHODE, b.PO_BUYER, b.STYLE, b.COLOR_NAME, b.SIZE, b.CONTAINER_ID, d.CONTAINER_SEQ,  c.USER_NAME
FROM packing_shipment_scan a 
LEFT JOIN packing_shipment_plan b 
	ON b.SHIPMENT_ID = a.SHIPMENT_ID 
	AND b.PACK_UPC = a.UPC 
	AND a.PO_ITEM = b.PO_ITEM 
	AND a.CONTAINER_ID = b.CONTAINER_ID
LEFT JOIN xref_user_web c ON c.USER_ID = a.USER_ADD 
LEFT JOIN packing_ship_container d ON d.CONTAINER_ID = a.CONTAINER_ID
WHERE a.SHIPMENT_ID =  :sid AND a.CONTAINER_ID = :conId
ORDER BY a.ADD_TIME DESC LIMIT 2`;

export const querRefSid = `SELECT DISTINCT a.SHIPMENT_ID
FROM packing_shipment_plan a WHERE a.SHIPMENT_ID LIKE :sid `;

export const qryLabelResult = `SELECT a.UNIK_CODE, a.ROWID, a.CTN_NO, a.CTN_OF,
b.SHIPMENT_ID,
b.SHIPMENT_DATE,
b.PACKPLAN_ID,
b.PACK_METHODE,
b.CONTAINER_ID,
b.L, b.W, b.H,
b.STYLE,
b.PO_BUYER,
b.PO_ITEM,
b.PACK_UPC,
b.ARTICLE,
b.COLOR_CODE,
b.COLOR_NAME,
b.SIZE,
b.QTY,
b.TTL_CTN,
b.QTY/b.TTL_CTN PCS_PER_CTN
FROM packing_ship_carton_label a 
LEFT JOIN packing_shipment_plan b ON b.ROWID = a.ROWID
WHERE a.ROWID = :rowId`;

export const queryGetTlOfCtn = `SELECT
 SUM(a.TTL_CTN) NO_OF_CTN
FROM packing_shipment_plan a 
WHERE a.SHIPMENT_ID = :SHIPMENT_ID AND a.PO_BUYER = :PO_BUYER AND a.COLOR_CODE = :COLOR_CODE AND a.CONTAINER_ID = :CONTAINER_ID`;

export const queryContainerList = `SELECT DISTINCT a.SHIPMENT_ID, a.CONTAINER_ID, a.CONTAINER_NO, a.CONTAINER_SEQ, a.CONTAINER_TYPE
FROM packing_ship_container a WHERE a.SHIPMENT_ID = :sid `;

export const PackingShipScan = db.define(
  "packing_shipment_scan",
  {
    SHIPMENT_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SHIPMENT_PLAN_ID: { type: DataTypes.INTEGER },
    UPC: { type: DataTypes.STRING },
    PO_ITEM: { type: DataTypes.STRING },
    PO_NUMBER: { type: DataTypes.STRING },
    CONTAINER_ID: { type: DataTypes.INTEGER },
    SCAN_QTY: { type: DataTypes.INTEGER },
    USER_ADD: { type: DataTypes.STRING },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: false,
  }
);

PackingShipScan.removeAttribute("id");

export const PackCtnLabel = db.define(
  "packing_ship_carton_label",
  {
    ROWID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    UNIK_CODE: { type: DataTypes.STRING },
    CTN_NO: { type: DataTypes.INTEGER },
    CTN_OF: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

PackCtnLabel.removeAttribute("id");

export const PackSortSize = db.define(
  "packing_plan_sort_size",
  {
    PACKPLAN_ID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SIZE_CODE: { type: DataTypes.STRING },
    TYPE: { type: DataTypes.STRING },
    SORT_NO: { type: DataTypes.INTEGER },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

PackSortSize.removeAttribute("id");

export const qryCheckPoItem = `SELECT a.PACK_UPC, a.PO_ITEM FROM packing_shipment_plan a WHERE a.PACK_UPC = :upc AND a.CONTAINER_ID = :conId AND a.PO_BUYER = :po`;

// export const checkBlcShipScan = `SELECT
//  a.SHIPMENT_ID, a.PO_BUYER, a.PO_ITEM, a.PACK_METHODE,  a.CTN_MEAS, a.STYLE, a.COLOR_CODE,
//  a.TTL_CTN, IFNULL(b.SCAN_RESULT, 0) SCAN_RESULT, (a.TTL_CTN - IFNULL(b.SCAN_RESULT, 0)) BALANCE_SCAN
// FROM packing_shipment_plan a
// LEFT JOIN (
// 	SELECT
// 		c.SHIPMENT_PLAN_ID, c.SHIPMENT_ID,  c.PO_ITEM, c.CONTAINER_ID, c.UPC,  COUNT(c.UPC) SCAN_RESULT
// 	FROM packing_shipment_scan c
// 	WHERE c.SHIPMENT_PLAN_ID = :id
//     AND c.UPC = :upc
//   -- ADN  c.PO_ITEM = :poItem
// 	GROUP BY c.SHIPMENT_ID, c.PO_ITEM, c.CONTAINER_ID, c.UPC,  c.PO_ITEM
// ) b ON b.SHIPMENT_ID = a.SHIPMENT_ID
// 	AND a.PACK_UPC = b.UPC
// 	AND a.PO_ITEM = b.PO_ITEM
// 	AND a.CONTAINER_ID = b.CONTAINER_ID
// 	AND a.ID = b.SHIPMENT_PLAN_ID
// WHERE a.ID = :id
//   AND a.PACK_UPC = :upc `;

export const qryGetLisCtnStylBoxByr = `SELECT DISTINCT a.BOX_ID, b.BOX_NAME, b.BOX_CODE, b.LWH_UOM, b.LENGTH, b.WIDTH, b.HEIGHT, a.ORDER_STYLE_DESCRIPTION, a.PACKING_METHODE
FROM pack_carton_style a
LEFT JOIN item_carton_list b ON b.BOX_ID = a.BOX_ID  
WHERE a.BUYER_CODE = :buyer
GROUP BY a.BOX_ID, b.BOX_NAME, b.BOX_CODE, b.LWH_UOM, b.LENGTH, b.WIDTH, b.HEIGHT, a.ORDER_STYLE_DESCRIPTION, a.PACKING_METHODE`;

///report monitoring shipment my date
export const qryShipmentMonitoring = `SELECT n.*, n.TTL_CTN-TTL_RESULT BALANCE, ROUND(n.TTL_RESULT/n.TTL_CTN*100,2) AS PERCENT_RESULT
FROM (
	SELECT a.SHIPMENT_ID, a.CONTAINER_ID, b.CONTAINER_NO, b.CONTAINER_TYPE, SUM(a.TTL_CTN) TTL_CTN, IFNULL(d.TTL_RESULT,0) TTL_RESULT
	FROM  packing_shipment_plan  a 
	LEFT JOIN packing_ship_container b ON b.CONTAINER_ID = a.CONTAINER_ID
	LEFT JOIN (
		SELECT a.SHIPMENT_ID, a.CONTAINER_ID, SUM(a.SCAN_QTY) TTL_RESULT
		FROM packing_shipment_scan a 
		WHERE a.SHIPMENT_ID IN (
				SELECT DISTINCT c.SHIPMENT_ID FROM  packing_shipment_plan  c WHERE c.SHIPMENT_DATE = :shipDate 
			)
		GROUP BY a.SHIPMENT_ID, a.CONTAINER_ID
	) d ON d.SHIPMENT_ID = a.SHIPMENT_ID AND a.CONTAINER_ID = d.CONTAINER_ID
	WHERE a.SHIPMENT_DATE = :shipDate
	GROUP BY a.SHIPMENT_ID, a.CONTAINER_ID
) n`;

//get list SID by year
export const qryGetSidByYear = `SELECT 
a.SHIPMENT_ID, 
a.SHIPMENT_DATE,
a.BUYER,
COUNT(b.CONTAINER_ID) COUNT_CLP
FROM packing_shipment_header a 
LEFT JOIN packing_ship_container b ON a.SHIPMENT_ID = b.SHIPMENT_ID
WHERE YEAR(a.SHIPMENT_DATE) = :year
GROUP BY a.SHIPMENT_ID 
order BY a.ADD_TIME DESC`;

//shipment scan
export const queryShipPlanLoad = `SELECT
 a.*,  
  e.CONTAINER_NO,
  b.SCAN_RESULT, 
  (a.TTL_CTN - IFNULL(b.SCAN_RESULT, 0)) BALANCE_SCAN
FROM packing_shipment_plan a 
LEFT JOIN (
	SELECT 
		c.SHIPMENT_PLAN_ID, c.SHIPMENT_ID, c.PO_ITEM, c.CONTAINER_ID, c.UPC, IFNULL(SUM(c.SCAN_QTY),0) AS SCAN_RESULT
	FROM packing_shipment_scan c WHERE c.SHIPMENT_ID = :sid  
	GROUP BY c.SHIPMENT_PLAN_ID, c.SHIPMENT_ID, c.PO_ITEM, c.CONTAINER_ID, c.UPC
) b ON b.SHIPMENT_ID = a.SHIPMENT_ID 
	AND a.PACK_UPC = b.UPC 
	AND a.PO_ITEM = b.PO_ITEM
	AND a.CONTAINER_ID = b.CONTAINER_ID
  AND a.PO_ITEM =  b.PO_ITEM
  AND a.ID =  b.SHIPMENT_PLAN_ID
LEFT JOIN packing_ship_container e ON e.CONTAINER_ID = a.CONTAINER_ID
WHERE a.SHIPMENT_ID = :sid`;

export const qryGetNewSid = `SELECT CAST(SUBSTRING(a.SHIPMENT_ID,8) AS INTEGER)+1 LAST_ID, YEAR(a.SHIPMENT_DATE) LAST_YEAR 
FROM packing_shipment_header a 
WHERE YEAR(a.SHIPMENT_DATE) = YEAR(:shipDate)
ORDER BY a.ADD_TIME DESC
LIMIT 1`;

export const PackShipHeader = db.define(
  "packing_shipment_header",
  {
    SHIPMENT_ID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    SHIPMENT_DATE: { type: DataTypes.DATE },
    BUYER: { type: DataTypes.STRING },
    ADD_ID: { type: DataTypes.INTEGER },
    ADD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: false,
  }
);
