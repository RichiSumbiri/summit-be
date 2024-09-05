import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  OrderPoBuyersAsli,
  OrderPoBuyersDetail,
} from "../../../models/production/order.mod.js";

// CONTROLLER Upload Order PO buyer
export const uploadOrderPOBuyer = async (req, res) => {
  try {
    // let existData = [];
    const dataOrder = req.body;

    if (!dataOrder.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataOrder,
      });
    }

    const arrPONo = dataOrder.map((items) => items.PO_NUMBER);

    await OrderPoBuyersAsli.destroy({
      where: {
        PO_NUMBER: arrPONo,
      },
    });

    const postPobuyer = await OrderPoBuyersAsli.bulkCreate(dataOrder);

    if (postPobuyer) {
      res.json({ message: "success upload" });
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

export const uploadOrderPOBuyerDetail = async (req, res) => {
  try {
    // let existData = [];
    const dataOrder = req.body;

    if (!dataOrder.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataOrder,
      });
    }

    const arrUpc = dataOrder.map((items) => items.UPC_CODE);

    await OrderPoBuyersDetail.destroy({
      where: {
        UPC_CODE: arrUpc,
      },
    });

    const postPobuyer = await OrderPoBuyersDetail.bulkCreate(dataOrder);

    if (postPobuyer) {
      res.json({ message: "success upload" });
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
