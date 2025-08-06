import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const ModelProjectionOrder = db.define('projection_order', {
    PRJ_ID: {
      type: DataTypes.CHAR(10),
      primaryKey: true,
      allowNull: false
    },
    PRJ_CODE: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    PRJ_DESCRIPTION: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    PRJ_STATUS: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    CUSTOMER_ID: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    CUSTOMER_DIVISION_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CUSTOMER_SEASON_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ORDER_CONFIRMED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    UOM_CODE: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    CURRENCY_CODE: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    ORDER_QTY: {
      type: DataTypes.INTEGER(100),
      allowNull: true
    },
    UNIT_PRICE: {
      type: DataTypes.DECIMAL(60, 6),
      allowNull: true
    },
    CONTRACT_NO: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    CONTRACT_CONFIRMED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ORDER_PERIOD_DATE_FROM: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ORDER_PERIOD_DATE_TO: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    NOTE_REMARKS: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CREATE_BY: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UPDATE_BY: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'projection_order',
    timestamps: false
  });


  export const queryGetProjectionOrder = `
  SELECT
	prj.PRJ_ID,
	prj.PRJ_CODE,
	prj.PRJ_DESCRIPTION,
	prj.CUSTOMER_ID,
	cd.CTC_NAME AS CUSTOMER_NAME,
	prj.CUSTOMER_DIVISION_ID,
	cpd.CTPROD_DIVISION_CODE AS CUSTOMER_DIVISION_CODE,
	cpd.CTPROD_DIVISION_NAME AS CUSTOMER_DIVISION_NAME,
	prj.CUSTOMER_SEASON_ID,
	cps.CTPROD_SESION_CODE AS CUSTOMER_SEASON_CODE,
	cps.CTPROD_SESION_NAME  AS CUSTOMER_SEASON_NAME,
	prj.ORDER_CONFIRMED_DATE,
	prj.UOM_CODE,
	prj.CURRENCY_CODE,
	prj.ORDER_QTY,
	prj.UNIT_PRICE,
	prj.CONTRACT_NO,
	prj.CONTRACT_CONFIRMED_DATE,
	prj.ORDER_PERIOD_DATE_FROM,
	prj.ORDER_PERIOD_DATE_TO,
	prj.NOTE_REMARKS,
	prj.CREATE_BY,
	xuw.USER_INISIAL AS CREATE_INISIAL,
	prj.CREATE_DATE,
	prj.UPDATE_BY,
	xuw2.USER_INISIAL AS UPDATE_INISIAL,
	prj.UPDATE_DATE,
	prj.PRJ_STATUS
FROM
	projection_order prj
LEFT JOIN customer_detail cd ON cd.CTC_ID = prj.CUSTOMER_ID 
LEFT JOIN customer_product_division cpd ON cpd.CTPROD_DIVISION_ID = prj.CUSTOMER_DIVISION_ID 
LEFT JOIN customer_product_season cps ON cps.CTPROD_SESION_ID = prj.CUSTOMER_SEASON_ID
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = prj.CREATE_BY 
LEFT JOIN xref_user_web xuw2 ON xuw2.USER_ID = prj.UPDATE_BY 
ORDER BY prj.PRJ_ID ASC
  `