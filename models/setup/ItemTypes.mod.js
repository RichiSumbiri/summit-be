import db from "../../config/database.js";
import { DataTypes } from "sequelize";



export const MasterItemTypes = db.define('master_item_type', {
    ITEM_TYPE_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ITEM_TYPE_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    ITEM_TYPE_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ITEM_GROUP_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ITEM_TYPE_STOCK: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true
    },
    ITEM_TYPE_ACTIVE: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true
    }
  }, {
    tableName: 'master_item_type',
    timestamps: false,
    freezeTableName: true
  });
