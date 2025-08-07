import BomTemplateListModel from "../../models/system/bomTemplateList.mod.js";
import BomTemplateModel from "../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import {ModelVendorDetail} from "../../models/system/VendorDetail.mod.js";

export const createBomTemplateList = async (req, res) => {
    try {
        const {
            BOM_TEMPLATE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            NOTE,
            MASTER_ITEM_ID,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            CREATED_ID,
        } = req.body;

        if (!BOM_TEMPLATE_ID || !STATUS) {
            return res.status(400).json({
                success: false,
                message: "BOM_TEMPLATE_ID and STATUS are required",
            });
        }

        const lastEntry = await BomTemplateListModel.findOne({
            where: {BOM_TEMPLATE_ID},
            order: [["BOM_TEMPLATE_LINE_ID", "DESC"]],
        });

        const BOM_TEMPLATE_LINE_ID = lastEntry ? lastEntry.BOM_TEMPLATE_LINE_ID + 1 : 1;

        await BomTemplateListModel.create({
            BOM_TEMPLATE_ID,
            BOM_TEMPLATE_LINE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            VENDOR_ID,
            NOTE,
            CREATED_ID,
            MASTER_ITEM_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "BOM template list created successfully",
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
        const {BOM_TEMPLATE_ID} = req.query;

        const whereCondition = {};
        if (BOM_TEMPLATE_ID) {
            whereCondition.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID;
        }

        const lists = await BomTemplateListModel.findAll({
            where: {
                ...whereCondition,
                IS_DELETED: false,
            },
            include: [{
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ['ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_UOM_BASE'],
                include: [
                    {
                        model: MasterItemGroup,
                        as: "ITEM_GROUP",
                        attributes: ['ITEM_GROUP_CODE']
                    },
                    {
                        model: MasterItemTypes,
                        as: "ITEM_TYPE",
                        attributes: ['ITEM_TYPE_CODE']
                    },
                    {
                        model: MasterItemCategories,
                        as: "ITEM_CATEGORY",
                        attributes: ['ITEM_CATEGORY_CODE']
                    },
                ]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }],
        });

        return res.status(200).json({
            success: true,
            message: "BOM template lists retrieved successfully",
            data: lists,
        });
    } catch (error) {
        console.error("Error retrieving BOM template lists:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template lists: ${error.message}`,
        });
    }
};

export const cloneBomTemplateList = async (req, res) => {
    try {
        const { id } = req.params;
        const {USER_ID} = req.body
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required",
            });
        }

        if (!USER_ID) {
            return res.status(400).json({
                success: false,
                message: "USER_ID is required",
            });
        }

        const originalEntry = await BomTemplateListModel.findOne({
            where: { ID: id },
        });

        if (!originalEntry) {
            return res.status(404).json({
                success: false,
                message: "Original BOM template list not found",
            });
        }

        const lastEntry = await BomTemplateListModel.findOne({
            where: { BOM_TEMPLATE_ID: originalEntry.BOM_TEMPLATE_ID },
            order: [["BOM_TEMPLATE_LINE_ID", "DESC"]],
        });

        const BOM_TEMPLATE_LINE_ID = lastEntry ? lastEntry.BOM_TEMPLATE_LINE_ID + 1 : 1;

        await BomTemplateListModel.create({
            BOM_TEMPLATE_ID: originalEntry.BOM_TEMPLATE_ID,
            BOM_TEMPLATE_LINE_ID,
            STATUS: originalEntry.STATUS,
            COSTING_CONSUMER_PER_ITEM: originalEntry.COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM: originalEntry.INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR: originalEntry.IS_SPLIT_COLOR,
            IS_SPLIT_SIZE: originalEntry.IS_SPLIT_SIZE,
            IS_SPLIT_STATUS: originalEntry.IS_SPLIT_STATUS,
            ITEM_POSITION: originalEntry.ITEM_POSITION,
            VENDOR_ID: originalEntry.VENDOR_ID,
            NOTE: originalEntry.NOTE,
            MASTER_ITEM_ID: originalEntry.MASTER_ITEM_ID,
            CREATED_ID: USER_ID,
            UPDATED_ID: null,
            UPDATED_AT: null,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "BOM template list cloned successfully",
        });
    } catch (error) {
        console.error("Error cloning BOM template list:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to clone BOM template list: ${error.message}`,
        });
    }
};

export const getBomTemplateListById = async (req, res) => {
    try {
        const {id} = req.params;

        const list = await BomTemplateListModel.findOne({
            where: {ID: id, IS_DELETED: false},
            include: [{
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ['ITEM_ID', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_UOM_BASE'],
                include: [
                    {
                        model: MasterItemGroup,
                        as: "ITEM_GROUP",
                        attributes: ['ITEM_GROUP_CODE']
                    },
                    {
                        model: MasterItemTypes,
                        as: "ITEM_TYPE",
                        attributes: ['ITEM_TYPE_CODE']
                    },
                    {
                        model: MasterItemCategories,
                        as: "ITEM_CATEGORY",
                        attributes: ['ITEM_CATEGORY_CODE']
                    },
                ]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }],
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
            data: list,
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
        const {id} = req.params;
        const {
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            MASTER_ITEM_ID,
            NOTE,
            UPDATED_ID,
        } = req.body;

        const list = await BomTemplateListModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!list) {
            return res.status(404).json({
                success: false,
                message: "BOM template list not found",
            });
        }

        await list.update({
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            MASTER_ITEM_ID,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            VENDOR_ID,
            NOTE,
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
        const {id} = req.params;

        const list = await BomTemplateListModel.findOne({
            where: {ID: id},
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