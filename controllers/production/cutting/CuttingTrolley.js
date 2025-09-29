import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  AgvListTrolley,
  AgvScanSewingIn,
  qryGetListStatinBySite,
  qryGetListTrolley,
} from "../../../models/production/cutting.mod.js";
import { getUniqueAttribute } from "../../util/Utility.js";

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
