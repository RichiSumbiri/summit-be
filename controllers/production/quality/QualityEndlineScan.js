import { Orders } from "../../../models/production/order.mod.js";
// import { ScanQuality } from "../../../models/setup/production/quality.mod";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

// import moment from "moment";
import {
  CheckQrExist,
  CheckWipBfrOut,
  ManpowewrDailyDetail,
  QuerySewingInQr,
  ScanSewingOut,
} from "../../../models/production/sewing.mod.js";
import {
  EndlineUndo,
  getEndllineQROutput,
  PlanSize,
  QcEndlineOutput,
  QcRemarks,
  QueryEndlinePlanSize,
  QueryGetDefForRepair,
  QueryGetLastRepaird,
  QueryGetLastRttDefBS,
  QueryGetListDefect,
  QueryGetListPart,
  QueryGetQrPendding,
  QueryPlanSizePending,
  queryTotalCheck,
  SewingBdlReturn,
} from "../../../models/production/quality.mod.js";
import { CuttinScanSewingIn } from "../../../models/production/cutting.mod.js";
import { CheckNilai } from "../../util/Utility.js";

// Update Actual Manpower Normal / OT
export const SetActualMp = async (req, res) => {
  try {
    const dataPlan = req.body;
    //check manpower on mp_daily_detail
    const findMp = await ManpowewrDailyDetail.findOne({
      where: {
        SCHD_ID: dataPlan.SCHD_ID,
        SHIFT: dataPlan.SHIFT,
      },
    });
    // if founded
    if (findMp) {
      const updateMp = await ManpowewrDailyDetail.update(dataPlan, {
        where: {
          SCHD_ID: dataPlan.SCHD_ID,
          SHIFT: dataPlan.SHIFT,
        },
      });
      return res.status(200).json({
        success: true,
        data: updateMp,
        message: "Berhasil Update Actual Manpower",
      });
    } else {
      const create = await ManpowewrDailyDetail.create(dataPlan);
      return res.status(200).json({
        success: true,
        data: create,
        message: "Berhasil set manpower",
        // message: "Create Actual Manpower Successfully",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//get qr list
export const GetQrSewingIn = async (req, res) => {
  try {
    //line name disini tidak dipakai tapi dipakai untuk tablet
    const { schDate, sitename, linename, barcodeserial } = req.params;

    const listQrAfterScan = await db.query(QuerySewingInQr, {
      replacements: { schDate, sitename, linename, barcodeserial },
      type: QueryTypes.SELECT,
    });

    if (listQrAfterScan)
      return res.status(200).json({
        success: true,
        message: "Found Data Scan",
        data: listQrAfterScan,
      });
  } catch (error) {
    // console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//getlist Part
export const getListPart = async (req, res) => {
  try {
    const getListPart = await db.query(QueryGetListPart, {
      type: QueryTypes.SELECT,
    });

    return res.json(getListPart);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
//getlist Part
export const getListDefect = async (req, res) => {
  try {
    const listDefect = await db.query(QueryGetListDefect, {
      type: QueryTypes.SELECT,
    });

    return res.json(listDefect);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//fot endline output GOOD/DEF/REJ/BS/
export const postEndlineOutput = async (req, res) => {
  try {
    const dataGood = req.body;

    const checkQty = await db.query(queryTotalCheck, {
      replacements: {
        schdid: dataGood.ENDLINE_SCHD_ID,
        size: dataGood.ENDLINE_PLAN_SIZE,
      },
      type: QueryTypes.SELECT,
    });
    // console.log(checkQty);
    if (checkQty.length > 0) {
      //tambahkan total check dengan qty yang akan di post
      const newTotCheck =
        parseInt(CheckNilai(dataGood.ENDLINE_OUT_QTY)) +
        parseInt(CheckNilai(checkQty[0].TOTAL_CHECKED));

      const sewingIn = parseInt(CheckNilai(checkQty[0].QTY_SEW_IN));

      //check jika total new check melebihi sewing in reject
      if (newTotCheck > sewingIn) {
        return res.status(404).json({
          message: "QC Output Tidak Bisa Melebihi Total QTY Loading",
        });
      }
    }

    const postDataGood = await QcEndlineOutput.create(dataGood);
    handleAddUndo(dataGood);
    return res.json(postDataGood);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

//function handle undo
export const handleUndo = async (req, res) => {
  try {
    const dataUndo = req.body;

    let queryFind =
      dataUndo.ENDLINE_OUT_TYPE === "REPAIR"
        ? QueryGetLastRepaird
        : QueryGetLastRttDefBS;

    const findLastPost = await db.query(queryFind, {
      replacements: {
        schdid: dataUndo.SCHD_ID,
        type: dataUndo.ENDLINE_OUT_TYPE, //defect ttype
        size: dataUndo.ORDER_SIZE,
        prodtype: dataUndo.type,
      },
      type: QueryTypes.SELECT,
    });

    if (findLastPost[0]) {
      const lastRecod = findLastPost[0];

      if (dataUndo.ENDLINE_OUT_TYPE === "REPAIR") {
        const ekseundoRep = await QcEndlineOutput.update(
          { ENDLINE_REPAIR: null, ENDLINE_ACT_RPR_SCHD_ID: null },
          {
            where: {
              ENDLINE_OUT_ID: lastRecod.ENDLINE_OUT_ID,
            },
          }
        );

        if (ekseundoRep) {
          handleMinUndo(dataUndo);
        }
        return res.json({ message: "Success Undo" });
      }

      const ekeundo = await QcEndlineOutput.update(
        { ENDLINE_OUT_UNDO: "Y" },
        {
          where: {
            ENDLINE_OUT_ID: lastRecod.ENDLINE_OUT_ID,
          },
        }
      );
      if (ekeundo) {
        handleMinUndo(dataUndo);
      }

      return res.json({ message: "Success Undo" });
    }

    return res.status(404).json({
      message:
        "Tidak ada data untuk di Undo atau tidak bisa Undo Data Hari Sebelumnya",
      // message: "No Data For Undo ",
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get Undo",
      data: error,
    });
  }
};

//get list plan size for main table
export const getPlanningEendBySize = async (req, res) => {
  try {
    const { schDate, sitename, linename, userId } = req.params;
    const dataPlanBysize = await db.query(QueryEndlinePlanSize, {
      replacements: { schDate, sitename, linename, userId },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: dataPlanBysize,
    });
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data planning by size",
      data: error,
    });
  }
};

//qc end output presize main button
export const getDataQcEndSizeResult = async (req, res) => {
  try {
    const { schdid, size } = req.params;
    const getQREndlineQty = await db.query(getEndllineQROutput, {
      replacements: { schdid, size },
      type: QueryTypes.SELECT,
    });

    return res.json(getQREndlineQty);
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data qr qty",
      data: error,
    });
  }
};

//get list defect for Repaired
export const getDefForRepair = async (req, res) => {
  try {
    const { schdid, size } = req.params;
    const getDefList = await db.query(QueryGetDefForRepair, {
      replacements: { schdid, size },
      type: QueryTypes.SELECT,
    });

    return res.json(getDefList);
  } catch (error) {
    // console.log(error);
    return res.status(404).json({
      message: "error processing get data Defect qty",
      data: error,
    });
  }
};

//conrol for repair
export const repairedProccess = async (req, res) => {
  try {
    const dataRepaird = req.body;
    if (dataRepaird.length < 0)
      return res.status(404).json({
        message: "Tidak ada Data Repaired",
        data: error,
      });

    // console.log(dataRepaird);
    dataRepaird.forEach(async (repair, i) => {
      await QcEndlineOutput.update(
        {
          ENDLINE_REPAIR: "Y",
          ENDLINE_ACT_RPR_SCHD_ID: repair.ENDLINE_ACT_RPR_SCHD_ID,
        },
        { where: { ENDLINE_OUT_ID: repair.ENDLINE_OUT_ID } }
      );
      // console.log(repair);
      handleAddUndo({ ...repair, ENDLINE_OUT_TYPE: "REPAIR" });
      if (i + 1 === dataRepaird.length) {
        return res.status(200).json({ message: "Repaired Berhasil" });
      }
    });
  } catch (error) {
    return res.status(404).json({
      message: "error processing repaired",
      data: error,
    });
  }
};

//post plansize for undo
export const planSizePost = async (req, res) => {
  try {
    const dataPlanSize = req.body;
    const checkDataPlanSize = await PlanSize.findOne({
      attributes: ["PLANSIZE_ID", "SCHD_ID", "ORDER_SIZE"],
      where: {
        PLANSIZE_ID: dataPlanSize.PLANSIZE_ID,
        SCHD_ID: dataPlanSize.SCHD_ID,
        ORDER_SIZE: dataPlanSize.ORDER_SIZE,
      },
    });

    if (!checkDataPlanSize?.PLANSIZE_ID) {
      delete dataPlanSize.PLANSIZE_MOD_ID;
      const dataplanSizePost = await PlanSize.create(dataPlanSize);
      if (dataplanSizePost) {
        return res.status(200).json({
          status: "create",
          message: "New Plan Size",
          data: dataplanSizePost,
        });
      }
    } else {
      delete dataPlanSize.PLANSIZE_ADD_ID;
      const updatePlanSize = await PlanSize.update(dataPlanSize, {
        where: {
          PLANSIZE_ID: dataPlanSize.PLANSIZE_ID,
          // SCHD_ID: dataPlanSize.SCHD_ID,
          ORDER_SIZE: dataPlanSize.ORDER_SIZE,
        },
      });

      if (updatePlanSize) {
        return res.status(200).json({
          status: "update",
          message: "Update Plan Size",
          data: updatePlanSize,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing Plan Size",
      data: error,
    });
  }
};

//update plansize after inspection or closed main button
export const planSizeUpdate = async (req, res) => {
  try {
    let dataPlanSize = req.body;
    if (!dataPlanSize.PLANSIZE_ID) {
      return res.status(404).json({
        message: "Tidak ada Plan Size ID",
      });
    } else {
      const totalQty = parseInt(dataPlanSize.QTY);
      const goodQty =
        parseInt(dataPlanSize.RTT) + parseInt(dataPlanSize.REPAIRED);
      // console.log(totalQty);
      // console.log(goodQty);

      dataPlanSize.COMPLETE_STATUS = null;
      dataPlanSize.GOOD = goodQty;

      if (totalQty === goodQty) {
        dataPlanSize.COMPLETE_STATUS = "Y";
      }
      const updatePlanSize = await PlanSize.update(dataPlanSize, {
        where: {
          PLANSIZE_ID: dataPlanSize.PLANSIZE_ID,
        },
      });
      return res.status(200).json({
        status: "update",
        message: "Update Plan Size After Count",
        data: updatePlanSize,
      });
    }
  } catch (error) {
    return res.status(404).json({
      success: false,
      data: error,
      message: "error Update Plan Size After Count",
    });
  }
};

//funtion untuk mendambahkan qty undo
async function handleAddUndo(data) {
  const checkEndUndo = await EndlineUndo.findOne({
    where: {
      SCHD_ID: data.ENDLINE_SCHD_ID,
      PLANSIZE_ID: data.PLANSIZE_ID,
      USER_ID: data.ENDLINE_ADD_ID,
    },
  });

  if (!checkEndUndo) {
    const newUndo = {
      SCHD_ID: data.ENDLINE_SCHD_ID,
      PLANSIZE_ID: data.PLANSIZE_ID,
      USER_ID: data.ENDLINE_ADD_ID,
      ADD_ID: data.ENDLINE_ADD_ID,
      NDO_RTT: data.ENDLINE_OUT_TYPE === "RTT" ? 1 : 0,
      UNDO_DEFECT: data.ENDLINE_OUT_TYPE === "DEFECT" ? 1 : 0,
      UNDO_BS: data.ENDLINE_OUT_TYPE === "BS" ? 1 : 0,
      UNDO_REPAIR: data.ENDLINE_OUT_TYPE === "REPAIR" ? 1 : 0,
    };
    return await EndlineUndo.create(newUndo);
  }

  if (checkEndUndo) {
    const {
      PLANSIZE_ID,
      SCHD_ID,
      USER_ID,
      UNDO_RTT,
      UNDO_DEFECT,
      UNDO_BS,
      UNDO_REPAIR,
    } = checkEndUndo.dataValues;
    switch (data.ENDLINE_OUT_TYPE) {
      case "RTT":
        if (UNDO_RTT < 3) {
          return updateUndo(
            { UNDO_RTT: UNDO_RTT + 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "DEFECT":
        if (UNDO_DEFECT < 3) {
          return updateUndo(
            { UNDO_DEFECT: UNDO_DEFECT + 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "BS":
        if (UNDO_BS < 3) {
          return updateUndo(
            { UNDO_BS: UNDO_BS + 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "REPAIR":
        if (UNDO_REPAIR < 3) {
          return updateUndo(
            { UNDO_REPAIR: UNDO_REPAIR + 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;

      default:
        break;
    }
  }
}
//funtion untuk mendambahkan qty undo
async function handleMinUndo(data) {
  // console.log(data);
  const checkEndUndo = await EndlineUndo.findOne({
    where: {
      SCHD_ID: data.SCHD_ID,
      PLANSIZE_ID: data.PLANSIZE_ID,
      USER_ID: data.USER_ID,
    },
  });

  if (checkEndUndo) {
    const {
      PLANSIZE_ID,
      SCHD_ID,
      USER_ID,
      UNDO_RTT,
      UNDO_DEFECT,
      UNDO_BS,
      UNDO_REPAIR,
    } = checkEndUndo.dataValues;
    switch (data.ENDLINE_OUT_TYPE) {
      case "RTT":
        if (UNDO_RTT > 0) {
          return updateUndo(
            { UNDO_RTT: UNDO_RTT - 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "DEFECT":
        if (UNDO_DEFECT > 0) {
          return updateUndo(
            { UNDO_DEFECT: UNDO_DEFECT - 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "BS":
        if (UNDO_BS > 0) {
          return updateUndo(
            { UNDO_BS: UNDO_BS - 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;
      case "REPAIR":
        if (UNDO_REPAIR > 0) {
          return updateUndo(
            { UNDO_REPAIR: UNDO_REPAIR - 1 },
            { PLANSIZE_ID, SCHD_ID, USER_ID }
          );
        }
        break;

      default:
        break;
    }
  }
}
//for update add or min undo
async function updateUndo(dataUpdate, dataWhere) {
  return await EndlineUndo.update(dataUpdate, {
    where: dataWhere,
  }).catch((err) => console.log(err));
}

//function for qr Transfer / Scan sewing out
export async function sewingScanOut(req, res) {
  try {
    const dataQr = req.body;
    // console.log(dataQr);
    const checkQrScanIn = await db.query(CheckQrExist, {
      type: QueryTypes.SELECT,
      replacements: { barcodeSerial: dataQr.BARCODE_SERIAL },
    });
    // console.log(checkQrScanIn);

    //jika ketemu sudah di scan reject
    if (checkQrScanIn.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "danger",
        message: "Tidak ada QR Scan In",
      });
    }

    const checkQrScanOut = await ScanSewingOut.findAll({
      where: {
        BARCODE_SERIAL: dataQr.BARCODE_SERIAL,
      },
    });

    // console.log(checkQrScanOut);
    //jika ketemu sudah di scan reject
    if (checkQrScanOut.length > 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "danger",
        message: "QR Sudah transfer",
      });
    } else {
      const qrwithMain = { ...dataQr, BARCODE_MAIN: dataQr.BARCODE_SERIAL };
      const transferQr = await ScanSewingOut.create(qrwithMain);
      if (transferQr) {
        return res.status(200).json({
          success: true,
          qrstatus: "success",
          message: "Transfer Berhasil",
        });
      } else {
        return res.status(202).json({
          success: false,
          qrstatus: "danger",
          message: "QR Sudah transfer",
        });
      }
    }

    // const detailQr = checkQrScanIn[0];
    // //check wip
    // const checkWipVsOutput = await db.query(CheckWipBfrOut, {
    //   type: QueryTypes.SELECT,
    //   replacements: {
    //     schdId: detailQr.SCHD_ID,
    //     orderSize: detailQr.ORDER_SIZE,
    //   },
    // });

    // if (parseInt(checkWipVsOutput[0].BALANCE) < detailQr.ORDER_QTY) {
    //   return res.status(200).json({
    //     success: true,
    //     qrstatus: "danger",
    //     message: "BALANCE Good tidak mencukupi mohon refresh dan coba kembali",
    //   });
    // } else {
    //   const transferQr = await ScanSewingOut.create(dataQr);
    //   if (transferQr) {
    //     return res.status(200).json({
    //       success: true,
    //       qrstatus: "success",
    //       message: "Transfer Berhasil",
    //     });
    //   }
    // }

    // return res.status(404).json({
    //   success: false,
    //   data: error,
    //   message: "error transfer QR",
    // });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
}

//get plansize pendding
export const getPlanSizePendding = async (req, res) => {
  try {
    const { schDate, sitename, linename, userId } = req.params;
    const planSizePendding = await db.query(QueryPlanSizePending, {
      type: QueryTypes.SELECT,
      replacements: { schDate, sitename, linename, userId },
    });

    return res.status(200).json({
      success: true,
      data: planSizePendding,
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request plansize pendding",
      data: error,
    });
  }
};

//get Qr List pendding
export const getQrListPendding = async (req, res) => {
  try {
    const { schDate, sitename, linename } = req.params;
    const qrlistPendding = await db.query(QueryGetQrPendding, {
      type: QueryTypes.SELECT,
      replacements: { schDate, sitename, linename },
    });

    return res.status(200).json({
      success: true,
      data: qrlistPendding,
    });
  } catch (error) {
    res.status(404).json({
      message: "error processing request Qr List pendding",
      data: error,
    });
  }
};

//add update remark
export const postUpdtEndlineRmks = async (req, res) => {
  try {
    let dataRemark = req.body;

    const checkRemark = await QcRemarks.findOne({
      attributes: ["SCHD_ID", "ID_SITELINE", "TYPE_PROD"],
      where: {
        SCHD_ID: dataRemark.SCHD_ID,
        ID_SITELINE: dataRemark.ID_SITELINE,
        TYPE_PROD: dataRemark.TYPE_PROD,
      },
    });

    if (checkRemark) {
      const updateRmk = await QcRemarks.update(dataRemark, {
        where: {
          SCHD_ID: dataRemark.SCHD_ID,
          ID_SITELINE: dataRemark.ID_SITELINE,
          TYPE_PROD: dataRemark.TYPE_PROD,
        },
      });

      delete dataRemark.ADD_ID;
      return res.status(200).json({
        success: true,
        message: "Remark berhasil diupdate",
        data: updateRmk,
      });
    }

    delete dataRemark.MOD_ID;
    const addDataRemark = await QcRemarks.create(dataRemark);

    return res.status(200).json({
      success: true,
      message: "Remark ditambahkan",
      data: addDataRemark,
    });
  } catch (error) {
    // console.log(error);
    res.status(404).json({
      message: "error processing request Qr List pendding",
      data: error,
    });
  }
};

//add proposal return
export const postReturnBdl = async (req, res) => {
  try {
    let dataReturn = req.body;

    const bundleremark = await SewingBdlReturn.findOne({
      attributes: ["BARCODE_SERIAL", "SCH_ID", "SCHD_ID", "CONFIRM_STATUS"],
      where: {
        BARCODE_SERIAL: dataReturn.BARCODE_SERIAL,
        SCH_ID: dataReturn.SCH_ID,
        SCHD_ID: dataReturn.SCHD_ID,
        CONFIRM_STATUS: 0,
      },
    });

    if (bundleremark) {
      return res.status(202).json({
        message: "Sudah meminta pengembalian Bundle/Box",
      });
    }

    const postReturn = await SewingBdlReturn.create(dataReturn);

    if (postReturn)
      return res.json({
        message: "Berhasil meminta pengembalian Bundle/Box ke preparation",
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request return",
      data: error,
    });
  }
};
