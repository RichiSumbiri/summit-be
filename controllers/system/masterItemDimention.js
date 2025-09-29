import { Op } from "sequelize";
import MasterItemDimensionModel from "../../models/system/masterItemDimention.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import ColorChartMod from "../../models/system/colorChart.mod.js";


export const createMasterItemDimension = async (req, res) => {
    try {
        const {
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_PRICE,
            LATEST_PURCHASE_CURRENCY,
            LATEST_PURCHASE_VENDOR,
            LATEST_PURCHASE_DATE,
            AVERAGE_PURCHASE_PRICE,
            CREATE_BY,
        } = req.body;


        if (!MASTER_ITEM_ID) {
            return res.status(400).json({
                success: false,
                message: "Master Item is required",
            });
        }


        const getLastID = await MasterItemDimensionModel.findOne({
            where: {
                MASTER_ITEM_ID,
                [Op.and]: [
                    { COLOR_ID: { [Op.not]: null } },
                    { COLOR_ID: { [Op.ne]: "" } },
                ],
            },
            order: [['DIMENSION_ID', 'DESC']],
            raw: true
        });

        const newID = getLastID ? Number(getLastID.DIMENSION_ID)+1 : 0;
        const existItemDimension = await  MasterItemDimensionModel.findOne({
            where: {COLOR_ID, SIZE_ID, MASTER_ITEM_ID, IS_DELETED: false}
        })

        if (existItemDimension) {
            return res.status(400).json({
                status: false,
                message: `Skipping addition: COLOR ${COLOR_ID}, SIZE ${SIZE_ID} already exists`,
            })
        }

        const newItemDimension = await MasterItemDimensionModel.create({
            DIMENSION_ID: newID,
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_PRICE,
            LATEST_PURCHASE_CURRENCY,
            LATEST_PURCHASE_VENDOR,
            LATEST_PURCHASE_DATE,
            AVERAGE_PURCHASE_PRICE,
            CREATE_BY,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Item dimension created successfully",
            newItemDimension,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create item dimension: ${error.message}`,
        });
    }
};


export const getAllMasterItemDimensions = async (req, res) => {
    try {
        const { masterItemId, IS_FILTER, isActive = '' } = req.query;

        const whereCondition = {};
        if (masterItemId) {
            whereCondition.MASTER_ITEM_ID = masterItemId;
        }
        if (isActive !== '') {
            whereCondition.IS_ACTIVE = isActive;
        }

        const attributes = IS_FILTER ? ["ID", "DIMENSION_ID", "SERIAL_NO"] : undefined;

        const itemDimensions = await MasterItemDimensionModel.findAll({
            where: {IS_DELETED: false, ...whereCondition},
            attributes,
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
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve item dimensions: ${error.message}`,
        });
    }
};


export const getMasterItemDimensionById = async (req, res) => {
    try {
        const { id } = req.params;

        const itemDimension = await MasterItemDimensionModel.findOne({
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
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve item dimension: ${error.message}`,
        });
    }
};


export const updateMasterItemDimension = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            MASTER_ITEM_ID,
            COLOR_ID,
            SIZE_ID,
            SERIAL_NO,
            IS_ACTIVE,
            LATEST_PURCHASE_PRICE,
            LATEST_PURCHASE_CURRENCY,
            LATEST_PURCHASE_VENDOR,
            LATEST_PURCHASE_DATE,
            AVERAGE_PURCHASE_PRICE,
            UPDATE_BY,
        } = req.body;

        const itemDimension = await MasterItemDimensionModel.findOne({
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
            LATEST_PURCHASE_PRICE,
            LATEST_PURCHASE_CURRENCY,
            LATEST_PURCHASE_VENDOR,
            LATEST_PURCHASE_DATE,
            AVERAGE_PURCHASE_PRICE,
            UPDATE_BY,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Item dimension updated successfully",
            itemDimension,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update item dimension: ${error.message}`,
        });
    }
};


export const deleteMasterItemDimension = async (req, res) => {
    try {
        const { id } = req.params;

        const itemDimension = await MasterItemDimensionModel.findByPk(id);

        if (!itemDimension) {
            return res.status(404).json({
                success: false,
                message: "Item dimension not found",
            });
        }


        itemDimension.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        })

        return res.status(200).json({
            success: true,
            message: "Item dimension deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete item dimension: ${error.message}`,
        });
    }
};