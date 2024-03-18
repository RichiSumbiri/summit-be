import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";
import {
  CartonBox,
  OrderPoBuyer,
  PackBoxStyle,
  PackPlanHeader,
  findPoPlanPack,
  getBoxStyleCode,
  getSizeCodeByStyleId,
  qryDeliveryMode,
  qryGetCusDivision,
  qryGetCustLoaction,
  qryGetLastPPI,
  qryGetPackHeader,
  qryGetPackMethod,
  qryGetlistPo,
  qryPackPoIdPoBuyer,
  queryGetSytleByBuyer,
} from "../../../models/production/packing.mod.js";
import moment from "moment";

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
    const { poNum } = req.params;

    const poNumber = decodeURIComponent(poNum);

    const listPO = await db.query(findPoPlanPack, {
      replacements: {
        poNumber,
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
      updateOnDuplicate: ["BUYER_PO", "BUYER_COLOR_CODE", "BUYER_COLOR_NAME"],
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
