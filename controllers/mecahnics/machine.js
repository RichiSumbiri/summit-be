import db from "../../config/database.js";
import {
  MecListMachine,
  qryGetAllMachine,
  qryGetlistSection,
  qryGetlistType,
} from "../../models/mechanics/machines.mod.js";
import { QueryTypes, Op } from "sequelize";

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
