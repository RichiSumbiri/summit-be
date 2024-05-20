import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  qryFindDataQr,
  qryFindHisQrOutput,
  qryTrackOneDetail,
} from "../../../models/reports/TrackingOne.mod.js";

export const getDataQrTrackOne = async (req, res) => {
  try {
    const { barcodeserial } = req.params;

    //find schedule
    const checkBarcodeSerial = await db.query(qryFindDataQr, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    const trackingData = await db.query(qryTrackOneDetail, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    const trackingOutput = await db.query(qryFindHisQrOutput, {
      replacements: {
        barcodeserial: barcodeserial,
      },
      type: QueryTypes.SELECT,
    });

    if (checkBarcodeSerial.length > 0) {
      return res.json({
        resultStatus: true,
        dataQr: checkBarcodeSerial[0],
        dataTracking: trackingData,
        trackingOutput: trackingOutput,
      });
    } else {
      return res.json({
        resultStatus: false,
        dataQr: {},
        dataTracking: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};
