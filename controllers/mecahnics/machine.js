import moment from "moment";
import db from "../../config/database.js";
import {
  MacItemIn,
  MacPartOut,
  MacTypeOfMachine,
  MecListMachine,
  findEmploye,
  qryGetAllMachine,
  qryGetAllMachineByDepartment,
  qryGetDtlTransPart,
  qryGetOneItem,
  qryGetOneMachine,
  qryGetSPartNeedle,
  qryGetlistSection,
  qryGetlistType,
  qryListInbyDate,
  qryListOut,
  qryMecStockMain, MecDownTimeModel,
} from "../../models/mechanics/machines.mod.js";
import { QueryTypes, Op } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import StorageInventoryModel from "../../models/storage/storageInventory.mod.js";
import StorageInventoryLogModel from "../../models/storage/storageInvnetoryLog.mod.js";
import {LogDailyOutput} from "../../models/planning/dailyPlan.mod.js";
import Users from "../../models/setup/users.mod.js";
import {modelSumbiriEmployee} from "../../models/hr/employe.mod.js";
import BuildingModel from "../../models/list/buildings.mod.js";

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
  const { departmentId } = req.query;

  try {
    var listMach = []
    if (Number(departmentId)) {
      listMach = await db.query(qryGetAllMachineByDepartment, {
        replacements: { departmentId },
        type: QueryTypes.SELECT
      });
    } else {
      listMach = await db.query(qryGetAllMachine, {
        type: QueryTypes.SELECT,
      });
    }
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
    res.status(404).json({
      success: false,
      message: "error processing request post list machine",
    });
  }
};

export const updateMachineAndStorage = async (req, res) => {
  try {
    const { serialNumberInventory } = req.params;
    const { machineNos, userId } = req.body; 

    if (!Array.isArray(machineNos) || machineNos.length === 0 || !serialNumberInventory) {
      return res.status(400).json({
        success: false,
        message: "Machine numbers must be an array and serial number inventory must be provided",
      });
    }
    
    const storageInventory = await StorageInventoryModel.findOne({
      where: { SERIAL_NUMBER: serialNumberInventory },
    });

    if (!storageInventory) {
      return res.status(404).json({
        success: false,
        message: "Storage inventory not found",
      });
    }

    const machinesInStorage = await MecListMachine.findAll({
      where: { STORAGE_INVENTORY_ID: storageInventory.ID },
      order: [["SEQ_NO", "DESC"]], 
    });

    let newSeqNo = machinesInStorage.length > 0 ? machinesInStorage[0].SEQ_NO + 1 : 1;
    
    const updatedMachines = [];
    for (const machineNo of machineNos) {
      const downtimeValid = await MecDownTimeModel.findOne({
        where: {
          MACHINE_ID: machineNo,
          IS_COMPLETE: false
        }
      })
      if (downtimeValid) {
        return res.status(500).json({
          success: false,
          message: `the machine cannot be moved because it is in downtime mode`,
        });
      }
      const machine = await MecListMachine.findOne({
        where: { MACHINE_ID: machineNo },
      });

      if (!machine) {
        console.warn(`Machine with ID ${machineNo} not found. Skipping...`);
        continue; 
      }
      
      await machine.update({
        STORAGE_INVENTORY_ID: storageInventory.ID,
        SEQ_NO: newSeqNo,
      });

      updatedMachines.push({
        MACHINE_ID: machine.MACHINE_ID,
        STORAGE_INVENTORY_ID: storageInventory.ID,
        SEQ_NO: newSeqNo,
      });

      StorageInventoryLogModel.create({
        STORAGE_INVENTORY_ID: storageInventory.ID,
        MACHINE_ID: machineNo,
        USER_ADD_ID: userId
      })

      newSeqNo++;
    }

    if (updatedMachines.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid machines found to update",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Machines and storage updated successfully",
      data: updatedMachines,
    });
  } catch (error) {
    console.error("Error updating machines and storage:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to update machines and storage: ${error.message}`,
    });
  }
};

export const updateSequenceByStorageAndMachine = async (req, res) => {
  try {
    const { storageInventoryId } = req.params;
    const { machineId, newSeqNo } = req.body;

  
    if (!storageInventoryId || !machineId || !newSeqNo) {
      return res.status(400).json({
        success: false,
        message: "Storage inventory ID, machine ID, and new sequence number must be provided",
      });
    }

  
    const machinesInStorage = await MecListMachine.findAll({
      where: { STORAGE_INVENTORY_ID: storageInventoryId },
      order: [["SEQ_NO", "ASC"]],
    });

  
    const targetMachine = machinesInStorage.find((machine) => machine.MACHINE_ID === machineId);

    if (!targetMachine) {
      return res.status(404).json({
        success: false,
        message: "Machine not found in the specified storage inventory",
      });
    }

  
    if (newSeqNo < 1 || newSeqNo > machinesInStorage.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid sequence number. It must be between 1 and the total number of machines in the storage.",
      });
    }

  
    machinesInStorage.forEach((machine) => {
      if (machine.SEQ_NO === newSeqNo && machine.MACHINE_ID !== machineId) {
        machine.SEQ_NO = targetMachine.SEQ_NO;
        machine.save();
      }
    });

  
    targetMachine.SEQ_NO = newSeqNo;
    await targetMachine.save();

    return res.status(200).json({
      success: true,
      message: "Sequence updated successfully",
      data: {
        MACHINE_ID: targetMachine.MACHINE_ID,
        STORAGE_INVENTORY_ID: storageInventoryId,
        NEW_SEQ_NO: newSeqNo,
      },
    });
  } catch (error) {
    console.error("Error updating sequence:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to update sequence: ${error.message}`,
    });
  }
};

//untuk Delete machine
export const deleteMachine = async (req, res) => {
  try {
    const { macId } = req.params;
    if (!macId)
      return res.status(404).json({
        success: false,
        message: "Tidak Terdapat NO Mesin",
      });

    const checkMac = await MecListMachine.findAll({
      where: {
        MACHINE_ID: macId,
      },
      raw: true,
    });

    if (checkMac.length === 0)
      return res.status(404).json({
        success: false,
        message: "No Mesin tidak Ditemukan",
      });

    const checkTransactionIn = await MacItemIn.findAll({
      where: {
        MACHINE_ID: macId,
      },
      raw: true,
    });

    if (checkTransactionIn.length !== 0)
      return res.status(404).json({
        success: false,
        message: "Tidak Dapat Di Hapus sudah terdapat Transaksi IN",
      });

    const deleteMac = await MecListMachine.destroy({
      where: {
        MACHINE_ID: macId,
      },
    });

    if (deleteMac)
      return res.status(200).json({
        success: true,
        message: "Data Delete Success",
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request delete list machine",
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



export const getMachinesByStorageInventoryId = async (req, res) => {
  try {
    const { storageInventoryId } = req.params;


    if (!storageInventoryId) {
      return res.status(400).json({
        success: false,
        message: "Storage inventory ID is required",
      });
    }


    const machines = await MecListMachine.findAll({
      where: { STORAGE_INVENTORY_ID: storageInventoryId },
      include: [
        {
          model: MacTypeOfMachine,
          as: "MEC_TYPE_OF_MACHINE",
          attributes: ["TYPE_DESCRIPTION", "COLOR"]
        }
      ],
      order: [["SEQ_NO"]]
    });



    return res.status(200).json({
      success: true,
      message: "Machines retrieved successfully",
      data: machines,
    });
  } catch (error) {
    console.error("Error retrieving machines by storage inventory ID:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve machines: ${error.message}`,
    });
  }
};

export const ListTypeMachine = async (req, res) => {
  try {
    const {category} = req.query

    const where = {}
    if (category) {
      where.CATEGORY = category
    }

    const resp = await MacTypeOfMachine.findAll({
      where
    })
    return res.status(200).json({
      success: true,
      message: "Machines retrieved successfully",
      data: resp,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve machines: ${err.message}`,
    });
  }
}

export const getTypeMachineByCategory = async (req, res) => {
  try {

    const productionTypes = await MacTypeOfMachine.findAll({
      where: {
        CATEGORY: "PRODUCTION"
      }
    })

    if (!productionTypes || productionTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No type machines found for category 'PRODUCTION'.",
      });
    }
    const response = []

    for (let i = 0; i < productionTypes.length; i++) {
      const typeId = productionTypes[i].dataValues.TYPE_ID
      const totalMachines = await MecListMachine.count({
        where: {
          MACHINE_TYPE: typeId,
        },
      });


      const machinesInUse = await MecListMachine.count({
        where: {
          MACHINE_TYPE: typeId,
          STORAGE_INVENTORY_ID: {
            [Op.ne]: null,
          },
        },
      });


      const availableMachines = await MecListMachine.count({
        where: {
          MACHINE_TYPE: typeId,
          STATUS: "NORMAL",
          STORAGE_INVENTORY_ID: null,
        },
      });
      const brokenMachines = await MecListMachine.count({
        where: {
          MACHINE_TYPE: typeId,
          STATUS: {
            [Op.ne]: "NORMAL"
          },
        },
      });

        response.push({
        ...productionTypes[i].dataValues,
        TOTAL_MACHINE: totalMachines,
        MACHINE_IN_USE: machinesInUse,
        MACHINE_BROKEN: brokenMachines,
        MACHINE_AVAILABLE: availableMachines,
      })
    }

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching type machines by category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data.",
      error: error.message,
    });
  }
};

export  const getMecDownTimeValidation = async  (req, res) => {
  try {
      const {status, machineId} = req.query
    const downtimeValid = await MecDownTimeModel.findOne({
      where: {
        MACHINE_ID: machineId,
        IS_COMPLETE: false
      }
    })
    if (downtimeValid) {
      const validData = downtimeValid.STATUS !== status;
      res.status(200).json({
        success: true,
        message: "Get Down Time Validation success",
        data: validData
      })
    }  else {
      res.status(200).json({
        success: true,
        message: "Get Down Time Validation success",
        data: false
      })
    }
  } catch (err) {
    console.error("Error retrieving downtime records:", err);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve downtime records: ${err.message}`,
    });
  }
}

export const getAllDownTimeWithOutput = async (req, res) => {
  try {
    const { startDate, endDate, idSiteLine, idDashboard } = req.query;


    const whereCondition = {}
    if (idSiteLine) {
      whereCondition.ID_SITELINE = idSiteLine
    }

    if (idDashboard) {
      whereCondition.STATUS = {
        [Op.in]: ["BROKEN", "ON_FIX", "REPLACE"]
      }
    }

    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      parsedStartDate.setHours(0, 0, 0, 0);
      const parsedEndDate = new Date(endDate);
      parsedEndDate.setHours(23, 59, 59, 999);


      if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use YYYY-MM-DD.",
        });
      }
      whereCondition.START_TIME = {
        [Op.between]: [parsedStartDate, parsedEndDate],
      }
    }

    const downTimes = await MecDownTimeModel.findAll({
      where: {
        ...whereCondition,
      }
    });

    const result = await Promise.all(
        downTimes.map(async (downTime) => {
          const dailyOutput = await LogDailyOutput.findOne({
            where: {
              ID_SITELINE: downTime.ID_SITELINE,
              SCHD_ID: downTime.SCHD_ID,
            },
            attributes: ['TOTAL_OUTPUT', 'ORDER_STYLE_DESCRIPTION', 'ITEM_COLOR_NAME', 'LINE_NAME', 'SHIFT']
          });

          const dtD =  dailyOutput.dataValues
          const dl = downTime.dataValues

          const mechanic = await modelSumbiriEmployee.findOne({
            where: {Nik: dl.MECHANIC_ID}
          })
          const machine = await MecListMachine.findOne({where: {MACHINE_ID: dl.MACHINE_ID}, include: [
              {
                model: MacTypeOfMachine,
                as: "MEC_TYPE_OF_MACHINE",
                attributes:['COLOR']
              }
            ]})
          const storage = await StorageInventoryModel.findOne({
            where: {
              ID: dl.STORAGE_INVENTORY_ID
            },
            include: [
              {
                model: BuildingModel,
                as: "Building",
                attributes: ['NAME']
              }
            ]
          })


          return {
            ...dtD,
            TOTAL_OUTPUT: dtD.TOTAL_OUTPUT || 0,
            STYLE: dtD.ORDER_STYLE_DESCRIPTION,
            COLOR: dtD.ITEM_COLOR_NAME,
            LINE_NAME: dtD.LINE_NAME,
            SHIFT: dtD.SHIFT,
            BUILDING: storage?.Building?.NAME,
            START_DATE: dl.START_TIME,
            END_DATE: dl.END_TIME,
            STATUS: dl.STATUS,
            MECHANIC_NAME: mechanic?.NamaLengkap,
            MACHINE_ID: machine?.MACHINE_ID,
            MACHINE_COLOR: machine?.MEC_TYPE_OF_MACHINE?.COLOR || '#f3f3f3'
          };
        })
    );

    return res.status(200).json({
      success: true,
      message: "Downtime records retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error retrieving downtime records:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve downtime records: ${error.message}`,
    });
  }
};