import { QueryTypes } from "sequelize";
import db from "../../../config/database.js";
import {
  CartonBox,
  PackBoxStyle,
  getBoxStyleCode,
  getSizeCodeByStyleId,
  queryGetSytleByBuyer,
} from "../../../models/production/packing.mod.js";

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
