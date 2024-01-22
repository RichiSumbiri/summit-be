import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";
import {
  qryViewSchSewingForCutting,
  getSewingSchSize,
} from "../../../models/planning/cuttingplan.mod.js";

export const getSchSewForCut = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;
    const weekSchHead = await db.query(qryViewSchSewingForCutting, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchSize = await db.query(getSewingSchSize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: { weekSchHead, weekSchSize } });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
