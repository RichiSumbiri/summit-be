import { QueryTypes, Op } from "sequelize";
import { mainTraceOrder } from "../../../models/reports/auditTracking.mod.js";
import { dbSPL } from "../../../config/dbAudit.js";

//query get main Audit Tracking
export const getAuditTrack = async (req, res) => {
  try {
    const { listMonth } = req.params;
    // console.log(listMonth);
    const months = listMonth
      .split("-")
      .map((month) => decodeURIComponent(month));

    const listTrace = await dbSPL.query(mainTraceOrder, {
      // const pland = await db.query(QueryDailyPlann, {
      replacements: {
        listMonth: months,
      },
      type: QueryTypes.SELECT,
    });
    return res.json(listTrace);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
