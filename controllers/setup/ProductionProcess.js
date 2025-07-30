import masterProductionProcess from "../../models/system/masterProductionProcess.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getMasterProductionProcess = async (req, res) => {
  try {
    const getData = await masterProductionProcess.findAll({
      where: {IS_DEFAULT: 1},
      attributes: [
        "PRODUCTION_PROCESS_ID",
        "PRODUCTION_PROCESS_CODE",
        "PRODUCTION_PROCESS_NAME",
      ],
    });

    successResponse(res, getData, "Production process fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch production process", 400);
  }
};
