import {
  Orders,
  getDetailQrGenerate,
} from "../../../models/production/order.mod.js";
import {
  GenerateQR,
  GetLastQr,
} from "../../../models/production/cutting.mod.js";
import moment from "moment";
import db from "../../../config/database.js";
import { QueryTypes } from "sequelize";

// CONTROLLER GENERATE QR CODE
export const newQRCutting = async (req, res) => {
  try {
    let existData = [];
    const dataOrder = req.body;

    if (!dataOrder.length) {
      return res.status(404).json({
        success: false,
        message: "no order qr generated!",
        data: dataOrder,
      });
    }

    dataOrder.forEach(async (order, i) => {
      const checkGeneratedQR = await GenerateQR.findOne({
        where: {
          BARCODE_SERIAL: order.BARCODE_SERIAL,
        },
      });

      if (checkGeneratedQR) {
        await GenerateQR.update(
          { SITE_LINE: order.SITE_LINE, UPDATE_BY: 130 },
          {
            where: {
              BARCODE_SERIAL: order.BARCODE_SERIAL,
              BUNDLE_SEQUENCE: order.SEQUENCE,
              UPDATE_BY: order.CREATE_BY,
            },
          }
        );
      } else {
        await GenerateQR.create({
          BARCODE_SERIAL: order.BARCODE_SERIAL,
          BUNDLE_SEQUENCE: order.SEQUENCE,
          SITE_LINE: order.SITE_LINE,
          CREATE_BY: order.CREATE_BY,
        });
      }

      if (i + 1 === dataOrder.length)
        return res.status(201).json({
          success: true,
          message: "QR Generated Successfully",
          duplicate: existData,
        });
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

export const generateBdlOrder = async (req, res) => {
  try {
    const { dataOrder, qtyAlocation, qtyBdl, draft, alocation, userId } =
      req.body;

    if (!req.body) {
      return res.status(404).json({
        success: false,
        message: "no data post!",
      });
    }

    const findLast = await db.query(GetLastQr, {
      type: QueryTypes.SELECT,
    });

    const orderData = {
      BUYER_CODE: dataOrder.CUSTOMER_NAME,
      ORDER_NO: dataOrder.ORDER_NO,
      PRODUCT_TYPE: dataOrder.PRODUCT_TYPE,
      BUYER_PO: dataOrder.ORDER_PO_ID,
      MO_NO: dataOrder.MO_NO,
      ORDER_VERSION: 1,
      SHIPMENT_DATE: dataOrder.PLAN_EXFACTORY_DATE,
      ORDER_COLOR: dataOrder.ITEM_COLOR_CODE,
      ORDER_SIZE: dataOrder.SIZE_CODE,
      ORDER_STYLE: dataOrder.ORDER_STYLE_DESCRIPTION,
      SITE_LINE: alocation,
      CREATE_BY: userId,
    };

    const lastQr = findLast[0].lastIdx || 0;
    const BarcodeList = [];
    const prefix = "SSC";

    for (let i = 0; i < draft.bdlUtama; i++) {
      const qrNumber = lastQr + i + 1;
      const barcodeSerial = prefix + qrNumber.toString().padStart(9, "0");

      const barcodeObj = {
        ...orderData,
        BARCODE_SERIAL: barcodeSerial,
        ORDER_QTY: qtyBdl,
      };
      BarcodeList.push(barcodeObj);
    }

    if (draft.sisaBagi > 0) {
      const qrNumberSisa = lastQr + draft.bdlUtama + 1;
      const barcodeSerial = prefix + qrNumberSisa.toString().padStart(9, "0");

      const barcodeObj2 = {
        ...orderData,
        BARCODE_SERIAL: barcodeSerial,
        ORDER_QTY: draft.sisaBagi,
      };
      BarcodeList.push(barcodeObj2);
    }

    const bulkOrderDetail = await Orders.bulkCreate(BarcodeList);

    if (bulkOrderDetail) {
      const { BUYER_PO, ORDER_COLOR, ORDER_SIZE } = bulkOrderDetail[0];

      const resultDetail = await db.query(getDetailQrGenerate, {
        replacements: {
          poId: BUYER_PO,
          colorCode: ORDER_COLOR,
          sizeCode: ORDER_SIZE,
        },
        type: QueryTypes.SELECT,
      });

      return res.status(200).json({
        success: true,
        message: "Order Data Added Successfully",
        dataResult: resultDetail,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
