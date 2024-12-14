import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  QuerySmvHeader,
  SewingSmvDetail,
  SewingSmvHeader,
} from "../../../models/sewingmod/sewingSmv.mod.js";

// CONTROLLER CREATE NEW SEWING SMV HEADER
export const postSewingSmvHeader = async (req, res) => {
  try {
    // let existData = [];
    const dataSmv = req.body;

    if (!dataSmv.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataSmv,
      });
    }

    let countSuccessNew = 0;
    let countSuccessUpdate = 0;
    let countGagalNew = 0;
    let countGagalUpdate = 0;
    for (const [i, smvData] of dataSmv.entries()) {
      const checkSmvHeader = await SewingSmvHeader.findOne({
        where: {
          ORDER_NO: smvData.ORDER_NO,
        },
      });

      if (checkSmvHeader) {
        delete smvData.SMV_ADD_ID;
        const updateSmv = await SewingSmvHeader.update(smvData, {
          where: {
            ORDER_NO: smvData.ORDER_NO,
          },
        });
        if (updateSmv) {
          countSuccessUpdate++;
        } else {
          countGagalUpdate++;
        }
      } else {
        delete smvData.SMV_MOD_ID;
        const newSmvHeader = await SewingSmvHeader.create(smvData);
        if (newSmvHeader) {
          countSuccessNew++;
        } else {
          countGagalNew++;
        }
      }

      if (i + 1 === dataSmv.length)
        return res.status(201).json({
          success: true,
          message: `SMV New Data ${countSuccessNew}, Update Data ${countSuccessUpdate}, Error New ${countGagalNew}, update ${countGagalUpdate}`,
          data: smvData,
          // duplicate: existData,
        });
    }
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//Get SMV data sudah di join dengan PO Listing
export const getListSmvHeader = async (req, res) => {
  try {
    const listSmvHeader = await db.query(QuerySmvHeader, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json(listSmvHeader);
  } catch (error) {
    res.status(404).json({
      message: "error processing request",
      data: error,
    });
  }
};

// CONTROLLER CREATE NEW SEWING SMV Detail
export const postSewingSmvDetail = async (req, res) => {
  try {
    // let existData = [];
    const dataSmv = req.body;

    if (!dataSmv.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataSmv,
      });
    }

    await SewingSmvDetail.destroy({
      where: {
        ORDER_NO: dataSmv[0].ORDER_NO,
        PRODUCT_ID: dataSmv[0].PRODUCT_ID,
      },
    });

    const action = await SewingSmvDetail.bulkCreate(dataSmv).catch((error) =>
      console.error(error)
    );

    if (action) {
      return res.status(201).json({
        success: true,
        message: "SMV Data Added Successfully",
        data: dataSmv,
        // duplicate: existData,
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

// CONTROLLER GET SMV DETAIL
export const getSewingSmvDetail = async (req, res) => {
  try {
    const { orderNO } = req.params;

    const getSmvDetail = await SewingSmvDetail.findAll({
      where: {
        ORDER_NO: orderNO,
      },
    });

    res.status(200).json(getSmvDetail);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
