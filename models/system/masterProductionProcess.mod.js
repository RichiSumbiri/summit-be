import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const masterProductionProcess = db.define(
  "master_production_process",
  {
    PRODUCTION_PROCESS_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    PRODUCTION_PROCESS_CODE: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    PRODUCTION_PROCESS_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    IS_DEFAULT: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DELETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
    deletedAt: "DELETED_AT",
    paranoid: true,
  }
);

export default masterProductionProcess;
