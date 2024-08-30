import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  getDetailQuery,
  qryGetCutPOStatus,
  QueryRepCutLoadDateSize,
  QueryRepCutLoading,
} from "../../../models/production/cutting.mod.js";

const chkNilaInt = (nilai) => {
  const newNilai = parseInt(nilai);
  if (!newNilai || isNaN(newNilai)) {
    return 0;
  } else {
    return newNilai;
  }
};
const checkStaus = (load, sch) => {
  const qtyStatus = load - sch;
  if (qtyStatus > 0) return "Over";
  if (qtyStatus < 0) return "Open";
  if (qtyStatus === 0) return "Completed";
};

export const getBaseRepCutLoad = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;

    //get base data
    const detailData = await db.query(QueryRepCutLoading, {
      replacements: { startDate, endDate, site },
      type: QueryTypes.SELECT,
    });

    const detailDataSize = await db.query(QueryRepCutLoadDateSize, {
      replacements: { startDate, endDate, site },
      type: QueryTypes.SELECT,
    });

    if (detailData.length === 0) {
      return res.json({
        dataSchedule: [],
        detailData: [],
        detailDataSize: [],
      });
    }

    const dataSchedule = [
      ...detailData
        .reduce((distSchedule, current) => {
          const { SCH_ID } = current;
          const grouped = distSchedule.get(SCH_ID);
          // console.log(grouped);
          if (!grouped) {
            distSchedule.set(SCH_ID, {
              ...current,
              SCH_SIZE_QTY: chkNilaInt(current.SCH_SIZE_QTY),
              GENERATE_QTY: chkNilaInt(current.GENERATE_QTY),
              LOADING_QTY: chkNilaInt(current.LOADING_QTY),
            });
          } else {
            distSchedule.set(SCH_ID, {
              ...grouped,
              SCH_SIZE_QTY:
                chkNilaInt(grouped.SCH_SIZE_QTY) +
                chkNilaInt(current.SCH_SIZE_QTY),
              GENERATE_QTY:
                chkNilaInt(grouped.GENERATE_QTY) +
                chkNilaInt(current.GENERATE_QTY),
              LOADING_QTY:
                chkNilaInt(grouped.LOADING_QTY) +
                chkNilaInt(current.LOADING_QTY),
            });
          }

          return distSchedule;
        }, new Map())
        .values(),
    ].map((load) => ({
      ...load,
      STATUS: checkStaus(load.LOADING_QTY, load.SCH_SIZE_QTY),
    }));

    return res.json({
      dataSchedule: dataSchedule,
      detailData: detailData,
      detailDataSize: detailDataSize,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

export const getCuttingPOstatus = async (req, res) => {
  try {
    const { poNum } = req.params;

    const poNo = decodeURIComponent(poNum);
    const orders = await db.query(qryGetCutPOStatus, {
      replacements: {
        poNo,
      },
      type: QueryTypes.SELECT,
    });

    if (orders.length === 0)
      return res.status(200).json({
        success: true,
        message: "data Order not found",
        data: [],
      });

    return res.status(200).json({
      data: orders,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

export const getCuttingPOStatdtl = async (req, res) => {
  try {
    const { poId, size } = req.params;

    const orders = await db.query(getDetailQuery, {
      replacements: {
        poId,
        size,
      },
      type: QueryTypes.SELECT,
    });

    if (orders.length === 0)
      return res.status(200).json({
        success: true,
        message: "data Order not found",
        data: [],
      });

    return res.status(200).json({
      data: orders,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
