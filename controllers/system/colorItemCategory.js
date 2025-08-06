import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";
import colorItemCategory from "../../models/system/colorItemCategory.mod.js";
import colorChart from "../../models/system/colorChart.mod.js";

export const getColorItemCategories = async (req, res) => {
  try {
    const { COLOR_ID, ITEM_CATEGORY_ID, ITEM_TYPE_ID, ITEM_GROUP_ID } = req.query;

    const whereClause = {};

    if (COLOR_ID) {
      whereClause.COLOR_ID = COLOR_ID;
    }

    if (ITEM_CATEGORY_ID) {
      whereClause.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID;
    }

    if (ITEM_TYPE_ID) {
      whereClause.ITEM_TYPE_ID = ITEM_TYPE_ID;
    }

    if (ITEM_GROUP_ID) {
      whereClause.ITEM_GROUP_ID = ITEM_GROUP_ID;
    }

    const colorsData = await colorItemCategory.findAll({
      where: whereClause,
      attributes: ["ITEM_CATEGORY_COLOR_ID", "IS_ACTIVE"],
      include: [
        {
          model: colorChart,
          as: "color_chart",
          required: true,
          attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION", "IS_ACTIVE"],
        },
        {
          model: MasterItemCategories,
          as: "item_categories",
          required: true,
          attributes: [
            "ITEM_CATEGORY_ID",
            "ITEM_CATEGORY_CODE",
            "ITEM_CATEGORY_DESCRIPTION",
          ],
        },
        {
          model: MasterItemTypes,
          as: "item_types",
          required: true,
          attributes: [
            "ITEM_TYPE_ID",
            "ITEM_TYPE_CODE",
            "ITEM_TYPE_DESCRIPTION",
          ],
        },
        {
          model: MasterItemGroup,
          as: "item_groups",
          required: true,
          attributes: [
            "ITEM_GROUP_ID",
            "ITEM_GROUP_CODE",
            "ITEM_GROUP_DESCRIPTION",
          ],
        },
      ],
      order: [["COLOR_ID"]],
    });

    return successResponse(
      res,
      colorsData,
      "Color item categories fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch color item categories data",
      500
    );
  }
};

export const createOrEditColorItemCategory = async (req, res) => {
  try {
    const { COLOR_ID } = req.params;
    const { COLOR_ITEM_CATEGORY, USER_ID } = req.body;

    for (const item_category of COLOR_ITEM_CATEGORY) {
      const existing = await colorItemCategory.findOne({
        where: {
          COLOR_ID: COLOR_ID,
          ITEM_GROUP_ID: item_category.ITEM_GROUP_ID,
          ITEM_TYPE_ID: item_category.ITEM_TYPE_ID,
          ITEM_CATEGORY_ID: item_category.ITEM_CATEGORY_ID,
        },
      });

      if (!existing) {
        await colorItemCategory.create({
          COLOR_ID: COLOR_ID,
          ITEM_GROUP_ID: item_category.ITEM_GROUP_ID,
          ITEM_TYPE_ID: item_category.ITEM_TYPE_ID,
          ITEM_CATEGORY_ID: item_category.ITEM_CATEGORY_ID,
          CREATED_BY: USER_ID,
          UPDATED_BY: USER_ID,
        });
      }
    }

    return successResponse(
      res,
      null,
      "Color item category created successfully",
      201
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to create color item category data",
      400
    );
  }
};

export const deleteColorItemCategory = async (req, res) => {
  const { ITEM_CATEGORY_COLOR_ID, DELETED_BY } = req.body;

  try {
    const colorData = await colorItemCategory.findByPk(ITEM_CATEGORY_COLOR_ID);

    if (!colorData) {
      return errorResponse(res, null, "Color item category not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await colorData.update({ DELETED_BY });
    await colorData.destroy();

    return successResponse(res, null, "Color item category deleted successfully", 200);
  } catch (err) {
    return errorResponse(res, err, "Failed to delete color item category", 500);
  }
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
