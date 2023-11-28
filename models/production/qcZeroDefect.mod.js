import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const QryListSiteZd = `SELECT DISTINCT
zis.SITE, zis.SITE_NAME, zis.CUS_NAME, zis.SITE_NAME id, zis.SITE_NAME name
FROM zd_item_siteline zis
WHERE zis.ZD_STATUS  = 1`;

export const QryListLineZd = `SELECT  zis.SITE, zis.SITE_NAME, zis.CUS_NAME, zis.ID_SITELINE, zis.LINE_NAME,
zis.ID_SITELINE id, CONCAT(zis.SITE_NAME, ' - ', zis.LINE_NAME)  name 
FROM zd_item_siteline zis  WHERE zis.ZD_STATUS  = 1`;

export const QryPoNoSoruce = `SELECT a.SCH_ID, a.SCH_SITE AS SITE_NAME, a.SCH_ID_SITELINE, c.LINE_NAME AS LINE_NAME, 
b.CUSTOMER_NAME,
b.ORDER_REFERENCE_PO_NO,
b.ORDER_STYLE_DESCRIPTION, b.CUSTOMER_DIVISION, b.ITEM_COLOR_NAME, 
b.ITEM_COLOR_CODE, b.ORDER_PRODUCT_ITEM_TYPE AS PROD_SUBCATEGORY,  
b.ORDER_REFERENCE_PO_NO AS name, DATE_FORMAT(a.SCH_PROD_MONTH, '%M/%Y') ACT_PROD_MONTH,
'' AS AUDITOR_NAME, CURDATE() AS DATE_INSPECTION,
a.SCH_CAPACITY_ID
FROM weekly_prod_schedule a 
LEFT JOIN  viewcapacity b ON b.ID_CAPACITY = a.SCH_CAPACITY_ID
LEFT JOIN zd_item_siteline c ON a.SCH_ID_SITELINE = c.ID_SITELINE
WHERE b.CUSTOMER_NAME = 'PVH' AND c.ZD_STATUS = 1 
AND b.ORDER_REFERENCE_PO_NO LIKE :search 
ORDER BY c.ID_SITELINE`;

export const QueryListDefPvh = `SELECT 
CONCAT(a.DEFECT_INTERNALID, ' - ', a.DEFECT_NAME, ' || ', b.BUYER_DEFECT_CODE, ' - ', b.BUYER_DEFECT_DESCRIPTION) BUYER_DEFECT, 
b.BUYER_CODE, b.DEFECT_INTERNALID, 
b.BUYER_DEFECT_CODE, b.BUYER_DEFECT_DESCRIPTION,
a.DEFECT_INTERNALID, a.DEFECT_NAME
FROM item_defect_internal  a 
LEFT JOIN item_defect_buyer b ON a.DEFECT_INTERNALID = b.DEFECT_INTERNALID
WHERE b.BUYER_CODE = 'PVH'`;

export const QryDataZdHeader = `SELECT 
a.ID_ZD,
a.SCH_ID,
a.DATE_INSPECTION,
a.SCHEMA,
a.SITE_NAME, 
a.LINE_NAME, 
a.AUDITOR_NAME, 
a.CUSTOMER_DIVISION,
a.ORDER_REFERENCE_PO_NO,
a.ORDER_STYLE_DESCRIPTION,
a.GROUP,
a.ITEM_COLOR_CODE,
a.ITEM_COLOR_NAME,
a.PROD_SUBCATEGORY,
a.QC_TYPE_NAME,
a.SAMPLING_RULE,
a.PO_QTY, 
a.SAMPLE_QTY,
a.DEFECT_QTY,
b.USER_INISIAL USER_ADD,
a.ADD_TIME,
c.USER_INISIAL USER_MOD,
a.MOD_TIME
FROM zerodefect_header a 
LEFT JOIN xref_user_web b ON a.ADD_BY = b.USER_ID
LEFT JOIN xref_user_web c ON a.MOD_BY = c.USER_ID
WHERE a.DATE_INSPECTION BETWEEN  :startDate AND :endDate 
ORDER BY a.MOD_TIME `;

export const QryZdDetailForCombain = `SELECT 
a.ID_ZD,
a.ZD_DEFECT_CODE,
SUM(a.ZD_DEFECT_QTY) ZD_DEFECT_QTY
FROM zerodefect_detail a WHERE a.ID_ZD IN (
  SELECT zd.ID_ZD FROM zerodefect_header zd 
  WHERE zd.DATE_INSPECTION BETWEEN :startDate AND :endDate
)
GROUP BY a.ID_ZD, a.ZD_DEFECT_CODE`;

export const QryDataZdDeail = `SELECT 
a.ID_ZD,
'PVH' BUYER_CODE, a.DEFECT_INTERNALID, 
a.ZD_DEFECT_CODE, a.BUYER_DEFECT_DESCRIPTION,
a.DEFECT_INTERNALID, a.DEFECT_NAME,
a.ZD_DEFECT_QTY
FROM zerodefect_detail a WHERE a.ID_ZD = :zdId `;

export const ZeroDefectHeader = db.define(
  "zerodefect_header",
  {
    ID_ZD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    SCH_ID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    SCHEMA: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    GROUP: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    SCH_CAPACITY_ID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    SCH_ID_SITELINE: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    SITE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    LINE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    AUDITOR_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    DATE_INSPECTION: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    WEEKS: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CUSTOMER_DIVISION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ORDER_REFERENCE_PO_NO: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ORDER_STYLE_DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    PROD_SUBCATEGORY: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ITEM_COLOR_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ITEM_COLOR_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    QC_TYPE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    SAMPLING_RULE: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
    },
    RESULT_PASSFAIL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    SAMPLE_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PO_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DEFECT_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ADD_BY: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MOD_BY: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "zerodefect_header",
    createdAt: "ADD_TIME", // Jika Anda tidak menggunakan field createdAt dan updatedAt
    updatedAt: "MOD_TIME", // Jika Anda tidak menggunakan field createdAt dan updatedAt
  }
);

export const ZeroDefectDetail = db.define(
  "zerodefect_detail",
  {
    ID_ZD: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      defaultValue: 0,
    },
    ZD_DEFECT_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    SCHEMA: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ZD_DEFECT_QTY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DEFECT_INTERNALID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    BUYER_DEFECT_DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    DEFECT_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ZD_ADD_BY: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ZD_ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ZD_MOD_BY: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ZD_MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "zerodefect_detail",
    createdAt: "ZD_ADD_TIME", // Jika Anda tidak menggunakan field createdAt dan updatedAt
    updatedAt: "ZD_MOD_TIME",
  }
);
