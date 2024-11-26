import { QueryTypes } from "sequelize";
import db from "../config/database.js";
import { LogDailyQcDefect, LogDailyQcPart, queryLogQcDefect, queryLogQcPart } from "../models/production/logQcDefPart.mod.js";

export async function recapQcDefPart() {
    try {
      const getDefectRes = await db.query(queryLogQcDefect, {
        type: QueryTypes.SELECT,
      });
  
      if (getDefectRes.length > 0) {
        await LogDailyQcDefect.bulkCreate(getDefectRes, {
          updateOnDuplicate: [
            "DEFECT_QTY",
            "updatedAt",
          ],
        });
  
        console.log("success recap defect")
      } 

      const getPartRes = await db.query(queryLogQcPart, {
        type: QueryTypes.SELECT,
      });

      if (getPartRes.length > 0) {

      await LogDailyQcPart.bulkCreate(getPartRes, {
        updateOnDuplicate: [
          "DEFECT_QTY",
          "updatedAt",
        ],
      });
      return console.log("success recap part")

    }

    } catch (error) {
      console.log(error);
    }
  }