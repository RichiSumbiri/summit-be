import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import { OrderPoBuyersAsli } from "../../../models/production/order.mod.js";

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

    const arrUpcCode = dataOrder.map((items) => items.UPC_CODE);

    await OrderPoBuyersAsli.destroy({
      where: {
        UPC_CODE: arrUpcCode,
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
