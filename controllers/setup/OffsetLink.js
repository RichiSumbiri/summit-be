import masterOffsetLink from "../../models/system/masterOffsetLink.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getOffsetLink = async (req, res) => {
  try {
    const getData = await masterOffsetLink.findAll({
      attributes:["OFFSET_LINK_ID", "OFFSET_LINK_NAME", "IS_SPLIT_EVENT"]
    });

    successResponse(res, getData, "Offset link fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch offset link", 400);
  }
};
