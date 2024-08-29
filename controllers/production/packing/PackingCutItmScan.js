import { Op, QueryTypes } from "sequelize";
import db from "../../../config/database.js";
import {
  PackItemScan,
  qryGetBoxUnix,
  qryGetDtlRowByr,
  qryGetLastIndex,
  qryGetListPoBuyer,
  qryGetRowByPoBuyer,
} from "../../../models/production/PacScanItem.mod.js";

//get list po
export const getQryListPoBuyer = async (req, res) => {
  try {
    const { poBuyer } = req.params;
    //   const customer = decodeURIComponent(buyer);
    const texpO = decodeURIComponent(poBuyer);

    const qryPO = `%${texpO}%`;

    const listPO = await db.query(qryGetListPoBuyer, {
      replacements: {
        //   customer,
        qryPO,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: listPO });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi po buyer",
      data: error,
    });
  }
};

//get row by po buyer
export const getQryListRowByPoByr = async (req, res) => {
  try {
    const { poBuyer } = req.params;
    //   const customer = decodeURIComponent(buyer);
    const texpO = decodeURIComponent(poBuyer);

    const listRowRaw = await db.query(qryGetRowByPoBuyer, {
      replacements: {
        //   customer,
        poBuyer: texpO,
      },
      type: QueryTypes.SELECT,
    });

    const listRowDetail = await db.query(qryGetDtlRowByr, {
      replacements: {
        //   customer,
        poBuyer: texpO,
      },
      type: QueryTypes.SELECT,
    });

    let listRow = [];
    if (listRowRaw.length > 0 && listRowDetail.length > 0) {
      listRow = listRowRaw?.map((item) => {
        const filterSize = listRowDetail.filter(
          (po) => po.ROWID === item.ROWID
        );

        const stringSizeCode =
          filterSize.length > 0
            ? filterSize.map((item) => item.SIZE_CODE).join(" , ")
            : "";

        const dataReturn = {
          ...item,
          SIZE_CODE: stringSizeCode,
        };

        return dataReturn;
      });

      return res.json({ data: { listRow, listRowDetail } });
    } else {
      return res.status(200).json({ data: { listRow, listRowDetail } });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing list row po buyer",
      data: error,
    });
  }
};

export const postItemScanRow = async (req, res) => {
  try {
    const data = req.body;

    if (!data) res.status(404).json({ message: "tidak ada data untuk dipost" });

    const getNoUnix = await db.query(qryGetBoxUnix, {
      replacements: {
        ppid: data.PACKPLAN_ID,
      },
      type: QueryTypes.SELECT,
    });

    const lastUnix = getNoUnix[0]
      ? getNoUnix[0].LAST_ID.toString().padStart(6, "0")
      : "000001";

    const getLastIndex = await db.query(qryGetLastIndex, {
      replacements: {
        rowId: data.ROWID,
      },
      type: QueryTypes.SELECT,
    });

    const noNoUnix = data.PACKPLAN_ID + lastUnix;

    const lastIndex = getLastIndex[0] ? getLastIndex[0].LAST_INDEX : 1;
    const newData = { ...data, UNIX_BOX_NO: noNoUnix, INDEX_CTN: lastIndex };

    const postScan = await PackItemScan.create(newData);

    if (postScan) {
      res.json({ status: "success", data: postScan.dataValues });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing list row po buyer",
      data: error,
    });
  }
};

export const getRowScanResult = async (req, res) => {
  try {
    const { rowID } = req.params;
    const rowId = decodeURIComponent(rowID);

    const getResultScanrow = await PackItemScan.findAll({
      where: {
        ROWID: rowId,
      },
      order: [["INDEX_CTN", "ASC"]],
    });

    return res.json({ data: getResultScanrow });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get result scan",
      data: error,
    });
  }
};
