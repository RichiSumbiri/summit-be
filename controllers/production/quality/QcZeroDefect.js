import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

import {
  QryListLineZd,
  QryListSiteZd,
} from "../../../models/production/qcZeroDefect.mod.js";

//get list site ZD
export const getListSiteZd = async (req, res) => {
  try {
    const llistSiteZd = await db.query(QryListSiteZd, {
      // replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: llistSiteZd,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list site zd",
      data: error,
    });
  }
};

export const getListLineZd = async (req, res) => {
  try {
    const llistSiteZd = await db.query(QryListLineZd, {
      // replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: llistSiteZd,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list line zd",
      data: error,
    });
  }
};
