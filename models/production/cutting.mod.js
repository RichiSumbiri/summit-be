import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ScanCutting = db.define(
  "order_scan_log",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CUTTING_SCANTIME: {
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

export const GenerateQR = db.define(
  "order_qr_generate",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    BUNDLE_SEQUENCE: {
      type: DataTypes.INTEGER(100),
      allowNull: false,
    },
    SITE_LINE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    CREATE_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CREATE_BY: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
    },
    UPDATE_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UPDATE_BY: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
  }
);

GenerateQR.removeAttribute("id");
ScanCutting.removeAttribute("id");

export const OrderDetailList = `SELECT * FROM vieworderdetaillist WHERE UPLOAD_DATE BETWEEN :startDate AND :endDate`;

export const SelectOrderNo = `SELECT DISTINCT 
a.BUYER_CODE, a.ORDER_NO, a.PRODUCT_TYPE, a.BUYER_PO, a.MO_NO, a.ORDER_VERSION, a.SHIPMENT_DATE,
a.ORDER_QTY, a.ORDER_SIZE, a.ORDER_STYLE, a.BARCODE_SERIAL, a.SITE_LINE, b.ITEM_COLOR_NAME, SUBSTRING_INDEX(b.ORDER_REFERENCE_PO_NO, ' ', 1) ORDER_REF, b.COUNTRY
FROM order_detail a 
LEFT JOIN (
	SELECT * FROM order_po_listing c WHERE c.ORDER_NO = :orderNo
	) b ON b.MO_NO = a.MO_NO
WHERE a.ORDER_NO = :orderNo ORDER BY  a.ORDER_SIZE, a.BARCODE_SERIAL`;

export const CuttingWorkdoneByDate = `SELECT * FROM ViewWorkdoneCutting WHERE ScanDate BETWEEN :startDate AND :endDate`;

export const CuttinScanSewingIn = db.define(
  "scan_sewing_in",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
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

export const QryCutScanInWithSize = `SELECT a.SCH_ID, a.SCHD_ID, b.ORDER_QTY, b.BUYER_CODE, b.SITE_LINE SITE_LINE_FX, g.SCHD_SITE SITE_NAME, e.LINE_NAME,
b.ORDER_NO, a.BARCODE_SERIAL, b.ORDER_SIZE, b.ORDER_QTY, f.BUNDLE_SEQUENCE 
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
LEFT JOIN weekly_prod_sch_detail g ON a.SCHD_ID = g.SCHD_ID
LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
LEFT JOIN order_qr_generate f ON f.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE a.BARCODE_SERIAL = :qrcode `;

export const QueryCheckQcOut = `SELECT a.ENDLINE_SCHD_DATE, a.PLANSIZE_ID, a.ENDLINE_PLAN_SIZE, a.ENDLINE_SCHD_ID, a.ENDLINE_ACT_SCHD_ID
FROM qc_endline_output a
WHERE a.ENDLINE_PLAN_SIZE = :sizeCode 
AND  a.ENDLINE_SCHD_ID = :schdId`;

export const QryListBoxReturn = `SELECT a.SEWING_SCAN_TIME, a.BARCODE_SERIAL, d.BUNDLE_SEQUENCE, a.SEWING_SCAN_LOCATION, a.SCHD_ID, a.PLANSIZE_ID, 
b.SCHD_ID_SITELINE, f.LINE_NAME, 
c.ORDER_NO, SUBSTRING_INDEX(c.MO_NO,',',-1) MO_NO, e.ORDER_REFERENCE_PO_NO, e.ORDER_STYLE_DESCRIPTION,
e.ITEM_COLOR_NAME, a.CONFIRM_RETURN_BY, a.SEWING_RETURN_BY, a.CONFIRM_STATUS, a.CONFRIM_DATE
FROM scan_sewing_return a 
LEFT JOIN weekly_prod_sch_detail b ON a.SCHD_ID = b.SCHD_ID 
LEFT JOIN order_detail c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN order_qr_generate d ON d.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN  order_po_listing e ON e.ORDER_NO = c.ORDER_NO AND e.MO_NO =  SUBSTRING_INDEX(c.MO_NO,',',-1) 
AND e.ORDER_PO_ID = SUBSTRING_INDEX(c.BUYER_PO,',',-1) -- jika MO ada 2 ambil mo terakir
LEFT JOIN item_siteline f ON b.SCHD_ID_SITELINE = f.ID_SITELINE 
WHERE a.SEWING_SCAN_LOCATION LIKE :sitename AND date(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate AND a.CONFIRM_STATUS LIKE '%%' `;

export const QryListBoxReturnConf = `SELECT a.SEWING_SCAN_TIME, a.BARCODE_SERIAL, d.BUNDLE_SEQUENCE, a.SEWING_SCAN_LOCATION, a.SCHD_ID, a.PLANSIZE_ID, 
b.SCHD_ID_SITELINE, f.LINE_NAME, 
c.ORDER_NO, SUBSTRING_INDEX(c.MO_NO,',',-1) MO_NO, e.ORDER_REFERENCE_PO_NO, e.ORDER_STYLE_DESCRIPTION,
e.ITEM_COLOR_NAME, a.CONFIRM_RETURN_BY, a.SEWING_RETURN_BY, a.CONFIRM_STATUS, a.CONFRIM_DATE
FROM scan_sewing_return a 
LEFT JOIN weekly_prod_sch_detail b ON a.SCHD_ID = b.SCHD_ID 
LEFT JOIN order_detail c ON c.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN order_qr_generate d ON d.BARCODE_SERIAL = a.BARCODE_SERIAL
LEFT JOIN  order_po_listing e ON e.ORDER_NO = c.ORDER_NO AND e.MO_NO =  SUBSTRING_INDEX(c.MO_NO,',',-1) 
AND e.ORDER_PO_ID = SUBSTRING_INDEX(c.BUYER_PO,',',-1) -- jika MO ada 2 ambil mo terakir
LEFT JOIN item_siteline f ON b.SCHD_ID_SITELINE = f.ID_SITELINE 
WHERE a.SEWING_SCAN_LOCATION LIKE :sitename AND date(a.CONFRIM_DATE) BETWEEN :startDate AND :endDate AND a.CONFIRM_STATUS <> '0' `;

export const QueryRepCutLoading = `-- QUERY UNTUK CUTTING OUTPUT and LOADING
SELECT n.*,  e.LOADING_QTY, f.LINE_NAME , e.LOADING_QTY-n.SCH_SIZE_QTY BAL,
CASE WHEN (IFNULL(e.LOADING_QTY,0) - n.SCH_SIZE_QTY) < 0 THEN "Open"
     WHEN (IFNULL(e.LOADING_QTY,0) - n.SCH_SIZE_QTY) = 0 THEN "Completed"
     ELSE "Over" END AS STATUS
FROM (
	SELECT 
		a.SCH_ID, a.SCH_SITE, a.SCH_ID_SITELINE,  c.ORDER_NO,
		IFNULL(c.NEW_PLAN_EXFACTORY_DATE, c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
		c.CUSTOMER_NAME, c.ORDER_REFERENCE_PO_NO, c.PRODUCT_ITEM_CODE, 
		c.ORDER_STYLE_DESCRIPTION, c.ITEM_COLOR_CODE, c.ITEM_COLOR_NAME,
		b.SIZE_CODE, c.MO_QTY, a.SCH_QTY,  
		CASE WHEN c.MO_QTY = a.SCH_QTY THEN 'ALL_SIZE' ELSE 'PARTIAL' END AS SIZES,
		SUM(b.SCH_SIZE_QTY) SCH_SIZE_QTY, SUM(d.GENERATE_QTY) GENERATE_QTY
	FROM weekly_prod_schedule a
	LEFT JOIN  weekly_sch_size b ON a.SCH_ID = b.SCH_ID
	LEFT JOIN viewcapacity c ON a.SCH_CAPACITY_ID = c.ID_CAPACITY
	LEFT JOIN (
		SELECT n.PRODUCTION_MONTH, n.MANUFACTURING_SITE, n.ORDER_NO, n.ORDER_REFERENCE_PO_NO,
			 	n.ITEM_COLOR_CODE, n.PLAN_EXFACTORY_DATE, n.ORDER_SIZE,
			  	SUM(n.ORDER_QTY) GENERATE_QTY 
		FROM (
			SELECT DISTINCT 
				a.BARCODE_SERIAL, 
				c.PRODUCTION_MONTH, 
				IFNULL(c.NEW_MANUFACTURING_SITE, c.MANUFACTURING_SITE) MANUFACTURING_SITE, 
				 b.BUYER_CODE, b.ORDER_NO, b.PRODUCT_TYPE, b.BUYER_PO, 
				SUBSTRING_INDEX(b.MO_NO,',',-1) MO_NO, 
				c.ORDER_REFERENCE_PO_NO, 
				c.ITEM_COLOR_NAME, 
				c.ITEM_COLOR_CODE, 
				b.ORDER_SIZE, b.ORDER_STYLE, b.SITE_LINE, 
				SUBSTRING_INDEX(b.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(b.SITE_LINE,' ',-1)  LINE,
				IFNULL(c.NEW_PLAN_EXFACTORY_DATE, c.PLAN_EXFACTORY_DATE) PLAN_EXFACTORY_DATE,
				b.ORDER_QTY
			FROM order_qr_generate a
			LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
			LEFT JOIN order_po_listing c ON c.MO_NO = SUBSTRING_INDEX(b.MO_NO,',',-1) AND SUBSTRING_INDEX(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
			WHERE b.ORDER_NO IN ( 
				SELECT c.ORDER_NO FROM weekly_prod_schedule a 
				LEFT JOIN viewcapacity c ON a.SCH_CAPACITY_ID = c.ID_CAPACITY
				WHERE a.SCH_ID IN (
					SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
					WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate AND a.SCHD_SITE = :site
				)  
			)
			GROUP by a.BARCODE_SERIAL
		) n GROUP BY n.PRODUCTION_MONTH, n.MANUFACTURING_SITE, n.ORDER_NO, n.ORDER_REFERENCE_PO_NO,
			 n.ITEM_COLOR_CODE, n.PLAN_EXFACTORY_DATE, n.ORDER_SIZE
	) d on d.PRODUCTION_MONTH = c.PRODUCTION_MONTH 
		AND d.MANUFACTURING_SITE = c.MANUFACTURING_SITE 
		AND  d.PLAN_EXFACTORY_DATE = IFNULL(c.NEW_PLAN_EXFACTORY_DATE, c.PLAN_EXFACTORY_DATE)  
		AND d.ORDER_NO = c.ORDER_NO 
		AND d.ORDER_REFERENCE_PO_NO = c.ORDER_REFERENCE_PO_NO
	 	AND d.ITEM_COLOR_CODE = c.ITEM_COLOR_CODE
	 	AND d.ORDER_SIZE = b.SIZE_CODE 
	WHERE a.SCH_ID IN (
			SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
			WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate AND a.SCHD_SITE = :site
	)  
	 GROUP BY a.SCH_ID,  b.SIZE_CODE
) n
LEFT JOIN (
	SELECT a.SCH_ID,  b.ORDER_SIZE, SUM(b.ORDER_QTY) LOADING_QTY
	FROM scan_sewing_in a
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
	WHERE a.SCH_ID IN (
		SELECT DISTINCT a.SCH_ID  FROM weekly_prod_sch_detail a 
		WHERE a.SCHD_PROD_DATE BETWEEN :startDate AND :endDate AND a.SCHD_SITE = :site
	)  
	GROUP BY a.SCH_ID,  b.ORDER_SIZE
) e ON n.SCH_ID = e.SCH_ID AND e.ORDER_SIZE =  n.SIZE_CODE
LEFT JOIN item_siteline f ON f.ID_SITELINE = n.SCH_ID_SITELINE
ORDER BY n.SCH_ID_SITELINE`;

export const QueryRepCutLoadDateSize = `SELECT a.SCH_ID, DATE(a.SEWING_SCAN_TIME) SCAN_DATE, b.ORDER_SIZE, SUM(b.ORDER_QTY) LOADING_QTY
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate AND a.SEWING_SCAN_LOCATION = :site
GROUP BY a.SCH_ID,  DATE(a.SEWING_SCAN_TIME), b.ORDER_SIZE`;

export const GetLastQr = `SELECT  CAST(SUBSTRING(a.BARCODE_SERIAL, 4) AS UNSIGNED) AS lastIdx  
FROM order_detail a WHERE SUBSTRING(a.BARCODE_SERIAL,1,3) ='SSC' 
ORDER BY  a.BARCODE_SERIAL DESC
LIMIT 1 `;
