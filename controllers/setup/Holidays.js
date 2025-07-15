import db from "../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QueryGetHoliday,
  QueryGetHolidayByDate,
  QueryGetHolidayByYear,
  QueryGetGenerateWorkingDays,
} from "../../models/setup/holidays.mod.js";
import CalendarHolidays from "../../models/setup/calendarHolidays.mod.js";
import WorkingDays from "../../models/setup/workingDays.js";
import { GeneratedWorkingDays } from "../../models/setup/generatedWorkingDays.js";
import moment from "moment/moment.js";

export const getCalendarHolidays = async (req, res) => {
  try {
    const { year } = req.params;
    const holidays = await db.query(QueryGetHolidayByYear, {
      replacements: {
        year: year,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(holidays);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Action Problem With Get Holidays Data", data: err });
  }
};

export const createHoliday = async (req, res) => {
  const dataHoliday = req.body;
  const cekHolidayDate = await CalendarHolidays.findAll({
    attributes: ["HOLIDAY_DATE"],
    where: {
      HOLIDAY_DATE: dataHoliday.HOLIDAY_DATE,
    },
  });

  await adjustGeneratedWorkingDays({
    date: dataHoliday.HOLIDAY_DATE,
    action: "create",
  });

  if (cekHolidayDate.length !== 0)
    return res.status(400).json({ message: "Holiday date already exist" });
  await CalendarHolidays.create(dataHoliday);
  res.json({
    // datanew: resData,
    message: "Calendar Holiday Added Successfully",
  });
};

export const updateHoliday = async (req, res) => {
  const { HOLIDAY_ID, ...dataHoliday } = req.body;

  try {
    const holiday = await CalendarHolidays.findByPk(HOLIDAY_ID);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    const existingHoliday = await CalendarHolidays.findOne({
      where: {
        HOLIDAY_DATE: dataHoliday.HOLIDAY_DATE,
        HOLIDAY_ID: { [Op.ne]: HOLIDAY_ID },
      },
    });

    if (existingHoliday) {
      return res.status(400).json({ message: "Holiday date already exists" });
    }

    const oldDate = holiday.HOLIDAY_DATE;
    await holiday.update(dataHoliday);

    await adjustGeneratedWorkingDays({
      date: dataHoliday.HOLIDAY_DATE,
      action: "update",
      oldDate: oldDate,
    });

    res.json({ message: "Calendar Holiday Updated Successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update holiday",
      error: err.message,
    });
  }
};

export const deleteHoliday = async (req, res) => {
  const { HOLIDAY_ID } = req.body;

  try {
    const holiday = await CalendarHolidays.findByPk(HOLIDAY_ID);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    await holiday.destroy();

    await adjustGeneratedWorkingDays({
      date: holiday.HOLIDAY_DATE,
      action: "delete",
    });

    res.json({ message: "Calendar Holiday deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete holiday", error: err.message });
  }
};

export const generateWorkingDays = async (req, res) => {
  const { months } = req.body;

  if (!Array.isArray(months) || months.length === 0) {
    return res.status(400).json({ message: "Invalid data format" });
  }

  try {
    for (const item of months) {
      const { MONTH, YEAR, WORKING_DAYS, USER_ID } = item;

      const existing = await GeneratedWorkingDays.findOne({
        where: {
          MONTH,
          YEAR,
        },
      });

      if (existing) {
        await existing.update({
          ALLOCATED_WORK_DAYS: WORKING_DAYS,
          SCHEDULING_WORK_DAYS: WORKING_DAYS,
          UPDATED_BY: USER_ID,
        });
      } else {
        await GeneratedWorkingDays.create({
          MONTH,
          YEAR,
          ALLOCATED_WORK_DAYS: WORKING_DAYS,
          SCHEDULING_WORK_DAYS: WORKING_DAYS,
          CREATED_BY: USER_ID,
          UPDATED_BY: USER_ID,
        });
      }
    }

    res
      .status(200)
      .json({ message: "Generated working days saved successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to save generated working days",
      error: err.message,
    });
  }
};

const adjustGeneratedWorkingDays = async ({ date, action, oldDate = null }) => {
  const parsedDate = moment(date);
  const month = parsedDate.format("MMMM");
  const year = parsedDate.year();

  if (action === "create") {
    await GeneratedWorkingDays.increment(
      { ALLOCATED_WORK_DAYS: -1, SCHEDULING_WORK_DAYS: -1 },
      { where: { MONTH: month, YEAR: year } }
    );
  }

  if (action === "delete") {
    await GeneratedWorkingDays.increment(
      { ALLOCATED_WORK_DAYS: 1, SCHEDULING_WORK_DAYS: 1 },
      { where: { MONTH: month, YEAR: year } }
    );
  }

  if (action === "update") {
    const oldMonth = moment(oldDate).format("MMMM");
    const oldYear = moment(oldDate).year();

    if (month !== oldMonth || year !== oldYear) {
      await GeneratedWorkingDays.increment(
        { ALLOCATED_WORK_DAYS: 1, SCHEDULING_WORK_DAYS: 1 },
        { where: { MONTH: oldMonth, YEAR: oldYear } }
      );
      await GeneratedWorkingDays.increment(
        { ALLOCATED_WORK_DAYS: -1, SCHEDULING_WORK_DAYS: -1 },
        { where: { MONTH: month, YEAR: year } }
      );
    }
  }
};

export const getGenerateWorkingDays = async (req, res) => {
  try {
    const { year } = req.params;

    const workingDays = await db.query(QueryGetGenerateWorkingDays, {
      replacements: {
        year: year,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(workingDays);
  } catch (err) {
    res.status(404).json({
      message: "Problem With Get Generated Working Days Data",
      data: err,
    });
  }
};

export const saveGeneratedWorkDaysFlag = async (req, res) => {
  try {
    const { data } = req.body;
    for (const dataRow of data) {
      await GeneratedWorkingDays.update(
        {
          CONFIRMED_DATE: dataRow.CONFIRMED_DATE,
          CONFIRMED_BY: dataRow.CONFIRMED_BY,
          CONFIRMED_FLAG: dataRow.CONFIRMED_FLAG,
        },
        { where: { GENERATED_WORKING_DAY_ID: dataRow.GENERATED_WORKING_DAY_ID } }
      );
    }
    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err });
  }
};

export const getWorkingDays = async (req, res) => {
  try {
    const workingDays = await WorkingDays.findAll({
      attributes: ["WORKING_DAY_ID", "DAY", "IS_WORKING_DAY"],
    });

    res.status(200).json(workingDays);
  } catch (err) {
    res.status(404).json({
      message: "Problem With Get Working Days Data",
      data: err,
    });
  }
};

export const getWorkingDaysById = async (req, res) => {
  try {
    const { id } = req.params;
    const workingDays = await WorkingDays.findByPk(id);

    res.status(200).json(workingDays);
  } catch (err) {
    res.status(404).json({
      message: "Problem With Get Working Days Data",
      data: err,
    });
  }
};

export const updateWorkingDays = async (req, res) => {
  try {
    const updates = req.body;
    for (const day of updates) {
      await WorkingDays.update(
        { IS_WORKING_DAY: day.IS_WORKING_DAY },
        { where: { DAY: day.DAY } }
      );
    }
    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err });
  }
};

export const getHolidaysByYear = async (req, res) => {
  try {
    const { startYear, endYear } = req.params;
    const holidays = await db.query(QueryGetHoliday, {
      replacements: {
        startYear: startYear,
        endYear: endYear,
      },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(holidays);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Action Problem With Get Holidays Data", data: err });
  }
};

export const getArrHolidayByDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const holidays = await db.query(QueryGetHolidayByDate, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    res.status(200).json(holidays);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Action Problem With Get Holidays Data", data: err });
  }
};
