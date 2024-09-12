import { Op, QueryTypes, where } from "sequelize";
import db from "../../../config/database.js";
import {
  CartonBox,
  OrderPoBuyer,
  PackBoxStyle,
  PackCartonStyle,
  PackMethodeList,
  PackPlanChild,
  PackPlanHeader,
  PackPlanRowDetail,
  PackSortSize,
  PackingPlanBoxRow,
  PackingPlanDetail,
  PackingPlanPoSum,
  findPoPlanPack,
  getBoxStyleCode,
  getCtnStyleCode,
  getCtnStyleCodeDetail,
  getSizeCodeByStyleId,
  qryDeliveryMode,
  qryGetCusDivision,
  qryGetCustLoaction,
  qryGetDistcPoBuyer,
  qryGetDistcPoRef,
  qryGetLastPPI,
  qryGetLisColorPPID,
  qryGetLisCtnStylBoxByr,
  qryGetLisPOPPID,
  qryGetLisSizePPID,
  qryGetPackHeader,
  qryGetPackMethod,
  qryGetPackPlanDtlPo,
  qryGetReflistPoBuyer,
  qryGetRowColQty,
  qryGetRowDtl,
  qryGetRowDtlOne,
  qryGetRowIdAndIndex,
  qryGetSeqChild,
  // qryGetSumPoPront,
  qryGetlistPo,
  qryListSumPo,
  qryPackPoIdPoBuyer,
  qryQtySizeRowDtl,
  qrySumNewQtyRow,
  qrySumPoDetil,
  qrySumQtyPoBox,
  qrySumQtyPoBoxPrepack,
  queryGetSytleByBuyer,
} from "../../../models/production/packing.mod.js";
import moment from "moment";
import {
  CheckNilai,
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

    let boxList = listBoxSpec;

    if (listBoxSpec.length) {
      boxList = listBoxSpec.map((items) => ({
        ...items,
        LABEL_BOX: `${items.BOX_NAME} (${items.BOX_CODE})`,
      }));
    }

    return res.status(200).json({ data: boxList });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data box",
      data: error,
    });
  }
};

export const getPackBoxWithStyle = async (req, res) => {
  try {
    const { buyer } = req.params;
    const BUYER_CODE = decodeURIComponent(buyer).toString();

    const listBoxStyel = await db.query(qryGetLisCtnStylBoxByr, {
      replacements: {
        buyer: BUYER_CODE,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: listBoxStyel });
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
    const { update } = req.query;
    const { BOX_ID } = dataPost;

    const postBox = update
      ? await CartonBox.update(dataPost, { where: { BOX_ID: BOX_ID } })
      : await CartonBox.create(dataPost);

    if (postBox) {
      const listBoxSpec = await CartonBox.findAll({
        where: {
          BUYER_CODE: dataPost.BUYER_CODE,
        },
        raw: true,
      });

      return res.status(200).json({
        message: `Success ${update ? "update" : "create"} box`,
        data: listBoxSpec,
      });
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

export const copyFromStyle = async (req, res) => {
  try {
    const dataPost = req.body;
    const { styleSelect, styleSource } = dataPost;

    const listSetBoxSource = await PackCartonStyle.findAll({
      where: {
        ORDER_STYLE_DESCRIPTION: styleSource,
      },
      raw: true,
    });

    if (listSetBoxSource.length === 0) {
      return res.status(202).json({ message: "Not Found Set Style" });
    }

    await PackCartonStyle.destroy({
      where: {
        ORDER_STYLE_DESCRIPTION: styleSelect,
      },
    });

    const setStyleToSource = listSetBoxSource.map(({ ID, ...items }) => ({
      ...items,
      ORDER_STYLE_DESCRIPTION: styleSelect,
    }));

    // const listGmt = dataPost.map((items) => items.PRODUCT_ITEM_ID);

    await PackCartonStyle.bulkCreate(setStyleToSource);

    return res.status(200).json({ message: "Success Save" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get post box",
      data: error,
    });
  }
};

export const deletePackBox = async (req, res) => {
  try {
    const { BOX_ID, BUYER_CODE } = req.params;

    if (!BOX_ID) return res.status(202).json({ message: "No data Box Id" });

    const checkUsed = await PackingPlanBoxRow.findAll({
      where: { BOX_ID: BOX_ID },
    });

    if (checkUsed.length > 0) {
      return res
        .status(202)
        .json({ message: "The box is already in use, it cannot be deleted" });
    }

    const deleteBox = await CartonBox.destroy({ where: { BOX_ID: BOX_ID } });

    if (deleteBox) {
      const buyerCode = decodeURIComponent(BUYER_CODE);
      const listBoxSpec = await CartonBox.findAll({
        where: {
          BUYER_CODE: buyerCode,
        },
        raw: true,
      });

      return res.status(200).json({
        message: `Success deleted box`,
        data: listBoxSpec,
      });
    } else {
      return res.status(500).json({ message: "Faild to deleted" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get deleted box",
      data: error,
    });
  }
};

export const getListSizeCodeByProdId = async (req, res) => {
  try {
    const { styleOrder } = req.params;
    //   const MES_STYLE = decodeURIComponent(style).toString();
    const decodeStyle = decodeURIComponent(styleOrder);
    const listSizeCode = await db.query(getSizeCodeByStyleId, {
      replacements: {
        styleOrder: decodeStyle,
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

export const getListSetCtnStyle = async (req, res) => {
  try {
    const { styleOrder } = req.params;
    //   const MES_STYLE = decodeURIComponent(style).toString();
    const decodeStyle = decodeURIComponent(styleOrder);
    const listCtnStyle = await db.query(getCtnStyleCode, {
      replacements: {
        orderStyle: decodeStyle,
      },
      type: QueryTypes.SELECT,
    });

    const listCtnStyleDetail = await db.query(getCtnStyleCodeDetail, {
      replacements: {
        orderStyle: decodeStyle,
      },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: { listCtnStyle, listCtnStyleDetail } });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get data list set result",
      data: error,
    });
  }
};

export const postSetCartonStyle = async (req, res) => {
  try {
    const dataPost = req.body;

    if (!dataPost) return res.status(404).json({ message: "Tidak ada data" });

    const ORDER_STYLE_DESCRIPTION = dataPost[0].ORDER_STYLE_DESCRIPTION;
    const PACKING_METHODE = dataPost[0].PACKING_METHODE;
    const arrCountry = dataPost.map((items) => items.COUNTRY_ID);

    await PackCartonStyle.destroy({
      where: {
        ORDER_STYLE_DESCRIPTION: ORDER_STYLE_DESCRIPTION,
        PACKING_METHODE: PACKING_METHODE,
        COUNTRY_ID: {
          [Op.in]: arrCountry,
        },
      },
    });

    // const listGmt = dataPost.map((items) => items.PRODUCT_ITEM_ID);

    await PackCartonStyle.bulkCreate(dataPost);

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

export const deleteSetCartonStyle = async (req, res) => {
  try {
    const dataPost = req.body;

    if (!dataPost) return res.status(404).json({ message: "Tidak ada data" });

    const ORDER_STYLE_DESCRIPTION = dataPost[0].ORDER_STYLE_DESCRIPTION;
    const arrPackMethode = dataPost.map((items) => items.PACKING_METHODE);
    const arrCountry = dataPost.map((items) => items.COUNTRY_ID);

    const destroydata = await PackCartonStyle.destroy({
      where: {
        ORDER_STYLE_DESCRIPTION: ORDER_STYLE_DESCRIPTION,
        PACKING_METHODE: {
          [Op.in]: arrPackMethode,
        },
        COUNTRY_ID: {
          [Op.in]: arrCountry,
        },
      },
    });

    // const listGmt = dataPost.map((items) => items.PRODUCT_ITEM_ID);
    if (destroydata) return res.status(200).json({ message: "Success Delete" });
    // if (destroyBox) {
    // } else {
    //   return res.status(500).json({ message: "Faild to Save" });
    // }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error delete box style",
      data: error,
    });
  }
};

export const deleteSetCtnStyleDetail = async (req, res) => {
  try {
    const dataPost = req.body;

    if (!dataPost) return res.status(404).json({ message: "Tidak ada data" });

    const ORDER_STYLE_DESCRIPTION = dataPost[0].ORDER_STYLE_DESCRIPTION;
    const arrPackMethode = dataPost.map((items) => items.PACKING_METHODE);
    const arrCountry = dataPost.map((items) => items.COUNTRY_ID);
    const arrSize = dataPost.map((items) => items.SIZE_CODE);

    const destroydata = await PackCartonStyle.destroy({
      where: {
        ORDER_STYLE_DESCRIPTION: ORDER_STYLE_DESCRIPTION,
        PACKING_METHODE: {
          [Op.in]: arrPackMethode,
        },
        COUNTRY_ID: {
          [Op.in]: arrCountry,
        },
        SIZE_CODE: {
          [Op.in]: arrSize,
        },
      },
    });

    // const listGmt = dataPost.map((items) => items.PRODUCT_ITEM_ID);
    if (destroydata) return res.status(200).json({ message: "Success Delete" });
    // if (destroyBox) {
    // } else {
    //   return res.status(500).json({ message: "Faild to Save" });
    // }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error delete box style",
      data: error,
    });
  }
};

export const updateBoxCtnStylDetail = async (req, res) => {
  try {
    const dataUpdate = req.body;

    if (!dataUpdate) return res.status(404).json({ message: "Tidak ada data" });
    const { arrId, boxSelect } = dataUpdate;

    const { BOX_ID, BOX_NAME, BOX_CODE } = boxSelect;

    const updateBox = await PackCartonStyle.update(
      { BOX_ID, BOX_NAME, BOX_CODE },
      {
        where: {
          ID: {
            [Op.in]: arrId,
          },
        },
      }
    );

    if (updateBox)
      return res.status(200).json({
        message: "Success update",
      });
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

// get sequanceId
export const getSequanceId = async (req, res) => {
  try {
    const { ppid } = req.params;
    let newSeqNo = 1;

    const getseqNo = await db.query(qryGetSeqChild, {
      replacements: {
        ppid,
      },
      type: QueryTypes.SELECT,
    });

    if (getseqNo.length > 0) {
      const lastNo = getseqNo[0].SEQ_NO;
      newSeqNo = lastNo + 1;
    }

    return res.status(200).json({ data: newSeqNo });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Seq No",
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

    const listPoBuyer = await db.query(qryGetDistcPoBuyer, {
      replacements: {
        customer: buyer,
        startDate,
        endDate,
      },
      type: QueryTypes.SELECT,
    });

    const listPoRef = await db.query(qryGetDistcPoRef, {
      replacements: {
        customer: buyer,
        startDate,
        endDate,
      },
      type: QueryTypes.SELECT,
    });

    if (listDataHeader.length > 0) {
      const joinDataPPIDdanPO = listDataHeader?.map((item) => {
        const filterPObuy = listPoBuyer.filter(
          (po) => po.PACKPLAN_ID === item.PACKPLAN_ID
        );
        const filterPOref = listPoRef.filter(
          (po) => po.PACKPLAN_ID === item.PACKPLAN_ID
        );

        const stringPoBuy =
          filterPObuy.length > 0
            ? filterPObuy.map((po) => po.BUYER_PO).join(" , ")
            : "";
        const stringPoRef =
          filterPOref.length > 0
            ? filterPOref.map((po) => po.ORDER_REFERENCE_PO_NO).join(" , ")
            : "";

        const dataReturn = {
          ...item,
          BUYER_PO: stringPoBuy,
          ORDER_REFERENCE_PO_NO: stringPoRef,
        };

        return dataReturn;
      });

      return res.status(200).json({ data: joinDataPPIDdanPO });
    } else {
      return res.status(200).json({ data: listDataHeader });
    }
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

export const getPackPlanMethod = async (req, res) => {
  try {
    const listPackMethod = await PackMethodeList.findAll({});

    return res.status(200).json({ data: listPackMethod });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error get Packing Plan data header",
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

    const postDataHeader = await PackPlanHeader.create(data);
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

export const postDataPackPlanChild = async (req, res) => {
  try {
    const data = req.body;

    if (!data) res.status(400).json({ message: "no data provided" });

    //check duplicate packplan code
    let checkIdExist = await PackPlanChild.findOne({
      where: {
        PACKPLAN_ID: data.PACKPLAN_ID,
        SEQ_NO: data.SEQ_NO,
      },
    });
    if (checkIdExist) return res.status(400).json({ message: "SEQ Exist" });

    let checkAll = await PackPlanChild.findAll({
      where: {
        PACKPLAN_ID: data.PACKPLAN_ID,
        SEQ_NO: data.SEQ_NO,
      },
    });

    const dataAddIndex = { ...data, INDEX_NO: checkAll.length || 1 };

    const postDataHeader = await PackPlanChild.create(dataAddIndex);
    if (postDataHeader)
      return res.status(200).json({ message: "Success Create Child Post" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post Packing Child",
      data: error,
    });
  }
};

export const pachtSortPoId = async (req, res) => {
  try {
    const { dataSort } = req.body;

    if (!dataSort) res.status(400).json({ message: "no data provided" });

    //check duplicate packplan code
    let updateIndex = await PackPlanChild.bulkCreate(dataSort, {
      updateOnDuplicate: ["INDEX_NO"],
      where: {
        ADDING_ID: ["ADDING_ID"],
      },
    });

    if (updateIndex)
      return res.status(200).json({ message: "Success Short Index Po" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post sort index po",
      data: error,
    });
  }
};

export const editDataPackPlanChild = async (req, res) => {
  try {
    const data = req.body;

    if (!data) res.status(400).json({ message: "no data provided" });

    //check duplicate packplan code
    let checkIdExist = await PackPlanChild.findOne({
      where: {
        PACKPLAN_ID: data.PACKPLAN_ID,
        SEQ_NO: data.SEQ_NO,
      },
    });

    if (!checkIdExist)
      return res.status(400).json({ message: "SEQ Not Exist" });

    const oldStringSeq = `${checkIdExist.PACKPLAN_ID}|${checkIdExist.SEQ_NO}|${checkIdExist.COUNTRY_ID}|${checkIdExist.PACKING_METHODE}`;
    const newStringSeq = `${data.PACKPLAN_ID}|${data.SEQ_NO}|${data.COUNTRY_ID}|${data.PACKING_METHODE}`;
    // console.log({ oldStringSeq, newStringSeq });
    await PackPlanChild.update(data, {
      where: {
        PACKPLAN_ID: data.PACKPLAN_ID,
        SEQ_NO: data.SEQ_NO,
      },
    });

    await OrderPoBuyer.update(
      {
        PLAN_SEQUANCE_ID: newStringSeq,
      },
      {
        where: {
          PLAN_SEQUANCE_ID: oldStringSeq,
        },
      }
    );

    await PackingPlanPoSum.update(
      {
        PLAN_SEQUANCE_ID: newStringSeq,
      },
      {
        where: {
          PLAN_SEQUANCE_ID: oldStringSeq,
        },
      }
    );

    await PackingPlanDetail.update(
      {
        PLAN_SEQUANCE_ID: newStringSeq,
      },
      {
        where: {
          PLAN_SEQUANCE_ID: oldStringSeq,
        },
      }
    );

    const findRow = await PackingPlanBoxRow.findAll({
      where: {
        ROWID: {
          [Op.like]: oldStringSeq + "%",
        },
      },
      raw: true,
    });

    if (findRow.length > 0) {
      for (let index = 0; index < findRow.length; index++) {
        const element = findRow[index];
        const oldRowId = element.ROWID;
        const arrString = oldRowId.split("|");

        let newRowId = newStringSeq + "|" + arrString[4];
        if (arrString[5]) {
          newRowId = newRowId + "|" + arrString[5];
        }
        // console.log({ oldRowId, newRowId });

        await PackingPlanBoxRow.update(
          {
            ROWID: newRowId,
          },
          {
            where: {
              ROWID: oldRowId,
            },
          }
        );

        await PackPlanRowDetail.update(
          {
            ROWID: newRowId,
          },
          {
            where: {
              ROWID: oldRowId,
            },
          }
        );
      }
    }

    return res.status(200).json({ message: "Success Edited Seq" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post Packing Seq",
      data: error,
    });
  }
};

export const updateDataPackPlanHeader = async (req, res) => {
  try {
    const data = req.body;

    if (!data) res.status(400).json({ message: "no data provided" });

    const updateData = PackPlanHeader.update(data, {
      where: { PACKPLAN_ID: data.PACKPLAN_ID },
    });
    if (updateData)
      return res.status(200).json({ message: "Success UPdate Header Post" });
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
    const { poNum, seqID } = req.params;

    const poNumber = decodeURIComponent(poNum);
    const planSeqId = decodeURIComponent(seqID);

    const listPO = await db.query(qryPackPoIdPoBuyer, {
      replacements: {
        poNumber,
        planSeqId,
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
    const { ppidSeqId } = req.params;
    // console.log(ppidSeqId);
    // const poNumber = decodeURIComponent(poNum);
    const ppidSeqDec = decodeURIComponent(ppidSeqId);

    const listPO = await db.query(findPoPlanPack, {
      replacements: {
        ppidSeqId: ppidSeqDec,
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

    //array po id
    const arrPoId = data.map((item) => item.ORDER_PO_ID);

    await OrderPoBuyer.destroy({
      where: {
        PLAN_SEQUANCE_ID: data[0].PLAN_SEQUANCE_ID,
        ORDER_PO_ID: arrPoId,
      },
    });
    //create or update
    let createOrUpdate = await OrderPoBuyer.bulkCreate(data);
    // console.log({ PLAN_SEQUANCE_ID: data[0].PLAN_SEQUANCE_ID, arrPoId });
    const findPoDetail = await db.query(qryGetPackPlanDtlPo, {
      replacements: {
        seqId: data[0].PLAN_SEQUANCE_ID,
        orderPoId: arrPoId,
      },
      type: QueryTypes.SELECT,
    });

    if (createOrUpdate)
      return res.status(200).json({
        status: "success",
        message: "Success Post PO Buyer",
        data: findPoDetail,
      });
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
          PLAN_SEQUANCE_ID: ppDetail.PLAN_SEQUANCE_ID,
          UNIKID: ppDetail.UNIKID,
          PACKPLAN_ID: ppDetail.PACKPLAN_ID,
        },
        raw: true,
      });
      if (checkExist && ppDetail.SHIPMENT_QTY) {
        ppDetail.ADD_ID = null;
        await PackingPlanDetail.update(ppDetail, {
          where: {
            PLAN_SEQUANCE_ID: ppDetail.PLAN_SEQUANCE_ID,
            UNIKID: ppDetail.UNIKID,
            PACKPLAN_ID: ppDetail.PACKPLAN_ID,
          },
        });
      }
      if (checkExist && !ppDetail.SHIPMENT_QTY) {
        // console.log("execute delete");
        await PackingPlanDetail.destroy({
          where: {
            PLAN_SEQUANCE_ID: ppDetail.PLAN_SEQUANCE_ID,
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
    const { ppidSeqId } = req.params;
    // const poNumber = decodeURIComponent(poNum);
    const ppidSeq = decodeURIComponent(ppidSeqId);

    const orderPOid = await OrderPoBuyer.findAll({
      where: {
        PLAN_SEQUANCE_ID: ppidSeq,
      },
      raw: true,
    });

    const arrPoId = orderPOid.map((item) => item.ORDER_PO_ID);
    // console.log(arrPoId);
    // console.log({ ppidSeq, arrPoId });
    const sumPODetail = await db.query(qrySumPoDetil, {
      replacements: {
        ppidSeqId: ppidSeq,
        orderPoId: arrPoId,
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
    // console.log(data);
    for (const [i, poSUm] of data.entries()) {
      const checkExist = await PackingPlanPoSum.findOne({
        where: {
          PLAN_SEQUANCE_ID: poSUm.PLAN_SEQUANCE_ID,
          BUYER_COLOR_CODE: poSUm.BUYER_COLOR_CODE,
        },
        raw: true,
      });
      if (checkExist && poSUm.SHIPMENT_QTY) {
        await PackingPlanPoSum.update(poSUm, {
          where: {
            PLAN_SEQUANCE_ID: poSUm.PLAN_SEQUANCE_ID,
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

//Delete delete sequence ppid
export const delPackPosum = async (req, res) => {
  try {
    const { seqPpid, colorCode } = req.query;

    const seqPpids = decodeURIComponent(seqPpid);
    // const poNumber = decodeURIComponent(poNum);
    const clrCode = decodeURIComponent(colorCode);

    let paramWhere = {
      PLAN_SEQUANCE_ID: seqPpids,
    };

    const arrPlanSeq = seqPpids.split("|");
    const objSeq = {
      PPID: arrPlanSeq[0],
      SEQ_NO: arrPlanSeq[1],
    };

    let rowId = seqPpids;

    if (colorCode) {
      paramWhere.BUYER_COLOR_CODE = clrCode;
      rowId = rowId + `|${clrCode}`;
    }
    rowId = rowId + "%";

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
    //kalo tidak ada color code berarti ini juga delete
    if (!colorCode) {
      await PackPlanChild.destroy({
        where: {
          PACKPLAN_ID: objSeq.PPID,
          SEQ_NO: parseInt(objSeq.SEQ_NO),
        },
      });
    }

    await OrderPoBuyer.destroy({
      where: paramWhere,
    });

    return res.json({
      status: "success",
      message: "Success Delete Packing Sequance",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error delete when save packing po summary",
      data: error,
    });
  }
};

//function untuk cari sort no
function findSortNo(row, customSort) {
  // console.log(row);

  const sortNo = customSort.find((sz) => sz.SIZE_CODE === row.SIZE_CODE);
  // console.log(sortNo);

  if (sortNo) {
    return sortNo.SORT_NO;
  } else {
    return row.SORT_NO;
  }
}

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

    const customSizeSor = await PackSortSize.findAll({
      where: { PACKPLAN_ID: ppid },
      raw: true,
    });
    // console.log(customSizeSor);

    let lisSizePpid = lisSizePpidHd;
    if (lisSizePpidHd.length !== 0 && customSizeSor.length !== 0) {
      const setSortNo = lisSizePpidHd.map((items) => ({
        ...items,
        SORT_NO: findSortNo(items, customSizeSor),
      }));
      lisSizePpid = setSortNo.sort((a, b) => {
        return a.SORT_NO - b.SORT_NO;
      });
      // console.log(lisSizePpid);
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

    // if (lisSizePpidHd[0].SORT_TYPE === "letter" && listRowDtl.length > 0) {
    //   listRowDtl.sort((a, b) => {
    //     if (a.BUYER_PO < b.BUYER_PO) return -1;
    //     if (a.BUYER_PO > b.BUYER_PO) return 1;
    //     if (a.CTN_START < b.CTN_START) return -1;
    //     if (a.CTN_START > b.CTN_START) return 1;
    //     return 0;
    //   });
    // }

    const listRowDtlQty = await db.query(qryQtySizeRowDtl, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const qtyPackRowCol = await db.query(qryGetRowColQty, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const listSumPo = await db.query(qryListSumPo, {
      replacements: { ppid },
      type: QueryTypes.SELECT,
    });

    const datas = {
      listPOppid,
      lisSizePpid,
      // lisSizePpidHd,
      lisColorPpid,
      listRowDtl,
      listRowDtlQty,
      listSumPo,
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
    const { seqPoPpid } = req.params;
    const { color } = req.query;

    let stringQuery = `a.PLAN_SEQUANCE_ID = '${seqPoPpid}'`;
    if (color) {
      stringQuery += ` AND a.BUYER_COLOR_CODE = '${color}'`;
    }

    const querySumQty = qrySumQtyPoBox(stringQuery);

    const seqPpid = decodeURIComponent(seqPoPpid);
    const sumPODetail = await db.query(querySumQty, {
      replacements: {
        seqPpid,
      },
      type: QueryTypes.SELECT,
    });

    let sortSizeCode = sumPODetail;
    // if (sumPODetail.length !== 0 && sumPODetail[0].SORT_TYPE === "letter") {
    //   sortSizeCode = customSortByLetterFirst(sumPODetail, "SIZE_CODE");
    // } else {
    //   sortSizeCode = customSortByNumberFirst(sumPODetail, "SIZE_CODE");
    // }

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
    const rowByPassZero = dataRows.filter(
      (item) =>
        item.QTY_PER_BOX && !isNaN(item.CTN_START) && !isNaN(item.CTN_END)
    );

    const listNewRowId = rowByPassZero.map((items) => items.ROWID);
    const listArrDetailInclude = arrRowDetail.filter((items) =>
      listNewRowId.includes(items.ROWID)
    );

    // console.log(dataRows);
    const headerPost = await PackingPlanBoxRow.bulkCreate(rowByPassZero);

    const detailPost = await PackPlanRowDetail.bulkCreate(listArrDetailInclude);

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

//post generate row box prepack
export async function postGenPrePack(req, res) {
  try {
    const { seqPoPpid, userId, color } = req.body;

    if (!seqPoPpid)
      return res.status(404).json({
        message: "No Data For Post",
      });
    const seqPpid = decodeURIComponent(seqPoPpid);

    let stringQuery = `a.PLAN_SEQUANCE_ID = '${seqPpid}'`;
    if (color) {
      stringQuery += ` AND a.BUYER_COLOR_CODE = '${color}'`;
    }

    const querySumPrepack = qrySumQtyPoBoxPrepack(stringQuery);
    //row color
    const sumPODetailCol = await db.query(querySumPrepack, {
      replacements: {
        seqPpid,
      },
      type: QueryTypes.SELECT,
    });
    const listRowId = sumPODetailCol.map((items) => items.ROWID);

    const querySumQty = qrySumQtyPoBox(stringQuery);
    //row detail
    const sumPODetail = await db.query(querySumQty, {
      replacements: {
        seqPpid,
      },
      type: QueryTypes.SELECT,
    });

    let arrRow = [];
    let arrRowDetail = [];

    for (let index = 0; index < sumPODetailCol.length; index++) {
      let rowCol = sumPODetailCol[index];

      const ctnStart = index === 0 ? 1 : sumPODetailCol[index - 1].CTN_END + 1;
      const ctnEnd = index === 0 ? rowCol.TTL_BOX : ctnStart + rowCol.TTL_BOX;
      rowCol.CTN_START = ctnStart;
      rowCol.CTN_END = ctnEnd;
      rowCol.ROW_INDEX = index;
      arrRow.push(rowCol);

      const detailRow = sumPODetail
        .filter((clr) => clr.BUYER_COLOR_CODE === rowCol.BUYER_COLOR_CODE)
        .map((items) => ({
          ROWID: rowCol.ROWID,
          PACKPLAN_ID: items.PACKPLAN_ID,
          SIZE_CODE: items.SIZE_CODE,
          QTY: items.AFTER_SET_QTY / rowCol.MIN_QTY,
          ADD_ID: userId,
        }));
      arrRowDetail.push(...detailRow);
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

    const headerPost = await PackingPlanBoxRow.bulkCreate(arrRow);

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

    const findResult = await db.query(qryGetRowDtlOne, {
      replacements: { rowId: data.ROWID },
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

    const findOneDetail = await PackPlanRowDetail.findOne({
      where: { ROWID: data.ROWID, SIZE_CODE: data.SIZE_CODE },
    });

    let postDetail = {};
    if (findOneDetail) {
      const updateDetail = await PackPlanRowDetail.update(data, {
        where: { ROWID: data.ROWID, SIZE_CODE: data.SIZE_CODE },
        raw: true,
      });
      if (updateDetail) {
        postDetail = data;
      }
    } else {
      postDetail = await PackPlanRowDetail.create(data, {
        raw: true,
      });
    }

    if (!postDetail)
      return res.status(404).json({ status: false, message: "Gagal Update" });

    const findNewQty = await db.query(qrySumNewQtyRow, {
      replacements: { rowId: data.ROWID },
      type: QueryTypes.SELECT,
    });

    const findOne = await PackingPlanBoxRow.findOne({
      where: {
        ROWID: data.ROWID,
      },
      raw: true,
    });

    const newvalue = findNewQty[0] ? findNewQty[0].QTY : 0;
    const TTL_QTY_BOX = CheckNilai(findOne.TTL_BOX * newvalue);
    const valUpdate = {
      SHIPMENT_QTY: TTL_QTY_BOX,
      AFTER_SET_QTY: newvalue,
      QTY_PER_BOX: newvalue,
      TTL_QTY_BOX: TTL_QTY_BOX,
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

    const plainPostDetail = findOneDetail
      ? postDetail
      : postDetail.get({ plain: true });

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

//ganti start no karton nya
export async function chgCtnStartNo(req, res) {
  try {
    const { rowData, noStart, userId, cntnus } = req.body;

    if (!rowData || !noStart)
      return res.status(404).json({
        message: "No Data For Post",
      });

    const { ROW_INDEX, PLAN_SEQUANCE_ID, ROWID, BUYER_COLOR_CODE, CTN_END } =
      rowData;

    const ctnEndRow = noStart + rowData.TTL_BOX - 1;
    const updateRow = await PackingPlanBoxRow.update(
      { CTN_START: noStart, CTN_END: ctnEndRow },
      {
        where: {
          ROWID,
        },
      }
    );

    if (!cntnus && updateRow) {
      return res.json({
        message: "Success update",
      });
    } else {
      const rowIds = PLAN_SEQUANCE_ID + "%";

      const getAfterRow = await PackingPlanBoxRow.findAll({
        where: {
          ROWID: {
            [Op.like]: rowIds,
          },
          ROW_INDEX: {
            [Op.gt]: ROW_INDEX, // ROW_INDEX lebih besar dari
          },
          BUYER_COLOR_CODE: BUYER_COLOR_CODE,
        },
        order: [["ROW_INDEX", "ASC"]],
        raw: true,
      });

      const startNumber = parseInt(ctnEndRow) + 1;

      if (getAfterRow.length > 0) {
        let arrRow = [];
        for (let index = 0; index < getAfterRow.length; index++) {
          let rowCol = getAfterRow[index];

          const ctnStart =
            index === 0 ? startNumber : getAfterRow[index - 1].CTN_END + 1;
          const ctnEnd = ctnStart - 1 + rowCol.TTL_BOX;

          rowCol.CTN_START = ctnStart;
          rowCol.CTN_END = ctnEnd;
          arrRow.push(rowCol);
        }

        await PackingPlanBoxRow.bulkCreate(arrRow, {
          updateOnDuplicate: ["CTN_START", "CTN_END"],
          where: {
            ROWID: ["ROWID"],
          },
        });
      }

      return res.json({
        message: "Success update",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error update",
      data: error,
    });
  }
}

//Delete satu PPID tidak perduli mana saja
export const deletePPIDEntire = async (req, res) => {
  try {
    const { PPID } = req.params;

    const paramWhere = {
      PACKPLAN_ID: PPID,
    };

    await PackPlanRowDetail.destroy({
      where: paramWhere,
    });

    await PackingPlanBoxRow.destroy({
      where: paramWhere,
    });

    await PackingPlanDetail.destroy({
      where: paramWhere,
    });

    await PackingPlanPoSum.destroy({
      where: paramWhere,
    });

    await PackPlanHeader.destroy({
      where: paramWhere,
    });

    return res.json({
      status: "success",
      message: "Success Delete Packing PLAN",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error delete when DELTE packing PLAN",
      data: error,
    });
  }
};

//update data qty row prepack dan detail kolom

export async function updatePpackRowNdetail(req, res) {
  try {
    const { objRow, arrDetail } = req.body;

    if (!objRow || !arrDetail)
      return res.status(404).json({
        message: "No Data For update",
      });

    const { ROW_INDEX, PLAN_SEQUANCE_ID, ROWID, CTN_END } = objRow;
    // console.log({ ROW_INDEX, PLAN_SEQUANCE_ID, ROWID });

    const updateRow = await PackingPlanBoxRow.update(objRow, {
      where: {
        ROWID: ROWID,
      },
      raw: true,
    });

    if (updateRow) {
      const deleteDetail = await PackPlanRowDetail.destroy({
        where: {
          ROWID: ROWID,
        },
      });

      if (deleteDetail) {
        await PackPlanRowDetail.bulkCreate(arrDetail);
      }
    }
    const rowId = PLAN_SEQUANCE_ID + "%";

    const getAfterRow = await PackingPlanBoxRow.findAll({
      where: {
        ROWID: {
          [Op.like]: rowId,
        },
        ROW_INDEX: {
          [Op.gt]: ROW_INDEX, // ROW_INDEX lebih besar dari
        },
      },
      raw: true,
    });

    if (getAfterRow.length > 0) {
      let arrRow = [];
      for (let index = 0; index < getAfterRow.length; index++) {
        let rowCol = getAfterRow[index];

        const ctnStart =
          index === 0 ? CTN_END + 1 : getAfterRow[index].CTN_END + 1;
        const ctnEnd = ctnStart - 1 + rowCol.TTL_BOX;
        rowCol.CTN_START = ctnStart;
        rowCol.CTN_END = ctnEnd;
        arrRow.push(rowCol);
      }

      await PackingPlanBoxRow.bulkCreate(arrRow, {
        updateOnDuplicate: ["CTN_START", "CTN_END"],
        where: {
          ROWID: ["ROWID"],
        },
      });
    }

    return res.json({
      message: "Success update",
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error update",
      data: error,
    });
  }
}

// for rubah GEN to Manual agar bisa di update
export async function switchGenToMnl(req, res) {
  try {
    const { rowsId } = req.params;

    if (!rowsId)
      return res.status(404).json({
        message: "No Data For update",
      });

    const ROWID = decodeURIComponent(rowsId);

    const updateRow = await PackingPlanBoxRow.update(
      { ROW_TYPE: "MNL" },
      {
        where: {
          ROWID: ROWID,
        },
        raw: true,
      }
    );

    if (updateRow) {
      return res.json({
        message: "Allow Input",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error update",
      data: error,
    });
  }
}

export const getRowIdAndIndex = async (req, res) => {
  try {
    const { seqIds, colorCodes } = req.params;
    const seqId = decodeURIComponent(seqIds);
    const colorCode = decodeURIComponent(colorCodes);

    const rowColor = seqId + "|" + colorCode + "%";

    const findRowId = await db.query(qryGetRowIdAndIndex, {
      replacements: { seqId, colorCode, rowColor },
      type: QueryTypes.SELECT,
    });

    if (findRowId.length === 0)
      return res.status(404).json({ message: "Data Tidak Ditemukan" });

    const balance = findRowId[0].BALANCE;
    if (balance <= 0)
      return res
        .status(200)
        .json({ status: false, message: "Nilali Balance 0" });

    return res.status(200).json({ status: true, data: findRowId[0] });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error update",
      data: error,
    });
  }
};

export const addNewRowSolid = async (req, res) => {
  try {
    const data = req.body;
    if (!data)
      return res.status(404).json({ message: "Data Tidak Boleh kosong" });

    const dataNewRow = await PackingPlanBoxRow.create(data);

    if (dataNewRow) return res.json({ message: "Success Add new row" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "error add new row", data: error });
  }
};

///delete by selected row
export const deleteRowSolid = async (req, res) => {
  try {
    const { arrROw } = req.body;
    if (!arrROw)
      return res.status(404).json({ message: "Data Tidak Boleh kosong" });

    await PackPlanRowDetail.destroy({
      where: {
        ROWID: arrROw,
      },
    });
    // console.log(arrROw);
    // console.log(deleteDetail);
    const delteRow = await PackingPlanBoxRow.destroy({
      where: { ROWID: arrROw },
    });
    if (delteRow) {
      return res.json({ message: "Success Delete row" });
      // if (deleteDetail) {
    } else {
      return res.status(404).json({ message: "Gagal Delete row detail" });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "error delete row", data: error });
  }
};

export const setStartCtnSatu = async (req, res) => {
  try {
    const { arrROw } = req.body;
    if (!arrROw)
      return res.status(404).json({ message: "Data Tidak Boleh kosong" });

    const findRow = await PackingPlanBoxRow.findAll({
      where: { ROWID: arrROw },
      raw: true,
    });
    if (findRow.length === 0)
      return res.status(404).json({ message: "Data tidak ditemukan" });

    const newRows = findRow.map((item) => ({
      ...item,
      CTN_START: 1,
      CTN_END: item.TTL_BOX,
    }));

    const updateRows = await PackingPlanBoxRow.bulkCreate(newRows, {
      updateOnDuplicate: ["CTN_START", "CTN_END"],
      where: {
        ROWID: ["ROWID"],
      },
    });

    if (updateRows) res.json({ message: "Success update row" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "error delete row", data: error });
  }
};

export const setBoxIdRow = async (req, res) => {
  try {
    const { arrROw } = req.body;
    if (!arrROw)
      return res.status(404).json({ message: "Data Tidak Boleh kosong" });

    const updateRows = await PackingPlanBoxRow.bulkCreate(arrROw, {
      updateOnDuplicate: ["BOX_ID", "BOX_CODE"],
      where: {
        ROWID: ["ROWID"],
      },
    });

    if (updateRows) res.json({ message: "Success update row" });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "error delete row", data: error });
  }
};

//post data custom sort size
export const postCstmSetSortSize = async (req, res) => {
  try {
    const data = req.body;

    if (!data || data.length === 0)
      return res.status(400).json({ message: "no data provided" });
    // console.log(data);

    await PackSortSize.destroy({
      where: {
        PACKPLAN_ID: data[0].PACKPLAN_ID,
        TYPE: data[0].TYPE,
      },
    });

    const postSortSizes = await PackSortSize.bulkCreate(data);

    if (postSortSizes) {
      return res.json({
        status: "success",
        message: "Success Post set sort size",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "error post when Post set sort size",
      data: error,
    });
  }
};

// commit packing plann
export const commitPackingPlan = async (req, res) => {
  try {
    const { ppid } = req.params;

    const updateHeader = await PackPlanHeader.update(
      { PACKPLAN_COMMIT: "Y" },
      {
        where: {
          PACKPLAN_ID: ppid,
        },
      }
    );

    if (updateHeader) {
      const listRowDtl = await db.query(qryGetRowDtl, {
        replacements: { ppid },
        type: QueryTypes.SELECT,
      });

      const postItemUpcArticle = listRowDtl.map((item) => ({
        ...item,
        COMMIT_STATUS: "Y",
      }));

      await PackingPlanBoxRow.bulkCreate(postItemUpcArticle, {
        updateOnDuplicate: ["COMMIT_STATUS", "PO_ITEM", "ARTICLE", "UPC_CODE"],
        where: {
          ROWID: ["ROWID"],
        },
      })
        .then((response) => {
          return res.json({ message: "Success update" });
        })
        .catch((err) => {
          return res
            .status(404)
            .json({ message: "Error when update row", data: err });
        });
    } else {
      return res
        .status(404)
        .json({ message: "Error when update header", data: update });
    }
  } catch (error) {
    return res.status(404).json({ message: "Error update", data: ERR });
  }
};

export const getRefListPoBuyer = async (req, res) => {
  try {
    const { poNum } = req.params;
    // const customer = decodeURIComponent(buyer);
    const texpO = decodeURIComponent(poNum);

    const qryPO = `%${texpO}%`;

    const listPO = await db.query(qryGetReflistPoBuyer, {
      replacements: {
        // customer,
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
