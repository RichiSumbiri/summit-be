import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import moment from "moment";
import {
  QueryPackInDaily,
  QueryPackInDailyPO,
  QueryPackInDailySize,
  QueryPackInDailySizePo,
  QyrPackInSumSize,
} from "../../../models/production/packing.mod.js";

//resulst packscan in
export const PackInScanInDayRep = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { startDate, endDate } = req.params;

    const dailyRepotScanIn = await db.query(QueryPackInDaily, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        // linename: linename,
      },
      type: QueryTypes.SELECT,
    });

    if (dailyRepotScanIn)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: dailyRepotScanIn,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

export const packingInSizeSum = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { startDate, endDate } = req.params;

    const dailyRepotScanIn = await db.query(QyrPackInSumSize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    if (dailyRepotScanIn)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: dailyRepotScanIn,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};
export const PackInScanInDaySize = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { startDate, endDate } = req.params;

    const dailyRepotScanIn = await db.query(QueryPackInDailySize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
      },
      type: QueryTypes.SELECT,
    });

    if (dailyRepotScanIn)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: dailyRepotScanIn,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};
//resulst packscan in
export const PackInScanInDayRepPo = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { scanDate } = req.params;

    const dailyRepotScanIn = await db.query(QueryPackInDailyPO, {
      replacements: {
        scanDate: scanDate,
        // enddate: scanDate,
        // linename: linename,
      },
      type: QueryTypes.SELECT,
    });

    if (dailyRepotScanIn)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: dailyRepotScanIn,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

export const PackInScanInDaySizePo = async (req, res) => {
  try {
    //line line name dan barcode serialhanya  pemaniss
    const { scanDate } = req.params;

    const dailyRepotScanIn = await db.query(QueryPackInDailySizePo, {
      replacements: {
        scanDate: scanDate,
        // enddate: scanDate,
        // linename: linename,
      },
      type: QueryTypes.SELECT,
    });

    if (dailyRepotScanIn)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: dailyRepotScanIn,
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};
