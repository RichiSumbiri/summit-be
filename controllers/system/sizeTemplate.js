import SizeChartTemplateModel from "../../models/system/sizeTemplate.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";


export const createSizeChartTemplate = async (req, res) => {
    try {
        const { DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, LIST } = req.body;

        if (!DESCRIPTION || !CUSTOMER_ID || !ITEM_CATEGORY_ID || !Array.isArray(LIST)) {
            return res.status(400).json({
                success: false,
                message: "DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, and LIST (array) are required",
            });
        }


        const ID = `TEMPLATE-${Date.now()}`;
        const newList = JSON.stringify(LIST);


         await SizeChartTemplateModel.create({
            ID,
            DESCRIPTION,
            CUSTOMER_ID,
            ITEM_CATEGORY_ID,
            LIST: newList,
        });


        const masterSizes = await SizeChartMod.findAll({
            where: { SIZE_ID: { [Op.in]: LIST } },
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
    try {
        const templates = await SizeChartTemplateModel.findAll();


        const transformedTemplates = await Promise.all(
            templates.map(async (template) => {
                const list = JSON.parse(template.LIST);
                const masterSizes = await SizeChartMod.findAll({
                    where: { SIZE_ID: { [Op.in]: list } },
                });
                return {
                    ...template.toJSON(),
                    LIST: masterSizes,
                };
            })
        );

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
        const { id } = req.params;

        const template = await SizeChartTemplateModel.findOne({ where: { ID: id } });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }


        const list = JSON.parse(template.LIST);
        const masterSizes = await SizeChartMod.findAll({
            where: { SIZE_ID: { [Op.in]: list } },
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template retrieved successfully",
            data: {
                ...template.toJSON(),
                LIST: masterSizes,
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
        const { id } = req.params;
        const { DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, LIST } = req.body;

        const template = await SizeChartTemplateModel.findOne({ where: { ID: id } });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }


        await template.update({
            DESCRIPTION,
            CUSTOMER_ID,
            ITEM_CATEGORY_ID,
            LIST: JSON.stringify(LIST),
        });

        await SizeChartMod.findAll({
            where: { SIZE_ID: { [Op.in]: LIST } },
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
        const { id } = req.params;

        const template = await SizeChartTemplateModel.findOne({ where: { ID: id } });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }

        await template.destroy();

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