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
a.PACKPLAN_EX_FACTORY, a.PACKPLAN_ACD, a.PACKPLAN_SBD, a.PACKPLAN_ADD_ID, b.USER_INISIAL, a.PACKPLAN_COUNTRY, a.PACKPLAN_DELIVERY_MODE
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

export const qryPackPoIdPoBuyer = `SELECT 
  a.PRODUCT_ITEM_CODE,
  a.CUSTOMER_NAME, a.CUSTOMER_DIVISION, a.PO_REF_CODE, a.DELIVERY_LOCATION_NAME,
  a.ORDER_NO, a.ORDER_REFERENCE_PO_NO, a.ITEM_COLOR_CODE, a.ORDER_PO_ID, a.ITEM_COLOR_NAME,
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
-- n.PRODUCT_ITEM_CODE,
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
    n.PACKPLAN_ID, n.PLAN_SEQUANCE_ID, n.BUYER_PO, n.ORDER_REFERENCE_PO_NO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,  n.PRODUCT_ITEM_ID, n.PRODUCT_ITEM_CODE,
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

export const qryListSumPo = `SELECT 
    n.PACKPLAN_ID, n.PLAN_SEQUANCE_ID, n.BUYER_PO, n.ORDER_REFERENCE_PO_NO, n.BUYER_COLOR_CODE, n.BUYER_COLOR_NAME,  n.PRODUCT_ITEM_ID, n.PRODUCT_ITEM_CODE,
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
ORDER BY m.COL_INDEX`;
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

export const qryGetLisPOPPID = `SELECT a.PACKPLAN_ID, a.BUYER_PO, a.SEQ_NO, a.COUNTRY_ID, a.PACKING_METHODE, b.COUNTRY_CODE, b.COUNTRY_NAME,
CONCAT(a.PACKPLAN_ID, '|', a.SEQ_NO,  '|',   b.COUNTRY_ID, '|', a.PACKING_METHODE ) AS PLAN_SEQUANCE_ID
FROM packing_plan_child a 
LEFT JOIN item_country b ON a.COUNTRY_ID = b.COUNTRY_ID
WHERE a.PACKPLAN_ID = :ppid
ORDER BY a.SEQ_NO`;

export const qryGetLisSizePPID = `SELECT DISTINCT a.SIZE_CODE, c.SORT_TYPE FROM packing_plan_detail a 
	LEFT JOIN packing_plan_header b ON b.PACKPLAN_ID = a.PACKPLAN_ID
	LEFT JOIN item_buyer_size_sort c ON b.PACKPLAN_BUYER = c.BUYER
WHERE a.PACKPLAN_ID = :ppid`;
export const qryGetLisColorPPID = `SELECT DISTINCT a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.ORDER_REFERENCE_PO_NO, a.BUYER_COLOR_CODE, a.COL_INDEX, a.SHIPMENT_QTY
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

export const qrySumQtyPoBox = `SELECT 
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
	a.PACKPLAN_ID, c.PRODUCT_ITEM_ID, c.PRODUCT_ITEM_CODE, a.BUYER_PO, 	a.BUYER_COLOR_CODE, b.BUYER_COLOR_NAME, 
	 a.SIZE_CODE, d.BOX_ID, d.BOX_CODE, b.SET_PAIR, f.SORT_TYPE,
  SUM(a.SHIPMENT_QTY) SHIPMENT_QTY, -- tanpa set
	CASE WHEN b.SET_PAIR <> 0 THEN SUM(a.SHIPMENT_QTY)/b.SET_PAIR ELSE  SUM(a.SHIPMENT_QTY) END AS AFTER_SET_QTY -- set qty
	FROM packing_plan_detail a 
	LEFT JOIN packing_plan_po_sum b ON b.BUYER_PO = a.BUYER_PO AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE AND a.PLAN_SEQUANCE_ID = b.PLAN_SEQUANCE_ID
	LEFT JOIN order_po_listing c ON c.ORDER_PO_ID = a.ORDER_PO_ID
	LEFT JOIN pack_box_style d ON d.PRODUCT_ITEM_ID = c.PRODUCT_ITEM_ID AND a.SIZE_CODE = d.SIZE_CODE
	LEFT JOIN packing_plan_header e ON e.PACKPLAN_ID = a.PACKPLAN_ID
	LEFT JOIN item_buyer_size_sort f ON e.PACKPLAN_BUYER = f.BUYER
	WHERE a.PLAN_SEQUANCE_ID = :seqPpid
	GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE, a.SIZE_CODE 
	ORDER BY b.COL_INDEX, a.BUYER_COLOR_CODE, a.SIZE_CODE
) n 
LEFT JOIN packing_plan_box_row m ON m.ROWID = n.ROWID`;

export const qrySumQtyPoBoxPrepack = `SELECT
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
	LEFT JOIN pack_box_style d ON d.PRODUCT_ITEM_ID = c.PRODUCT_ITEM_ID AND d.TYPE_PACK = 'PREPACK'
	LEFT JOIN packing_plan_header e ON e.PACKPLAN_ID = a.PACKPLAN_ID
	LEFT JOIN item_buyer_size_sort f ON e.PACKPLAN_BUYER = f.BUYER
	WHERE a.PLAN_SEQUANCE_ID = :seqPpid
	GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE
	ORDER BY b.COL_INDEX, a.BUYER_COLOR_CODE
) n `;
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
    SIZE_CODE: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
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

export const qryGetRowDtl = `SELECT a.*, b.PRODUCT_ITEM_CODE, b.BUYER_COLOR_NAME , SUBSTRING_INDEX(a.ROWID, '|', 4) AS PLAN_SEQUANCE_ID
 FROM 
packing_plan_box_row a 
LEFT JOIN packing_plan_po_sum b ON b.PACKPLAN_ID = a.PACKPLAN_ID 
		AND a.BUYER_PO = b.BUYER_PO 
		AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
    AND SUBSTRING_INDEX(a.ROWID, '|', 4) = b.PLAN_SEQUANCE_ID
WHERE a.PACKPLAN_ID = :ppid
ORDER BY b.ADD_TIME, a.BUYER_PO, a.COL_INDEX, a.ROW_INDEX, a.CTN_START
`;

export const qryGetRowDtlOne = `SELECT a.*, b.PLAN_SEQUANCE_ID, b.PRODUCT_ITEM_CODE, b.BUYER_COLOR_NAME FROM 
packing_plan_box_row a 
LEFT JOIN packing_plan_po_sum b ON b.PACKPLAN_ID = a.PACKPLAN_ID 
		AND a.BUYER_PO = b.BUYER_PO 
		AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE
    AND SUBSTRING_INDEX(a.ROWID, '|', 4) = b.PLAN_SEQUANCE_ID
WHERE a.ROWID = :rowId
ORDER BY b.ADD_TIME, a.BUYER_PO, a.COL_INDEX, a.CTN_START
`;

export const qryQtySizeRowDtl = `SELECT a.ROWID, a.PACKPLAN_ID, a.SIZE_CODE, a.QTY , (a.QTY*b.TTL_BOX) TTL_QTY
FROM pack_plan_row_detail a 
LEFT JOIN packing_plan_box_row  b ON a.ROWID = b.ROWID
WHERE a.PACKPLAN_ID = :ppid`;

export const qryGetRowColQty = `SELECT 
a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID,  a.BUYER_PO, 	a.BUYER_COLOR_CODE, 
 a.SIZE_CODE,
 CASE WHEN b.SET_PAIR <> 0 THEN SUM(a.SHIPMENT_QTY)/b.SET_PAIR ELSE  SUM(a.SHIPMENT_QTY) END AS AFTER_SET_QTY -- set qty
FROM packing_plan_detail a 
LEFT JOIN packing_plan_po_sum b ON b.BUYER_PO = a.BUYER_PO AND a.BUYER_COLOR_CODE = b.BUYER_COLOR_CODE AND a.PLAN_SEQUANCE_ID = b.PLAN_SEQUANCE_ID
WHERE a.PACKPLAN_ID = :ppid -- AND  b.ORDER_REFERENCE_PO_NO = :poNumber
GROUP BY a.PACKPLAN_ID, a.PLAN_SEQUANCE_ID, a.BUYER_PO, a.BUYER_COLOR_CODE, a.SIZE_CODE `;

export const qrySumNewQtyRow = `SELECT SUM(a.QTY) QTY FROM pack_plan_row_detail a WHERE a.ROWID = :rowId`;
