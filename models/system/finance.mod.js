import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const MasterCurrency = db.define('master_currency', {
    CURRENCY_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    CURRENCY_CODE: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    CURRENCY_DESC: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });


export const MasterPayMethode = db.define('master_payment_methode', {
    PAYMET_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    PAYMET_CODE: {
      type: DataTypes.STRING,
      allowNull: false
    },
    PAYMET_DESC: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PAYMET_LEADTIME: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    timestamps: false
  });