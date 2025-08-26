import { col, Op, where } from "sequelize";
import { orderitemSMV } from "../../models/orderManagement/orderitemSMV.mod.js";
import { ModelOrderPOHeader } from "../../models/orderManagement/orderManagement.mod.js";
import productItemSmvDetail from "../../models/orderManagement/ProductItemSmvDetail.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import {
  CustomerBuyPlan,
  CustomerDetail,
  CustomerProductDivision,
  CustomerProductSeason,
  CustomerProgramName,
} from "../../models/system/customer.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import ProductItemModel from "../../models/system/productItem.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";
import Users from "../../models/setup/users.mod.js";
import masterProductionProcess from "../../models/system/masterProductionProcess.mod.js";
import db from "../../config/database.js";

export const createItemSMV = async (req, res) => {
  try {
    const { FG_ITEM_ID, CREATED_BY, UPDATED_BY, PRODUCTION_PROCESS } = req.body;

    for (const data of PRODUCTION_PROCESS) {
      const newData = {
        FG_ITEM_ID: FG_ITEM_ID,
        PRODUCTION_PROCESS_ID: data.PRODUCTION_PROCESS_ID,
        DEFAULT_SMV: data.DEFAULT_SMV,
        COSTING_SMV: data.COSTING_SMV,
        PLAN_SMV: data.PLAN_SMV,
        ACTUAL_SMV: data.ACTUAL_SMV,
        CREATED_BY: CREATED_BY,
        UPDATED_BY: UPDATED_BY,
      };

      await productItemSmvDetail.create(newData);
    }

    successResponse(
      res,
      null,
      "Product item SMV detail created successfully",
      201
    );
  } catch (err) {
    errorResponse(
      res,
      err,
      "Failed to create product item SMV detail data",
      400
    );
  }
};

export const showItemSMV = async (req, res) => {
  try {
    const { FG_ITEM_ID } = req.params;

    const data = await productItemSmvDetail.findAll({
      where: { FG_ITEM_ID: FG_ITEM_ID },
      attributes: [
        "PRODUCTION_PROCESS_ID",
        "COSTING_SMV",
        "DEFAULT_SMV",
        "PLAN_SMV",
        "ACTUAL_SMV",
      ],
    });

    if (!data) {
      return errorResponse(res, null, "Product item SMV detail not found", 404);
    }

    successResponse(
      res,
      data,
      "Product item SMV detail fetched successfully",
      200
    );
  } catch (err) {
    errorResponse(
      res,
      err,
      "Failed to fetch product item SMV detail data",
      500
    );
  }
};

export const editItemSMV = async (req, res) => {
  const { FG_ITEM_ID } = req.params;
  const { UPDATED_BY, PRODUCTION_PROCESS } = req.body;

  try {
    for (const data of PRODUCTION_PROCESS) {
      const itemSMV = await productItemSmvDetail.findOne({
        where: {
          FG_ITEM_ID,
          PRODUCTION_PROCESS_ID: data.PRODUCTION_PROCESS_ID,
        },
      });

      if (!itemSMV) {
        return errorResponse(
          res,
          null,
          "Product item SMV detail not found",
          404
        );
      }

      const editedData = {
        DEFAULT_SMV: data.DEFAULT_SMV,
        COSTING_SMV: data.COSTING_SMV,
        PLAN_SMV: data.PLAN_SMV,
        ACTUAL_SMV: data.ACTUAL_SMV,
        UPDATED_BY: UPDATED_BY,
      };

      await itemSMV.update(editedData);
    }

    successResponse(
      res,
      null,
      "Product item SMV detail updated successfully",
      200
    );
  } catch (err) {
    errorResponse(
      res,
      err,
      "Failed to update product item SMV detail data",
      400
    );
  }
};

// ORDER
export const getOrderItemSMV = async (req, res) => {
  try {
    const { ITEM_ID } = req.params;

    const data = await orderitemSMV.findAll({
      attributes: [
        "ID",
        "ORDER_ID",
        "FG_ITEM_ID",
        "DEFAULT_SMV",
        "COSTING_SMV",
        "PLAN_SMV",
        "ACTUAL_SMV",
        "CREATED_AT",
      ],
      where: {
        FG_ITEM_ID: ITEM_ID,
      },
      include: [
        {
          model: ModelOrderPOHeader,
          as: "ORDER_HEADER",
          required: false,
          attributes: [
            "ITEM_ID",
            "ORDER_ID",
            "ORDER_REFERENCE_PO_NO",
            "ORDER_STYLE_DESCRIPTION",
          ],
          include: [
            {
              model: CustomerDetail,
              as: "CUSTOMER",
              attributes: ["CTC_CODE", "CTC_NAME"],
              required: false,
            },
            {
              model: CustomerProductDivision,
              as: "CUSTOMER_DIVISION",
              attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_NAME"],
              required: false,
            },
            {
              model: CustomerProductSeason,
              as: "CUSTOMER_SEASON",
              attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_NAME"],
              required: false,
            },
          ],
        },
        {
          model: masterProductionProcess,
          as: "PRODUCTION_PROCESS",
          required: true,
          attributes: ["PRODUCTION_PROCESS_CODE"],
        },
        {
          model: Users,
          as: "created_by",
          required: true,
          attributes: [["USER_INISIAL", "CREATED_BY"]],
        },
      ],
    });

    successResponse(res, data, "Order Item SMV fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch Order Item SMV data", 500);
  }
};

export const showOrderItemSMV = async (req, res) => {
  try {
    const { ITEM_ID } = req.params;

    const data = await ModelOrderPOHeader.findAll({
      attributes: [
        "ORDER_ID",
        "ORDER_STATUS",
        "ORDER_TYPE_CODE",
        "ORDER_REFERENCE_PO_NO",
        "ORDER_STYLE_DESCRIPTION",
        "ITEM_ID",
        "CURRENCY_CODE",
        "CONTRACT_NO",
        "CONTRACT_CONFIRMED_DATE",
        "NOTE_REMARKS",
      ],
      where: {
        ITEM_ID,
        [Op.and]: [where(col("ORDER_ITEM_SMV.ORDER_ID"), Op.is, null)],
      },
      include: [
        {
          model: MasterItemIdModel,
          as: "ITEM",
          attributes: ["ITEM_CODE", "ITEM_DESCRIPTION"],
          required: false,
          include: [
            {
              model: MasterItemTypes,
              as: "ITEM_TYPE",
              attributes: ["ITEM_TYPE_DESCRIPTION"],
              required: false,
            },
            {
              model: MasterItemCategories,
              as: "ITEM_CATEGORY",
              attributes: ["ITEM_CATEGORY_CODE", "ITEM_CATEGORY_DESCRIPTION"],
              required: false,
            },
          ],
        },
        {
          model: orderitemSMV,
          as: "ORDER_ITEM_SMV",
          attributes: ["ORDER_ID"],
          required: false,
        },
        {
          model: ProductItemModel,
          as: "PRODUCT",
          attributes: ["PRODUCT_TYPE_CODE", "PRODUCT_CAT_CODE"],
          required: false,
        },
        {
          model: CustomerDetail,
          as: "CUSTOMER",
          attributes: ["CTC_CODE", "CTC_NAME"],
          required: false,
        },
        {
          model: CustomerProductDivision,
          as: "CUSTOMER_DIVISION",
          attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_NAME"],
          required: false,
        },
        {
          model: CustomerProductSeason,
          as: "CUSTOMER_SEASON",
          attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_NAME"],
          required: false,
        },
        {
          model: CustomerProgramName,
          as: "CUSTOMER_PROGRAM",
          attributes: ["CTPROG_ID", "CTPROG_NAME"],
          required: false,
        },
        {
          model: CustomerBuyPlan,
          as: "CUSTOMER_BUYPLAN",
          attributes: ["CTBUYPLAN_ID", "CTBUYPLAN_NAME"],
          required: false,
        },
      ],
    });

    successResponse(res, data, "Order Item SMV fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch Order Item SMV data", 500);
  }
};

export const createOrderItemSMV = async (req, res) => {
  const t = await db.transaction();
  try {

    const { USER_ID, ORDER_ID, FG_ITEM_ID, ITEM_SMV } = req.body;

    for (const item of ITEM_SMV) {
      item.ORDER_ID = ORDER_ID;
      item.FG_ITEM_ID = FG_ITEM_ID;
      item.CREATED_BY = USER_ID;
      item.UPDATED_BY = USER_ID;
      await orderitemSMV.create(item, { transaction: t });
    }

    await t.commit();

    successResponse(res, null, "Order Item SMV updated successfully", 200);
  } catch (err) {
    await t.rollback();
    errorResponse(res, err, "Failed to update Order Item SMV data", 500);
  }
};
