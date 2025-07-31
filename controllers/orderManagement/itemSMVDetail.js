import productItemSmvDetail from "../../models/orderManagement/ProductItemSmvDetail.mod.js";
import masterProductionProcess from "../../models/system/masterProductionProcess.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

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
        where: { FG_ITEM_ID, PRODUCTION_PROCESS_ID: data.PRODUCTION_PROCESS_ID },
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
