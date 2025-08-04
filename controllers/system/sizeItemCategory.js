import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";
import { Op, Sequelize } from "sequelize";
import sizeItemCategory from "../../models/system/sizeItemCategory.mod.js";
import sizeChart from "../../models/system/sizeChart.mod.js";

export const getSizeItemCategories = async (req, res) => {
  try {
    const { SIZE_ID } = req.query;

    const whereClause = {};

    if (SIZE_ID) {
      whereClause.SIZE_ID = SIZE_ID;
    }

    const sizesData = await sizeItemCategory.findAll({
      where: whereClause,
      attributes: ["ITEM_CATEGORY_SIZE_ID", "IS_ACTIVE"],
      include: [
        {
          model: sizeChart,
          as: "size_chart",
          required: true,
          attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION", "IS_ACTIVE"],
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
      order: [["SIZE_ID"]],
    });

    return successResponse(
      res,
      sizesData,
      "Size item categories fetched successfully",
      200
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to fetch size item categories data",
      500
    );
  }
};

export const createOrEditSizeItemCategory = async (req, res) => {
  try {
    const { SIZE_ID } = req.params;
    const { SIZE_ITEM_CATEGORY, USER_ID } = req.body;

    for (const item_category of SIZE_ITEM_CATEGORY) {
      const existing = await sizeItemCategory.findOne({
        where: {
          SIZE_ID: SIZE_ID,
          ITEM_GROUP_ID: item_category.ITEM_GROUP_ID,
          ITEM_TYPE_ID: item_category.ITEM_TYPE_ID,
          ITEM_CATEGORY_ID: item_category.ITEM_CATEGORY_ID,
        },
      });

      if (!existing) {
        await sizeItemCategory.create({
          SIZE_ID: SIZE_ID,
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
      "Size item category created successfully",
      201
    );
  } catch (err) {
    return errorResponse(
      res,
      err,
      "Failed to create size item category data",
      400
    );
  }
};

export const deleteSizeItemCategory = async (req, res) => {
  const { ITEM_CATEGORY_SIZE_ID, DELETED_BY } = req.body;

  try {
    const sizeData = await sizeItemCategory.findByPk(ITEM_CATEGORY_SIZE_ID);

    if (!sizeData) {
      return errorResponse(res, null, "Size item category not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await sizeData.update({ DELETED_BY });
    await sizeData.destroy();

    return successResponse(res, null, "Size item category deleted successfully", 200);
  } catch (err) {
    return errorResponse(res, err, "Failed to delete size item category", 500);
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
