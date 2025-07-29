import colorChart from "../../models/system/colorChart.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";

export const getColors = async (req, res) => {
  try {
    const { ITEM_GROUP_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID } = req.query;

    const where = {
      ...(ITEM_CATEGORY_ID && { ITEM_CATEGORY_ID }),
      ...(ITEM_GROUP_ID && { ITEM_GROUP_ID }),
      ...(ITEM_TYPE_ID && { ITEM_TYPE_ID }),
    };

    const colorsData = await colorChart.findAll({
      where: where,
      include: [
        {
          model: MasterItemCategories,
          as: "item_categories",
          required: true,
          attributes: [
            "ITEM_CATEGORY_ID",
            "ITEM_CATEGORY_CODE",
            ["ITEM_CATEGORY_DESCRIPTION", "ITEM_CATEGORY_NAME"],
          ],
        },
        {
          model: MasterItemTypes,
          as: "item_types",
          required: true,
          attributes: [
            "ITEM_TYPE_ID",
            "ITEM_TYPE_CODE",
            ["ITEM_TYPE_DESCRIPTION", "ITEM_TYPE_NAME"],
          ],
        },
        {
          model: MasterItemGroup,
          as: "item_groups",
          required: true,
          attributes: [
            "ITEM_GROUP_ID",
            "ITEM_GROUP_CODE",
            ["ITEM_GROUP_DESCRIPTION", "ITEM_GROUP_NAME"],
          ],
        },
      ],
      order: [["COLOR_ID"]],
    });

    successResponse(res, colorsData, "Colors chart fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch colors data", 500);
  }
};

export const createColor = async (req, res) => {
  try {
    const colorData = req.body;

    await chechMasterExist(colorData);

    const customId = await generateCustomId();
    colorData.COLOR_ID = customId;

    await colorChart.create(colorData);
    successResponse(res, null, "Color created successfully", 201);
  } catch (err) {
    errorResponse(res, err, "Failed to create color data", 400);
  }
};

export const showColor = async (req, res) => {
  try {
    const { COLOR_ID } = req.params;

    const colorData = await colorChart.findOne({
      where: { COLOR_ID: COLOR_ID },
      include: [
        {
          model: MasterItemCategories,
          as: "item_categories",
          required: true,
          attributes: [
            "ITEM_CATEGORY_ID",
            "ITEM_CATEGORY_CODE",
            ["ITEM_CATEGORY_DESCRIPTION", "ITEM_CATEGORY_NAME"],
          ],
        },
        {
          model: MasterItemTypes,
          as: "item_types",
          required: true,
          attributes: [
            "ITEM_TYPE_ID",
            "ITEM_TYPE_CODE",
            ["ITEM_TYPE_DESCRIPTION", "ITEM_TYPE_NAME"],
          ],
        },
        {
          model: MasterItemGroup,
          as: "item_groups",
          required: true,
          attributes: [
            "ITEM_GROUP_ID",
            "ITEM_GROUP_CODE",
            ["ITEM_GROUP_DESCRIPTION", "ITEM_GROUP_NAME"],
          ],
        },
      ],
    });

    if (!colorData) {
      return errorResponse(res, null, "Color not found", 404);
    }

    successResponse(res, colorData, "Color chart fetched successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to fetch color data", 500);
  }
};

export const editColor = async (req, res) => {
  const { COLOR_ID } = req.params;
  const dataColors = req.body;

  try {
    const colorData = await colorChart.findByPk(COLOR_ID);

    if (!colorData) {
      return errorResponse(res, null, "Color not found", 404);
    }

    await chechMasterExist(dataColors);

    await colorData.update(dataColors);

    successResponse(res, null, "Color chart updated successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to update color data", 400);
  }
};

export const deleteColor = async (req, res) => {
  const { COLOR_ID, DELETED_BY } = req.body;

  try {
    const colorData = await colorChart.findByPk(COLOR_ID);

    if (!colorData) {
      return errorResponse(res, null, "Color not found", 404);
    }

    if (!DELETED_BY) {
      return errorResponse(res, null, "Deleted by is required", 400);
    }

    await colorData.update({ DELETED_BY });
    await colorData.destroy();

    successResponse(res, null, "Color chart deleted successfully", 200);
  } catch (err) {
    errorResponse(res, err, "Failed to delete color data", 500);
  }
};

const generateCustomId = async () => {
  const lastRecord = await colorChart.findOne({
    order: [["COLOR_ID", "DESC"]],
    paranoid: false,
  });

  let nextId = "CID0000001";

  if (lastRecord) {
    const lastId = lastRecord.COLOR_ID;
    const numericPart = parseInt(lastId.slice(3));
    const newNumber = numericPart + 1;
    const padded = newNumber.toString().padStart(7, "0");
    nextId = `CID${padded}`;
  }

  return nextId;
};

const chechMasterExist = async (data) => {
  const dropdowns = {
    MasterItemCategories: "ITEM_CATEGORY_ID",
    MasterItemGroup: "ITEM_GROUP_ID",
    MasterItemTypes: "ITEM_TYPE_ID",
  };

  const models = {
    MasterItemCategories,
    MasterItemTypes,
    MasterItemGroup,
  };

  for (const [modelKey, fieldKey] of Object.entries(dropdowns)) {
    const model = models[modelKey];
    const masterItem = await model.findByPk(data[fieldKey]);

    if (!masterItem) {
      throw new Error(`${modelKey} not found`);
    }
  }
};
