import MasterServiceGroups from "../../models/setup/ServiceGroups.mod.js";

export const getMasterServiceGroup = async (req, res) => {
  try {
    const getData = await MasterServiceGroups.findAll({
      attributes: [
        "SERVICE_GROUP_ID",
        "SERVICE_GROUP_CODE",
        "SERVICE_GROUP_DESCRIPTION",
      ],
    });
    if (getData) {
      return res.status(200).json({
        success: true,
        message: "success get master service group",
        data: getData,
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err,
      message: "error get list service group",
    });
  }
};
