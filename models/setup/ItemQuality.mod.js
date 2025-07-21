import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const ModelMasterItemQuality = db.define('master_item_quality', {
    ITEM_QUALITY_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false,
      primaryKey: true,
    },
    ITEM_QUALITY_REF_CODE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ITEM_QUALITY_DESCRIPTION: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  }, {
    tableName: 'master_item_quality',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });