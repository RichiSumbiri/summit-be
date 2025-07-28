import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ModelDeliveryMode = db.define('master_delivery_mode', {
    DELIVERY_MODE_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    DELIVERY_MODE_CODE: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    DELIVERY_MODE_DESC: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'master_delivery_mode',
    timestamps: false
  });