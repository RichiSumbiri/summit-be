import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import {
  qryGetUserList,
  queryGetEventList,
} from "../../models/hr/event.mod.js";

export const getEventList = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) return res.status(404).json({ message: "No Year No Data" });
    const listEvent = await db.query(queryGetEventList, {
      replacements: { year },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listEvent,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list event",
    });
  }
};

export const getRefGuest = async (req, res) => {
  try {
    const { strQuery } = req.params;
    if (!strQuery)
      return res.status(404).json({ message: "No Year No Query string" });

    const decodeQry = decodeURIComponent(strQuery);
    const query = `%${decodeQry}%`;

    const listRefGuest = await db.query(qryGetUserList, {
      replacements: { query },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listRefGuest,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list guest ref",
    });
  }
};
