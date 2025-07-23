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
export const QueryGetHolidayByYear = `SELECT HOLIDAY_ID, REASON, TYPE, HOLIDAY_DATE
FROM calendar_holidays WHERE YEAR(HOLIDAY_dATE) = :year ORDER BY HOLIDAY_DATE`;
export const QueryGetWorkingDays = `SELECT WORKING_DAY_ID, DAY, IS_WORKING_DAY
FROM working_days ORDER BY WORKING_DAY_ID`;
export const QueryGetGenerateWorkingDays = `SELECT a.GENERATED_WORKING_DAY_ID , a.YEAR , a.MONTH , a.ALLOCATED_WORK_DAYS , a.SCHEDULING_WORK_DAYS , a.CONFIRMED_FLAG , a.CONFIRMED_DATE , a.CREATED_AT , b.USER_INISIAL CREATED_BY, c.USER_INISIAL CONFIRMED_BY   from generated_working_days a
INNER JOIN xref_user_web b on a.CREATED_BY = b.USER_ID
INNER JOIN xref_user_web c on a.CONFIRMED_BY = c.USER_ID
WHERE a.YEAR = :year`;