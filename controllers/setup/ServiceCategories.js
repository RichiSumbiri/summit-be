import MasterServiceCategories from "../../models/setup/ServiceCategories.mod.js";

export const getMasterServiceCategory = async (req, res) => {
  try {
    const getData = await MasterServiceCategories.findAll({
      attributes: [
        "SERVICE_CATEGORY_ID",
        "SERVICE_CATEGORY_CODE",
        "SERVICE_CATEGORY_DESCRIPTION",
        "SERVICE_TYPE_ID"
      ],
    });

    if (getData) {
      return res.status(200).json({
        success: true,
        message: "success get master service category",
        data: getData,
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      error: err,
      message: "error get list service category",
    });
  }
};
