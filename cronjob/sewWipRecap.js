import { QueryTypes } from "sequelize";
import db from "../config/database.js";
import {
  LogSewingWipMonitoring,
  qryRecapSewWip,
} from "../models/reports/sewWipMonitor.mod.js";

export async function recapWipMonitoring() {
  try {
    const queryWipCore = await db.query(qryRecapSewWip, {
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
