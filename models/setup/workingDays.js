import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const WorkingDays = db.define(
  "working_days",
  {
    WORKING_DAY_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DAY: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    IS_WORKING_DAY: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  }
);

export default WorkingDays;
