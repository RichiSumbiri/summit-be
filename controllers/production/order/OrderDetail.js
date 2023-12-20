import { Orders } from "../../../models/production/order.mod.js";

// CONTROLLER GET ALL ORDER DATA
export const getOrder = async (req, res) => {
  try {
    const orders = await Orders.findAll();
    res.status(200).json({
      success: true,
      message: "Data Order Retrieved Successfully",
      data: orders,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

// CONTROLLER GET ORDER DATA BY BARCODE SERIAL
export const getOrderByBarcodeSerial = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      where: {
        BARCODE_SERIAL: req.params.barcodeserial,
      },
    });

    if (orders.length == 0) {
      res.status(200).json({
        success: true,
        message: "data barcode serial not found",
        data: [],
      });
    } else {
      res.status(200).json({
        success: true,
        message: "data barcode serial retrieved successfully",
        data: orders,
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

// CONTROLLER GET ORDER DATA BY BLK NUMBER
export const getOrderByBLK = async (req, res) => {
  try {
    const orders = await db.query(SelectOrderNo, {
      replacements: {
        orderNo: req.params.orderNo,
      },
      type: QueryTypes.SELECT,
    });

    if (orders.length === 0)
      return res.status(200).json({
        success: true,
        message: "data Order not found",
        data: [],
      });

    //distinc size
    const distSize = [
      ...new Map(orders.map((item) => [item["ORDER_SIZE"], item])).values(),
    ].map((size) => size.ORDER_SIZE);

    //LOOPING COMBINE SIZE WITH ORDERS
    let orderWithSeq = [];
    distSize.forEach((size) => {
      const newList = orders
        .filter((ord) => ord.ORDER_SIZE === size)
        .map((order, i) => ({
          ...order,
          SEQUENCE: i + 1,
        }));
      orderWithSeq.push(...newList);
    });

    // console.log(orderWithSeq);

    return res.status(200).json({
      success: true,
      message: "data retrieved successfully",
      data: orderWithSeq,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

// CONTROLLER CREATE NEW ORDER DATA
export const newOrder = async (req, res) => {
  try {
    let existData = [];
    const dataOrder = req.body;

    if (!dataOrder.length) {
      return res.status(404).json({
        success: false,
        message: "no data upload!",
        data: dataOrder,
      });
    }

    dataOrder.forEach(async (order, i) => {
      const checkBarcodeSerial = await Orders.findAll({
        attributes: ["BARCODE_SERIAL"],
        where: {
          BARCODE_SERIAL: order.BARCODE_SERIAL,
        },
      });

      if (checkBarcodeSerial.length !== 0) {
        existData.push(...checkBarcodeSerial);
      } else {
        await Orders.create(order);
      }

      if (i + 1 === dataOrder.length)
        return res.status(201).json({
          success: true,
          message: "Order Data Added Successfully",
          duplicate: existData,
        });
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

// CONTROLLER DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    await Orders.destroy({
      where: {
        BARCODE_SERIAL: req.params.barcodeserial,
      },
    });
    res.status(200).json({
      success: true,
      message: "Order Delete Successfully",
      data: [],
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};
