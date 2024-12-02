import { QueryTypes } from "sequelize";
import db from "../config/database.js";
import {
  LogSewingWipMonitoring,
  qryRecapSewWip,
  queryGetRecapWip,
} from "../models/reports/sewWipMonitor.mod.js";
import moment from "moment";

export async function recapWipMonitoring() {
  try {

    const today = moment().format('YYYY-MM-DD')
    const queryWipCore = await db.query(queryGetRecapWip, {
      replacements : {
        startDate : today,
        endDate : today
      },
      type: QueryTypes.SELECT,
    });

    if (queryWipCore.length > 0) {
      await LogSewingWipMonitoring.bulkCreate(queryWipCore, {
        updateOnDuplicate: [
          "TTL_SEWING_IN",
          "TTL_QC_QTY",
          "TTL_SEWING_OUT",
          "TTL_PACKING_IN",
          "updatedAt",
        ],
      });

      console.log("success")
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
}
