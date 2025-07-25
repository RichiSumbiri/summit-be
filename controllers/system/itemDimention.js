import { Op } from "sequelize";
import ItemDimensionModel from "../../models/system/itemDimention.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import ColorChartMod from "../../models/system/colorChart.mod.js";


export const createItemDimension = async (req, res) => {
    try {
        const {
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_1,
            LATEST_PURCHASE_2,
            LATEST_PURCHASE_3,
            LATEST_PURCHASE_4,
            LATEST_PURCHASE_5,
            CREATE_BY,
        } = req.body;


        if (!MASTER_ITEM_ID) {
            return res.status(400).json({
                success: false,
                message: "MASTER_ITEM_ID is required",
            });
        }


        const newItemDimension = await ItemDimensionModel.create({
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_1,
            LATEST_PURCHASE_2,
            LATEST_PURCHASE_3,
            LATEST_PURCHASE_4,
            LATEST_PURCHASE_5,
            CREATE_BY,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Item dimension created successfully",
            newItemDimension,
        });
    } catch (error) {
        console.error("Error creating item dimension:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create item dimension: ${error.message}`,
        });
    }
};


export const getAllItemDimensions = async (req, res) => {
    try {
        const { masterItemId, isActive } = req.query;

        const whereCondition = {};
        if (masterItemId) {
            whereCondition.MASTER_ITEM_ID = masterItemId;
        }
        if (isActive) {
            whereCondition.IS_ACTIVE = isActive;
        }

        const itemDimensions = await ItemDimensionModel.findAll({
            where: {IS_DELETE: false, ...whereCondition},
            include: [
                {
                    model: SizeChartMod,
                    as: "MASTER_SIZE",
                    attributes: ['SIZE_ID', 'SIZE_CODE', 'SIZE_DESCRIPTION']
                },
                {
                    model: ColorChartMod,
                    as: "MASTER_COLOR",
                    attributes: ['COLOR_ID', 'COLOR_CODE', 'COLOR_DESCRIPTION']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Item dimensions retrieved successfully",
            itemDimensions,
        });
    } catch (error) {
        console.error("Error retrieving item dimensions:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve item dimensions: ${error.message}`,
        });
    }
};


export const getItemDimensionById = async (req, res) => {
    try {
        const { id } = req.params;

        const itemDimension = await ItemDimensionModel.findOne({
            where: { ID: id },
        });

        if (!itemDimension) {
            return res.status(404).json({
                success: false,
                message: "Item dimension not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item dimension retrieved successfully",
            itemDimension,
        });
    } catch (error) {
        console.error("Error retrieving item dimension:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve item dimension: ${error.message}`,
        });
    }
};


export const updateItemDimension = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_1,
            LATEST_PURCHASE_2,
            LATEST_PURCHASE_3,
            LATEST_PURCHASE_4,
            LATEST_PURCHASE_5,
            UPDATE_BY,
        } = req.body;

        const itemDimension = await ItemDimensionModel.findOne({
            where: { ID: id },
        });

        if (!itemDimension) {
            return res.status(404).json({
                success: false,
                message: "Item dimension not found",
            });
        }


        await itemDimension.update({
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_1,
            LATEST_PURCHASE_2,
            LATEST_PURCHASE_3,
            LATEST_PURCHASE_4,
            LATEST_PURCHASE_5,
            UPDATE_BY,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Item dimension updated successfully",
            itemDimension,
        });
    } catch (error) {
        console.error("Error updating item dimension:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update item dimension: ${error.message}`,
        });
    }
};


export const deleteItemDimension = async (req, res) => {
    try {
        const { id } = req.params;

        const itemDimension = await ItemDimensionModel.findByPk(id);

        if (!itemDimension) {
            return res.status(404).json({
                success: false,
                message: "Item dimension not found",
            });
        }


        itemDimension.update({
            IS_DELETE: true,
            DELETED_AT: new Date()
        })

        return res.status(200).json({
            success: true,
            message: "Item dimension deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting item dimension:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete item dimension: ${error.message}`,
        });
    }
};