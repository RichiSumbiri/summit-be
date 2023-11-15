import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

import {
  QryListLineZd,
  QryListSiteZd,
  QryPoNoSoruce,
  QueryListDefPvh,
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

export const getListDefPvh = async (req, res) => {
  try {
    const defListPvh = await db.query(QueryListDefPvh, {
      // replacements: { schDate, sitename, linename },
      type: QueryTypes.SELECT,
    });

    if (defListPvh.length > 0) {
      const defWithId = defListPvh.map((def, i) => ({ ...def, id: i + 1 }));
      return res.status(200).json({
        success: true,
        data: defWithId,
      });
    }

    return res.status(400).json({
      success: true,
      message: "NO Data Defect",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list def zd",
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

export const getPoSearchZd = async (req, res) => {
  try {
    const { search } = req.query;

    const listPoData = await db.query(QryPoNoSoruce, {
      replacements: { search: `%${search}%` },
      type: QueryTypes.SELECT,
    });

    let poWithId = [];
    if (listPoData.length > 0) {
      poWithId = listPoData.map((dta, i) => {
        return { ...dta, id: i + 1 };
      });
      return res.status(200).json({
        success: true,
        data: poWithId,
      });
    }
    return res.status(200).json({
      success: true,
      data: poWithId,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data list po zd",
      data: error,
    });
  }
};
