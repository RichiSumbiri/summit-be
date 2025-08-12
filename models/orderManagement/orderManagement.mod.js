import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const ModelOrderPOHeader = db.define('order_po_header', {
  ORDER_ID: {
    type: DataTypes.CHAR(10),
    allowNull: false,
    primaryKey: true,
  },
  ORDER_TYPE_CODE: {
    type: DataTypes.CHAR(3),
    allowNull: false,
  },
  ORDER_STATUS: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  ORDER_PLACEMENT_COMPANY: {
    type: DataTypes.CHAR(3),
    allowNull: true,
  },
  ORDER_REFERENCE_PO_NO: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ORDER_STYLE_DESCRIPTION: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ITEM_ID: {
    type: DataTypes.CHAR(10),
    allowNull: true,
  },
  PRICE_TYPE_CODE: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  CUSTOMER_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_DIVISION_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_SEASON_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_PROGRAM_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CUSTOMER_BUYPLAN_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ORDER_UOM: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  ORDER_CONFIRMED_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  CONTRACT_CONFIRMED_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  CONTRACT_EXPIRED_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  CONTRACT_NO: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  PROJECTION_ORDER_ID: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  FLAG_MULTISET_ITEMS: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  SIZE_TEMPLATE_ID: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  NOTE_REMARKS: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  CREATE_BY: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  CREATE_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  UPDATE_BY: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  UPDATE_DATE: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'order_po_header',
  timestamps: false,
  freezeTableName: true,
});


export const queryGetListOrderHeader = `
SELECT
	oph.ORDER_ID,
	oph.ORDER_TYPE_CODE,
	oph.ORDER_STATUS,
	oph.ORDER_PLACEMENT_COMPANY,
	mc.NAME  AS ORDER_PLACEMENT_COMPANY_NAME,
	oph.ORDER_REFERENCE_PO_NO,
	oph.ORDER_STYLE_DESCRIPTION,
	oph.ITEM_ID,
	mii.ITEM_CODE,
	mii.ITEM_DESCRIPTION,
	oph.PRICE_TYPE_CODE,
	oph.CUSTOMER_ID,
	cd.CTC_NAME AS CUSTOMER_NAME,
	oph.CUSTOMER_DIVISION_ID,
	cpd.CTPROD_DIVISION_NAME AS CUSTOMER_DIVISION_NAME,
	oph.CUSTOMER_SEASON_ID,
	cps.CTPROD_SESION_NAME AS CUSTOMER_SEASON_NAME,
	oph.CUSTOMER_PROGRAM_ID,
	cpn.CTPROG_NAME AS CUSTOMER_PROGRAM_NAME,
	oph.CUSTOMER_BUYPLAN_ID,
	cbp.CTBUYPLAN_NAME AS CUSTOMER_BUYPLAN_NAME,
	oph.ORDER_UOM,
	oph.ORDER_CONFIRMED_DATE,
	oph.CONTRACT_CONFIRMED_DATE,
	oph.CONTRACT_EXPIRED_DATE,
	oph.CONTRACT_NO,
	oph.PROJECTION_ORDER_ID,
	po.PRJ_CODE AS PROJECTION_ORDER_CODE,
	po.PRJ_DESCRIPTION AS PROJECTION_ORDER_DESCRIPTION,
	oph.FLAG_MULTISET_ITEMS,
	oph.SIZE_TEMPLATE_ID,
	oph.NOTE_REMARKS,
  oph.CREATE_BY,
	xuw.USER_NAME AS CREATE_NAME,
	oph.CREATE_DATE,
	oph.UPDATE_BY,
	xuw2.USER_NAME AS UPDATE_NAME,
	oph.UPDATE_DATE
FROM
	order_po_header oph
LEFT JOIN master_company mc ON mc.CODE = oph.ORDER_PLACEMENT_COMPANY 
LEFT JOIN master_item_id mii ON mii.ITEM_ID = oph.ITEM_ID 
LEFT JOIN customer_detail cd ON cd.CTC_ID = oph.CUSTOMER_ID 
LEFT JOIN customer_product_division cpd ON cpd.CTPROD_DIVISION_ID = oph.CUSTOMER_DIVISION_ID 
LEFT JOIN customer_product_season cps ON cps.CTPROD_SESION_ID = oph.CUSTOMER_SEASON_ID 
LEFT JOIN customer_program_name cpn ON cpn.CTPROG_ID = oph.CUSTOMER_PROGRAM_ID 
LEFT JOIN customer_buy_plan cbp ON cbp.CTBUYPLAN_ID = oph.CUSTOMER_BUYPLAN_ID 
LEFT JOIN projection_order po ON po.PRJ_ID = oph.PROJECTION_ORDER_ID 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = oph.CREATE_BY 
LEFT JOIN xref_user_web xuw2 ON xuw2.USER_ID = oph.UPDATE_BY 
WHERE oph.ORDER_STATUS= :orderStatus    `;