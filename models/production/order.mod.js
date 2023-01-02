import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const Orders = db.define(
  "order_detail",
  {
    BUYER_CODE: { type: DataTypes.STRING(10), allowNull: false },
    ORDER_NO: { type: DataTypes.STRING(20), allowNull: false },
    PRODUCT_TYPE: { type: DataTypes.STRING(20), allowNull: false },
    BUYER_PO: { type: DataTypes.STRING(200), allowNull: false },
    MO_NO: { type: DataTypes.STRING(50), allowNull: false },
    ORDER_VERSION: { type: DataTypes.STRING(10), allowNull: false },
    SHIPMENT_DATE: { type: DataTypes.DATE, allowNull: false },
    SHIPMENT_DATE: { type: DataTypes.DATE, allowNull: false },
    ORDER_QTY: { type: DataTypes.INTEGER(10), allowNull: false },
    ORDER_COLOR: { type: DataTypes.STRING(100), allowNull: false },
    ORDER_SIZE: { type: DataTypes.STRING(20), allowNull: false },
    ORDER_STYLE: { type: DataTypes.STRING(255), allowNull: false },
    BARCODE_SERIAL: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true,
    },
    SITE_LINE: { type: DataTypes.STRING(20), allowNull: false },
    DATE_CREATE: { type: DataTypes.DATE, allowNull: true },
    DATE_UPDATE: { type: DataTypes.DATE, allowNull: true },
    CREATE_BY: { type: DataTypes.BIGINT },
    UPDATE_BY: { type: DataTypes.BIGINT },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const OrderPoListing = db.define(
  "order_po_listing",
  {
    MANUFACTURING_COMPANY: { type: DataTypes.STRING(5), allowNull: true },
    ORDER_PLACEMENT_COMPANY: { type: DataTypes.STRING(5), allowNull: true },
    CUSTOMER_NAME: { type: DataTypes.STRING(20), allowNull: true },
    CUSTOMER_DIVISION: { type: DataTypes.STRING(50), allowNull: true },
    CUSTOMER_SEASON: { type: DataTypes.STRING(5), allowNull: true },
    CUSTOMER_PROGRAM: { type: DataTypes.STRING(50), allowNull: true },
    CUSTOMER_BUY_PLAN: { type: DataTypes.STRING(50), allowNull: true },
    PROJECTION_ORDER_ID: { type: DataTypes.STRING(10), allowNull: true },
    PROJECTION_ORDER_CODE: { type: DataTypes.STRING(50), allowNull: true },
    ORDER_TYPE_CODE: { type: DataTypes.STRING(3), allowNull: true },
    ORDER_NO: { type: DataTypes.STRING(10), allowNull: true },
    ORDER_REFERENCE_PO_NO: { type: DataTypes.STRING(50), allowNull: true },
    ORDER_STYLE_DESCRIPTION: { type: DataTypes.STRING(255), allowNull: true },
    ORDER_PO_ID: { type: DataTypes.STRING(10), allowNull: true },
    PO_STATUS: { type: DataTypes.STRING(100), allowNull: true },
    MO_AVAILABILITY: { type: DataTypes.BOOLEAN, allowNull: true },
    MO_NO: { type: DataTypes.STRING(10), allowNull: true },
    MO_RELEASED_DATE: { type: DataTypes.DATE, allowNull: true },
    PO_REF_CODE: { type: DataTypes.STRING(255), allowNull: true },
    PRODUCT_ITEM_ID: { type: DataTypes.STRING(50), allowNull: true },
    PRODUCT_ITEM_CODE: { type: DataTypes.STRING(50), allowNull: true },
    PRODUCT_ITEM_DESCRIPTION: { type: DataTypes.STRING(255), allowNull: true },
    PRODUCT_ID: { type: DataTypes.STRING(10), allowNull: true },
    PRODUCT_TYPE: { type: DataTypes.STRING(10), allowNull: true },
    PRODUCT_CATEGORY: { type: DataTypes.STRING(50), allowNull: true },
    ITEM_COLOR_CODE: { type: DataTypes.STRING(50), allowNull: true },
    ITEM_COLOR_NAME: { type: DataTypes.STRING(50), allowNull: true },
    ORDER_QTY: { type: DataTypes.INTEGER(100), allowNull: true },
    MO_QTY: { type: DataTypes.INTEGER(100), allowNull: true },
    SHIPMENT_PO_QTY: { type: DataTypes.INTEGER(50), allowNull: true },
    ORDER_UOM: { type: DataTypes.INTEGER(50), allowNull: true },
    PLAN_MO_QTY_PERCENTAGE: { type: DataTypes.DOUBLE, allowNull: true },
    SHIPMENT_PO_QTY_VARIANCE: { type: DataTypes.DOUBLE, allowNull: true },
    PLAN_SHIPMENT_PO_PERCENTAGE: { type: DataTypes.DOUBLE, allowNull: true },
    SHIPPED_QTY: { type: DataTypes.INTEGER(100), allowNull: true },
    ORDER_TO_SHIPPED_PERCENTAGE: { type: DataTypes.DOUBLE, allowNull: true },
    DELIVERY_TERM: { type: DataTypes.STRING(50), allowNull: true },
    PRICE_TYPE: { type: DataTypes.STRING(50), allowNull: true },
    UNIT_PRICE: { type: DataTypes.DOUBLE(200, 4), allowNull: true },
    MO_COST: { type: DataTypes.DOUBLE(200, 4), allowNull: true },
    TOTAL_ORDER_COST: { type: DataTypes.DOUBLE(200, 4), allowNull: true },
    TOTAL_MO_COST: {
      type: DataTypes.DOUBLE(200, 4),
      allowNull: true,
    },
    CURRENCY_CODE: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    DELIVERY_LOCATION_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    DELIVERY_LOCATION_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    COUNTRY: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    PACKING_METHOD: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    DELIVERY_MODE_CODE: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    PO_CREATED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    PO_CONFIRMED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    TARGET_PCD: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    ORIGINAL_DELIVERY_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    FINAL_DELIVERY_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    PLAN_EXFACTORY_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    PO_EXPIRY_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    PRODUCTION_MONTH: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    MANUFACTURING_SITE: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    ORDER_PRODUCT_ITEM_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ORDER_PRODUCT_ITEM_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ORDER_PRODUCT_ITEM_DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ORDER_PRODUCT_ITEM_TYPE: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    NEW_TARGET_PCD: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    NEW_FINAL_DELIVERY_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    NEW_PLAN_EXFACTORY_DATE: {
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

Orders.removeAttribute("id");
OrderPoListing.removeAttribute("id");

// export const OrderDetailList = `SELECT a.BUYER_CODE, a.ORDER_NO, a.MO_NO, SUM(a.ORDER_QTY) QTY, a.CREATE_DATE
// FROM order_detail a GROUP BY a.BUYER_CODE, a.ORDER_NO WHERE DATE(a.CREATE_DATE) BETWEEN :startDate AND :endDate
// ORDER BY a.CREATE_DATE DESC`;

export const OrderDetailHeader = `SELECT * FROM vieworderdetailheader WHERE UPLOAD_DATE BETWEEN :startDate AND :endDate`;

//export const OrderDetailList = `SELECT * FROM ViewOrderDetailList WHERE ORDER_N=:orderNo`;

export const OrderDetailList = `SELECT DISTINCT a.BUYER_CODE, a.ORDER_NO, a.PRODUCT_TYPE, a.BUYER_PO, a.MO_NO, a.ORDER_VERSION, a.SHIPMENT_DATE,
a.ORDER_QTY, d.ORDER_QTY PRINT_QTY, a.ORDER_SIZE, a.ORDER_STYLE, a.BARCODE_SERIAL, a.SITE_LINE, b.ITEM_COLOR_NAME, SUBSTRING_INDEX(b.ORDER_REFERENCE_PO_NO, ' ', 1) ORDER_REF, b.COUNTRY
FROM order_detail a 
LEFT JOIN (
	SELECT * FROM order_po_listing c WHERE c.ORDER_NO = :orderNo
	) b ON b.MO_NO = a.MO_NO
LEFT JOIN (
	SELECT DISTINCT b.BUYER_CODE, b.ORDER_NO, a.BARCODE_SERIAL, a.BUNDLE_SEQUENCE, b.ORDER_QTY
	FROM order_qr_generate a 
	LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL AND b.ORDER_NO = :orderNo
) d ON d.BARCODE_SERIAL = a.BARCODE_SERIAL
WHERE a.ORDER_NO = :orderNo ORDER BY  a.ORDER_SIZE, a.BARCODE_SERIAL`;

export const PoMatrixDelivery = db.define(
  "po_matrix_delivery",
  {
    PDM_ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SITE_CODE: { type: DataTypes.STRING },
    PROD_MONTH: { type: DataTypes.STRING },
    BUYER_CODE: { type: DataTypes.STRING },
    ORDER_NO: { type: DataTypes.STRING },
    ORDER_REF_NO: { type: DataTypes.STRING },
    ORDER_PO_STYLE_REF: { type: DataTypes.STRING },
    COLOR_CODE: { type: DataTypes.STRING },
    COLOR_NAME: { type: DataTypes.STRING },
    EX_FACTORY: { type: DataTypes.DATE },
    SIZE_CODE: { type: DataTypes.STRING },
    TOTAL_QTY: { type: DataTypes.INTEGER },
    PDM_ADD_DATE: { type: DataTypes.DATE },
    PDM_MOD_DATE: { type: DataTypes.DATE },
    PDM_ADD_ID: { type: DataTypes.BIGINT },
    PDM_MOD_ID: { type: DataTypes.BIGINT },
  },
  {
    freezeTableName: true,
    createdAt: "PDM_ADD_DATE",
    updatedAt: "PDM_MOD_DATE",
  }
);

export const QueryGetPOMatrix = `SELECT b.ID_CAPACITY, a.PDM_ID, a.SITE_CODE, a.PROD_MONTH, a.BUYER_CODE, a.ORDER_NO, a.ORDER_REF_NO, a.ORDER_PO_STYLE_REF, 
a.COLOR_CODE, a.COLOR_NAME, a.EX_FACTORY, a.SIZE_CODE, a.TOTAL_QTY
, na.SCH_SIZE_QTY SCH_QTY, 
CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END BALANCE
FROM po_matrix_delivery a 
LEFT JOIN viewcapacity b ON a.SITE_CODE = b.MANUFACTURING_SITE 
	AND a.PROD_MONTH = b.PRODUCTION_MONTH
	AND a.EX_FACTORY = b.PLAN_EXFACTORY_DATE 
	AND a.ORDER_NO = b.ORDER_NO 
	#AND a.ORDER_REF_NO = b.ORDER_REFERENCE_PO_NO 
	AND a.COLOR_CODE = b.ITEM_COLOR_CODE
LEFT JOIN (
	SELECT  n.PDM_ID, n.SCH_ID, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
	FROM weekly_sch_size n 
	WHERE n.ID_CAPACITY = :capId
	GROUP BY n.PDM_ID
) na ON na.PDM_ID  = a.PDM_ID
WHERE b.ID_CAPACITY = :capId`;
