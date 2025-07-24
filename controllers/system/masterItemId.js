import { Op } from "sequelize";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";


export const createItem = async (req, res) => {
    try {
        const {
            ITEM_CODE,
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            CREATE_BY,
            UNIT_ID,
        } = req.body;

        
        if (!ITEM_CODE) {
            return res.status(400).json({
                success: false,
                message: "ITEM_CODE is required",
            });
        }

        
        const count = await MasterItemIdModel.count();
        const newItem = await MasterItemIdModel.create({
            ITEM_ID: `AFL${String(count + 1).padStart(7, "0")}`,
            ITEM_CODE,
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            CREATE_BY,
            UNIT_ID,
            CREATE_DATE: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Item created successfully",
            newItem,
        });
    } catch (error) {
        console.error("Error creating item:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create item: ${error.message}`,
        });
    }
};


export const getAllItems = async (req, res) => {
    try {
        const { unitId, search } = req.query;

        const whereCondition = {};
        if (unitId) {
            whereCondition.UNIT_ID = unitId; 
        }
        if (search) {
            whereCondition.ITEM_CODE = { [Op.like]: `%${search}%` }; 
        }

        const items = await MasterItemIdModel.findAll({
            where: whereCondition,
        });

        return res.status(200).json({
            success: true,
            message: "Items retrieved successfully",
            items,
        });
    } catch (error) {
        console.error("Error retrieving items:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve items: ${error.message}`,
        });
    }
};


export const getItemById = async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await MasterItemIdModel.findOne({
            where: { ITEM_ID: itemId },
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item retrieved successfully",
            item,
        });
    } catch (error) {
        console.error("Error retrieving item:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve item: ${error.message}`,
        });
    }
};


export const updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const {
            ITEM_CODE,
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            UPDATE_BY,
            UNIT_ID,
        } = req.body;

        const item = await MasterItemIdModel.findOne({
            where: { ITEM_ID: itemId },
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        
        await item.update({
            ITEM_CODE,
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            UPDATE_BY,
            UNIT_ID,
            UPDATE_DATE: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            item,
        });
    } catch (error) {
        console.error("Error updating item:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update item: ${error.message}`,
        });
    }
};


export const deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const item = await MasterItemIdModel.findOne({
            where: { ITEM_ID: itemId },
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        
        await item.destroy();

        return res.status(200).json({
            success: true,
            message: "Item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting item:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete item: ${error.message}`,
        });
    }
};