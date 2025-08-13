import MasterEventType from "../../models/system/masterEventType.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getMasterEventType = async (req, res) => {
  try {
    const getData = await MasterEventType.findAll({
      attributes: ["EVENT_TYPE_ID", "EVENT_TYPE_NAME"],
    });

    successResponse(res, getData, "Event types fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch event types", 400);
  }
};
