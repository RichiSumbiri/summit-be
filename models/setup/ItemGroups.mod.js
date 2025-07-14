import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const MasterItemGroup = db.define('master_item_group', {
    ITEM_GROUP_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ITEM_GROUP_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: 'master_item_group_unique',
    },
    ITEM_GROUP_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ITEM_GROUP_ACTIVE: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'Y',
    },
    CREATE_BY: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'master_item_group',
    timestamps: false, // since you don't have createdAt/updatedAt fields
  });

