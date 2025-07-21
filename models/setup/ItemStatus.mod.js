import db from "../../config/database.js";
import { DataTypes } from "sequelize";


export const ModelMasterItemStatus = db.define('master_item_status', {
    ITEM_STATUS_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false,
      primaryKey: true,
    },
    ITEM_STATUS_REF_CODE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ITEM_STATUS_DESCRIPTION: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  }, {
    tableName: 'master_item_status',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });