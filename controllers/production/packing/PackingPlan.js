import { Op, QueryTypes, where } from "sequelize";
import db from "../../../config/database.js";
import {
  CartonBox,
  OrderPoBuyer,
  PackBoxStyle,
  PackPlanHeader,
  PackPlanRowDetail,
  PackingPlanBoxRow,
  PackingPlanDetail,
  PackingPlanPoSum,
  findPoPlanPack,
  getBoxStyleCode,
  getSizeCodeByStyleId,
  qryDeliveryMode,
  qryGetCusDivision,
  qryGetCustLoaction,
  qryGetLastPPI,
  qryGetLisColorPPID,
  qryGetLisPOPPID,
  qryGetLisSizePPID,
  qryGetPackHeader,
  qryGetPackMethod,
  qryGetRowColQty,
  qryGetRowDtl,
  qryGetRowDtlOne,
  // qryGetSumPoPront,
  qryGetlistPo,
  qryPackPoIdPoBuyer,
  qryQtySizeRowDtl,
  qrySumNewQtyRow,
  qrySumPoDetil,
  qrySumQtyPoBox,
  queryGetSytleByBuyer,
} from "../../../models/production/packing.mod.js";
import moment from "moment";
import {
  customSortByLetterFirst,
  customSortByNumberFirst,
} from "../../util/Utility.js";

export const getListStylePack = async (req, res) => {
  try {
    const { buyer } = req.params;
    const byr = decodeURIComponent(buyer).toString();
    //   const MES_STYLE = decodeURIComponent(style).toString();

    const listStyel = await db.query(queryGetSytleByBuyer, {
      replacements: {
        byr,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: listStyel });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data style",
      data: error,
    });
  }
};

export const getPackBox = async (req, res) => {
  try {
    const { buyer } = req.params;
    const BUYER_CODE = decodeURIComponent(buyer).toString();

    const listBoxSpec = await CartonBox.findAll({
      where: {
        BUYER_CODE: BUYER_CODE,
      },
      raw: true,
    });

    return res.status(200).json({ data: listBoxSpec });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data box",
      data: error,
    });
  }
};

export const postPackBox = async (req, res) => {
  try {
    const dataPost = req.body;

    const postBox = await CartonBox.create(dataPost);

    if (postBox) {
      const listBoxSpec = await CartonBox.findAll({
        where: {
          BUYER_CODE: dataPost.BUYER_CODE,
        },
        raw: true,
      });

      return res
        .status(200)
        .json({ message: "Success Add", data: listBoxSpec });
    } else {
      return res.status(500).json({ message: "Faild to add" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get post box",
      data: error,
    });
  }
};

export const getListSizeCodeByProdId = async (req, res) => {
  try {
    const { prodItemCode } = req.params;
    //   const MES_STYLE = decodeURIComponent(style).toString();

    const listSizeCode = await db.query(getSizeCodeByStyleId, {
      replacements: {
        prodItemCode,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: listSizeCode });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data listSizeCode",
      data: error,
    });
  }
};

export const postSetCartonStyle = async (req, res) => {
  try {
    const dataPost = req.body;
    const { prodItemCode } = req.params;

    const destroyBox = await PackBoxStyle.destroy({
      where: {
        PRODUCT_ITEM_ID: prodItemCode,
        TYPE_PACK: "SOLID",
      },
    });

    if (!dataPost && destroyBox)
      return res.status(200).json({
        message: "Berhasil Clear Data Carton Prodct ID " + prodItemCode,
      });

    // const listGmt = dataPost.map((items) => items.PRODUCT_ITEM_ID);

    await PackBoxStyle.bulkCreate(dataPost);

    return res.status(200).json({ message: "Success Save" });
    // if (destroyBox) {
    // } else {
    //   return res.status(500).json({ message: "Faild to Save" });
    // }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post box style",
      data: error,
    });
  }
};

export const postSetCtnPrepack = async (req, res) => {
  try {
    const dataPost = req.body;
    const { prodItemCode } = req.params;

    const destroyBox = await PackBoxStyle.destroy({
      where: {
        PRODUCT_ITEM_ID: prodItemCode,
        TYPE_PACK: "PREPACK",
      },
    });

    if (!dataPost && destroyBox)
      return res.status(200).json({
        message: "Berhasil Clear Data Carton Prodct ID " + prodItemCode,
      });

    // const listGmt = dataPost.map((items) => items.PRODUCT_ITEM_ID);

    await PackBoxStyle.create(dataPost);

    return res.status(200).json({ message: "Success Save" });
    // if (destroyBox) {
    // } else {
    //   return res.status(500).json({ message: "Faild to Save" });
    // }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post box style",
      data: error,
    });
  }
};

//untuk result box style size
export const getResltBoxStyle = async (req, res) => {
  try {
    const { prodItemCode } = req.params;
    //   const MES_STYLE = decodeURIComponent(style).toString();

    const listResult = await db.query(getBoxStyleCode, {
      replacements: {
        prodItemCode,
      },
      type: QueryTypes.SELECT,
    });

    if (listResult.length === 0) {
      return res.status(201).json({ message: "Belum ada data" });
    }

    const listBoxCode = [
      ...new Map(listResult.map((item) => [item["BOX_ID"], item])).values(),
    ].map((items) => ({ BOX_ID: items.BOX_ID, BOX_CODE: items.BOX_CODE }));

    return res.status(200).json({ data: { listResult, listBoxCode } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data listSizeCode",
      data: error,
    });
  }
};

// get packing plan id
export const getPackingPlanId = async (req, res) => {
  try {
    const getNoId = await db.query(qryGetLastPPI, {
      type: QueryTypes.SELECT,
    });
    const lasPPID = getNoId[0]
      ? getNoId[0].LAST_ID.toString().padStart(6, "0")
      : "000001";

    const years = moment().format("YYYY");

    const newPPID = "PPID" + years + lasPPID;

    return res.status(200).json({ data: newPPID });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing Plan ID",
      data: error,
    });
  }
};

export const getPackingPlanHd = async (req, res) => {
  try {
    const { customer, startDate, endDate } = req.params;

    const buyer = decodeURIComponent(customer);

    const listDataHeader = await db.query(qryGetPackHeader, {
      replacements: {
        customer: buyer,
        startDate,
        endDate,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: listDataHeader });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing Plan data header",
      data: error,
    });
  }
};

// get packing plan id
export const getRefPackPlanByByr = async (req, res) => {
  try {
    const { customer } = req.params;
    const buyer = decodeURIComponent(customer);

    const listDivision = await db.query(qryGetCusDivision, {
      replacements: {
        customer: buyer,
      },
      type: QueryTypes.SELECT,
    });

    const listPackMethod = await db.query(qryGetPackMethod, {
      replacements: {
        customer: buyer,
      },
      type: QueryTypes.SELECT,
    });

    const listCustLocation = await db.query(qryGetCustLoaction, {
      replacements: {
        customer: buyer,
      },
      type: QueryTypes.SELECT,
    });

    const listDelivMode = await db.query(qryDeliveryMode, {
      replacements: {
        customer: buyer,
      },
      type: QueryTypes.SELECT,
    });

    const listRef = {
      listDivision,
      listPackMethod,
      listCustLocation,
      listDelivMode,
    };

    return res.status(200).json({ data: listRef });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi by buyer",
      data: error,
    });
  }
};

export const postDataPackPlanHeader = async (req, res) => {
  try {
    const data = req.body;

    if (!data) res.status(400).json({ message: "no data provided" });

    //check duplicate packplan code
    let checkIdExist = await PackPlanHeader.findOne({
      where: { PACKPLAN_ID: data.PACKPLAN_ID },
    });
    if (checkIdExist)
      return res.status(400).json({ message: "ID Already Exist" });

    const postDataHeader = PackPlanHeader.create(data);
    if (postDataHeader)
      return res.status(200).json({ message: "Success Create Header Post" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi by buyer",
      data: error,
    });
  }
};

//get list po
export const getQryListPo = async (req, res) => {
  try {
    const { buyer, poNum } = req.params;
    const customer = decodeURIComponent(buyer);
    const texpO = decodeURIComponent(poNum);

    const qryPO = `%${texpO}%`;

    const listPO = await db.query(qryGetlistPo, {
      replacements: {
        customer,
        qryPO,
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

//get po for packing plan
export const getDataPolistPoBuyer = async (req, res) => {
  try {
    const { poNum } = req.params;

    const poNumber = decodeURIComponent(poNum);

    const listPO = await db.query(qryPackPoIdPoBuyer, {
      replacements: {
        poNumber,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: listPO });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing po list buyer",
      data: error,
    });
  }
};

//get po for packing plan
export const getDataPoSizeForPack = async (req, res) => {
  try {
    const { poNum, ppid } = req.params;

    const poNumber = decodeURIComponent(poNum);

    const listPO = await db.query(findPoPlanPack, {
      replacements: {
        poNumber,
        ppid,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: listPO });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi by buyer",
      data: error,
    });
  }
};

export const postPackBuyerPo = async (req, res) => {
  try {
    const data = req.body;

    if (!data || data.length === 0)
      res.status(400).json({ message: "no data provided" });

    //create or update
    let createOrUpdate = await OrderPoBuyer.bulkCreate(data, {
      updateOnDuplicate: [
        "BUYER_PO",
        "BUYER_COLOR_CODE",
        "BUYER_COLOR_NAME",
        "MOD_ID",
      ],
      where: { ORDER_PO_ID: ["ORDER_PO_ID"] },
    });

    if (createOrUpdate)
      return res
        .status(200)
        .json({ status: "success", message: "Success Post PO Buyer" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post po buyer",
      data: error,
    });
  }
};

export const PosPackPlanDetail = async (req, res) => {
  try {
    const data = req.body;

    if (!data || data.length === 0)
      return res.status(400).json({ message: "no data provided" });

    // const dataCreatUpdate = data.filter(items => items.SHIPMENT_QTY)
    // const dataDelete = data.filter(items => !items.SHIPMENT_QTY).map()

    // //create or update
    for (const [i, ppDetail] of data.entries()) {
      const checkExist = await PackingPlanDetail.findOne({
        where: {
          UNIKID: ppDetail.UNIKID,
          PACKPLAN_ID: ppDetail.PACKPLAN_ID,
        },
        raw: true,
      });
      if (checkExist && ppDetail.SHIPMENT_QTY) {
        ppDetail.ADD_ID = null;
        await PackingPlanDetail.update(ppDetail, {
          where: {
            UNIKID: ppDetail.UNIKID,
            PACKPLAN_ID: ppDetail.PACKPLAN_ID,
          },
        });
      }
      if (checkExist && !ppDetail.SHIPMENT_QTY) {
        // console.log("execute delete");
        await PackingPlanDetail.destroy({
          where: {
            UNIKID: ppDetail.UNIKID,
            PACKPLAN_ID: ppDetail.PACKPLAN_ID,
          },
        });
      }
      if (!checkExist && ppDetail.SHIPMENT_QTY) {
        await PackingPlanDetail.create(ppDetail);
      }

      if (data.length === i + 1)
        return res
          .status(200)
          .json({ status: "success", message: "Success Post Packing detail" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post packing plan detail",
      data: error,
    });
  }
};

//get list po detail sum
export const getQrySumDetail = async (req, res) => {
  try {
    const { poNum, ppid } = req.params;
    const poNumber = decodeURIComponent(poNum);

    const sumPODetail = await db.query(qrySumPoDetil, {
      replacements: {
        poNumber,
        ppid,
      },
      type: QueryTypes.SELECT,
    });

    return res.json({ data: sumPODetail });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi po number",
      data: error,
    });
  }
};

//post data summary po packing plan
export const postPackPosum = async (req, res) => {
  try {
    const data = req.body;

    if (!data || data.length === 0)
      return res.status(400).json({ message: "no data provided" });

    for (const [i, poSUm] of data.entries()) {
      const checkExist = await PackingPlanPoSum.findOne({
        where: {
          PACKPLAN_ID: poSUm.PACKPLAN_ID,
          BUYER_PO: poSUm.BUYER_PO,
          BUYER_COLOR_CODE: poSUm.BUYER_COLOR_CODE,
        },
        raw: true,
      });
      if (checkExist && poSUm.SHIPMENT_QTY) {
        await PackingPlanPoSum.update(poSUm, {
          where: {
            PACKPLAN_ID: poSUm.PACKPLAN_ID,
            BUYER_PO: poSUm.BUYER_PO,
            BUYER_COLOR_CODE: poSUm.BUYER_COLOR_CODE,
          },
        });
      } else {
        await PackingPlanPoSum.create(poSUm);
      }

      if (data.length === i + 1)
        return res.status(200).json({
          status: "success",
          message: "Success Post Packing PO Summary",
        });
    }
    if (dataSum) {
      return res.json({
        status: "success",
        message: "Success Post Packing detail",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post when save packing po summary",
      data: error,
    });
  }
};

//Delete DataPackSum
export const delPackPosum = async (req, res) => {
  try {
    const { poNum, ppid, colorCode } = req.query;

    const poNumber = decodeURIComponent(poNum);
    const clrCode = decodeURIComponent(colorCode);

    const paramWhere = {
      PACKPLAN_ID: ppid,
      BUYER_PO: poNumber,
    };

    let rowId = `${ppid};${poNumber}`;

    if (colorCode) {
      paramWhere.BUYER_COLOR_CODE = clrCode;
      rowId = rowId + `;${clrCode}`;
    }
    rowId + "%";

    await PackingPlanDetail.destroy({
      where: paramWhere,
    });

    await PackingPlanPoSum.destroy({
      where: paramWhere,
    });

    await PackingPlanBoxRow.destroy({
      where: {
        ROWID: {
          [Op.like]: rowId,
        },
      },
    });

    await PackPlanRowDetail.destroy({
      where: {
        ROWID: {
          [Op.like]: rowId,
        },
      },
    });

    return res.json({
      status: "success",
      message: "Success Post Packing detail",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error delete when save packing po summary",
      data: error,
    });
  }
};

//get list po ppid
export const getLisPoPPID = async (req, res) => {
  try {
    const { ppid } = req.params;

    const listPOppid = await db.query(qryGetLisPOPPID, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const lisSizePpidHd = await db.query(qryGetLisSizePPID, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    let lisSizePpid = lisSizePpidHd;
    if (lisSizePpidHd.length !== 0 && lisSizePpidHd[0].SORT_TYPE === "letter") {
      lisSizePpid = customSortByLetterFirst(lisSizePpidHd, "SIZE_CODE");
    } else {
      lisSizePpid = customSortByNumberFirst(lisSizePpidHd, "SIZE_CODE");
    }

    const lisColorPpid = await db.query(qryGetLisColorPPID, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    // const listPOSum = await db.query(qryGetSumPoPront, {
    //   replacements: { ppid },
    //   type: QueryTypes.SELECT,
    // });

    const listRowDtl = await db.query(qryGetRowDtl, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const listRowDtlQty = await db.query(qryQtySizeRowDtl, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const qtyPackRowCol = await db.query(qryGetRowColQty, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const datas = {
      listPOppid,
      lisSizePpid,
      lisColorPpid,
      listRowDtl,
      listRowDtlQty,
      qtyPackRowCol,
    };

    return res.json({ data: datas });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get list po ppid",
      data: error,
    });
  }
};

//modal add po tabs buyer box
export const getPoByrBox = async (req, res) => {
  try {
    const { poNum, ppid } = req.params;

    const poNumber = decodeURIComponent(poNum);
    const sumPODetail = await db.query(qrySumQtyPoBox, {
      replacements: {
        poNumber,
        ppid,
      },
      type: QueryTypes.SELECT,
    });

    let sortSizeCode = sumPODetail;
    if (sumPODetail.length !== 0 && sumPODetail[0].SORT_TYPE === "letter") {
      sortSizeCode = customSortByLetterFirst(sumPODetail, "SIZE_CODE");
    } else {
      sortSizeCode = customSortByNumberFirst(sumPODetail, "SIZE_CODE");
    }

    return res.json({ data: sortSizeCode });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing referensi po number",
      data: error,
    });
  }
};

//post generate row box
export async function postGenerateRowBox(req, res) {
  try {
    const { arrRow, arrRowDetail } = req.body;

    if (!arrRow)
      return res.status(404).json({
        message: "No Data For Post",
      });

    const listRowId = arrRow.map((items) => items.ROWID);

    const dataRows = [];
    let po = "";
    let color = "";
    let idxPo = 0;
    let idxRow = 0;

    for (let index = 0; index < arrRow.length; index++) {
      const items = arrRow[index];
      if (po !== items.BUYER_PO) {
        po = items.BUYER_PO;
        idxPo = 0;
      }
      idxRow++;
      if (color !== items.BUYER_COLOR_CODE) {
        color = items.BUYER_COLOR_CODE;
        idxRow = 1;
      }

      const dataWithIdx = {
        ...items,
        CTN_START: idxPo + 1,
        CTN_END:
          items.TTL_BOX !== 1 ? idxPo + parseInt(items.TTL_BOX) : idxPo + 1,
        ROW_INDEX: idxRow,
      };
      dataRows.push(dataWithIdx);

      idxPo = idxPo + parseInt(items.TTL_BOX);
    }
    //delete header row
    await PackingPlanBoxRow.destroy({
      where: {
        ROWID: listRowId,
      },
    });

    //delete detail row
    await PackPlanRowDetail.destroy({
      where: {
        ROWID: listRowId,
      },
    });

    // const detailRow = arrRow.map((item) => ({
    //   ROWID: item.ROWID,
    //   PACKPLAN_ID: item.PACKPLAN_ID,
    //   SIZE_CODE: item.SIZE_CODE,
    //   QTY: item.QTY_PER_BOX,
    //   ADD_ID: item.ADD_ID,
    // }));

    const headerPost = await PackingPlanBoxRow.bulkCreate(dataRows);

    const detailPost = await PackPlanRowDetail.bulkCreate(arrRowDetail);

    if (headerPost && detailPost)
      return res.json({
        message: "Success Generate",
      });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post packing box row",
      data: error,
    });
  }
}

//get list po row detil ppid
export const getListRowDtlPo = async (req, res) => {
  try {
    const { ppid } = req.params;

    // const listPOSum = await db.query(qryGetSumPoPront, {
    //   replacements: { ppid },
    //   type: QueryTypes.SELECT,
    // });

    const listRowDtl = await db.query(qryGetRowDtl, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const listRowDtlQty = await db.query(qryQtySizeRowDtl, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const qtyPackRowCol = await db.query(qryGetRowColQty, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const datas = {
      listRowDtl,
      listRowDtlQty,
      qtyPackRowCol,
    };

    return res.json({ data: datas });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get list po ppid",
      data: error,
    });
  }
};

//update one rows
export const updateOneRowPpid = async (req, res) => {
  try {
    const data = req.body;

    if (!data)
      return res.status(404).json({
        message: "No Data For Update",
      });

    const updateROw = await PackingPlanBoxRow.update(data, {
      where: {
        ROWID: data.ROWID,
      },
    });
    if (updateROw) {
      return res.json({ status: true, message: "Success update row" });
    } else {
      return res.json({ status: false });
    }
  } catch (error) {
    return res.status(404).json({
      message: "error patsch rowid",
      data: error,
    });
  }
};

//delete one detail row
export const delOneDetailPpid = async (req, res) => {
  try {
    const { size, rowId } = req.params;

    if (!size || !rowId)
      return res.status(404).json({
        message: "No Data For Update",
      });
    const endCodRowId = decodeURIComponent(rowId);
    const deleteDetail = await PackPlanRowDetail.destroy({
      where: {
        ROWID: endCodRowId,
        SIZE_CODE: size,
      },
    });

    if (!deleteDetail)
      return res.status(404).json({ status: false, message: "Gagal Update" });

    const findNewQty = await db.query(qrySumNewQtyRow, {
      replacements: { rowId: endCodRowId },
      type: QueryTypes.SELECT,
    });
    const newvalue = findNewQty[0] ? findNewQty[0].QTY : 0;
    const valUpdate = {
      SHIPMENT_QTY: newvalue,
      AFTER_SET_QTY: newvalue,
      QTY_PER_BOX: newvalue,
      TTL_QTY_BOX: newvalue,
    };

    const updateROw = await PackingPlanBoxRow.update(valUpdate, {
      where: {
        ROWID: endCodRowId,
      },
    });

    const findResult = await db.query(qryGetRowDtlOne, {
      replacements: { rowId: endCodRowId },
      type: QueryTypes.SELECT,
    });

    if (updateROw) {
      return res.json({
        status: true,
        data: findResult[0],
        message: "Success update row",
      });
    } else {
      return res.json({ status: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error patsch rowid",
      data: error,
    });
  }
};

//post one detail row
export const PostOneDtlRowPpid = async (req, res) => {
  try {
    const data = req.body;

    if (!data)
      return res.status(404).json({
        message: "No Data For Update",
      });

    const postDetail = await PackPlanRowDetail.create(data, {
      raw: true,
    });

    if (!postDetail)
      return res.status(404).json({ status: false, message: "Gagal Update" });

    const findNewQty = await db.query(qrySumNewQtyRow, {
      replacements: { rowId: data.ROWID },
      type: QueryTypes.SELECT,
    });

    const newvalue = findNewQty[0] ? findNewQty[0].QTY : 0;
    const valUpdate = {
      SHIPMENT_QTY: newvalue,
      AFTER_SET_QTY: newvalue,
      QTY_PER_BOX: newvalue,
      TTL_QTY_BOX: newvalue,
    };

    const updateROw = await PackingPlanBoxRow.update(valUpdate, {
      where: {
        ROWID: data.ROWID,
      },
    });

    const findResult = await db.query(qryGetRowDtlOne, {
      replacements: { rowId: data.ROWID },
      type: QueryTypes.SELECT,
    });

    const plainPostDetail = postDetail.get({ plain: true });
    const newDetails = {
      ...plainPostDetail,
      TTL_QTY: plainPostDetail.QTY * findResult[0].TTL_BOX,
    };

    if (updateROw) {
      return res.json({
        status: true,
        data: { rowData: findResult[0], detailData: newDetails },
        message: "Success update row",
      });
    } else {
      return res.json({ status: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error patsch rowid",
      data: error,
    });
  }
};
