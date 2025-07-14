import db from "../../config/database.js";
import { DataTypes } from "sequelize";



export const MasterItemCategories = db.define('master_item_category', {
    ITEM_CATEGORY_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ITEM_CATEGORY_CODE: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: 'master_item_category_unique'
    },
    ITEM_CATEGORY_BASE_UOM: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    ITEM_CATEGORY_BASE_UOM_DESCRIPTION: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    ITEM_CATEGORY_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ITEM_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ITEM_CATEGORY_INSPECTION_FLAG: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'N'
    },
    ITEM_CATEGORY_LOTSERIAL_FLAG: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'N'
    },
    ITEM_CATEGORY_LABDIPS_AVAILABILITY: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'N'
    },
    ITEM_CATEGORY_LOTBATCH_UOM_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'master_item_category',
    timestamps: false
  });

