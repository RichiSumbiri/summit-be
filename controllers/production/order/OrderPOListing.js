import db from "../../../config/database.js";
import { QueryTypes, Op } from "sequelize";
import {
  findNewCapId,
  getListBlkNo,
  getOrderSizeByBlk,
  OrderPoListing,
  OrderPoListingSize,
} from "../../../models/production/order.mod.js";
import {
  SchSizeAloc,
  WeeklyProSchd,
  WeekSchDetail,
} from "../../../models/planning/weekLyPlan.mod.js";

// CONTROLLER GET ALL ORDER DATA
export const getOrderPOListing = async (req, res) => {
  try {
    const orders = await OrderPoListing.findAll();
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

// CONTROLLER CREATE NEW ORDER PO LISTING DATA
export const newOrderPOListing = async (req, res) => {
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

    dataOrder.forEach(async (order, i) => {
      const checkOrderPOData = await OrderPoListing.findOne({
        where: {
          ORDER_NO: order.ORDER_NO,
          ORDER_PO_ID: order.ORDER_PO_ID,
        },
      });

      if (checkOrderPOData) {
        //filter hanya data tanpa prototype Sequelize
        const records = checkOrderPOData.dataValues;
        // console.log(order);
        // console.log(records);
        // Rest in Object Destructuring New Object/Data  PO Listing without Don’t Update Category and Change Name New Cloumn Date
        const {
          MANUFACTURING_SITE,
          CUSTOMER_NAME,
          CUSTOMER_DIVISION,
          CUSTOMER_PROGRAM,
          CUSTOMER_SEASON,
          ORDER_NO,
          // ORDER_REFERENCE_PO_NO,
          PRODUCT_ITEM_CODE,
          // ORDER_STYLE_DESCRIPTION,
          ITEM_COLOR_CODE,
          ITEM_COLOR_NAME,
          // TARGET_PCD,
          PLAN_EXFACTORY_DATE,
          ORIGINAL_DELIVERY_DATE,
          ...newOrdr
        } = {
          ...order,
        };

        //Join New Data with existing Object/Data
        const joinAfterDecon = { ...records, ...newOrdr };
        // jika new manufacture juga berbeda dengan manufacture yang baru diupload
        if (
          records.NEW_MANUFACTURING_SITE !== null &&
          records.NEW_MANUFACTURING_SITE !== order.MANUFACTURING_SITE
        )
          joinAfterDecon.NEW_MANUFACTURING_SITE = order.MANUFACTURING_SITE;

        if (records.MANUFACTURING_SITE !== order.MANUFACTURING_SITE)
          joinAfterDecon.NEW_MANUFACTURING_SITE = order.MANUFACTURING_SITE;

        if (records.NEW_TARGET_PCD !== order.TARGET_PCD)
          joinAfterDecon.NEW_TARGET_PCD = order.TARGET_PCD;

        if (records.TARGET_PCD !== order.TARGET_PCD)
          joinAfterDecon.NEW_TARGET_PCD = order.TARGET_PCD;

        if (joinAfterDecon.FINAL_DELIVERY_DATE !== order.FINAL_DELIVERY_DATE)
          joinAfterDecon.NEW_FINAL_DELIVERY_DATE = order.FINAL_DELIVERY_DATE;

        if (joinAfterDecon.PLAN_EXFACTORY_DATE !== order.PLAN_EXFACTORY_DATE)
          joinAfterDecon.NEW_PLAN_EXFACTORY_DATE = order.PLAN_EXFACTORY_DATE;

        const updtD = await OrderPoListing.update(joinAfterDecon, {
          where: {
            ORDER_NO: records.ORDER_NO,
            ORDER_STYLE_DESCRIPTION: records.ORDER_STYLE_DESCRIPTION,
            ORDER_PO_ID: records.ORDER_PO_ID,
            // MO_NO: records.MO_NO,
          },
        });
      } else {
        try {
          await OrderPoListing.create(order);
        } catch (error) {
          console.log(error);
        }
      }

      if (i + 1 === dataOrder.length) {
        await updateIdCapacity(order.PRODUCTION_MONTH);
        return res.status(201).json({
          success: true,
          message: "Order PO Data Added Successfully",
          data: order,
          // duplicate: existData,
        });
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error processing request",
      data: error,
    });
  }
};

//function for update ID Capacity in weekly_sch_schedule, weekly_prod_sch_detail, weekly_sch_size
async function updateIdCapacity(prodMonth) {
  //first find List NEW_ID_CAPACITY base on PO Listing updated controler on the top
  const listCapNewId = await db.query(findNewCapId, {
    replacements: {
      prodMonth: prodMonth,
    },
    type: QueryTypes.SELECT,
  });

  //if finded do looping and update every table wit Capacity ID
  if (listCapNewId.length > 0) {
    listCapNewId.forEach(async (capNew) => {
      //find and update Schedule Header
      const schHeader = await WeeklyProSchd.findAll({
        where: {
          SCH_CAPACITY_ID: capNew.ID_CAPACITY,
        },
      });
      if (schHeader) {
        await WeeklyProSchd.update(
          { SCH_CAPACITY_ID: capNew.NEW_ID_CAPACITY },
          {
            where: {
              SCH_CAPACITY_ID: capNew.ID_CAPACITY,
            },
          }
        );
      }

      //find and update Schedule Detail/daily
      const schDetail = await WeekSchDetail.findAll({
        where: {
          SCHD_CAPACITY_ID: capNew.ID_CAPACITY,
        },
      });
      if (schDetail) {
        await WeekSchDetail.update(
          { SCHD_CAPACITY_ID: capNew.NEW_ID_CAPACITY },
          {
            where: {
              SCHD_CAPACITY_ID: capNew.ID_CAPACITY,
            },
          }
        );
      }

      //find and update Schedule size
      const schSize = await SchSizeAloc.findAll({
        where: {
          ID_CAPACITY: capNew.ID_CAPACITY,
        },
      });
      if (schSize) {
        await SchSizeAloc.update(
          { ID_CAPACITY: capNew.NEW_ID_CAPACITY },
          {
            where: {
              ID_CAPACITY: capNew.ID_CAPACITY,
            },
          }
        );
      }
    });
  }
}

// CONTROLLER CREATE NEW ORDER PO LISTING DATA with sizes
export const newOrderPOListingSizes = async (req, res) => {
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

    //get list of month for destroy data befor post new data
    const listMonth = [
      ...new Set(dataOrder.map((item) => item.PRODUCTION_MONTH)),
    ];
    for (const [i, month] of listMonth.entries()) {
      await OrderPoListingSize.destroy({
        where: {
          PRODUCTION_MONTH: month,
        },
      });
      if (i + 1 === listMonth.length) {
        await OrderPoListingSize.bulkCreate(dataOrder).then(() => {
          return res.status(200).json({
            success: true,
            message: "Data Order Retrieved Successfully create",
          });
        });
      }
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

// get order poListingSize
export const getOrderPOListingSize = async (req, res) => {
  try {
    const { orderId } = req.params;

    const ordersSize = await db.query(getOrderSizeByBlk, {
      where: {
        orderId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Data Order Retrieved Successfully",
      data: ordersSize,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error saat mencari order size",
      data: error,
    });
  }
};

// get order poListingSize
export const getBlkNoList = async (req, res) => {
  try {
    const { orderId } = req.params;
    const qry = `%${orderId}%`;

    const ordersSize = await db.query(getListBlkNo, {
      where: {
        orderId: qry,
      },
    });
    res.status(200).json({
      success: true,
      message: "Data Order Retrieved Successfully",
      data: ordersSize,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "error saat mencari order size",
      data: error,
    });
  }
};
