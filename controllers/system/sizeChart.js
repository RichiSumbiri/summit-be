import sizeChart from "../../models/system/sizeChart.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { successResponse, errorResponse } from "../helpers/responseHelper.js";
import {Op, Sequelize} from "sequelize";

export const getSizes = async (req, res) => {
  try {
    const { ITEM_GROUP_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID } = req.query;

    const where = {
      ...(ITEM_CATEGORY_ID && { ITEM_CATEGORY_ID }),
      ...(ITEM_GROUP_ID && { ITEM_GROUP_ID }),
      ...(ITEM_TYPE_ID && { ITEM_TYPE_ID }),
    };

    const sizesData = await sizeChart.findAll({
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
      order: [["SIZE_ID"]],
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
      return errorResponse(res, err, "SIZE_CODE are Required", 400);
    }

    const normalizedSizeCode = sizeData.SIZE_CODE.trim().toLowerCase();

    const existingSize = await sizeChart.findOne({
      where: {
        [Op.and]: [
          { SIZE_CODE: { [Op.ne]: null } },
          Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.fn("TRIM", Sequelize.col("SIZE_CODE"))),
              normalizedSizeCode
          ),
        ],
      },
    });


    if (existingSize) {
      return errorResponse(res, null, "SIZE_CODE already exists", 400);
    }

    await chechMasterExist(sizeData);
    const customId = await generateCustomId();



    sizeData.SIZE_ID = customId;
    await sizeChart.create(sizeData);

    return successResponse(res, null, "Size created successfully", 201);
  } catch (err) {
    return errorResponse(res, err, "Failed to create size data", 400);
  }
};

export const showSize = async (req, res) => {
  try {
    const { SIZE_ID } = req.params;

    const sizeData = await sizeChart.findOne({
      where: { SIZE_ID: SIZE_ID },
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
          { SIZE_CODE: { [Op.ne]: null } },
          Sequelize.where(
              Sequelize.fn("LOWER", Sequelize.fn("TRIM", Sequelize.col("SIZE_CODE"))),
              normalizedSizeCode
          ),
        ],
      },
    });


    if (existingSize) {
      return errorResponse(res, null, "SIZE_CODE already exists", 400);
    }

    await chechMasterExist(dataSizes);
    await sizeData.update(dataSizes);

    return successResponse(res, null, "Size updated successfully", 200);
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
