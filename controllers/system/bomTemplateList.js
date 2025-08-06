import BomTemplateListModel from "../../models/system/bomTemplateList.mod.js";

export const createBomTemplateList = async (req, res) => {
    try {
        const {
            BOM_TEMPLATE_LINE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            NOTE,
            IS_SPLIT_STATUS,
            CREATED_ID,
        } = req.body;

        if (!BOM_TEMPLATE_LINE_ID || !STATUS) {
            return res.status(400).json({
                success: false,
                message: "BOM_TEMPLATE_LINE_ID and STATUS are required",
            });
        }

        const list = await BomTemplateListModel.create({
            BOM_TEMPLATE_LINE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            NOTE,
            IS_SPLIT_STATUS,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "BOM template list created successfully",
            data: list,
        });
    } catch (error) {
        console.error("Error creating BOM template list:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template list: ${error.message}`,
        });
    }
};

export const getAllBomTemplateLists = async (req, res) => {
    try {
        const lists = await BomTemplateListModel.findAll({
            where: { IS_DELETED: false },
        });

        return res.status(200).json({
            success: true,
            message: "BOM template lists retrieved successfully",
            lists,
        });
    } catch (error) {
        console.error("Error retrieving BOM template lists:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template lists: ${error.message}`,
        });
    }
};

export const getBomTemplateListById = async (req, res) => {
    try {
        const { id } = req.params;

        const list = await BomTemplateListModel.findOne({
            where: { id, IS_DELETED: false },
        });

        if (!list) {
            return res.status(404).json({
                success: false,
                message: "BOM template list not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM template list retrieved successfully",
            list,
        });
    } catch (error) {
        console.error("Error retrieving BOM template list:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template list: ${error.message}`,
        });
    }
};

export const updateBomTemplateList = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            BOM_TEMPLATE_LINE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            NOTE,
            IS_SPLIT_STATUS,
            UPDATED_ID,
        } = req.body;

        const list = await BomTemplateListModel.findOne({
            where: { id, IS_DELETED: false },
        });

        if (!list) {
            return res.status(404).json({
                success: false,
                message: "BOM template list not found",
            });
        }

        await list.update({
            BOM_TEMPLATE_LINE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            NOTE,
            IS_SPLIT_STATUS,
            UPDATED_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM template list updated successfully",
        });
    } catch (error) {
        console.error("Error updating BOM template list:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM template list: ${error.message}`,
        });
    }
};

export const deleteBomTemplateList = async (req, res) => {
    try {
        const { id } = req.params;

        const list = await BomTemplateListModel.findOne({
            where: { id },
        });

        if (!list) {
            return res.status(404).json({
                success: false,
                message: "BOM template list not found",
            });
        }

        await list.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM template list deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting BOM template list:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM template list: ${error.message}`,
        });
    }
};