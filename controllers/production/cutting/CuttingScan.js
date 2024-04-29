import { Orders } from "../../../models/production/order.mod.js";
import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";

import {
  CuttinScanSewingIn,
  QryCutScanInWithSize,
  QryListBoxReturn,
  QryListBoxReturnConf,
  QueryCheckQcOut,
  ScanCutting,
} from "../../../models/production/cutting.mod.js";
import moment from "moment";
import {
  FindOnePlanZ,
  FindQrReturn,
  QryFinSprMrktIn,
  QryListSizeSewIn,
  QueryCheckSchdScan,
  QueryfindQrSewingIn,
} from "../../../models/planning/dailyPlan.mod.js";
import {
  GetQrlistAftrScan,
  ScanSewingOut,
} from "../../../models/production/sewing.mod.js";
import {
  PlanSize,
  SewingBdlReturn,
} from "../../../models/production/quality.mod.js";

// CONTROLLER SCAN CUTTING
export const QRScanCutting = async (req, res) => {
  try {
    const barcodeserial = req.body.barcodeserial;
    const datetimenow = moment().format("YYYY-MM-DD HH:MM:SS");

    const checkBarcodeSerial = await Orders.findAll({
      attributes: ["BARCODE_SERIAL"],
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (checkBarcodeSerial.length == 0) {
      return res.status(400).json({
        success: true,
        message: "Barcode Serial not exist!",
        data: [],
      });
    } else {
      const checkCuttingScanTime = await ScanCutting.findAll({
        attributes: ["BARCODE_SERIAL", "CUTTING_SCANTIME"],
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
      });

      if (checkCuttingScanTime[0].CUTTING_SCANTIME != null) {
        res.status(200).json({
          success: true,
          message: "order already scan on cutting!",
          data: checkCuttingScanTime,
        });
      } else {
        await ScanCutting.update(
          {
            CUTTING_SCANTIME: datetimenow,
          },
          {
            where: {
              BARCODE_SERIAL: barcodeserial,
            },
          }
        );

        res.status(200).json({
          success: true,
          data: [],
          message: "order scan cutting successfully",
        });
      }
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//CUTTING SEWING IN
export const QRScanSewingIn = async (req, res) => {
  try {
    const { barcodeserial, schDate, sitename, lineName, userId } = req.body;
    //check apakah barcode serial ada pada table orders detail
    //find schedule
    const checkBarcodeSerial = await db.query(QryFinSprMrktIn, {
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
        message: "QRCode Not Found",
      });
    }

    //jika ada maka bandingkan dengan
    if (checkBarcodeSerial) {
      const valueBarcode = checkBarcodeSerial[0];

      const checkScan = await CuttinScanSewingIn.findAll({
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
      });
      //jika ketemu sudah di scan reject
      if (checkScan.length !== 0) {
        return res.status(200).json({
          success: true,
          qrstatus: "duplicate",
          message: "Already Scan",
        });
      }

      //find schedule
      const checkSchdNsize = await db.query(QueryCheckSchdScan, {
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

      // console.log(checkSchdNsize);
      // console.log({
      //   plannDate: schDate,
      //   sitename: sitename,
      //   lineName: lineName ? lineName : valueBarcode.LINE_NAME,
      //   moNo: valueBarcode.MO_NO,
      //   styleDesc: valueBarcode.ORDER_STYLE,
      //   colorCode: valueBarcode.ORDER_COLOR,
      //   sizeCode: valueBarcode.ORDER_SIZE,
      // });
      if (checkSchdNsize.length > 0) {
        const { SCHD_ID, SCH_ID } = checkSchdNsize[0];
        const dataBarcode = {
          BARCODE_SERIAL: valueBarcode.BARCODE_SERIAL,
          SCHD_ID,
          SCH_ID,
          SEWING_SCAN_BY: userId,
          SEWING_SCAN_LOCATION: sitename,
        };
        const returnData = {
          ...valueBarcode,
          LINE_NAME: lineName ? lineName : valueBarcode.LINE_NAME,
          SCHD_ID,
          SCH_ID,
          SITE_NAME: sitename,
        };
        const pushQrSewin = await CuttinScanSewingIn.create(dataBarcode);
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

export const QrListAftrSewingIn = async (req, res) => {
  try {
    //line name disini tidak dipakai tapi dipakai untuk tablet
    const { schDate, sitename, linename, barcodeserial } = req.params;

    const listQrAfterScan = await db.query(GetQrlistAftrScan, {
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
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//delete qr sewing IN
export const DelQrScanSewIN = async (req, res) => {
  try {
    const { barcodeserial } = req.params;

    const checkQr = await db.query(QryCutScanInWithSize, {
      replacements: {
        qrcode: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    if (!checkQr)
      return res.status(202).json({
        success: false,
        message: "QR Not Found",
      });

    const checkOutput = await db.query(QueryCheckQcOut, {
      replacements: {
        sizeCode: checkQr[0].ORDER_SIZE,
        schdId: checkQr[0].SCHD_ID,
      },
      type: QueryTypes.SELECT,
    });

    if (checkOutput.length > 0)
      return res.status(202).json({
        success: false,
        message: "Can't Delete QR Already Output QC Endline",
      });

    const deleteQr = await CuttinScanSewingIn.destroy({
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

//cntrole list all size schedule for sewing scan in
export const ListSizeSewingScanIn = async (req, res) => {
  try {
    const { schDate, sitename } = req.params;
    const listSizePlan = await db.query(QryListSizeSewIn, {
      replacements: { schDate, sitename },
      type: QueryTypes.SELECT,
    });

    return res.json(listSizePlan);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//cntrole list all size schedule for sewing scan in
export const ListQrReturnFrmSewing = async (req, res) => {
  try {
    const { sitename, startDate, endDate, status } = req.params;
    // const newStatus =
    //   status === "ALL"
    //     ? `a.CONFIRM_STATUS LIKE '%%'`
    //     : `a.CONFIRM_STATUS <> '0'`;

    let newQuery = status === "ALL" ? QryListBoxReturn : QryListBoxReturnConf;

    const listQr = await db.query(newQuery, {
      replacements: { sitename, startDate, endDate },
      type: QueryTypes.SELECT,
    });

    return res.json(listQr);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request",
    });
  }
};

//confirm return
export const adjustPlanByReturn = async (req, res, next) => {
  try {
    let { barcodeserial, confirmStatus, userId } = req.body;

    if (confirmStatus === "2") {
      return next();
    }

    // check qrcodde
    const checkBarcodeSerial = await db.query(QueryfindQrSewingIn, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    //jika tidak terdapat brcode
    if (checkBarcodeSerial.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "error",
        message: "QRCode Not Found",
      });
    }

    //check qr pada return table
    const findQrReturn = await db.query(FindQrReturn, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    //jika tidak ada reject
    if (findQrReturn.length === 0) {
      return res.status(200).json({
        success: true,
        qrstatus: "duplicate",
        message: "No QR Return Or Already Scan",
      });
    }
    //jika terdapat plansize maka adzusment
    if (findQrReturn[0].PLANSIZE_ID) {
      const arrPlanZ = await db.query(FindOnePlanZ, {
        replacements: {
          planzId: findQrReturn[0].PLANSIZE_ID,
        },
        type: QueryTypes.SELECT,
      });

      const planZ = arrPlanZ[0];
      const balance = planZ.QTY - (planZ.RTT + planZ.REPAIRED);
      const qtyBarcode = checkBarcodeSerial[0].ORDER_QTY;

      // console.log(planZ);
      // console.log(balance);
      // console.log(qtyBarcode);
      if (balance < qtyBarcode) {
        await autoRejectConfrm(barcodeserial, userId);

        return res.status(200).json({
          success: true,
          qrstatus: "error",
          message: "QR Already QC Check",
        });
      } else {
        // update plan Size
        const newBalance = planZ.QTY - qtyBarcode;

        const updatePlanSize = await PlanSize.update(
          { QTY: newBalance },
          {
            where: {
              PLANSIZE_ID: planZ.PLANSIZE_ID,
            },
          }
        );
        if (!updatePlanSize) {
          return res.status(200).json({
            success: true,
            qrstatus: "error",
            message: "Error Upadate Plan Size",
          });
        }
      }
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request return",
      data: error,
    });
  }
};

// delete data sewing in
export const deleteDataSewIn = async (req, res, next) => {
  try {
    let { barcodeserial, confirmStatus, userId } = req.body;
    if (confirmStatus === "2") {
      return next();
    }

    const checkQrSewingOut = await ScanSewingOut.findAll({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (!checkQrSewingOut.length === 0) {
      await autoRejectConfrm(barcodeserial, userId);
      return res.json({
        success: true,
        qrstatus: "error",
        message: "QR Already Sewing Out",
      });
    }

    const deleteQr = await CuttinScanSewingIn.destroy({
      where: {
        BARCODE_SERIAL: barcodeserial,
      },
    });

    if (!deleteQr)
      return res.json({
        success: true,
        qrstatus: "error",
        message: "QR Not Yet Scan IN",
      });
    next();
  } catch (error) {
    res.status(404).json({
      message: "error processing request return",
      data: error,
    });
  }
};

// update data request
export const confrmReturn = async (req, res) => {
  try {
    let { barcodeserial, confirmtime, userId, confirmStatus } = req.body;

    const dataUpd = {
      CONFIRM_STATUS: confirmStatus,
      CONFIRM_RETURN_BY: userId,
      CONFRIM_DATE: confirmtime,
    };
    const updateReq = await SewingBdlReturn.update(dataUpd, {
      where: {
        BARCODE_SERIAL: barcodeserial,
        CONFIRM_STATUS: 0,
      },
    });
    if (updateReq)
      return res.json({
        success: true,
        qrstatus: "success",
        message: "Success Return",
      });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request return",
      data: error,
    });
  }
};

async function autoRejectConfrm(barcodeserial, userId) {
  try {
    const dataUpd = {
      CONFIRM_STATUS: 2,
      CONFIRM_RETURN_BY: userId,
      CONFRIM_DATE: moment().format("YYYY-MM-DD"),
    };
    return await SewingBdlReturn.update(dataUpd, {
      where: {
        BARCODE_SERIAL: barcodeserial,
        CONFIRM_STATUS: 0,
      },
    });
  } catch (error) {
    console.log(error);
  }
}
