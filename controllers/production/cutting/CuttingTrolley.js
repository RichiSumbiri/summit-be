import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  AgvListTrolley,
  AgvScanSewingIn,
  CutSupermarketIn,
  CutSupermarketOut,
  CuttinScanSewingIn,
  GetQrlistAftrTrolleyIn,
  qryGetListStatinBySite,
  qryGetListTrolley,
  qryGetSiteLineWithStation,
} from "../../../models/production/cutting.mod.js";
import { getUniqueAttribute } from "../../util/Utility.js";
import { QueryCheckSchdScan, QueryfindQrSewingIn } from "../../../models/planning/dailyPlan.mod.js";
import { qryCheckTtlSewScanIn } from "../../../models/planning/cuttingplan.mod.js";

export const getlistStationBySite = async (req, res) => {
  try {
    const { siteName } = req.params;

    const getAllStation = await db.query(qryGetListStatinBySite, {
      replacements: { siteName },
      type: QueryTypes.SELECT,
    });
    const uniqObj = getUniqueAttribute(getAllStation, "STATION_ID");
    const dataList = {
      listStation: uniqObj,
      listDetailStation: getAllStation,
    };

    return res.status(200).json({
      success: true,
      data: dataList,
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

export const getlistLineStationBySite = async (req, res) => {
  try {
    const { siteName } = req.params;

    const getAllStation = await db.query(qryGetSiteLineWithStation, {
      replacements: { siteName },
      type: QueryTypes.SELECT,
    });


    return res.status(200).json({
      success: true,
      data: getAllStation,
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

export const getListTrolley = async (req, res) => {
  try {
    const { siteName, scheduleDate } = req.params;

    const getListTrolley = await db.query(qryGetListTrolley, {
      replacements: { siteName, scheduleDate },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: getListTrolley,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error processing request get trolley",
    });
  }
};

export const generateTrolleyId = async (stationId, SCHEDULE_DATE) => {
  const yyyymmdd = SCHEDULE_DATE.replace(/-/g, ""); // YYYYMMDD

  // Cari SEQ_NO terakhir untuk hari ini & stationId
  const lastTrolley = await AgvListTrolley.findOne({
    where: {
      STATION_ID_SEWING: stationId,
      SCHEDULE_DATE: SCHEDULE_DATE,
    },
    order: [["SEQ_NO", "DESC"]],
  });

  let seq = 1;
  if (lastTrolley) {
    seq = lastTrolley.SEQ_NO + 1;
  }

  const seqStr = String(seq).padStart(3, "0"); // padding jadi 3 digit
  const trolleyId = `${stationId}.${yyyymmdd}.${seqStr}`;

  return { trolleyId, seq };
};

export const deleteTrolley = async (req, res) => {
  try {
    const arrTrolley = req.body; // bentuknya array dari FE

    if (!Array.isArray(arrTrolley) || arrTrolley.length === 0) {
      return res.status(400).json({ message: "arrTrolley harus berupa array berisi TROLLEY_ID" });
    }

    // cek apakah ada yang sudah dipakai di agv_scan_sewing_in
    const existScan = await AgvScanSewingIn.findOne({
      where: { TROLLEY_ID: arrTrolley },
    });

    if (existScan) {
      return res.status(400).json({
        message: `Trolley ${existScan.TROLLEY_ID} tidak dapat dihapus karena sudah ada Bundle!`,
      });
    }

    // delete trolley di agv_list_trolley
    const deleted = await AgvListTrolley.destroy({
      where: {
        TROLLEY_ID: arrTrolley,
      },
    });

    return res.json({
      success: true,
      deletedCount: deleted,
      message: `${deleted} trolley berhasil dihapus`,
    });
  } catch (error) {
    console.error("Error deleteTrolley:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};


export const postTrolley = async (req, res) => {
  try {
    const { STATION_ID_SEWING, ADD_ID, TOTAL_CONTAINER, SCHEDULE_DATE } =
      req.body;

    if (
      TOTAL_CONTAINER === undefined ||
      TOTAL_CONTAINER < 0 ||
      TOTAL_CONTAINER > 6
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "TOTAL_CONTAINER must be between 0 - 6",
        });
    }

    const { trolleyId, seq } = await generateTrolleyId(
      STATION_ID_SEWING,
      SCHEDULE_DATE
    );

    const newTrolley = await AgvListTrolley.create({
      TROLLEY_ID: trolleyId,
      SCHEDULE_DATE: SCHEDULE_DATE,
      CONTAINER_QTY: TOTAL_CONTAINER,
      SEQ_NO: seq,
      STATION_ID_SEWING: STATION_ID_SEWING,
      ADD_ID: ADD_ID,
    });

    return res.status(201).json({
      success: true,
      message: "Trolley created successfully",
      data: newTrolley,
    });
  } catch (error) {
    console.error("❌ Error creating trolley:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const QRScanTrolleyIn = async (req, res) => {
  try {
    const { barcodeserial, trolleyId, schDate, sitename, lineName, userId } = req.body;
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
        message: "QRCode Not Found",
      });
    }



    //jika ada maka bandingkan dengan
    if (checkBarcodeSerial) {
      const valueBarcode = checkBarcodeSerial[0];

      const checkScan = await AgvScanSewingIn.findAll({
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

      const checkScaOut = await CutSupermarketOut.findOne({
        where: {
          BARCODE_SERIAL: barcodeserial,
        },
        raw: true,
      });

      if (!checkScaOut) {
        return res.status(200).json({
          success: true,
          qrstatus: "error",
          message: "Belum Supermarket Out",
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

      if (checkSchdNsize.length > 0) {
        const { SCHD_ID, SCH_ID, SCH_SIZE_QTY } = checkSchdNsize[0];

        //check total schedule berdasarkan serwing in nanti kalo sudah jalan pakai trolley
        const ttlScanInQty = await db.query(qryCheckTtlSewScanIn, {
          replacements: {
            schId: SCH_ID,
            size: valueBarcode.ORDER_SIZE,
          },
          type: QueryTypes.SELECT,
        });

        if (ttlScanInQty.length > 0) {
          const ttlInQty = parseInt(ttlScanInQty[0].TOTAL_SCAN);

          if (ttlInQty > SCH_SIZE_QTY)
            return res.status(200).json({
              success: true,
              qrstatus: "error",
              message: "Melebih Schedule Qty",
            });
        }

        const dataBarcode = {
          BARCODE_SERIAL: valueBarcode.BARCODE_SERIAL,
          SCHD_ID,
          SCH_ID,
          SEWING_SCAN_BY: userId,
          SEWING_SCAN_LOCATION: sitename,
          TROLLEY_ID: trolleyId,
        };
        const returnData = {
          ...valueBarcode,
          LINE_NAME: lineName ? lineName : valueBarcode.LINE_NAME,
          SCHD_ID,
          SCH_ID,
          SITE_NAME: sitename,
        };
        const pushQrSewin = await AgvScanSewingIn.create(dataBarcode);

        if (pushQrSewin) {
          if (checkScaOut.SCH_ID !== dataBarcode.SCH_ID) {
            //update SCH_ID Supermarket In jika tidak sama dengan SCH_ID supermarket out
            await CutSupermarketIn.update(
              { SCH_ID: dataBarcode.SCH_ID },
              {
                where: {
                  BARCODE_SERIAL: barcodeserial,
                },
              }
            );
            await CutSupermarketOut.update(
              { SCH_ID: dataBarcode.SCH_ID },
              {
                where: {
                  BARCODE_SERIAL: barcodeserial,
                },
              }
            );
          }

          return res.status(200).json({
            success: true,
            qrstatus: "success",
            message: "Scan Success",
            data: returnData,
          });
        }
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


export const QrListAftrTrolleyIn = async (req, res) => {
  try {
    //line name disini tidak dipakai tapi dipakai untuk tablet
    const { schDate, sitename, linename } = req.params;

    const listQrAfterScan = await db.query(GetQrlistAftrTrolleyIn, {
      replacements: { schDate, sitename, linename },
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