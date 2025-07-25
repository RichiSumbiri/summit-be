import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const ModelShippingTerms = db.define('master_shipping_terms', {
    SHIPPING_TERMS_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    SHIPPING_TERMS_CODE: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    SHIPPING_TERMS_DESC: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'master_shipping_terms',
    timestamps: false
  });
