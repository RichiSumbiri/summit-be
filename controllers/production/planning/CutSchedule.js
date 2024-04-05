import { QueryTypes, where } from "sequelize";
import db from "../../../config/database.js";
import {
  qryViewSchSewingForCutting,
  getSewingSchSize,
  CutingLoadingSchedule,
  CutingLoadingSchSize,
  queryGetSchCutLoad,
  qryGetCutSchSize,
  qryCutingSchDetail,
  CuttingSchDetails,
  qryCekQtyCutSch,
  findOneScanIn,
  queryInfoSchSize,
  qrySizeDailyPlan,
  qryDailyPlanCut,
  qryRsltSupIN,
  queryChkclSupSchIn,
  qryRsltSupOut,
  CutSchDtlReal,
  qryGetFromLoad,
  queryGetSchCutReal,
  qryGetCutSchSizeReal,
  qryCutingSchDetailReal,
  qryGetHeadCutSupRep,
  qrySizeCutSupRep,
  qryCutSupDetailDate,
  qryExportCutLoadSum,
  qryExportCutLoadDtl,
} from "../../../models/planning/cuttingplan.mod.js";
import {
  CutSupermarketIn,
  CutSupermarketOut,
  CuttinScanSewingIn,
} from "../../../models/production/cutting.mod.js";
import Moment from "moment";
import momentRange from "moment-range";
import { QueryfindQrSewingIn } from "../../../models/planning/dailyPlan.mod.js";
import { QueryGetHoliday } from "../../../models/setup/holidays.mod.js";
const moment = momentRange.extendMoment(Moment);

export const getSchSewForCut = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;
    const weekSchHead = await db.query(qryViewSchSewingForCutting, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchSize = await db.query(getSewingSchSize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: { weekSchHead, weekSchSize } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getCuttingSchedule = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;
    const weekSchHead = await db.query(queryGetSchCutLoad, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchSize = await db.query(qryGetCutSchSize, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const getSchDetail = await db.query(qryCutingSchDetail, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchDetail =
      getSchDetail?.map((sch) => ({
        ...sch,
        LOAD_STATUS: sch.LOADING_QTY ? true : false,
      })) || [];

    return res.json({ data: { weekSchHead, weekSchSize, weekSchDetail } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

export const postSewToCutSchd = async (req, res) => {
  try {
    const { arrPlanSew, arrPlanSize } = req.body;

    if (!arrPlanSew)
      return res.status(404).json({
        message: "Tidak ada data schedule untuk di post",
      });

    for (const [i, arr] of arrPlanSew.entries()) {
      const dataCutSch = {
        CUT_SCH_ID: arr.SCH_ID,
        CUT_ID_CAPACITY: arr.SCH_CAPACITY_ID,
        CUT_ID_SITELINE: arr.SCH_ID_SITELINE,
        CUT_SEW_SCH_QTY: arr.SCH_QTY,
        CUT_SITE_NAME: arr.SITE_NAME,
        CUT_SIZE_TYPE: arr.SIZE,
        CUT_SEW_START: arr.SCH_START_PROD,
        CUT_SEW_FINISH: arr.SCH_FINISH_PROD,
        CUT_ADD_ID: arr.CUT_ADD_ID,
        CUT_MOD_ID: arr.CUT_MOD_ID,
      };

      if (!arr.CUT_ID) {
        const creatData = await CutingLoadingSchedule.create(dataCutSch);
        await postSewToCutSchdSize(arrPlanSize, arr.SCH_ID, creatData.CUT_ID);
      } else {
        await CutingLoadingSchedule.update(dataCutSch, {
          where: {
            CUT_ID: arr.CUT_ID,
          },
        });
        await postSewToCutSchdSize(arrPlanSize, arr.SCH_ID, arr.CUT_ID);
      }

      if (i + 1 === arrPlanSew.length) {
        return res.status(200).json({ message: "Success Post" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Terdapat error ketika post data schedule",
      data: error,
    });
  }
};

//controler post data schedule size
export async function postSewToCutSchdSize(arraySize, schId, cutId) {
  try {
    const filterArrSize = arraySize.filter(
      (arrSize) => arrSize.SCH_ID === schId
    );

    if (filterArrSize.length === 0) return [];

    const arrPlan = filterArrSize.map((arrSize) => ({
      CUT_ID: cutId,
      CUT_ID_SIZE: arrSize.CUT_ID_SIZE || null,
      CUT_SCH_ID_SIZE: arrSize.SCH_SIZE_ID,
      CUT_SCH_ID: arrSize.SCH_ID,
      CUT_ID_SITELINE: arrSize.SCH_ID_SITELINE,
      CUT_SEW_SCH_QTY: arrSize.SCH_SIZE_QTY,
      CUT_SEW_SIZE_CODE: arrSize.SIZE_CODE,
      CUT_ADD_ID: arrSize.CUT_ADD_ID,
      CUT_MOD_ID: arrSize.CUT_MOD_ID,
    }));

    for (const [i, arr] of arrPlan.entries()) {
      if (!arr.CUT_ID_SIZE) {
        await CutingLoadingSchSize.create(arr);
      } else {
        await CutingLoadingSchSize.update(arr, {
          where: {
            CUT_ID_SIZE: arr.CUT_ID_SIZE,
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const PostDetailCutSch = async (req, res) => {
  try {
    const dataPost = req.body;
    const findDataAll = await CuttingSchDetails.findAll({
      where: {
        CUT_SCH_ID: dataPost.CUT_SCH_ID,
        // CUT_LOAD_DATE: dataPost.CUT_LOAD_DATE,
        CUT_ID_SIZE: dataPost.CUT_ID_SIZE,
      },
      attributes: [
        "CUT_ID_DETAIL",
        "CUT_LOAD_DATE",
        "CUT_ID_SIZE",
        "CUT_SCH_ID",
        "CUT_SCH_QTY",
      ],
      raw: true, // <--- HERE
    });

    const findSizes = await CutingLoadingSchSize.findOne({
      where: {
        CUT_ID_SIZE: dataPost.CUT_ID_SIZE,
      },
    });

    let sewSchQty = findSizes.CUT_SEW_SCH_QTY ? findSizes.CUT_SEW_SCH_QTY : 0;
    let cutSchQty =
      findDataAll.reduce((sum, item) => sum + item["CUT_SCH_QTY"], 0) || 0;
    const saldo = sewSchQty - parseInt(cutSchQty);

    //check jumlah yang sudah di sew schd dan jmlh cutting sch
    let findData =
      findDataAll.filter(
        (dts) => dts.CUT_LOAD_DATE === dataPost.CUT_LOAD_DATE
      )[0] || null;

    //untuk kompare waktu
    const schDate = moment(dataPost.CUT_LOAD_DATE, "YYYY-MM-DD").add(
      1,
      "hours"
    );
    const currentDate = moment();
    currentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 }); // untuk menghindari tidak bisa input schedule hari ini

    // jika terdapat data schdid size
    if (findDataAll.length > 0) {
      if (dataPost.CUT_SCH_QTY === "" && findData.CUT_ID_DETAIL) {
        if (schDate.isBefore(currentDate))
          return res.status(404).json({
            message: "Tidak Bisa Delete Schedule ditanggal sebelum hari ini",
          });

        await CuttingSchDetails.destroy({
          where: {
            CUT_ID_DETAIL: findData.CUT_ID_DETAIL,
          },
        });
        //delete start and finish
        funcUpdateDate(dataPost.CUT_SCH_ID);
        return res
          .status(200)
          .json({ status: "delete", message: "success delete" });
      }

      // jika update
      if (findData && dataPost.CUT_SCH_QTY) {
        //jumlah oSchd cutting yang ada di kurang-findData

        const currentQty =
          parseInt(cutSchQty) -
          findData.CUT_SCH_QTY +
          parseInt(dataPost.CUT_SCH_QTY);
        // console.log(currentQty);
        if (currentQty > sewSchQty)
          return res.status(404).json({
            message: `Tidak Bisa melebihi balance Qty Schedule Sewing ${saldo}`,
          });

        await CuttingSchDetails.update(dataPost, {
          where: {
            CUT_ID_DETAIL: findData.CUT_ID_DETAIL,
          },
        });
        funcUpdateDate(dataPost.CUT_SCH_ID);

        return res.status(200).json({
          status: "modify",
          message: "Successfully modified",
        });
      }
    }

    const currentQty = parseInt(cutSchQty) + parseInt(dataPost.CUT_SCH_QTY);

    // console.log(currentQty);

    if (currentQty > sewSchQty)
      return res.status(404).json({
        message: `Tidak Bisa melebihi balance Qty Schedule Sewing ${saldo}`,
      });

    if (schDate.isBefore(currentDate))
      return res.status(404).json({
        message: "Tidak Bisa Add Schedule ditanggal sebelum hari ini",
      });

    await CuttingSchDetails.create(dataPost);
    funcUpdateDate(dataPost.CUT_SCH_ID);
    return res
      .status(200)
      .json({ status: "create", message: "success tambahkan data" });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Terdapat error ketika post data detail schedule",
      data: error,
    });
  }
};

//function untuk update data start dan end date
export const funcUpdateDate = async (schdId) => {
  try {
    // Mendapatkan baris pertama
    const firstRow = await CuttingSchDetails.findOne({
      where: {
        CUT_SCH_ID: schdId,
      },
      order: [["CUT_LOAD_DATE", "ASC"]],
    });

    // Mendapatkan baris terakhir
    const lastRow = await CuttingSchDetails.findOne({
      where: {
        CUT_SCH_ID: schdId,
      },
      order: [["CUT_LOAD_DATE", "DESC"]],
    });

    let updateDate = {
      CUT_LOADING_START: firstRow.CUT_LOAD_DATE ? firstRow.CUT_LOAD_DATE : null,
      CUT_LOADING_FINISH: lastRow.CUT_LOAD_DATE ? lastRow.CUT_LOAD_DATE : null,
    };

    // console.log(schdId);

    return await CutingLoadingSchedule.update(updateDate, {
      where: {
        CUT_SCH_ID: schdId,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const delHeadCutSch = async (req, res) => {
  try {
    const { cutSch } = req.params;
    if (!cutSch)
      return res.status(404).json({ message: "Tidak ada id schedule" });

    const checkLoading = await CuttinScanSewingIn.findOne({
      where: { SCH_ID: cutSch },
    });

    if (checkLoading)
      return res
        .status(404)
        .json({ message: "Tidak dapat di delete, Sudah terdapat loading" });

    const deleteSchHead = await CutingLoadingSchedule.destroy({
      where: {
        CUT_SCH_ID: cutSch,
      },
    });

    if (deleteSchHead) {
      await CuttingSchDetails.destroy({
        where: {
          CUT_SCH_ID: cutSch,
        },
      });
      await CutingLoadingSchSize.destroy({
        where: {
          CUT_SCH_ID: cutSch,
        },
      });
      await CutSchDtlReal.destroy({
        where: {
          CUT_SCH_ID: cutSch,
        },
      });
    }

    return res.json({ message: "Schedule Telah Di Hapus" });
  } catch (error) {
    console.log(error);

    res.status(404).json({
      message: "Terdapat error ketika Delete schedule",
      data: error,
    });
  }
};

export const delHeadCutSchSize = async (req, res) => {
  try {
    const { cutSch, sizeCode } = req.params;

    if (!cutSch)
      return res.status(404).json({ message: "Tidak ada id schedule" });

    const checkLoading = await db.query(findOneScanIn, {
      replacements: { cutSch, sizeCode },
      type: QueryTypes.SELECT,
    });

    if (checkLoading.length > 0)
      return res
        .status(404)
        .json({ message: "Tidak dapat di delete, Sudah terdapat loading" });

    const findIdSize = await CutingLoadingSchSize.findAll({
      where: {
        CUT_SCH_ID: cutSch,
        CUT_SEW_SIZE_CODE: sizeCode,
      },
      raw: true, // <--- HERE
    });

    //cari list id size untuk delete detail karena detail tidak memiliki sizecode
    const listIdSize = findIdSize.map((schZ) => schZ.CUT_ID_SIZE);
    const deleteSchZ = await CutingLoadingSchSize.destroy({
      where: {
        CUT_ID_SIZE: listIdSize,
      },
    });

    if (deleteSchZ) {
      await CuttingSchDetails.destroy({
        where: {
          CUT_ID_SIZE: listIdSize,
        },
      });
      await CutSchDtlReal.destroy({
        where: {
          CUT_SCH_ID: listIdSize,
        },
      });
    }

    return res.json({ message: "Schedule Telah Di Hapus" });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Terdapat error ketika Delete schedule",
      data: error,
    });
  }
};

export const getInfoDetailSize = async (req, res) => {
  try {
    const { cutIdSize, schId, sizeCode } = req.params;

    const detailIdSize = await db.query(queryInfoSchSize, {
      replacements: {
        cutIdSize,
        schId,
        sizeCode,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: detailIdSize });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

export const getCutDailySizePlan = async (req, res) => {
  try {
    const { schDate, site } = req.params;

    const detailIdSizePlan = await db.query(qrySizeDailyPlan, {
      replacements: {
        schDate,
        site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: detailIdSizePlan });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

// daily plan cutting sch
export const getDailyCutSch = async (req, res) => {
  try {
    const { schDate, site } = req.params;

    const weekSchHead = await db.query(qryDailyPlanCut, {
      replacements: {
        schDate,
        site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(weekSchHead);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

// daily plan cutting sch size
export const getDailyCutSchSize = async (req, res) => {
  try {
    const { schDate, site } = req.params;

    const weekSchSize = await db.query(qrySizeDailyPlan, {
      replacements: {
        schDate,
        site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json(weekSchSize);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

// daily  result scan sup in
export const getResulSacnSupIN = async (req, res) => {
  try {
    const { schDate, site } = req.params;

    const resulScanSupIN = await db.query(qryRsltSupIN, {
      replacements: {
        schDate,
        site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: resulScanSupIN });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};
// daily  result scan sup in
export const getResulSacnSupOut = async (req, res) => {
  try {
    const { schDate, site } = req.params;

    const resulScanSupout = await db.query(qryRsltSupOut, {
      replacements: {
        schDate,
        site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: resulScanSupout });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

//CUTTING SEWING IN
export const QRScanSuperMarketIn = async (req, res) => {
  try {
    const { barcodeserial, schDate, sitename, lineName, userId, idCapacity } =
      req.body;
    //check apakah barcode serial ada pada table orders detail
    //find schedule
    const checkBarcodeSerial = await db.query(QueryfindQrSewingIn, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });
    // console.log(checkBarcodeSerial);
    //jika tidak ada reject
    if (checkBarcodeSerial.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "QRCode Tidak Ditemukan",
      });
    }

    //jika ada maka bandingkan dengan
    if (checkBarcodeSerial) {
      const valueBarcode = checkBarcodeSerial[0];

      const checkScan = await CutSupermarketIn.findAll({
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
      });
      //jika ketemu sudah di scan reject
      if (checkScan.length !== 0) {
        return res.status(200).json({
          success: true,
          qrstatus: "duplicate",
          message: "Sudah Discan",
        });
      }

      //find schedule
      const checkSchdNsize = await db.query(queryChkclSupSchIn, {
        replacements: {
          plannDate: schDate,
          sitename: sitename,
          lineName: lineName ? lineName : valueBarcode.LINE_NAME,
          // moNo: valueBarcode.MO_NO,
          orderNo: valueBarcode.ORDER_NO,
          orderRef: valueBarcode.ORDER_REF,
          styleDesc: valueBarcode.ORDER_STYLE,
          colorCode: valueBarcode.ORDER_COLOR,
          sizeCode: valueBarcode.ORDER_SIZE,
          prodMonth: valueBarcode.PRODUCTION_MONTH,
          planExFty: valueBarcode.PLAN_EXFACTORY_DATE,
          fxSiteName: valueBarcode.MANUFACTURING_SITE,
        },
        type: QueryTypes.SELECT,
      });

      if (checkSchdNsize.length > 0) {
        const { CUT_ID, SCH_ID } = checkSchdNsize[0];
        const dataBarcode = {
          BARCODE_SERIAL: valueBarcode.BARCODE_SERIAL,
          SCH_ID,
          CUT_ID,
          CUT_SCAN_BY: userId,
          CUT_SITE: sitename,
        };
        const returnData = {
          ...valueBarcode,
          LINE_NAME: lineName ? lineName : valueBarcode.LINE_NAME,
          CUT_ID,
          SCH_ID,
          SITE_NAME: sitename,
        };
        const pushQrSewin = await CutSupermarketIn.create(dataBarcode);
        if (pushQrSewin)
          return res.status(200).json({
            success: true,
            qrstatus: "success",
            message: "Scan Success",
            data: returnData,
          });
      }

      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "No Schedule",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

export const QRScanSuperMarketOut = async (req, res) => {
  try {
    const { barcodeserial, schDate, sitename, lineName, userId, idCapacity } =
      req.body;
    //check apakah barcode serial ada pada table orders detail
    //find schedule
    const checkBarcodeSerial = await db.query(QueryfindQrSewingIn, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });
    // console.log(checkBarcodeSerial);
    //jika tidak ada reject
    if (checkBarcodeSerial.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "QRCode Tidak Ditemukan",
      });
    }

    //jika ada maka bandingkan dengan
    if (checkBarcodeSerial) {
      const valueBarcode = checkBarcodeSerial[0];

      const checkScan = await CutSupermarketOut.findAll({
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
      });
      //jika ketemu sudah di scan reject
      if (checkScan.length !== 0) {
        return res.status(200).json({
          success: true,
          qrstatus: "duplicate",
          message: "Sudah Discan",
        });
      }

      const checkScaIn = await CutSupermarketIn.findOne({
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
        raw: true,
      });

      if (!checkScaIn) {
        return res.status(200).json({
          success: true,
          qrstatus: "error",
          message: "Belum Scan In",
        });
      }
      //find schedule
      const checkSchdNsize = await db.query(queryChkclSupSchIn, {
        replacements: {
          plannDate: schDate,
          sitename: sitename,
          lineName: lineName ? lineName : valueBarcode.LINE_NAME,
          // moNo: valueBarcode.MO_NO,
          orderNo: valueBarcode.ORDER_NO,
          orderRef: valueBarcode.ORDER_REF,
          styleDesc: valueBarcode.ORDER_STYLE,
          colorCode: valueBarcode.ORDER_COLOR,
          sizeCode: valueBarcode.ORDER_SIZE,
          prodMonth: valueBarcode.PRODUCTION_MONTH,
          planExFty: valueBarcode.PLAN_EXFACTORY_DATE,
          fxSiteName: valueBarcode.MANUFACTURING_SITE,
        },
        type: QueryTypes.SELECT,
      });

      if (checkSchdNsize.length > 0) {
        const { CUT_ID, SCH_ID } = checkSchdNsize[0];
        const dataBarcode = {
          BARCODE_SERIAL: valueBarcode.BARCODE_SERIAL,
          SCH_ID,
          CUT_ID,
          CUT_SCAN_BY: userId,
          CUT_SITE: sitename,
        };
        const returnData = {
          ...valueBarcode,
          LINE_NAME: lineName ? lineName : valueBarcode.LINE_NAME,
          CUT_ID,
          SCH_ID,
          SITE_NAME: sitename,
        };
        const pushQrSewin = await CutSupermarketOut.create(dataBarcode);
        if (pushQrSewin)
          return res.status(200).json({
            success: true,
            qrstatus: "success",
            message: "Scan Success",
            data: returnData,
          });
      }

      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "No Schedule",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//delete qr supermarket IN
export const DelQrScanSupIN = async (req, res) => {
  try {
    const { barcodeserial } = req.params;

    const checkQr = await CutSupermarketIn.findOne({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
      raw: true,
    });

    if (!checkQr)
      return res.status(202).json({
        success: false,
        message: "QR Tidak Ditemukan",
      });

    const checkOutput = await CutSupermarketOut.findOne({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
      raw: true,
    });

    if (checkOutput)
      return res.status(202).json({
        success: false,
        message: "QR Sudah discan Out",
      });

    const deleteQr = await CutSupermarketIn.destroy({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (deleteQr) {
      return res.status(200).json({
        success: true,
        message: "QR Deleted",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//delete qr supermarket IN
export const DelQrScanSupOUT = async (req, res) => {
  try {
    const { barcodeserial } = req.params;

    const checkQr = await CutSupermarketOut.findOne({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
      raw: true,
    });

    if (!checkQr)
      return res.status(202).json({
        success: false,
        message: "QR Tidak Ditemukan",
      });

    const checkOutput = await CuttinScanSewingIn.findOne({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
      raw: true,
    });

    if (checkOutput)
      return res.status(202).json({
        success: false,
        message: "QR Sudah Sewing IN",
      });

    const deleteQr = await CutSupermarketOut.destroy({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (deleteQr) {
      return res.status(200).json({
        success: true,
        message: "QR Deleted",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//post schedule cuting from loading schedule
export const postSchCutFromLoad = async (req, res) => {
  try {
    const dataPost = req.body;

    if (!dataPost)
      return res.status(400).json({
        success: true,
        message: "no data",
      });

    //data post terdiri dari 3 data object
    const { site, userId, dateList } = req.body;
    //dapatakan list holiday
    const listYear = dateList.map((dt) =>
      moment(dt, "YYYY-MM-DD").format("YYYY")
    );
    //dapatkan unik array untuk ambil holiday
    const uniqYear = Array.from(new Set(listYear));

    const listHoliday = await db.query(QueryGetHoliday, {
      replacements: {
        startYear: uniqYear[0],
        endYear:
          uniqYear.length > 1 ? uniqYear[listYear.length - 1] : uniqYear[0],
      },
      type: QueryTypes.SELECT,
    });

    //masukan array holiday
    const arrHoliday = listHoliday.map((item) => item.calendar_date);

    //ambil list detail id sebelumnya untuk di destroy
    const getSchDetailBfore = await db.query(qryCutingSchDetailReal, {
      replacements: {
        startDate: dateList[0],
        endDate: dateList[dateList.length - 1],
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    //data list id
    const arrDetialID = getSchDetailBfore.map((item) => item.CUT_ID_DETAIL);
    //destroy detail schedule sebelumnya
    await CutSchDtlReal.destroy({ where: { CUT_ID_DETAIL: arrDetialID } });

    //untuk bypass sabtu dan minggu
    const dayWeekEnd = ["Saturday", "Sunday"];

    //looping list tanggal dari front end
    for await (const [i, date] of dateList.entries()) {
      let schDate = moment(date, "YYYY-MM-DD");
      let endSchDate = moment(date, "YYYY-MM-DD").add(30, "days"); //ambil 30 hari berikutnya biar aman

      //ambil range date
      const rangeDate = Array.from(
        moment.range(schDate, endSchDate).by("days")
      ).map((day) => day.format("YYYY-MM-DD"));
      // let currDate = moment(date, "YYYY-MM-DD")

      //hapus weekend dan holiday
      const dateOutHol = rangeDate.filter(
        (dt) =>
          !arrHoliday.includes(dt) &&
          !dayWeekEnd.includes(moment(dt, "YYYY-MM-DD").format("dddd"))
      );

      //ambil tanggal ke 8
      const dateMin8 = dateOutHol[8];
      console.log(dateMin8);
      //ambil data detail dari loading planing
      const dataFromLoading = await db.query(qryGetFromLoad, {
        replacements: {
          schDate: dateMin8,
          site: site,
        },
        type: QueryTypes.SELECT,
      });

      //ubah tanggal dan user id
      const dataForCutDetail = dataFromLoading.map((items) => ({
        ...items,
        CUT_SCH_DATE: date,
        CUT_ADD_ID: userId,
      }));

      //tambahkan
      await CutSchDtlReal.bulkCreate(dataForCutDetail);

      if (dateList.length === i + 1) {
        return res.status(200).json({ message: "Successfully" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: "Error get schd from loading",
    });
  }
};

export const getCuttingSchReal = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;
    const weekSchHead = await db.query(queryGetSchCutReal, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchSize = await db.query(qryGetCutSchSizeReal, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const getSchDetail = await db.query(qryCutingSchDetailReal, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const weekSchDetail =
      getSchDetail?.map((sch) => ({
        ...sch,
        LOAD_STATUS: sch.LOADING_QTY ? true : false,
      })) || [];

    return res.json({ data: { weekSchHead, weekSchSize, weekSchDetail } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

// supermarket cutting report
export const getCutSupReport = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;

    const dataSchedule = await db.query(qryGetHeadCutSupRep, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const detailData = await db.query(qrySizeCutSupRep, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const detailDataSize = await db.query(qryCutSupDetailDate, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ dataSchedule, detailDataSize, detailData });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};

export const getExlPlanLoad = async (req, res) => {
  try {
    const { startDate, endDate, site } = req.params;

    const dataSchedule = await db.query(qryExportCutLoadSum, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    const detailData = await db.query(qryExportCutLoadDtl, {
      replacements: {
        startDate: startDate,
        endDate: endDate,
        site: site,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ dataSchedule, detailData });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat mengambil schedule cutting loading",
      data: error,
    });
  }
};
