import masterStatus from "../../models/system/masterStatus.js";
import { errorResponse, successResponse } from "../helpers/responseHelper.js";

export const getMasterStatus = async (req, res) => {
  try {
    const getData = await masterStatus.findAll({
      attributes: ["STATUS_ID", "STATUS_NAME"],
    });

    successResponse(res, getData, "Master status fetched successfully", 200);
  } catch (error) {
    errorResponse(res, err, "Failed to fetch master status", 400);
  }
};
