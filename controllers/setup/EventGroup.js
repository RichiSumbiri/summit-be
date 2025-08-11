import MasterEventGroup from "../../models/system/masterEventGroup.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getMasterEventGroup = async (req, res) => {
  try {
    const getData = await MasterEventGroup.findAll({
      attributes: ["EVENT_GROUP_ID", "EVENT_GROUP_NAME"],
    });

    successResponse(res, getData, "Event groups fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch event groups", 400);
  }
};
