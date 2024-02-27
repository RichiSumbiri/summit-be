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

export const queryGetSytleByBuyer = `	SELECT DISTINCT a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.PRODUCT_ITEM_ID, a.PRODUCT_TYPE,
a.PRODUCT_ITEM_CODE, a.PRODUCT_ITEM_DESCRIPTION
FROM order_po_listing a
WHERE a.CUSTOMER_NAME = :byr 
GROUP BY  a.PRODUCT_ITEM_ID`;

export const CartonBox = db.define(
  "item_carton_list",
  {
    BOX_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BUYER_CODE: { type: DataTypes.STRING },
    BOX_CODE: { type: DataTypes.STRING },
    LWH_UOM: { type: DataTypes.STRING },
    LENGTH: { type: DataTypes.DECIMAL },
    WIDTH: { type: DataTypes.DECIMAL },
    HEIGHT: { type: DataTypes.DECIMAL },
    WEIGHT: { type: DataTypes.DECIMAL },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

export const getSizeCodeByStyleId = `SELECT DISTINCT a.SIZE_CODE
FROM order_po_listing_size a
WHERE a.PRODUCT_ITEM_ID = :prodItemCode
GROUP BY a.PRODUCT_ITEM_ID,  a.SIZE_CODE`;

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
    PACKPLAN_METHOD: { type: DataTypes.STRING },
    PACKPLAN_COUNTRY: { type: DataTypes.STRING },
    PACKPLAN_LOCATION: { type: DataTypes.STRING },
    PACKPLAN_QTY: { type: DataTypes.INTEGER },
    PACKPLAN_EX_FACTORY: { type: DataTypes.DATE },
    PACKPLAN_ACD: { type: DataTypes.DATE },
    PACKPLAN_SBD: { type: DataTypes.DATE },
    PACKPLAN_ADD_ID: { type: DataTypes.INTEGER },
    PACKPLAN_MOD_ID: { type: DataTypes.INTEGER },
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

export const qryGetCusDivision = `SELECT DISTINCT a.CUSTOMER_NAME, a.CUSTOMER_DIVISION
FROM order_po_listing  a 
WHERE a.CUSTOMER_NAME = :customer`;

export const qryGetPackMethod = `SELECT DISTINCT c.CUSTOMER_NAME, c.PACKING_METHOD
FROM order_po_listing  c 
WHERE c.CUSTOMER_NAME = :customer`;

export const qryGetCustLoaction = `SELECT DISTINCT  d.DELIVERY_LOCATION_ID, d.DELIVERY_LOCATION_NAME, d.COUNTRY
FROM order_po_listing  d 
WHERE d.CUSTOMER_NAME = :customer
ORDER BY d.DELIVERY_LOCATION_ID`;

export const qryGetPackHeader = `SELECT a.PACKPLAN_ID, a.PACKPLAN_BUYER, a.PACKPLAN_BUYER_DIVISION, a.PACKPLAN_METHOD, a.PACKPLAN_LOCATION,
a.PACKPLAN_EX_FACTORY, a.PACKPLAN_ACD, a.PACKPLAN_SBD, a.PACKPLAN_ADD_ID, b.USER_INISIAL, a.PACKPLAN_COUNTRY
FROM packing_plan_header a 
LEFT JOIN xref_user_web b ON a.PACKPLAN_ADD_ID = b.USER_ID
WHERE a.PACKPLAN_BUYER = :customer AND a.PACKPLAN_EX_FACTORY BETWEEN :startDate AND :endDate 
ORDER BY a.createdAt`;
