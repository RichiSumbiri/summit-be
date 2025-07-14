import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const CalendarHolidays = db.define(
  "calendar_holidays",
  {
    HOLIDAY_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    REASON: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    TYPE: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    HOLIDAY_DATE: {
      type: DataTypes.DATEONLY,
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

export default CalendarHolidays;
