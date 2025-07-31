import colorChart, {FGColorChartModel} from "../../models/system/colorChart.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {successResponse, errorResponse} from "../helpers/responseHelper.js";
import {Op, Sequelize} from "sequelize";

export const getColors = async (req, res) => {
    try {
        const {ITEM_GROUP_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID} = req.query;

        const where = {
            ...(ITEM_CATEGORY_ID && {ITEM_CATEGORY_ID}),
            ...(ITEM_GROUP_ID && {ITEM_GROUP_ID}),
            ...(ITEM_TYPE_ID && {ITEM_TYPE_ID}),
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
            order: [["COLOR_ID", "DESC"]],
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

        if (!colorData?.COLOR_CODE) {
            return errorResponse(res, null, "COLOR_CODE is required", 400);
        }

        const normalizedSizeCode = colorData.COLOR_CODE.trim().toLowerCase();
        const existingSize = await colorChart.findOne({
            where: {
                [Op.and]: [
                    {COLOR_CODE: {[Op.ne]: null}},
                    {ITEM_CATEGORY_ID: colorData.ITEM_CATEGORY_ID, ITEM_TYPE_ID: colorData.ITEM_TYPE_ID, ITEM_GROUP_ID: colorData.ITEM_GROUP_ID},
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.fn("TRIM", Sequelize.col("COLOR_CODE"))),
                        normalizedSizeCode
                    ),

                ],
            },
        });

        if (existingSize) {
            return errorResponse(res, null, "SIZE_CODE already exists", 400);
        }

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
        const {COLOR_ID} = req.params;

        const colorData = await colorChart.findOne({
            where: {COLOR_ID: COLOR_ID},
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
    const {COLOR_ID} = req.params;
    const dataColors = req.body;

    try {
        const colorData = await colorChart.findByPk(COLOR_ID);

        if (!colorData) {
            return errorResponse(res, null, "Color not found", 404);
        }

        if (!colorData?.COLOR_CODE) {
            return errorResponse(res, null, "COLOR_CODE is required", 400);
        }

        const normalizedSizeCode = colorData.COLOR_CODE.trim().toLowerCase();
        const existingSize = await colorChart.findOne({
            where: {
                [Op.and]: [
                    {COLOR_ID: {[Op.ne]: COLOR_ID}},
                    {COLOR_CODE: {[Op.ne]: null}},
                    {ITEM_CATEGORY_ID: colorData.ITEM_CATEGORY_ID},
                    {ITEM_TYPE_ID: colorData.ITEM_TYPE_ID},
                    {ITEM_GROUP_ID: colorData.ITEM_GROUP_ID},
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.fn("TRIM", Sequelize.col("COLOR_CODE"))),
                        normalizedSizeCode
                    ),
                ],
            },
        });

        if (existingSize) {
            return errorResponse(res, null, "SIZE_CODE already exists", 400);
        }

        await chechMasterExist(dataColors);

        await colorData.update(dataColors);

        successResponse(res, null, "Color chart updated successfully", 200);
    } catch (err) {
        errorResponse(res, err, "Failed to update color data", 400);
    }
};

export const deleteColor = async (req, res) => {
    const {COLOR_ID, DELETED_BY} = req.body;

    try {
        const colorData = await colorChart.findByPk(COLOR_ID);

        if (!colorData) {
            return errorResponse(res, null, "Color not found", 404);
        }

        if (!DELETED_BY) {
            return errorResponse(res, null, "Deleted by is required", 400);
        }

        await colorData.update({DELETED_BY});
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


export const createFGColorChart = async (req, res) => {
    try {
        const { MASTER_ITEM_ID, COLOR_ID } = req.body;

        if (!MASTER_ITEM_ID || !COLOR_ID) {
            return res.status(400).json({
                success: false,
                message: "MASTER_ITEM_ID and COLOR_ID are required",
            });
        }

        const color = await colorChart.findByPk(COLOR_ID);
        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Color not found",
            });
        }


        const exist = await FGColorChartModel.findOne({
            where: {
                MASTER_ITEM_ID,
                COLOR_ID,
                IS_DELETED: false,
            }
        });

        if (exist) {
            return res.status(400).json({
                success: false,
                message: "FG Color Already Exists",
            });
        }

        const newEntry = await FGColorChartModel.create({
            MASTER_ITEM_ID,
            COLOR_ID,
        });

        return res.status(201).json({
            success: true,
            message: "FG color chart created successfully",
            data: newEntry,
        });
    } catch (error) {
        console.error("Error creating FG color chart:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create FG color chart: ${error.message}`,
        });
    }
};

export const getAllFGColorCharts = async (req, res) => {
    try {
        const { MASTER_ITEM_ID } = req.query;

        const where = {IS_DELETED: false};
        if (MASTER_ITEM_ID) {
            where.MASTER_ITEM_ID = MASTER_ITEM_ID;
        }

        const entries = await FGColorChartModel.findAll({
            where,
            include: [
                {
                    model: colorChart,
                    as: "COLOR",
                    attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "FG color charts retrieved successfully",
            data: entries,
        });
    } catch (error) {
        console.error("Error retrieving FG color charts:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve FG color charts: ${error.message}`,
        });
    }
};

export const getFGColorChartById = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await FGColorChartModel.findByPk(id, {
            include: [
                {
                    model: colorChart,
                    as: "COLOR",
                    attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                },
            ],
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "FG color chart not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "FG color chart retrieved successfully",
            data: entry,
        });
    } catch (error) {
        console.error("Error retrieving FG color chart:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve FG color chart: ${error.message}`,
        });
    }
};

export const updateFGColorChart = async (req, res) => {
    try {
        const { id } = req.params;
        const { MASTER_ITEM_ID, COLOR_ID } = req.body;

        const entry = await FGColorChartModel.findByPk(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "FG color chart not found",
            });
        }

        if (COLOR_ID) {
            const color = await colorChart.findByPk(COLOR_ID);
            if (!color) {
                return res.status(404).json({
                    success: false,
                    message: "Color not found",
                });
            }
        }

        await entry.update({
            MASTER_ITEM_ID,
            COLOR_ID,
        });

        return res.status(200).json({
            success: true,
            message: "FG color chart updated successfully",
        });
    } catch (error) {
        console.error("Error updating FG color chart:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update FG color chart: ${error.message}`,
        });
    }
};

export const deleteFGColorChart = async (req, res) => {
    try {
        const { id } = req.params;

        const entry = await FGColorChartModel.findByPk(id);
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: "FG color chart not found",
            });
        }

        await entry.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        })

        return res.status(200).json({
            success: true,
            message: "FG color chart deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting FG color chart:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete FG color chart: ${error.message}`,
        });
    }
};