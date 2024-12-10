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
b.ORDER_NO, a.BARCODE_SERIAL, b.ORDER_SIZE, b.ORDER_QTY, f.BUNDLE_SEQUENCE, DATE(a.SEWING_SCAN_TIME) SCAN_DATE
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

export const QueryRepCutLoading = `SELECT n.*,  e.LOADING_QTY, f.LINE_NAME , e.LOADING_QTY-n.SCH_SIZE_QTY BAL,
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
		SUM(b.SCH_SIZE_QTY) SCH_SIZE_QTY -- , SUM(d.GENERATE_QTY) GENERATE_QTY
	FROM weekly_prod_schedule a
	LEFT JOIN  weekly_sch_size b ON a.SCH_ID = b.SCH_ID
	LEFT JOIN viewcapacity c ON a.SCH_CAPACITY_ID = c.ID_CAPACITY
	WHERE a.SCH_ID IN (
			SELECT DISTINCT a.SCH_ID  FROM  scan_sewing_in a
			WHERE DATE(a.SEWING_SCAN_TIME)  BETWEEN :startDate AND :endDate AND a.SEWING_SCAN_LOCATION = :site
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
ORDER BY  n.SCH_ID_SITELINE, n.SCH_ID`;

export const QueryRepCutLoadDateSize = `SELECT a.SCH_ID, DATE(a.SEWING_SCAN_TIME) SCAN_DATE, b.ORDER_SIZE, SUM(b.ORDER_QTY) LOADING_QTY
FROM scan_sewing_in a
LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
WHERE  DATE(a.SEWING_SCAN_TIME) BETWEEN :startDate AND :endDate AND a.SEWING_SCAN_LOCATION = :site
GROUP BY a.SCH_ID,  DATE(a.SEWING_SCAN_TIME), b.ORDER_SIZE`;

export const GetLastQr = `SELECT  CAST(SUBSTRING(a.BARCODE_SERIAL, 4) AS UNSIGNED) AS lastIdx  
FROM order_detail a WHERE SUBSTRING(a.BARCODE_SERIAL,1,3) ='SSC' 
ORDER BY  a.BARCODE_SERIAL DESC
LIMIT 1 `;

export const CutSupermarketIn = db.define(
  "scan_supermarket_in",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    CUT_ID: { type: DataTypes.BIGINT },
    CUT_SCAN_BY: { type: DataTypes.BIGINT },
    CUT_SITE: { type: DataTypes.STRING },
    CUT_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CUT_SCAN_TIME",
    updatedAt: false,
  }
);

export const CutSupermarketOut = db.define(
  "scan_supermarket_out",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    CUT_ID: { type: DataTypes.BIGINT },
    CUT_SCAN_BY: { type: DataTypes.BIGINT },
    CUT_SITE: { type: DataTypes.STRING },
    CUT_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CUT_SCAN_TIME",
    updatedAt: false,
  }
);

export const MoldingIn = db.define(
  "scan_molding_in",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    CUT_ID: { type: DataTypes.BIGINT },
    CUT_SCAN_BY: { type: DataTypes.BIGINT },
    CUT_SITE: { type: DataTypes.STRING },
    CUT_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CUT_SCAN_TIME",
    updatedAt: false,
  }
);

export const MoldingOut = db.define(
  "scan_molding_out",
  {
    BARCODE_SERIAL: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    SCH_ID: { type: DataTypes.BIGINT },
    CUT_ID: { type: DataTypes.BIGINT },
    CUT_SCAN_BY: { type: DataTypes.BIGINT },
    CUT_SITE: { type: DataTypes.STRING },
    CUT_SCAN_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "CUT_SCAN_TIME",
    updatedAt: false,
  }
);

// export const qryGetCutPOStatus = `
// SELECT
// n.*,
// n.QR_QTY-n.CUT_GENERATE BALANCE_GENERATE,
// n.CUT_GENERATE-n.SUP_IN BALANCE_SUP_IN,
// n.SUP_IN-n.SUP_OUT BALANCE_SUP_OUT,
// n.SUP_OUT-n.SEWING_IN BALANCE_SEWING_IN
// FROM (
// SELECT
//     a.ORDER_NO,
// 	 f.ORDER_REFERENCE_PO_NO,
// 	 f.ORDER_PO_ID,
//     a.MO_NO,
//     a.ORDER_COLOR,
//     f.ITEM_COLOR_NAME,
//     f.ORDER_STYLE_DESCRIPTION,
//     a.ORDER_SIZE,
//     SUM(a.ORDER_QTY) AS QR_QTY,
//     SUM(CASE WHEN b.BARCODE_SERIAL IS NOT NULL THEN a.ORDER_QTY ELSE 0 END) AS CUT_GENERATE,
//     SUM(CASE WHEN c.BARCODE_SERIAL IS NOT NULL THEN a.ORDER_QTY ELSE 0 END) AS SUP_IN,
//     SUM(CASE WHEN d.BARCODE_SERIAL IS NOT NULL THEN a.ORDER_QTY ELSE 0 END) AS SUP_OUT,
//     SUM(CASE WHEN e.BARCODE_SERIAL IS NOT NULL THEN a.ORDER_QTY ELSE 0 END) AS SEWING_IN
// FROM
//     view_order_detail a
// LEFT JOIN
//     order_qr_generate b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
// LEFT JOIN
//     scan_supermarket_in c ON a.BARCODE_SERIAL = c.BARCODE_SERIAL
// LEFT JOIN
//     scan_supermarket_out d ON a.BARCODE_SERIAL = d.BARCODE_SERIAL
// LEFT JOIN
//     scan_sewing_in e ON a.BARCODE_SERIAL = e.BARCODE_SERIAL
// JOIN
//     order_po_listing f ON a.MO_NO = f.MO_NO
// WHERE
//     f.ORDER_REFERENCE_PO_NO = :poNo
// GROUP BY
//     a.ORDER_NO, a.MO_NO, a.ORDER_COLOR, a.ORDER_SIZE
// ) n
// `;
export const qryGetCutPOStatus = `SELECT
   n.ORDER_REFERENCE_PO_NO, n.ORDER_NO, n.MO_NO, n.ORDER_PO_ID, n.ORDER_COLOR,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,  n.ORDER_SIZE,
    SUM(n.QR_QTY) AS QR_QTY,
    SUM(n.CUT_GENERATE) AS CUT_GENERATE,
    SUM(n.QR_QTY)-SUM(n.CUT_GENERATE) BALANCE_GENERATE,
    SUM(n.MOLDING_IN) AS MOLDING_IN,
    SUM(n.CUT_GENERATE)-SUM(n.MOLDING_IN) BALANCE_MOLDING_IN,
    SUM(n.MOLDING_OUT) AS MOLDING_OUT,
    SUM(n.MOLDING_IN)-SUM(n.MOLDING_OUT) BALANCE_MOLDING_OUT,
    SUM(n.SUP_IN) AS SUP_IN,
    SUM(n.CUT_GENERATE)-SUM(n.SUP_IN) BALANCE_SUP_IN,
    SUM(n.SUP_OUT) AS SUP_OUT,
    SUM(n.SUP_IN)-SUM(n.SUP_OUT) BALANCE_SUP_OUT,
    SUM(n.SEWING_IN) AS SEWING_IN,
    SUM(n.SUP_OUT)-SUM(n.SEWING_IN) BALANCE_SEWING_IN
FROM (
 SELECT
        a.ORDER_REFERENCE_PO_NO, a.ORDER_NO,  a.MO_NO, a.ORDER_PO_ID, a.ITEM_COLOR_CODE ORDER_COLOR,  a.ITEM_COLOR_NAME, a.ORDER_STYLE_DESCRIPTION, a.SIZE_CODE ORDER_SIZE,
        SUM(a.ORDER_QTY) AS QR_QTY,
        0 AS CUT_GENERATE,
        0 AS MOLDING_IN,
	     0 AS MOLDING_OUT,
        0 AS SUP_IN,
        0 AS SUP_OUT,
        0 AS SEWING_IN
    FROM
        order_po_listing_size a 
    WHERE
        a.ORDER_REFERENCE_PO_NO =:poNo
    GROUP BY
        a.ORDER_NO, a.MO_NO, a.ITEM_COLOR_CODE, a.ORDER_PO_ID, a.SIZE_CODE
     UNION ALL
    SELECT
       c.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR,  c.ITEM_COLOR_NAME, c.ORDER_STYLE_DESCRIPTION, b.ORDER_SIZE,
        0 AS QR_QTY,
        SUM(b.ORDER_QTY) AS CUT_GENERATE,
		  0 AS MOLDING_IN,
	     0 AS MOLDING_OUT,
        0 AS SUP_IN,
        0 AS SUP_OUT,
        0 AS SEWING_IN
    FROM
        order_qr_generate a
    JOIN
        order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
    JOIN
        order_po_listing c ON substring_index(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
    WHERE
        c.ORDER_REFERENCE_PO_NO =:poNo AND DATE(a.CREATE_TIME) <= :date
    GROUP BY
        b.ORDER_NO, b.MO_NO,  c.ORDER_PO_ID, b.ORDER_COLOR, b.ORDER_SIZE

             UNION ALL
	    SELECT
	 	  c.ORDER_REFERENCE_PO_NO,  b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR,  c.ITEM_COLOR_NAME, c.ORDER_STYLE_DESCRIPTION, b.ORDER_SIZE,
	     0 AS QR_QTY,
	     0 AS CUT_GENERATE,
	     SUM(b.ORDER_QTY) AS MOLDING_IN,
	     0 AS MOLDING_OUT,
	     0 AS SUP_IN,
	     0 AS SUP_OUT,
	     0 AS SEWING_IN
	 FROM
	     scan_molding_in a
	 JOIN
	     order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
	 JOIN
	     order_po_listing c ON substring_index(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
	 WHERE
	     c.ORDER_REFERENCE_PO_NO =:poNo AND DATE(a.CUT_SCAN_TIME) <= :date
	 GROUP BY
	     b.ORDER_NO, b.MO_NO,  c.ORDER_PO_ID, b.ORDER_COLOR, b.ORDER_SIZE
   
	  UNION ALL
     
	    SELECT
	 	  c.ORDER_REFERENCE_PO_NO,  b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR,  c.ITEM_COLOR_NAME, c.ORDER_STYLE_DESCRIPTION, b.ORDER_SIZE,
	     0 AS QR_QTY,
	     0 AS CUT_GENERATE,
	     0 AS MOLDING_IN,
	     SUM(b.ORDER_QTY) AS MOLDING_OUT,
	     0 AS SUP_IN,
	     0 AS SUP_OUT,
	     0 AS SEWING_IN
	 FROM
	     scan_molding_out a
	 JOIN
	     order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
	 JOIN
	     order_po_listing c ON substring_index(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
	 WHERE
	     c.ORDER_REFERENCE_PO_NO =:poNo AND DATE(a.CUT_SCAN_TIME) <= :date
	 GROUP BY
	     b.ORDER_NO, b.MO_NO,  c.ORDER_PO_ID, b.ORDER_COLOR, b.ORDER_SIZE

	UNION ALL

    SELECT
      c.ORDER_REFERENCE_PO_NO,  b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR,  c.ITEM_COLOR_NAME, c.ORDER_STYLE_DESCRIPTION, b.ORDER_SIZE,
        0 AS QR_QTY,
        0 AS  CUT_GENERATE,
        0 AS MOLDING_IN,
	     0 AS MOLDING_OUT,
        SUM(b.ORDER_QTY) AS SUP_IN,
        0 AS SUP_OUT,
        0 AS SEWING_IN
    FROM
        scan_supermarket_in a
    JOIN
        order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
    JOIN
        order_po_listing c ON substring_index(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
    WHERE
        c.ORDER_REFERENCE_PO_NO =:poNo AND DATE(a.CUT_SCAN_TIME) <= :date
    GROUP BY
        b.ORDER_NO, b.MO_NO,  c.ORDER_PO_ID, b.ORDER_COLOR, b.ORDER_SIZE

   UNION ALL

    SELECT
       c.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR, c.ITEM_COLOR_NAME, c.ORDER_STYLE_DESCRIPTION, b.ORDER_SIZE,
        0 AS QR_QTY,
        0 AS  CUT_GENERATE,
        0 AS MOLDING_IN,
	     0 AS MOLDING_OUT,
        0 AS SUP_IN,
        SUM(b.ORDER_QTY) AS SUP_OUT,
        0 AS SEWING_IN
    FROM
        scan_supermarket_out a
    JOIN
        order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
    JOIN
        order_po_listing c ON substring_index(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
    WHERE
        c.ORDER_REFERENCE_PO_NO =:poNo AND DATE(a.CUT_SCAN_TIME) <= :date
    GROUP BY
        b.ORDER_NO, b.MO_NO,  c.ORDER_PO_ID, b.ORDER_COLOR, b.ORDER_SIZE

	UNION ALL

    SELECT
        c.ORDER_REFERENCE_PO_NO, b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR, c.ITEM_COLOR_NAME, c.ORDER_STYLE_DESCRIPTION, b.ORDER_SIZE,
        0 AS QR_QTY,
        0 AS  CUT_GENERATE,
        0 AS MOLDING_IN,
	     0 AS MOLDING_OUT,
        0 AS SUP_IN,
        0 AS SUP_OUT,
        SUM(b.ORDER_QTY) AS SEWING_IN
    FROM
        scan_sewing_in a
    JOIN
        order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
    JOIN
        order_po_listing c ON substring_index(b.BUYER_PO,',',-1) = c.ORDER_PO_ID
    WHERE
        c.ORDER_REFERENCE_PO_NO =:poNo AND DATE(a.SEWING_SCAN_TIME) <= :date
    GROUP BY
        b.ORDER_NO, b.MO_NO, c.ORDER_PO_ID, b.ORDER_COLOR, b.ORDER_SIZE
) n
GROUP BY
    n.ORDER_REFERENCE_PO_NO, n.ORDER_NO, n.MO_NO, n.ORDER_PO_ID, n.ORDER_COLOR,  n.ITEM_COLOR_NAME, n.ORDER_STYLE_DESCRIPTION,  n.ORDER_SIZE
`;

export const getDetailQuery = `SELECT 
    a.BARCODE_SERIAL,
    COALESCE(b.BUNDLE_SEQUENCE, '0') AS BUNDLE_SEQUENCE, 
    a.ORDER_SIZE, 
    a.ORDER_QTY,
    SUM(CASE WHEN b.BARCODE_SERIAL IS NOT NULL THEN 1 ELSE 0 END) AS GENERATE_STATUS, 
    SUM(CASE WHEN f.BARCODE_SERIAL IS NOT NULL THEN 1 ELSE 0 END) AS MOL_IN_STATUS, 
    SUM(CASE WHEN g.BARCODE_SERIAL IS NOT NULL THEN 1 ELSE 0 END) AS MOL_OUT_STATUS, 
    SUM(CASE WHEN c.BARCODE_SERIAL IS NOT NULL THEN 1 ELSE 0 END) AS SUP_IN_STATUS, 
    SUM(CASE WHEN d.BARCODE_SERIAL IS NOT NULL THEN 1 ELSE 0 END) AS SUP_OUT_STATUS, 
    SUM(CASE WHEN e.BARCODE_SERIAL IS NOT NULL THEN 1 ELSE 0 END) AS SEW_IN_STATUS, 
    b.CREATE_TIME DATE_GENERATE,
    c.CUT_SCAN_TIME DATE_SUP_IN,
    d.CUT_SCAN_TIME DATE_SUP_OUT,
    e.SEWING_SCAN_TIME
FROM 
    order_detail a
LEFT JOIN 
    order_qr_generate b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL
LEFT JOIN 
    scan_molding_in f ON a.BARCODE_SERIAL = f.BARCODE_SERIAL
LEFT JOIN 
    scan_molding_out g ON a.BARCODE_SERIAL = g.BARCODE_SERIAL
LEFT JOIN 
    scan_supermarket_in c ON a.BARCODE_SERIAL = c.BARCODE_SERIAL
LEFT JOIN 
    scan_supermarket_out d ON a.BARCODE_SERIAL = d.BARCODE_SERIAL
LEFT JOIN 
    scan_sewing_in e ON a.BARCODE_SERIAL = e.BARCODE_SERIAL
WHERE 
    SUBSTRING_INDEX(a.BUYER_PO,',',1) = :poId
    AND a.ORDER_SIZE = :size
GROUP BY 
    a.BARCODE_SERIAL
`;

export const LogCuttingDept = db.define(
  "log_cutting_dept",
  {
    TRANS_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    TRANS_DATE_ACTUAL: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    TRANSACTION: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    CATEGORY: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    SCH_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
    },
    SCHD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
    },
    CUT_SITE: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    BUYER_CODE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ORDER_STYLE: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    PRODUCT_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ORDER_NO: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    BUYER_PO: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    ORDER_COLOR: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ORDER_SIZE: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    ORDER_QTY: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "log_cutting_dept",
    timestamps: true,
  }
);

LogCuttingDept.removeAttribute("id");

export const queryLogCutDept = `-- QUERY RECAP DEPT CUTING
SELECT 
	:startDate AS TRANS_DATE,
	GRP.TRANS_DATE AS TRANS_DATE_ACTUAL,
	GRP.TRANSACTION,
	GRP.CATEGORY,
	GRP.SCH_ID,
	GRP.SCHD_ID,
	GRP.CUT_SITE,
	GRP.BUYER_CODE,
	GRP.PRODUCT_TYPE,
	GRP.ORDER_NO,
	GRP.ORDER_STYLE,
	GRP.BUYER_PO,
	GRP.ORDER_COLOR,
	GRP.ORDER_SIZE,
	GRP.ORDER_QTY
FROM (
    -- query molding out
    SELECT DATE(smi.CUT_SCAN_TIME) TRANS_DATE, 'MOLDING' AS TRANSACTION, 'IN' AS CATEGORY, NULL AS SCH_ID, NULL AS  SCHD_ID, smi.CUT_SITE,
    od.BUYER_CODE, od.ORDER_STYLE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE, SUM(od.ORDER_QTY) AS ORDER_QTY
    FROM scan_molding_in smi 
    JOIN order_detail od ON smi.BARCODE_SERIAL = od.BARCODE_SERIAL
    WHERE smi.CUT_SCAN_TIME BETWEEN  :startDateTime AND :endDateTime
    GROUP BY  smi.CUT_SITE, od.BUYER_CODE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE
    UNION ALL
    -- query molding out
    SELECT  DATE(smo.CUT_SCAN_TIME) TRANS_DATE, 'MOLDING' AS TRANSACTION, 'OUT' AS CATEGORY, NULL AS SCH_ID, NULL AS  SCHD_ID, smo.CUT_SITE, 
    od.BUYER_CODE,  od.ORDER_STYLE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE, SUM(od.ORDER_QTY) AS ORDER_QTY
    FROM scan_molding_out smo 
    JOIN order_detail od ON smo.BARCODE_SERIAL = od.BARCODE_SERIAL
    WHERE smo.CUT_SCAN_TIME BETWEEN  :startDateTime AND :endDateTime
    GROUP BY  smo.CUT_SITE, od.BUYER_CODE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE
    UNION ALL
    -- query supermarket in :
    SELECT DATE(ssi.CUT_SCAN_TIME) TRANS_DATE, 'SUPERMARKET' AS TRANSACTION, 'IN' AS CATEGORY, NULL AS SCH_ID, NULL AS  SCHD_ID, ssi.CUT_SITE, 
    od.BUYER_CODE,  od.ORDER_STYLE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE, SUM(od.ORDER_QTY) AS ORDER_QTY
    FROM scan_supermarket_in ssi 
    JOIN order_detail od ON ssi.BARCODE_SERIAL = od.BARCODE_SERIAL
    WHERE ssi.CUT_SCAN_TIME BETWEEN  :startDateTime AND :endDateTime
    GROUP BY ssi.CUT_SITE, od.BUYER_CODE, od.PRODUCT_TYPE, od.ORDER_COLOR, od.ORDER_SIZE
    UNION ALL 
    -- query supermarket out
    SELECT DATE(sso.CUT_SCAN_TIME) TRANS_DATE,'SUPERMARKET' AS TRANSACTION, 'OUT' AS CATEGORY, NULL AS SCH_ID, NULL AS  SCHD_ID,  sso.CUT_SITE,
    od.BUYER_CODE,  od.ORDER_STYLE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE, SUM(od.ORDER_QTY) AS ORDER_QTY
    FROM scan_supermarket_out sso 
    JOIN order_detail od ON sso.BARCODE_SERIAL = od.BARCODE_SERIAL
    WHERE sso.CUT_SCAN_TIME BETWEEN  :startDateTime AND :endDateTime
    GROUP BY sso.CUT_SITE, od.BUYER_CODE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE
    UNION ALL 
    -- query supermarket in :
    SELECT DATE(swi.SEWING_SCAN_TIME) TRANS_DATE, 'SEWING_IN' AS TRANSACTION, 'IN' AS CATEGORY, swi.SCH_ID, swi.SCHD_ID,  swi.SEWING_SCAN_LOCATION CUT_SITE,
    od.BUYER_CODE,  od.ORDER_STYLE, od.PRODUCT_TYPE, od.ORDER_NO, od.BUYER_PO, od.ORDER_COLOR, od.ORDER_SIZE, SUM(od.ORDER_QTY) AS ORDER_QTY
    FROM scan_sewing_in swi 
    JOIN order_detail od ON swi.BARCODE_SERIAL = od.BARCODE_SERIAL
    WHERE DATE(swi.SEWING_SCAN_TIME) =  :startDate
    GROUP BY swi.SCH_ID, swi.SCHD_ID, swi.SEWING_SCAN_LOCATION, od.BUYER_CODE, od.PRODUCT_TYPE, od.ORDER_COLOR, od.ORDER_SIZE
) AS GRP
    `;

// dashboard query

export function createQueryDash(params) {
  if (!params) return false;

  return `SELECT * FROM log_cutting_dept lcd WHERE ${params} `;
}

export const qryGetCutLastDate = `SELECT * FROM log_cutting_dept lcd WHERE lcd.TRANS_DATE < :date
ORDER BY  lcd.TRANS_DATE DESC LIMIT 1`;

export function qryLoadingPlanVsActual(paramsPlan, paramsActual) {
  if (!paramsPlan && !paramsActual) return false;

  return `SELECT 
  sewin.CUT_LOAD_DATE,
  sewin.CUT_SITE_NAME SITE,
  il.SITE SITE_FX,
  SUM(sewin.SCH_QTY) AS  PLAN_QTY,
  SUM(sewin.ACTUAL_QTY) AS  ACTUAL_QTY
  FROM (
    SELECT cs.CUT_LOAD_DATE,
		csl.CUT_SITE_NAME, 
    SUM(cs.SCH_QTY) AS  SCH_QTY,
    0 AS ACTUAL_QTY
    FROM cuting_loading_sch_detail cs 
    JOIN cuting_loading_schedule csl ON csl.CUT_ID = cs.CUT_ID
    WHERE  ${paramsPlan}
    GROUP BY cs.CUT_LOAD_DATE, csl.CUT_SITE_NAME
    UNION ALL 
    SELECT 
		lcd.TRANS_DATE, 
		lcd.CUT_SITE, 
		0 AS SCH_QTY,
		SUM(lcd.ORDER_QTY) AS ACTUAL_QTY
    FROM log_cutting_dept lcd 
    WHERE  lcd.TRANSACTION = 'SEWING_IN' AND ${paramsActual} 
    GROUP BY lcd.TRANS_DATE, lcd.CUT_SITE
    ) AS sewin
    LEFT JOIN (
      SELECT DISTINCT 
      il.SITE, il.SITE_NAME
      FROM item_siteline il
    ) il ON il.SITE_NAME = sewin.CUT_SITE_NAME
    GROUP BY sewin.CUT_SITE_NAME
    ORDER BY il.SITE
    `;
}

export function qrySewInSiePerLine(paramsPlan, paramsActual) {
  if (!paramsPlan && !paramsActual) return false;

  return `SELECT 
  sewin.CUT_LOAD_DATE,
  sewin.CUT_SITE_NAME SITE,
  il.ID_SITELINE,
  il.LINE_NAME,
-- sewin.SCH_ID,
  SUM(sewin.SCH_QTY) AS  PLAN_QTY,
  SUM(sewin.ACTUAL_QTY) AS  ACTUAL_QTY
  FROM (
  -- kenapa di group by sch_id karena untuk memastikan atau join kedua query union all secara tidak langsung
		   SELECT cs.CUT_LOAD_DATE, 
			csl.CUT_SITE_NAME, cs.CUT_SCH_ID AS SCH_ID,
			SUM(cs.SCH_QTY) AS  SCH_QTY,
			0 AS ACTUAL_QTY
			FROM cuting_loading_sch_detail cs 
			JOIN cuting_loading_schedule csl ON csl.CUT_ID = cs.CUT_ID
			WHERE   ${paramsPlan} 
			GROUP BY cs.CUT_LOAD_DATE, csl.CUT_SITE_NAME, cs.CUT_SCH_ID
			UNION ALL 
			SELECT 
			lcd.TRANS_DATE, 
			lcd.CUT_SITE, 
			lcd.SCH_ID,
			0 AS SCH_QTY,
			SUM(lcd.ORDER_QTY) AS ACTUAL_QTY
			FROM log_cutting_dept lcd 
			WHERE  lcd.TRANSACTION = 'SEWING_IN' AND ${paramsActual}
			GROUP BY lcd.TRANS_DATE, lcd.CUT_SITE, lcd.SCH_ID
	 ) AS sewin
 LEFT JOIN cuting_loading_schedule cls2 ON cls2.CUT_SCH_ID = sewin.SCH_ID
 JOIN item_siteline il ON il.ID_SITELINE = cls2.CUT_ID_SITELINE
 GROUP BY 
 sewin.CUT_SITE_NAME,  il.ID_SITELINE -- sewin.SCH_ID
 ORDER BY  sewin.CUT_SITE_NAME, il.ID_SITELINE`;
}

export const qryGetWipSite = `SELECT 
    wp.SITE,
    MAX(wp.TARGET_WIP) TARGET_WIP,
    MAX(wp.WIP) WIP
    FROM (
      -- QUERY TARGET WIP BERDASRKAN LINE YANG JALAN / MEMILIKI SCHEDULE
      SELECT 
			tw.SITE,
			SUM(tw.TARGET_WIP) TARGET_WIP,
			0 WIP
      FROM (
        SELECT DISTINCT a.SCHD_SITE AS SITE, a.SCHD_ID_SITELINE, 500 AS TARGET_WIP 
        FROM weekly_prod_sch_detail a 
        WHERE a.SCHD_PROD_DATE = :date
        AND a.SCHD_QTY != 0
        ORDER BY a.SCHD_SITE, a.SCHD_ID_SITELINE
        ) tw
        GROUP BY tw.SITE
        UNION ALL 
        SELECT 
        wip.SCH_SITE SITE,
        0 TARGET_WIP,
        SUM(wip.WIP) AS WIP
        FROM (
          SELECT 
          a.SCH_SITE, 
          a.TTL_SEWING_IN - a.TTL_QC_QTY AS WIP
          FROM log_sewing_wip_monitoring a 
          JOIN weekly_prod_schedule b ON b.SCH_ID = a.SCH_ID -- antisipasi yang tidak ada schnya
          WHERE a.TTL_SEWING_IN > a.TTL_QC_QTY
          ) wip
          GROUP BY wip.SCH_SITE
          ) wp GROUP BY wp.SITE`;

export const qryPrepBalance = `SELECT 
          wp.SITE,
          MAX(wp.TARGET_WIP) TARGET_WIP,
          MAX(wp.WIP) WIP
          FROM (
            -- QUERY TARGET WIP BERDASRKAN LINE YANG JALAN / MEMILIKI SCHEDULE
            SELECT 
            tw.SITE,
            SUM(tw.TARGET_WIP) TARGET_WIP,
            0 WIP
            FROM (
              SELECT DISTINCT a.SCHD_SITE AS SITE, a.SCHD_ID_SITELINE, 250 AS TARGET_WIP 
              FROM weekly_prod_sch_detail a 
              WHERE a.SCHD_PROD_DATE = :date
              AND a.SCHD_QTY != 0
              ORDER BY a.SCHD_SITE, a.SCHD_ID_SITELINE
              ) tw
              GROUP BY tw.SITE
              UNION ALL 
              -- loading wip
              SELECT smo.CUT_SITE AS SITE, 0 TARGET_WIP, SUM(od.ORDER_QTY) WIP
              FROM scan_supermarket_out smo
              JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
              WHERE NOT EXISTS (
                SELECT 1
                FROM scan_sewing_in ssi
                WHERE ssi.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(ssi.SEWING_SCAN_TIME) <= :date
                ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                GROUP BY smo.CUT_SITE
                ) wp GROUP BY wp.SITE`;

//awas query lemot untuk chart wip
export const qryWipQtyDept = `
                SELECT 
                wp.SITE,
                MAX(wp.MOL_WIP) MOL_WIP,
                MAX(wp.SUP_WIP) SUP_WIP,
                MAX(wp.LOAD_WIP) LOAD_WIP
                FROM (
                  SELECT smo.CUT_SITE AS SITE, SUM(od.ORDER_QTY) MOL_WIP, 0 SUP_WIP, 0 LOAD_WIP
                  FROM scan_molding_in smo
                  JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
                  WHERE NOT EXISTS (
                    SELECT 1
                    FROM scan_molding_out sso
                    WHERE sso.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(sso.CUT_SCAN_TIME) <= :date
                    ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                    GROUP BY smo.CUT_SITE
                    UNION ALL
                    SELECT smo.CUT_SITE AS SITE, 0 MOL_WIP, SUM(od.ORDER_QTY) SUP_WIP, 0 LOAD_WIP
                    FROM scan_supermarket_in smo
                    JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
                    WHERE NOT EXISTS (
                      SELECT 1
                      FROM scan_supermarket_out sso
                      WHERE sso.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(sso.CUT_SCAN_TIME) <= :date
                      ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                      GROUP BY smo.CUT_SITE
                      UNION ALL 
                      SELECT smo.CUT_SITE AS SITE, 0 MOL_WIP, 0 SUP_WIP, SUM(od.ORDER_QTY) LOAD_WIP
                      FROM scan_supermarket_out smo
                      JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
                      WHERE NOT EXISTS (
                        SELECT 1
                        FROM scan_sewing_in ssi
                        WHERE ssi.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(ssi.SEWING_SCAN_TIME) <= :date
                        ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                        GROUP BY smo.CUT_SITE
                        ) wp GROUP BY wp.SITE
                        `;

export const findSiteLineLowWipPrep = `SELECT 
                        ind.SITE,
                        --	ind.SCH_ID_SITELINE,
                        COUNT(ind.SCH_ID_SITELINE) AS COUNT_LINE
                        --	ind.WIP
                        FROM (
                          SELECT smo.CUT_SITE AS SITE, wps.SCH_ID_SITELINE, smo.SCH_ID,  SUM(od.ORDER_QTY) WIP
                          FROM scan_supermarket_out smo
                          JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
                          JOIN weekly_prod_schedule wps ON wps.SCH_ID = smo.SCH_ID
                          WHERE NOT EXISTS (
                            SELECT 1
                            FROM scan_sewing_in ssi
                            WHERE ssi.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(ssi.SEWING_SCAN_TIME) <= :date
                            ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                            GROUP BY smo.CUT_SITE, wps.SCH_ID_SITELINE
                            ) ind WHERE  ind.WIP <= 50
                            GROUP BY 
                            ind.SITE
                            -- 	ind.SCH_ID_SITELINE`;

export const qrySiteLineCount = `SELECT
                            st.SITE AS SITE_ID,
                            st.SITE_NAME AS SITE,
                            COUNT(st.LINE_NAME) LINE 
                            FROM (
                              SELECT DISTINCT  a.SITE, a.SITE_NAME, a.LINE_NAME
                              FROM item_siteline a GROUP BY a.SITE, a.LINE_NAME
                              ) st GROUP BY st.SITE_NAME
                              ORDER BY st.SITE`;

export function qryBaseDtailBanner(params) {
  if (!params) return false;

  return `SELECT 	* FROM log_cutting_dept lcd 
    WHERE lcd.CATEGORY = 'IN'
    AND (lcd.TRANSACTION = 'MOLDING' OR lcd.TRANSACTION = 'SUPERMARKET')
    AND ${params} `;
}

export const qryGetDtlWipMolSite = `SELECT smo.CUT_SITE AS SITE, SUM(od.ORDER_QTY) WIP
FROM scan_molding_in smo
JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
WHERE NOT EXISTS (
	SELECT 1
	FROM scan_molding_out sso
	WHERE sso.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(sso.CUT_SCAN_TIME) <= :date
) AND DATE(smo.CUT_SCAN_TIME)  <= :date
GROUP BY smo.CUT_SITE`;

export const qryGetDtlWipSupSite = ` SELECT smo.CUT_SITE AS SITE, SUM(od.ORDER_QTY) WIP
                    FROM scan_supermarket_in smo
                    JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
                    WHERE NOT EXISTS (
                      SELECT 1
                      FROM scan_supermarket_out sso
                      WHERE sso.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(sso.CUT_SCAN_TIME) <= :date
                      ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                      GROUP BY smo.CUT_SITE`;

export const qryGetDtlWipSewInSite = `SELECT smo.CUT_SITE AS SITE, SUM(od.ORDER_QTY) WIP
                      FROM scan_supermarket_out smo
                      JOIN order_detail od ON od.BARCODE_SERIAL = smo.BARCODE_SERIAL
                      WHERE NOT EXISTS (
                        SELECT 1
                        FROM scan_sewing_in ssi
                        WHERE ssi.BARCODE_SERIAL = smo.BARCODE_SERIAL AND DATE(ssi.SEWING_SCAN_TIME) <= :date
                        ) AND DATE(smo.CUT_SCAN_TIME)  <= :date
                        GROUP BY smo.CUT_SITE`;
