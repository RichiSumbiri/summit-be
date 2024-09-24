import { Op, QueryTypes } from "sequelize";
import db from "../../../config/database.js";
import {
  checkBlcShipScan,
  PackingShipScan,
  qryCheckPoItem,
  querRefSid,
  queryContainerList,
  queryShipPlanScan,
  queryShipPlanScanResult,
  queryGetTlOfCtn,
  PackCtnLabel,
  qryLabelResult,
  PackShipPlan,
  qryTtlCtnClp,
  qryShipmentMonitoring,
} from "../../../models/production/packing.mod.js";
import { CheckNilai, CheckNilaiToint } from "../../util/Utility.js";

//get list container list
export const getContainerList = async (req, res) => {
  try {
    const { sid } = req.params;
    //   const MES_STYLE = decodeURIComponent(style).toString();

    const containerList = await db.query(queryContainerList, {
      replacements: {
        sid,
      },
      type: QueryTypes.SELECT,
    });

    if (containerList.length === 0) {
      return res.status(201).json({ message: "Belum ada data" });
    }

    return res.status(200).json({ data: { containerList } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data container list",
      data: error,
    });
  }
};

export const getListShipPlanScan = async (req, res) => {
  try {
    const { sid, conId } = req.params;
    //   const MES_STYLE = decodeURIComponent(style).toString();

    const shipPlan = await db.query(queryShipPlanScan, {
      replacements: {
        sid,
        conId,
      },
      type: QueryTypes.SELECT,
      raw: true,
    });

    const converIng = shipPlan?.map((item) => ({
      ...item,
      SCAN_RESULT: CheckNilaiToint(item.SCAN_RESULT),
      BALANCE_SCAN: CheckNilaiToint(item.BALANCE_SCAN),
    }));

    const listPoBuyer = [...new Set(shipPlan.map((item) => item.PO_BUYER))];

    const ttlCtn = await db.query(qryTtlCtnClp, {
      replacements: {
        sid,
        conId,
      },
      type: QueryTypes.SELECT,
    });

    const shipPlanResult = await db.query(queryShipPlanScanResult, {
      replacements: {
        sid,
        conId,
      },
      type: QueryTypes.SELECT,
    });

    const containerList = await db.query(queryContainerList, {
      replacements: {
        sid,
      },
      type: QueryTypes.SELECT,
    });

    if (shipPlan.length === 0) {
      return res.status(201).json({ message: "Belum ada data" });
    }

    return res.status(200).json({
      data: {
        shipPlan: converIng,
        shipPlanResult,
        containerList,
        listPoBuyer: listPoBuyer,
        ttlCtn: parseInt(ttlCtn[0].TTL_SCAN),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data shipment plan",
      data: error,
    });
  }
};

export const getTtlScanClp = async (req, res) => {
  try {
    const { sid, conId } = req.params;

    const ttlCtn = await db.query(qryTtlCtnClp, {
      replacements: {
        sid,
        conId,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: [0].TTL_SCAN });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data shipment plan",
      data: error,
    });
  }
};

//get list ref shimpent id
export const getQryListShipId = async (req, res) => {
  try {
    const { sidKey } = req.params;

    const sid = `%${sidKey}%`;

    const listPO = await db.query(querRefSid, {
      replacements: {
        sid,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: listPO });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi po number",
      data: error,
    });
  }
};

export const genShipLabelCtn = async (req, res) => {
  try {
    const data = req.body;
    const {
      SHIPMENT_ID,
      CONTAINER_ID,
      // PO_ITEM,
      PO_BUYER,
      COLOR_CODE,
      ROWID,
    } = req.body;

    if (!ROWID)
      return res.status(404).json({ message: "Tidak Terdapat ROWID" });

    const sumOfCtn = await db.query(queryGetTlOfCtn, {
      replacements: {
        SHIPMENT_ID,
        CONTAINER_ID,
        PO_BUYER,
        COLOR_CODE,
      },
      type: QueryTypes.SELECT,
      raw: true,
    });
    // console.log(sumOfCtn);

    const noOfCtn = sumOfCtn[0].NO_OF_CTN;
    const arrLabel = generateCartonObjects(data, noOfCtn);

    const generateLabels = await PackCtnLabel.bulkCreate(arrLabel);
    if (generateLabels) {
      const findResult = await db.query(qryLabelResult, {
        replacements: {
          rowId: ROWID,
        },
        type: QueryTypes.SELECT,
        raw: true,
      });

      await PackShipPlan.update(
        { PRINTED_STATUS: "1" },
        {
          where: {
            ROWID: ROWID,
          },
        }
      );

      return res.json({ message: "success", data: findResult });
    } else {
      return res.status(404).json({ message: "Error saat generate label" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi po number",
      data: error,
    });
  }
};

const generateCartonObjects = (shipment, noOF) => {
  const cartons = [];
  for (let i = shipment.CTN_START; i <= shipment.CTN_END; i++) {
    const carton = {
      ROWID: shipment.ROWID,
      // SHIPMENT_ID: shipment.SHIPMENT_ID,
      // PACK_UPC : shipment.PACK_UPC,
      CTN_NO: i,
      CTN_OF: noOF,
      UNIK_CODE: `${shipment.ROWID}|${i}`,
    };
    cartons.push(carton);
  }
  return cartons;
};

//untuk auto post shipment scan
export const scanShipmentBox = async (req, res) => {
  try {
    const dataBox = req.body;

    if (!dataBox) {
      return res.json({
        status: "error",
        message: "Data Tidak Ditemukan",
      });
    }

    const formatingPost = dataBox
      .filter((rslt) => rslt.SCAN_RESULT !== null)
      .map((items) => ({
        SHIPMENT_PLAN_ID: items.ID,
        UPC: items.PACK_UPC,
        SHIPMENT_ID: items.SHIPMENT_ID,
        PO_ITEM: items.PO_ITEM,
        PO_NUMBER: items.PO_BUYER,
        CONTAINER_ID: items.CONTAINER_ID,
        SCAN_QTY: items.SCAN_RESULT,
      }));

    const arrShipId = formatingPost.map((items) => items.SHIPMENT_PLAN_ID);
    await PackingShipScan.destroy({
      where: {
        SHIPMENT_PLAN_ID: {
          [Op.in]: arrShipId,
        },
      },
    });

    const postScan = await PackingShipScan.bulkCreate(formatingPost, {
      updateOnDuplicate: ["SCAN_QTY"],
      where: {
        SHIPMENT_PLAN_ID: ["SHIPMENT_PLAN_ID  "],
      },
    });

    const newTtlCtn = await db.query(qryTtlCtnClp, {
      replacements: {
        sid: dataBox[0].SHIPMENT_ID,
        conId: dataBox[0].CONTAINER_ID,
      },
      type: QueryTypes.SELECT,
    });

    if (postScan) {
      return res.json({
        status: "success",
        message: "Success Scan",
        scanResult: parseInt(newTtlCtn[0].TTL_SCAN),
      });
    } else {
      return res.json({ status: "error", message: "Gagal Scan" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error saat scan",
      data: error,
    });
  }
};

// shipment monitoring
export const getShipMntrResult = async (req, res) => {
  try {
    const { shipDate } = req.params;

    if (!shipDate)
      return res.status(404).json({ message: "Tidak ada tanggal" });

    const listResult = await db.query(qryShipmentMonitoring, {
      replacements: {
        shipDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: listResult });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get result",
      data: error,
    });
  }
};
