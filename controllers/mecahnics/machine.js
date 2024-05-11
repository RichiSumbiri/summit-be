import moment from "moment";
import db from "../../config/database.js";
import {
  MacItemIn,
  MacPartOut,
  MecListMachine,
  findEmploye,
  qryGetAllMachine,
  qryGetDtlTransPart,
  qryGetOneItem,
  qryGetOneMachine,
  qryGetSPartNeedle,
  qryGetlistSection,
  qryGetlistType,
  qryListInbyDate,
  qryListOut,
  qryMecStockMain,
} from "../../models/mechanics/machines.mod.js";
import { QueryTypes, Op } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const getOneMachine = async (req, res) => {
  try {
    const findOneMech = await MecListMachine.findOne({
      where: {
        MACHINE_ID: req.params.code,
      },
    });

    return res.status(200).json({
      success: true,
      data: findOneMech,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get one machine",
    });
  }
};

export const getListMachine = async (req, res) => {
  try {
    const listMach = await db.query(qryGetAllMachine, {
      type: QueryTypes.SELECT,
    });

    const listType = await db.query(qryGetlistType, {
      type: QueryTypes.SELECT,
    });

    const listSection = await db.query(qryGetlistSection, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listMach,
      listType: listType,
      listSection: listSection,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get list machine",
    });
  }
};

//untuk post machine
export const postMachine = async (req, res) => {
  try {
    const data = req.body;
    if (!data)
      return res.status(404).json({
        success: false,
        message: "error No Data For Post machine",
      });

    await MecListMachine.create(data);

    return res.status(200).json({
      success: true,
      message: "Data Create Success",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request post list machine",
    });
  }
};

//untuk UPDATE machine
export const updateMachine = async (req, res) => {
  try {
    const data = req.body;
    if (!data)
      return res.status(404).json({
        success: false,
        message: "error No Data For Post machine",
      });

    await MecListMachine.update(data, {
      where: {
        MACHINE_ID: data.MACHINE_ID,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Data Update Success",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request post list machine",
    });
  }
};

export const getListTypeMec = async (req, res) => {
  try {
    const listType = await db.query(qryGetlistType, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      listType: listType,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get list type",
    });
  }
};

export const getOneMachForIN = async (req, res) => {
  try {
    const { macId } = req.params;
    if (!macId) return res.status(404).json({ message });
    const oneMach = await db.query(qryGetOneItem, {
      replacements: { macId },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: oneMach,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get list type",
    });
  }
};

//untuk post machine
export const postMachItemIn = async (req, res) => {
  try {
    const data = req.body;
    if (!data)
      return res.status(404).json({
        success: false,
        message: "error No Data For Post IN",
      });

    await MacItemIn.create(data);

    return res.status(200).json({
      success: true,
      message: "Data Post In Success",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request post itemIN",
    });
  }
};

//untuk delt machine
export const delMachItemIn = async (req, res) => {
  try {
    const { LOG_ID, inputDate } = req.params;
    if (!LOG_ID)
      return res.status(404).json({
        success: false,
        message: "error No Data For Delete",
      });

    const dateInput = moment(inputDate, "YYYY-MM-DD").add(1, "hours");
    const dateNow = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    if (dateInput.isBefore(dateNow)) {
      return res.status(202).json({
        success: false,
        message: "Tidak Bisa Delete Input Hari Sebelumnya",
      });
    }

    await MacItemIn.destroy({
      where: {
        LOG_ID,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Success Delete",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request Delete itemIN",
    });
  }
};

export const getMacItemIn = async (req, res) => {
  try {
    const date = req.params.date;

    const listData = await db.query(qryListInbyDate, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    return res.json({
      success: true,
      data: listData,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request get itemIN",
    });
  }
};

export const getMacItemOut = async (req, res) => {
  try {
    const date = req.params.date;

    const listData = await db.query(qryListOut, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    return res.json({
      success: true,
      data: listData,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request get out",
    });
  }
};

export const getEmploye = async (req, res) => {
  try {
    const { nik } = req.params;

    const listData = await dbSPL.query(findEmploye, {
      replacements: { nik },
      type: QueryTypes.SELECT,
    });

    return res.json({
      success: true,
      data: listData,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request get employe ",
    });
  }
};

export const getMachineNo = async (req, res) => {
  try {
    const { macId } = req.params;

    const listData = await db.query(qryGetOneMachine, {
      replacements: { macId },
      type: QueryTypes.SELECT,
    });

    return res.json({
      success: true,
      data: listData,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request get machine no",
    });
  }
};

//untuk post sparePart out
export const postMacPartOut = async (req, res) => {
  try {
    const data = req.body;
    if (!data)
      return res.status(404).json({
        success: false,
        message: "error No Data For Post OUT",
      });

    await MacPartOut.create(data);

    return res.status(200).json({
      success: true,
      message: "Data Post In Success",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request post OUT",
    });
  }
};

//untuk delt machine
export const delMachItemOut = async (req, res) => {
  try {
    const { LOG_ID, inputDate } = req.params;
    if (!LOG_ID)
      return res.status(404).json({
        success: false,
        message: "error No Data For Delete",
      });

    const dateInput = moment(inputDate, "YYYY-MM-DD").add(1, "hours");
    const dateNow = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    if (dateInput.isBefore(dateNow)) {
      return res.status(202).json({
        success: false,
        message: "Tidak Bisa Delete Input Hari Sebelumnya",
      });
    }

    await MacPartOut.destroy({
      where: {
        LOG_ID,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Success Delete",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request Delete itemIN",
    });
  }
};

export const getPartNNeedle = async (req, res) => {
  try {
    const listMach = await db.query(qryGetSPartNeedle, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listMach,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get list machine",
    });
  }
};

//get report saldo awal mec report
export const getMecRepSaldoAwl = async (req, res) => {
  try {
    const { lastDate, startDate, endDate } = req.params;

    const listMach = await db.query(qryMecStockMain, {
      replacements: { lastDate, startDate, endDate },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listMach,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get list saldo awal",
    });
  }
};

//get report saldo awal mec report
export const getDtlMecTrans = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const listMach = await db.query(qryGetDtlTransPart, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listMach,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get list detail",
    });
  }
};
