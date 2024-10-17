// import db from "../../../config/database.js";
import db from "../../../config/database.js";

import { QueryTypes, Op } from "sequelize";
import {
  QryMesHederRepList,
  qryUserQcEndName,
  QueryDetailEndCheck,
  QueryDtlDayDef,
  QueryDtlDayDefSum,
  QueryDtlEndChckTblet,
  QueryGetDescMes,
  QueryMeasSpecRep,
  QueryMesValueRep,
  QuerySumPartDefCodChk,
  QuerySumPartDefCodeCheck,
  QurTablPlanQcEndRep,
} from "../../../models/production/qcEndRep.mod.js";

//get list plan size for main table
export const getPlanningEendReport = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(QurTablPlanQcEndRep, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data planning endline",
      data: error,
    });
  }
};

//get list qc endline check per hour
export const getQcEndCheckPerHour = async (req, res) => {
  try {
    const { schDate, idSiteLine, schdId } = req.params;
    const checkPerHour = await db.query(QueryDetailEndCheck, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
        schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list qc endline check per hour
export const getQcEndSumPartDefCode = async (req, res) => {
  try {
    const { schDate, idSiteLine, schdId } = req.params;
    const checkPerHour = await db.query(QuerySumPartDefCodeCheck, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
        schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    const getUserAddName = await db.query(qryUserQcEndName, {
      replacements: {
        schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
      userName: getUserAddName,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list qc endline check per hour
export const getQcEndChckTablet = async (req, res) => {
  try {
    const { schDate, idSiteLine } = req.params;
    const checkPerHour = await db.query(QueryDtlEndChckTblet, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
        //   schdId: schdId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list qc endline check per hour tablet
export const getQcEndDefReprTblt = async (req, res) => {
  try {
    const { schDate, idSiteLine } = req.params;
    const checkPerHour = await db.query(QuerySumPartDefCodChk, {
      replacements: {
        schDate: schDate,
        idSiteLine: idSiteLine,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: checkPerHour,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get data check perhour",
      data: error,
    });
  }
};

//get list detail defect
export const getDailyDefDetail = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(QueryDtlDayDef, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get deteail defect",
      data: error,
    });
  }
};

//get list detail defect Sumary
export const getDailyDefDetailSum = async (req, res) => {
  try {
    const { schDate, sitename, shift } = req.params;
    const detailSch = await db.query(QueryDtlDayDefSum, {
      replacements: {
        schDate: schDate,
        sitename: sitename,
        shift: shift,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: detailSch,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get deteail defect",
      data: error,
    });
  }
};

//get bulk report measurement
export const getMeasurementRep = async (req, res) => {
  try {
    const { orderNo, schdId, shift } = req.params;

    const desc = await db.query(QueryGetDescMes, {
      replacements: { orderNo },
      type: QueryTypes.SELECT,
    });
    //spec by size
    const specList = await db.query(QueryMeasSpecRep, {
      replacements: { orderNo, schdId, shift },
      type: QueryTypes.SELECT,
    });
    //detail value
    const values = await db.query(QueryMesValueRep, {
      replacements: { schdId, shift },
      type: QueryTypes.SELECT,
    });
    //detail value
    const headers = await db.query(QryMesHederRepList, {
      replacements: { schdId, shift },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: { desc, specList, values, headers },
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing get deteail defect",
      data: error,
    });
  }
};
