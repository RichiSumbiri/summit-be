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
    CREATE_DATE: { type: DataTypes.DATE, allowNull: true },
    UPDATE_DATE: { type: DataTypes.DATE, allowNull: true },
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
    NEW_MANUFACTURING_SITE: {
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

export const OrderPoListingSize = db.define(
  "order_po_listing_size",
  {
    ID_POL_SIZE: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    MANUFACTURING_COMPANY: { type: DataTypes.STRING(5), allowNull: true },
    ORDER_PLACEMENT_COMPANY: { type: DataTypes.STRING(5), allowNull: true },
    CUSTOMER_NAME: { type: DataTypes.STRING(20), allowNull: true },
    CUSTOMER_DIVISION: { type: DataTypes.STRING(50), allowNull: true },
    CUSTOMER_SEASON: { type: DataTypes.STRING(5), allowNull: true },
    CUSTOMER_PROGRAM: { type: DataTypes.STRING(50), allowNull: true },
    CUSTOMER_BUY_PLAN: { type: DataTypes.STRING(50), allowNull: true },
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
    SIZE_CODE: { type: DataTypes.STRING(50), allowNull: true },
    ORDER_QTY: { type: DataTypes.INTEGER(100), allowNull: true },
    MO_QTY: { type: DataTypes.INTEGER(100), allowNull: true },
    SHIPMENT_PO_QTY: { type: DataTypes.INTEGER(50), allowNull: true },
    ORDER_UOM: { type: DataTypes.INTEGER(50), allowNull: true },
    SHIPPED_QTY: { type: DataTypes.INTEGER(100), allowNull: true },
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
    FINAL_DELIVERY_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    PLAN_EXFACTORY_DATE: {
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
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATE_DATE",
    updatedAt: "UPDATE_DATE",
  }
);

export const OrderDetailHeader = `SELECT * FROM vieworderdetailheader WHERE UPLOAD_DATE BETWEEN :startDate AND :endDate`;
export const NewOrderDtlHeader = `SELECT
	n.*, d.QTY_PRINT
 FROM (
	SELECT a.BUYER_CODE,
	a.ORDER_NO, 
	a.MO_NO,
	b.PRODUCT_CATEGORY,
	SUM(a.ORDER_QTY) QTY,
	CAST(a.CREATE_DATE AS DATE)  AS UPLOAD_DATE
	FROM order_detail a 
	LEFT JOIN order_po_listing b ON b.ORDER_NO = a.ORDER_NO
	WHERE a.ORDER_NO = :orderNo
	GROUP BY a.BUYER_CODE, a.ORDER_NO
) n LEFT JOIN (
		SELECT b.ORDER_NO,
		SUM(b.ORDER_QTY) QTY_PRINT
		FROM order_qr_generate a
		JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
		WHERE b.ORDER_NO = :orderNo
		GROUP BY b.ORDER_NO
) d ON d.ORDER_NO = n.ORDER_NO`;

export const OrderDetailList = `SELECT N.BUYER_CODE, N.ORDER_NO, N.PRODUCT_TYPE, N.BUYER_PO, N.MO_NO, N.ORDER_VERSION, N.SHIPMENT_DATE,
N.ORDER_QTY, N.PRINT_QTY, N.ORDER_SIZE,  N.ORDER_STYLE, N.ORDER_REF, N.BARCODE_SERIAL, N.SEQUENCE, N.SITE_LINE, 
N.ITEM_COLOR_NAME, N.SITE, N.LINE, NA.SITE_NAME, NA.LINE_NAME, N.COUNTRY   
FROM (
  SELECT DISTINCT a.BUYER_CODE, a.ORDER_NO, a.PRODUCT_TYPE, SUBSTRING_INDEX(a.BUYER_PO,',',-1) BUYER_PO,
   SUBSTRING_INDEX(a.MO_NO,',',-1) MO_NO, a.ORDER_VERSION, a.SHIPMENT_DATE, b.COUNTRY,
  a.ORDER_QTY, d.ORDER_QTY PRINT_QTY, a.ORDER_SIZE, a.ORDER_STYLE, a.BARCODE_SERIAL, d.BUNDLE_SEQUENCE SEQUENCE, a.SITE_LINE, b.ITEM_COLOR_NAME,
  SUBSTRING_INDEX(a.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(a.SITE_LINE,' ',-1)  LINE,
  b.ORDER_REFERENCE_PO_NO ORDER_REF
  FROM order_detail a 
  LEFT JOIN  order_po_listing b ON b.ORDER_NO = :orderNo AND b.MO_NO =  SUBSTRING_INDEX(a.MO_NO,',',-1) 
  AND b.ORDER_PO_ID = SUBSTRING_INDEX(a.BUYER_PO,',',-1) -- jika MO ada 2 ambil mo terakhir
  LEFT JOIN (
	  SELECT DISTINCT b.BUYER_CODE, b.ORDER_NO, a.BARCODE_SERIAL, a.BUNDLE_SEQUENCE, b.ORDER_QTY
    FROM order_qr_generate a 
    LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL 
    WHERE  b.ORDER_NO = :orderNo
  ) d ON d.BARCODE_SERIAL = a.BARCODE_SERIAL
  WHERE a.ORDER_NO = :orderNo ORDER BY a.ORDER_SIZE, a.CREATE_DATE, a.BARCODE_SERIAL
)N LEFT JOIN (	SELECT DISTINCT a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME FROM item_siteline a)
NA ON NA.SITE = N.SITE AND NA.LINE = N.LINE
`;

// export const OrderDetailList = `SELECT N.BUYER_CODE, N.ORDER_NO, N.PRODUCT_TYPE, N.BUYER_PO, N.MO_NO, N.ORDER_VERSION, N.SHIPMENT_DATE,
// N.ORDER_QTY, N.PRINT_QTY, N.ORDER_SIZE, N.ORDER_STYLE, N.ORDER_REF, N.BARCODE_SERIAL, N.SITE_LINE,
// N.ITEM_COLOR_NAME, N.SITE, N.LINE, NA.SITE_NAME, NA.LINE_NAME
// FROM (
//   SELECT DISTINCT a.BUYER_CODE, a.ORDER_NO, a.PRODUCT_TYPE, a.BUYER_PO, SUBSTRING_INDEX(a.MO_NO,',',-1) MO_NO, a.ORDER_VERSION, a.SHIPMENT_DATE,
//   a.ORDER_QTY, d.ORDER_QTY PRINT_QTY, a.ORDER_SIZE, a.ORDER_STYLE, a.BARCODE_SERIAL, a.SITE_LINE, b.ITEM_COLOR_NAME,
//   SUBSTRING_INDEX(a.SITE_LINE,' ',1) SITE, SUBSTRING_INDEX(a.SITE_LINE,' ',-1)  LINE,
//   SUBSTRING_INDEX(b.ORDER_REFERENCE_PO_NO, ' ', 1) ORDER_REF
//   FROM order_detail a
//   LEFT JOIN (
//   	SELECT * FROM order_po_listing c WHERE c.ORDER_NO = :orderNo
//   ) b ON b.MO_NO =  SUBSTRING_INDEX(a.MO_NO,',',-1) -- jika MO ada 2 ambil mo terakhir
//   LEFT JOIN (
// 	  SELECT DISTINCT b.BUYER_CODE, b.ORDER_NO, a.BARCODE_SERIAL, a.BUNDLE_SEQUENCE, b.ORDER_QTY
// 	  FROM order_qr_generate a
// 	  LEFT JOIN order_detail b ON a.BARCODE_SERIAL = b.BARCODE_SERIAL AND b.ORDER_NO = :orderNo
//   ) d ON d.BARCODE_SERIAL = a.BARCODE_SERIAL
//   WHERE a.ORDER_NO = :orderNo ORDER BY  a.ORDER_SIZE, a.BARCODE_SERIAL
// )N LEFT JOIN (	SELECT DISTINCT a.SITE, a.LINE, a.SITE_NAME, a.LINE_NAME FROM item_siteline a)
// NA ON NA.SITE = N.SITE AND NA.LINE = N.LINE`;

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
    PACKING_METHOD: { type: DataTypes.STRING },
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
a.COLOR_CODE, a.COLOR_NAME, a.EX_FACTORY, a.SIZE_CODE, a.PACKING_METHOD, a.TOTAL_QTY
, na.SCH_SIZE_QTY SCH_QTY, 
CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END BALANCE
FROM po_matrix_delivery a 
LEFT JOIN viewcapacity b ON a.SITE_CODE = b.MANUFACTURING_SITE 
	AND a.PROD_MONTH = b.PRODUCTION_MONTH 
	AND a.EX_FACTORY = IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE)
	AND a.ORDER_NO = b.ORDER_NO 
 	AND a.COLOR_CODE = b.ITEM_COLOR_CODE
LEFT JOIN  (
	SELECT n.PDM_ID, n.ID_CAP_SIZE, n.ID_CAPACITY, n.SCH_ID, n.SCH_SIZE_ID, n.SIZE_CODE, 
	IFNULL(o.NEW_PLAN_EXFACTORY_DATE, o.PLAN_EXFACTORY_DATE) EX_FACTORY,
	n.PACKING_METHOD, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
	FROM view_weekly_sch_size n
	LEFT JOIN weekly_prod_schedule m ON m.SCH_ID = n.SCH_ID
	LEFT JOIN viewcapacity o ON o.ID_CAPACITY = m.SCH_CAPACITY_ID
	WHERE n.ID_CAP_SIZE = CONCAT(SUBSTRING_INDEX( :capId,'.',5),'.', SUBSTRING_INDEX( :capId,'.',-1))
	GROUP BY  n.SIZE_CODE, n.PACKING_METHOD,   IFNULL(o.NEW_PLAN_EXFACTORY_DATE, o.PLAN_EXFACTORY_DATE)  
) na ON na.SIZE_CODE = a.SIZE_CODE AND na.PACKING_METHOD = a.PACKING_METHOD AND na.EX_FACTORY = IFNULL(b.NEW_PLAN_EXFACTORY_DATE, b.PLAN_EXFACTORY_DATE)
WHERE b.ID_CAPACITY = :capId`;
// export const QueryGetPOMatrix = `SELECT b.ID_CAPACITY, a.PDM_ID, a.SITE_CODE, a.PROD_MONTH, a.BUYER_CODE, a.ORDER_NO, a.ORDER_REF_NO, a.ORDER_PO_STYLE_REF,
// a.COLOR_CODE, a.COLOR_NAME, a.EX_FACTORY, a.SIZE_CODE, a.PACKING_METHOD, a.TOTAL_QTY
// , na.SCH_SIZE_QTY SCH_QTY,
// CASE WHEN ISNULL(na.SCH_SIZE_QTY) THEN a.TOTAL_QTY ELSE a.TOTAL_QTY-na.SCH_SIZE_QTY END BALANCE
// FROM po_matrix_delivery a
// LEFT JOIN viewcapacity b ON a.SITE_CODE = b.MANUFACTURING_SITE
// 	AND a.PROD_MONTH = b.PRODUCTION_MONTH
// 	AND a.EX_FACTORY = IF(b.NEW_PLAN_EXFACTORY_DATE, b.NEW_PLAN_EXFACTORY_DATE,b.PLAN_EXFACTORY_DATE)
// 	AND a.ORDER_NO = b.ORDER_NO
//  	AND a.COLOR_CODE = b.ITEM_COLOR_CODE
// LEFT JOIN  (
// 	SELECT n.PDM_ID, n.ID_CAP_SIZE, n.ID_CAPACITY, n.SCH_ID, n.SCH_SIZE_ID, n.SIZE_CODE,  n.PACKING_METHOD, sum(n.SCH_SIZE_QTY) SCH_SIZE_QTY
// 	FROM view_weekly_sch_size n
// 	WHERE n.ID_CAP_SIZE = CONCAT(SUBSTRING_INDEX( :capId,'.',5),'.', SUBSTRING_INDEX( :capId,'.',-1))
// 	GROUP BY  n.SIZE_CODE, n.PACKING_METHOD
// ) na ON na.SIZE_CODE = a.SIZE_CODE AND na.PACKING_METHOD = na.PACKING_METHOD
// WHERE b.ID_CAPACITY = :capId`;

export const findNewCapId = `SELECT a.ID_CAPACITY, a.NEW_ID_CAPACITY
FROM viewcapacity_new_id a WHERE a.PRODUCTION_MONTH = :prodMonth AND  NEW_ID_CAPACITY IS NOT NULL `;

export const getOrderSizeByBlk = `SELECT 
a.ORDER_NO,
a.CUSTOMER_NAME,
a.ORDER_REFERENCE_PO_NO, 
a.MO_NO,
a.PO_REF_CODE, 
a.PRODUCT_ITEM_CODE,
a.ORDER_STYLE_DESCRIPTION,
a.ITEM_COLOR_NAME,
a.ITEM_COLOR_CODE,
a.ORDER_PO_ID,
a.SIZE_CODE,
a.PLAN_EXFACTORY_DATE,
a.MANUFACTURING_SITE,
a.COUNTRY,
a.PRODUCT_TYPE,
a.ORDER_QTY,
a.MO_QTY
FROM order_po_listing_size a WHERE a.ORDER_NO = :orderId `;

export const getListBlkNo = `SELECT 
a.ORDER_NO 
FROM order_po_listing_size a WHERE a.ORDER_NO LIKE :orderId AND a.MO_NO IS NOT NULL
GROUP BY a.ORDER_NO `;

export const getDetailPoSize = `SELECT 
a.ORDER_NO,
a.CUSTOMER_NAME,
a.ORDER_REFERENCE_PO_NO, 
a.MO_NO,
a.PO_REF_CODE, 
a.PRODUCT_ITEM_CODE,
a.ORDER_STYLE_DESCRIPTION,
a.ITEM_COLOR_NAME,
a.ITEM_COLOR_CODE,
a.ORDER_PO_ID,
a.SIZE_CODE,
a.PLAN_EXFACTORY_DATE,
a.MANUFACTURING_SITE,
a.COUNTRY,
a.PRODUCT_TYPE,
a.ORDER_QTY,
a.MO_QTY,
IFNULL(sum(b.ORDER_QTY),0) QTY_ALOCATION
FROM order_po_listing_size a
LEFT JOIN view_order_detail b ON a.ORDER_PO_ID = b.BUYER_PO AND a.SIZE_CODE = b.ORDER_SIZE 
WHERE a.ORDER_PO_ID = :poId AND a.ITEM_COLOR_CODE =:colorCode AND a.SIZE_CODE = :sizeCode
GROUP BY a.ORDER_NO, a.ORDER_PO_ID, a.ITEM_COLOR_CODE, a.SIZE_CODE`;

export const getDetailQrGenerate = `SELECT 
b.BARCODE_SERIAL,
a.ORDER_NO,
a.CUSTOMER_NAME,
a.ORDER_REFERENCE_PO_NO, 
a.MO_NO,
a.PO_REF_CODE, 
a.PRODUCT_ITEM_CODE,
a.ORDER_STYLE_DESCRIPTION,
a.ITEM_COLOR_NAME,
a.ITEM_COLOR_CODE,
a.ORDER_PO_ID,
a.SIZE_CODE,
a.PLAN_EXFACTORY_DATE,
a.MANUFACTURING_SITE,
a.COUNTRY,
a.PRODUCT_TYPE,
a.MO_QTY,
b.ORDER_QTY,
b.SITE_LINE
FROM order_po_listing_size a
LEFT JOIN view_order_detail b ON a.ORDER_PO_ID = b.BUYER_PO AND a.SIZE_CODE = b.ORDER_SIZE  
WHERE a.ORDER_PO_ID = :poId AND a.ITEM_COLOR_CODE = :colorCode AND a.SIZE_CODE = :sizeCode
AND SUBSTRING(b.BARCODE_SERIAL,1,3) ='SSC' `;

export const OrderPoBuyersAsli = db.define(
  "order_po_buyer",
  {
    VENDOR: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    PO_NUMBER: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    PO_ITEM: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SEGMENT: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SLOC: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ARTICLE_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ARTICLE_GENERIC: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ARTICLE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    QTY: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    COLOR_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    COLOR_DESCRIPTION: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    SIZE_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    UPC_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    PO_PRICE: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    // DPC: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true,
    // },
    // ITEM: {
    //   type: DataTypes.STRING(100),
    //   allowNull: true,
    // },
    FACTORY_NUMBER: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    FACTORY_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    CHAIN_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    FIBER_CONTENT: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    PO_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PC_PER_CTN: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ADD_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PO_DATE: {
      type: DataTypes.DATE,
    },
    EX_FACTORY: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
);

OrderPoBuyersAsli.removeAttribute("id");

export const OrderPoBuyersDetail = db.define(
  "order_po_buyer_detail",
  {
    VENDOR: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    PO_NUMBER: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    PO_ITEM: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SEGMENT: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    SLOC: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ARTICLE_TYPE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ARTICLE_GENERIC: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ARTICLE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    QTY: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    COLOR_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    COLOR_DESCRIPTION: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    SIZE_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    UPC_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    PO_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PC_PER_PACK: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ADD_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PO_DATE: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
);

OrderPoBuyersDetail.removeAttribute("id");
