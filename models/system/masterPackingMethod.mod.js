import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const ModelPackingMethod = db.define(
    "master_packing_method",
    {
      ID: {
        type: DataTypes.INTEGER(200),
        autoIncrement: true,
        primaryKey: true
      },
      CODE: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        unique: true
      },
      DESCRIPTION: {
        type: DataTypes.STRING(200),
        allowNull: true
      }
    },
    {
      tableName: "master_packing_method",
      timestamps: false, // No createdAt / updatedAt in the DDL
    }
  );