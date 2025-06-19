import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const MasterLocation = dbSPL.define('master_location', {
    LOCATION_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    LOCATION_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    LOCATION_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ADD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MOD_TIME: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'master_location',
    timestamps: false, // because there are no createdAt / updatedAt fields
  });
