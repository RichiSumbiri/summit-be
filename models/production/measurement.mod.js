import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QueryBlkForMeasur = `SELECT a.PROD_MONTH, a.PRODUCTION_MONTH, a.CUSTOMER_NAME, a.ORDER_NO, a.PRODUCT_ID, 
a.PRODUCT_ITEM_ID, a.ORDER_REFERENCE_PO_NO,
a.PRODUCT_CATEGORY, a.PRODUCT_ITEM_CODE, a.PRODUCT_ITEM_DESCRIPTION, a.ORDER_STYLE_DESCRIPTION,
b.MES_CHART_NO, a.ITEM_COLOR_NAME
FROM viewblk a 
LEFT JOIN measurement_and_order  b ON b.ORDER_NO = a.ORDER_NO
WHERE a.PROD_MONTH BETWEEN :startMonth AND :endMonth 
ORDER BY a.PROD_MONTH, a.CUSTOMER_NAME`;

export const QueryListBuyer = `SELECT a.ID id, a.CUSTOMER_NAME name FROM view_list_buyer a`;
export const QueryLsitStyle = `SELECT a.PRODUCT_ITEM_ID id, 
CONCAT(a.PRODUCT_ITEM_CODE,'/',a.PRODUCT_ITEM_DESCRIPTION) name, a.PRODUCT_ITEM_CODE,  a.CUSTOMER_NAME, a.ID_BUYER
FROM view_list_style a -- WHERE a.ID_BUYER = :idBuyer`;

export const MeasurementChart = db.define(
  "measurement_chart",
  {
    MES_BUYER: {
      type: DataTypes.STRING,
    },
    MES_CHART_NO: { type: DataTypes.STRING, primaryKey: true },
    MES_STYLE: { type: DataTypes.STRING },
    MES_DESC: { type: DataTypes.STRING },
    MES_SIZES: { type: DataTypes.STRING },
    MES_UOM: { type: DataTypes.STRING },
    MES_ADD_ID: { type: DataTypes.BIGINT },
    MES_UPDATE_ID: { type: DataTypes.BIGINT },
    MES_ADD_DATE: { type: DataTypes.DATE },
    MES_UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "MES_ADD_DATE",
    updatedAt: "MES_UPDATE_DATE",
  }
);

export const MeasChartDetail = db.define(
  "measurement_chart_detail",
  {
    MES_CHART_NO: { type: DataTypes.STRING },
    POM_ID: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    SPEC: { type: DataTypes.STRING },
    ADD_ID: { type: DataTypes.BIGINT },
    MOD_ID: { type: DataTypes.BIGINT },
    ADD_TIME: { type: DataTypes.DATE },
    MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_TIME",
    updatedAt: "MOD_TIME",
  }
);
MeasChartDetail.removeAttribute("id");

export const MeasPOM = db.define(
  "measurement_pom",
  {
    MES_CHART_NO: { type: DataTypes.STRING },
    POM_ID: { type: DataTypes.STRING },
    POM_DESC: { type: DataTypes.STRING },
    POM_PLUS: { type: DataTypes.STRING },
    POM_MIN: { type: DataTypes.STRING },
    POM_ORDER: { type: DataTypes.INTEGER },
    POM_ADD_ID: { type: DataTypes.BIGINT },
    POM_MOD_ID: { type: DataTypes.BIGINT },
    POM_ADD_TIME: { type: DataTypes.DATE },
    POM_MOD_TIME: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "POM_ADD_TIME",
    updatedAt: "POM_MOD_TIME",
  }
);

MeasPOM.removeAttribute("id");

export const QueryGetPOM = `SELECT  a.POM_ORDER 'INDEX', a.POM_ID 'CODE', a.POM_DESC POM, a.POM_MIN 'TOL -', a.POM_PLUS 'TOL +'
FROM measurement_pom a WHERE a.MES_CHART_NO = :chartNo`;

export const QueryGetDtilChart = `SELECT a.MES_CHART_NO, a.POM_ID, a.SIZE_CODE, a.SPEC FROM measurement_chart_detail a WHERE a.MES_CHART_NO = :chartNo`;
export const QueryGetMesSizelist = `SELECT DISTINCT a.SIZE_CODE FROM measurement_chart_detail a WHERE a.MES_CHART_NO = :chartNo`;

export const QryMesCheckInput = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo AND a.SIZE_CODE = :sizeCode`;
export const QryMesCheckInputPom = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo AND a.POM_ID = :pomId`;
export const QrcChckMeasChartOut = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo`;

export const QryGetMesByOrder = `SELECT a.MES_CHART_NO, a.ORDER_NO, b.MES_BUYER, b.MES_STYLE, b.MES_DESC, b.MES_SIZES, b.MES_UOM, b.MES_ADD_DATE, b.MES_UPDATE_DATE
FROM  measurement_and_order a 
LEFT JOIN measurement_chart b ON b.MES_CHART_NO = a.MES_CHART_NO
WHERE  a.ORDER_NO = :orderNo`;

export const QrcChckMeasChartOrdOut = `SELECT * FROM measurement_qc_output a WHERE a.MES_CHART_NO = :chartNo AND a.ORDDER_NO = :orderNo`;

export const MeasChartNOrder = db.define(
  "measurement_and_order",
  {
    MES_CHART_NO: { type: DataTypes.STRING },
    ORDER_NO: { type: DataTypes.STRING },
    ADD_ID: { type: DataTypes.BIGINT },
    UPDATE_ID: { type: DataTypes.BIGINT },
    ADD_DATE: { type: DataTypes.DATE },
    UPDATE_DATE: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "ADD_DATE",
    updatedAt: "UPDATE_DATE",
  }
);
MeasChartNOrder.removeAttribute("id");

export const MeasOutput = db.define(
  "measurement_qc_output",
  {
    MES_CHART_NO: { type: DataTypes.STRING },
    POM_ID: { type: DataTypes.STRING },
    SIZE_CODE: { type: DataTypes.STRING },
    BARCODE_SERIAL: { type: DataTypes.STRING },
    MES_VALUE: { type: DataTypes.STRING },
    ORDER_NO: { type: DataTypes.STRING },
    MES_CAT: { type: DataTypes.STRING },
    MES_SEQ: { type: DataTypes.INTEGER },
    SCHD_ID: { type: DataTypes.BIGINT },
    SITE_NAME: { type: DataTypes.STRING },
    LINE_NAME: { type: DataTypes.STRING },
    SHIFT: { type: DataTypes.STRING },
    ADD_ID: { type: DataTypes.BIGINT },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

MeasOutput.removeAttribute("id");

//QC end Measurement
export const QryGetSpecQCend = `SELECT a.MES_CHART_NO, a.ORDER_NO, c.POM_ID, a.MES_UOM, c.POM_DESC, c.POM_PLUS, c.POM_MIN, b.SIZE_CODE, b.SPEC
FROM (
	SELECT a.MES_CHART_NO, a.ORDER_NO, b.MES_UOM, a.ADD_DATE 
	FROM measurement_and_order a 
	LEFT JOIN measurement_chart b ON b.MES_CHART_NO = a.MES_CHART_NO
	WHERE a.ORDER_NO = :orderNo ORDER BY a.ADD_DATE DESC LIMIT 1 
) a 
LEFT JOIN measurement_chart_detail b ON a.MES_CHART_NO = b.MES_CHART_NO
LEFT JOIN measurement_pom c ON c.MES_CHART_NO = a.MES_CHART_NO  AND b.POM_ID = c.POM_ID
WHERE b.SIZE_CODE = :sizeCode `;

export const QryGetDataMeasOut = `SELECT a.MES_CHART_NO, a.POM_ID, a.SIZE_CODE, a.MES_VALUE, a.BARCODE_SERIAL, a.MES_SEQ, a.MES_CAT, a.ORDER_NO,
a.SCHD_ID, a.SITE_NAME, a.LINE_NAME, a.SHIFT, b.MES_UOM
FROM measurement_qc_output a 
LEFT JOIN measurement_chart b ON a.MES_CHART_NO = b.MES_CHART_NO
WHERE a.BARCODE_SERIAL = :barcodeSerial  AND a.SITE_NAME = :siteName AND a.LINE_NAME = :lineName AND a.SIZE_CODE = :sizeCode`;

export const QryMeasCheck = `SELECT n.BARCODE_SERIAL, COUNT(n.BARCODE_SERIAL) CHECK_COUNT
FROM (
	SELECT a.BARCODE_SERIAL
	FROM measurement_qc_output a
	WHERE a.BARCODE_SERIAL IN (
	  	SELECT DISTINCT a.BARCODE_SERIAL FROM scan_sewing_in a
		LEFT JOIN weekly_prod_sch_detail g ON a.SCH_ID = g.SCH_ID 
		LEFT JOIN item_siteline e ON e.ID_SITELINE = g.SCHD_ID_SITELINE
		LEFT JOIN scan_sewing_out i ON i.BARCODE_SERIAL = a.BARCODE_SERIAL
		WHERE g.SCHD_PROD_DATE <= :schDate AND g.SCHD_PROD_DATE >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND a.SEWING_SCAN_LOCATION = :sitename  AND 
		e.LINE_NAME = :linename AND ISNULL(i.BARCODE_SERIAL) 
	) GROUP BY a.BARCODE_SERIAL, a.MES_SEQ
) n GROUP BY n.BARCODE_SERIAL`;
