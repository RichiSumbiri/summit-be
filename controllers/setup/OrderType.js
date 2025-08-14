import masterOrderType from "../../models/system/masterOrderType.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getOrderType = async (req, res) => {
  try {
    const getData = await masterOrderType.findAll();

    successResponse(res, getData, "Order type fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch order type", 400);
  }
};
