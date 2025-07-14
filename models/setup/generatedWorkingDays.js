import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const GeneratedWorkingDays = db.define(
  "generated_working_days",
  {
    GENERATED_WORKING_DAY_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    YEAR: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MONTH: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    ALLOCATED_WORK_DAYS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SCHEDULING_WORK_DAYS: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CONFIRMED_FLAG: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    CONFIRMED_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    CONFIRMED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  }
);

export default GeneratedWorkingDays;
