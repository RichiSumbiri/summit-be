import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const CalendarHoliday = db.define(
  "item_calendar_holiday",
  {
    calendar_date: { type: DataTypes.DATEONLY, primaryKey: true },
    calendar_holiday_type: { type: DataTypes.STRING },
    calendar_holiday_reason: { type: DataTypes.STRING },
  },
  { freezeTableName: true, createdAt: false, updatedAt: false }
);

export default CalendarHoliday;

export const QueryGetHoliday = `SELECT a.calendar_date, a.calendar_holiday_type, a.calendar_holiday_reason
FROM item_calendar_holiday a WHERE YEAR(a.calendar_date) BETWEEN :startYear AND :endYear`;
export const QueryGetHolidayByDate = `SELECT a.*
FROM item_calendar_holiday a WHERE a.calendar_date BETWEEN :startDate AND :endDate`;
