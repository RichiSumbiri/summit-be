import sizeChart, {
  FGSizeChartModel,
} from "../../models/system/sizeChart.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";
import { Op, Sequelize } from "sequelize";
import Users from "../../models/setup/users.mod.js";
import { getPagination } from "../util/Query.js";

export const getSizes = async (req, res) => {
  try {
    const { SEARCH_TEXT, page, limit } = req.query;

    const include = SEARCH_TEXT
      ? []
      : [
          {
            model: Users,
            as: "created_by",
            required: true,
            attributes: [["USER_INISIAL", "CREATED_BY"]],
          },
          {
            model: Users,
            as: "updated_by",
            required: true,
            attributes: [["USER_INISIAL", "UPDATED_BY"]],
          },
        ];

    const where = {};

    if (SEARCH_TEXT) {
      where[Op.or] = [
        { SIZE_CODE: { [Op.like]: `%${SEARCH_TEXT}%` } },
        { SIZE_DESCRIPTION: { [Op.like]: `%${SEARCH_TEXT}%` } },
        { SIZE_ID: { [Op.like]: `%${SEARCH_TEXT}%` } },
      ];
    }

    const sizesData = await sizeChart.findAll({
      where,
      order: [["SIZE_ID"]],
      include,
      ...getPagination(page, limit),
    });

    return successResponse(
      res,
      sizesData,
      "Sizes chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch sizes data", 500);
  }
};

export const createSize = async (req, res) => {
  try {
    const sizeData = req.body;

    if (!sizeData?.SIZE_CODE) {
      return errorResponse(res, null, "SIZE_CODE are Required", 400);
    }

    const normalizedSizeCode = sizeData.SIZE_CODE.trim().toLowerCase();

    const existingSize = await sizeChart.findOne({
      where: {
        [Op.and]: [
          { SIZE_CODE: { [Op.ne]: null } },
          // {ITEM_CATEGORY_ID: sizeData.ITEM_CATEGORY_ID, ITEM_TYPE_ID: sizeData.ITEM_TYPE_ID, ITEM_GROUP_ID: sizeData.ITEM_GROUP_ID},
          Sequelize.where(
            Sequelize.fn(
              "LOWER",
              Sequelize.fn("TRIM", Sequelize.col("SIZE_CODE"))
            ),
            normalizedSizeCode
          ),
        ],
      },
    });

    if (existingSize) {
      return errorResponse(res, null, "SIZE_CODE already exists", 400);
    }

    const customId = await generateCustomId();

    sizeData.SIZE_ID = customId;
    await sizeChart.create(sizeData);

    return successResponse(res, {
      SIZE_ID: customId
    }, "Size created successfully", 201);
  } catch (err) {
    return errorResponse(res, err, "Failed to create size data", 400);
  }
};

export const showSize = async (req, res) => {
  try {
    const { SIZE_ID } = req.params;

    const sizeData = await sizeChart.findOne({
      where: { SIZE_ID: SIZE_ID },
      attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
    });

    if (!sizeData) {
      return errorResponse(res, null, "Size not found", 404);
    }

    return successResponse(
      res,
      sizeData,
      "Size chart fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch size data", 500);
  }
};

export const editSize = async (req, res) => {
  const { SIZE_ID } = req.params;
  const dataSizes = req.body;

  try {
    const sizeData = await sizeChart.findByPk(SIZE_ID);

    if (!sizeData) {
      return errorResponse(res, null, "Size not found", 404);
    }

    if (!sizeData?.SIZE_CODE) {
      return errorResponse(res, err, "SIZE_CODE are Required", 400);
    }

    const normalizedSizeCode = sizeData.SIZE_CODE.trim().toLowerCase();

    const existingSize = await sizeChart.findOne({
      where: {
        [Op.and]: [
          { SIZE_ID: { [Op.ne]: SIZE_ID } },
          { SIZE_CODE: { [Op.ne]: null } },
          // {ITEM_CATEGORY_ID: sizeData.ITEM_CATEGORY_ID},
          // {ITEM_TYPE_ID: sizeData.ITEM_TYPE_ID},
          // {ITEM_GROUP_ID: sizeData.ITEM_GROUP_ID},
          Sequelize.where(
            Sequelize.fn(
              "LOWER",
              Sequelize.fn("TRIM", Sequelize.col("SIZE_CODE"))
            ),
            normalizedSizeCode
          ),
        ],
      },
    });

    if (existingSize) {
      return errorResponse(res, null, "SIZE_CODE already exists", 400);
    }

    await sizeData.update(dataSizes);

    return successResponse(res, {
      SIZE_ID
    }, "Size updated successfully", 200);
  } catch (err) {
    return errorResponse(res, err, "Failed to update size", 400);
  }
};

export const deleteSize = async (req, res) => {
  const { SIZE_ID, DELETED_BY } = req.body;

  try {
    const sizeData = await sizeChart.findByPk(SIZE_ID);

    if (!sizeData) {
      return errorResponse(res, null, "Size not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await sizeData.update({ DELETED_BY });
    await sizeData.destroy();

    return successResponse(res, null, "Size deleted successfully", 200);
  } catch (err) {
    return errorResponse(res, err, "Failed to delete size", 500);
  }
};

const generateCustomId = async () => {
  const lastRecord = await sizeChart.findOne({
    order: [["SIZE_ID", "DESC"]],
    paranoid: false,
  });

  let nextId = "SID0000001";

  if (lastRecord) {
    const lastId = lastRecord.SIZE_ID;
    const numericPart = parseInt(lastId.slice(3));
    const newNumber = numericPart + 1;
    const padded = newNumber.toString().padStart(7, "0");
    nextId = `SID${padded}`;
  }

  return nextId;
};

// const chechMasterExist = async (data) => {
//   const dropdowns = {
//     MasterItemCategories: "ITEM_CATEGORY_ID",
//     MasterItemGroup: "ITEM_GROUP_ID",
//     MasterItemTypes: "ITEM_TYPE_ID",
//   };

//   const models = {
//     MasterItemCategories,
//     MasterItemTypes,
//     MasterItemGroup,
//   };

//   for (const [modelKey, fieldKey] of Object.entries(dropdowns)) {
//     const model = models[modelKey];
//     const masterItem = await model.findByPk(data[fieldKey]);

//     if (!masterItem) {
//       throw new Error(`${modelKey} not found`);
//     }
//   }
// };

export const createFGSizeChart = async (req, res) => {
  try {
    const { MASTER_ITEM_ID, SIZE_ID } = req.body;

    if (!MASTER_ITEM_ID || !SIZE_ID) {
      return res.status(400).json({
        success: false,
        message: "MASTER_ITEM_ID and SIZE_ID are required",
      });
    }

    const size = await sizeChart.findByPk(SIZE_ID);
    if (!size) {
      return res.status(404).json({
        success: false,
        message: "Size not found",
      });
    }

    const exits = await FGSizeChartModel.findOne({
      where: {
        MASTER_ITEM_ID,
        SIZE_ID,
        IS_DELETED: false,
      },
    });

    if (exits) {
      return res.status(400).json({
        success: false,
        message: "Size Already Exists",
      });
    }

    await FGSizeChartModel.create({
      MASTER_ITEM_ID,
      SIZE_ID,
    });

    return res.status(201).json({
      success: true,
      message: "FG size chart created successfully",
    });
  } catch (error) {
    console.error("Error creating FG size chart:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to create FG size chart: ${error.message}`,
    });
  }
};

export const getAllFGSizeCharts = async (req, res) => {
  try {
    const { MASTER_ITEM_ID } = req.query;

    const where = {
      IS_DELETED: false,
    };

    if (MASTER_ITEM_ID) {
      where.MASTER_ITEM_ID = MASTER_ITEM_ID;
    }

    const entries = await FGSizeChartModel.findAll({
      where,
      include: [
        {
          model: sizeChart,
          as: "SIZE",
          attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "FG size charts retrieved successfully",
      data: entries,
    });
  } catch (error) {
    console.error("Error retrieving FG size charts:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve FG size charts: ${error.message}`,
    });
  }
};

export const getFGSizeChartById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await FGSizeChartModel.findByPk(id, {
      include: [
        {
          model: sizeChart,
          as: "SIZE",
          attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
        },
      ],
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "FG size chart not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FG size chart retrieved successfully",
      data: entry,
    });
  } catch (error) {
    console.error("Error retrieving FG size chart:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve FG size chart: ${error.message}`,
    });
  }
};

export const updateFGSizeChart = async (req, res) => {
  try {
    const { id } = req.params;
    const { MASTER_ITEM_ID, SIZE_ID } = req.body;

    const entry = await FGSizeChartModel.findByPk(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "FG size chart not found",
      });
    }

    if (SIZE_ID) {
      const size = await sizeChart.findByPk(SIZE_ID);
      if (!size) {
        return res.status(404).json({
          success: false,
          message: "Size not found",
        });
      }
    }

    await entry.update({
      MASTER_ITEM_ID,
      SIZE_ID,
    });

    return res.status(200).json({
      success: true,
      message: "FG size chart updated successfully",
    });
  } catch (error) {
    console.error("Error updating FG size chart:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to update FG size chart: ${error.message}`,
    });
  }
};

export const deleteFGSizeChart = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await FGSizeChartModel.findByPk(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "FG size chart not found",
      });
    }

    await entry.update({
      IS_DELETED: true,
      DELETED_AT: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "FG size chart deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting FG size chart:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete FG size chart: ${error.message}`,
    });
  }
};
