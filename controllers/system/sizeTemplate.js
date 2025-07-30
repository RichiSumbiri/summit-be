import SizeChartTemplateModel from "../../models/system/sizeTemplate.mod.js";
import {CustomerDetail} from "../../models/system/customer.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import ColorChartMod from "../../models/system/colorChart.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import {Op} from "sequelize";


export const createSizeChartTemplate = async (req, res) => {
    try {
        const {DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, LIST} = req.body;

        if (!DESCRIPTION || !CUSTOMER_ID || !ITEM_CATEGORY_ID || !Array.isArray(LIST)) {
            return res.status(400).json({
                success: false,
                message: "DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, and LIST (array) are required",
            });
        }


        const count = await SizeChartTemplateModel.count();
        const ID = `CSC-${String(count + 1).padStart(7, "0")}`;


        const uniqueList = [...new Set(LIST)];


        await SizeChartTemplateModel.create({
            ID,
            DESCRIPTION,
            CUSTOMER_ID,
            ITEM_CATEGORY_ID,
            LIST: uniqueList,
        });

        return res.status(201).json({
            success: true,
            message: "Size chart template created successfully",
        });
    } catch (error) {
        console.error("Error creating size chart template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create size chart template: ${error.message}`,
        });
    }
};

export const getAllSizeChartTemplates = async (req, res) => {
    const {ITEM_CATEGORY_ID} = req.query;
    const where = {IS_DELETED: false};

    if (ITEM_CATEGORY_ID) {
        where.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID;
    }

    try {
        const templates = await SizeChartTemplateModel.findAll({
            where,
            include: [
                {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"],
                },
                {
                    model: MasterItemCategories,
                    as: "ITEM_CATEGORY",
                    attributes: [
                        "ITEM_CATEGORY_ID",
                        "ITEM_CATEGORY_CODE",
                        "ITEM_CATEGORY_BASE_UOM",
                        "ITEM_CATEGORY_BASE_UOM_DESCRIPTION",
                        "ITEM_CATEGORY_DESCRIPTION",
                    ],
                },
            ],
        });

        const transformedTemplates = []
        for (let i = 0; i < templates.length; i++) {
            const template = templates[i]
            const sizes = await SizeChartMod.findAll({
                where: {SIZE_ID: {[Op.in]: JSON.parse(template.dataValues.LIST)}},
                attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
            });
            transformedTemplates.push({
                ...template.dataValues,
                LIST: sizes,
            })
        }

        return res.status(200).json({
            success: true,
            message: "Size chart templates retrieved successfully",
            data: transformedTemplates,
        });
    } catch (error) {
        console.error("Error retrieving size chart templates:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve size chart templates: ${error.message}`,
        });
    }
};


export const getSizeChartTemplateById = async (req, res) => {
    try {
        const {id} = req.params;

        const template = await SizeChartTemplateModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }


        const sizes = await SizeChartMod.findAll({
            where: {SIZE_ID: {[Op.in]: template.LIST}},
            attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template retrieved successfully",
            data: {
                ...template.toJSON(),
                LIST: sizes,
            },
        });
    } catch (error) {
        console.error("Error retrieving size chart template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve size chart template: ${error.message}`,
        });
    }
};

export const updateSizeChartTemplate = async (req, res) => {
    try {
        const {id} = req.params;
        const {DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, LIST} = req.body;

        if (!DESCRIPTION || !CUSTOMER_ID || !ITEM_CATEGORY_ID || !Array.isArray(LIST)) {
            return res.status(400).json({
                success: false,
                message: "DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, and LIST (array) are required",
            });
        }

        const template = await SizeChartTemplateModel.findByPk(id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }


        const uniqueList = [...new Set(LIST)];

        await template.update({
            DESCRIPTION,
            CUSTOMER_ID,
            ITEM_CATEGORY_ID,
            LIST: uniqueList,
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template updated successfully",
        });
    } catch (error) {
        console.error("Error updating size chart template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update size chart template: ${error.message}`,
        });
    }
};

export const deleteSizeChartTemplate = async (req, res) => {
    try {
        const {id} = req.params;

        const template = await SizeChartTemplateModel.findOne({where: {ID: id}});

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }

        await template.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting size chart template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete size chart template: ${error.message}`,
        });
    }
};