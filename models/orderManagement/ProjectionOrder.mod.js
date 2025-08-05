import db from "../../config/database.js";


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
    CUSTOMER_ID: {
      type: DataTypes.CHAR(10),
      allowNull: false
    },
    CUSTOMER_BRAND_ID: {
      type: DataTypes.INTEGER(100),
      allowNull: true
    },
    CUSTOMER_SEASON_ID: {
      type: DataTypes.INTEGER(100),
      allowNull: true
    },
    ORDER_CONFIRMED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ORDER_UOM_CODE: {
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