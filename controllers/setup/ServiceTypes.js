import MasterServiceTypes from "../../models/setup/ServiceTypes.mod.js";

export const getMasterServiceType = async (req, res) => {
  try {
    const getData = await MasterServiceTypes.findAll({
      attributes: [
        "SERVICE_TYPE_ID",
        "SERVICE_TYPE_CODE",
        "SERVICE_TYPE_DESCRIPTION",
      ],
    });
    if (getData) {
      return res.status(200).json({
        success: true,
        message: "success get master service type",
        data: getData,
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err,
      message: "error get list service type",
    });
  }
};
