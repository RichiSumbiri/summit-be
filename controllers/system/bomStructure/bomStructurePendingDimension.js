import {BomStructureListModel, BomStructurePendingDimension} from "../../../models/system/bomStructure.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import {OrderPoListing} from "../../../models/production/order.mod.js";

export const getAllPendingDimensions = async (req, res) => {
    const { BOM_STRUCTURE_LIST_ID, SIZE_ID, COLOR_ID, ORDER_PO_ID } = req.query;
    const whereCondition = {};

    if (BOM_STRUCTURE_LIST_ID) whereCondition.BOM_STRUCTURE_LIST_ID = BOM_STRUCTURE_LIST_ID;
    if (SIZE_ID) whereCondition.SIZE_ID = SIZE_ID;
    if (COLOR_ID) whereCondition.COLOR_ID = COLOR_ID;
    if (ORDER_PO_ID) whereCondition.ORDER_PO_ID = ORDER_PO_ID;

    try {
        const dimensions = await BomStructurePendingDimension.findAll({
            where: whereCondition,
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "MASTER_ITEM_ID", "STATUS"],
                },
                { model: SizeChartMod, as: "SIZE" },
                { model: ColorChartMod, as: "COLOR" },
                { model: OrderPoListing, as: "ORDER_PO" },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Pending Dimensions retrieved successfully",
            data: dimensions,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve pending dimensions: ${error.message}`,
        });
    }
};

export const getPendingDimensionById = async (req, res) => {
    try {
        const { id } = req.params;

        const dimension = await BomStructurePendingDimension.findByPk(id, {
            include: [
                { model: BomStructureListModel, as: "BOM_STRUCTURE_LIST" },
                { model: SizeChartMod, as: "SIZE" },
                { model: ColorChartMod, as: "COLOR" },
                { model: OrderPoListing, as: "ORDER_PO" },
            ],
        });

        if (!dimension) {
            return res.status(404).json({
                success: false,
                message: "Pending Dimension not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pending Dimension retrieved successfully",
            data: dimension,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve dimension: ${error.message}`,
        });
    }
};

export const createPendingDimension = async (req, res) => {
    const { BOM_STRUCTURE_LIST_ID, USER_ID } = req.body;

    try {
        if (!BOM_STRUCTURE_LIST_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_STRUCTURE_LIST_ID is required",
            });
        }

        const bomStructureList = await BomStructureListModel.ifnd(BOM_STRUCTURE_LIST_ID)

        if (!bomStructureList) {
            return res.status(400).json({
                success: false,
                message: "Bom Structure List not found",
            });
        }




        const newDimension = await BomStructurePendingDimension.create({
            BOM_STRUCTURE_LIST_ID,
            SIZE_ID,
            COLOR_ID,
            ORDER_PO_ID,
            EXTRA_BOOKING,
            MATERIAL_ITEM_REQUIREMENT_QTY,
            TOTAL_EXTRA_PURCHASE_PLAN_PERCENT,
            BOOKING_APPROVAL_STATUS,
            EXTRA_APPROVAL_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Pending Dimension created successfully",
            data: newDimension,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create pending dimension: ${error.message}`,
        });
    }
};

export const updatePendingDimension = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const [updated] = await BomStructurePendingDimension.update(
            { ...updateData, UPDATED_AT: new Date() },
            { where: { ID: id } }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Pending Dimension not found",
            });
        }

        const updatedDimension = await BomStructurePendingDimension.findByPk(id);
        return res.status(200).json({
            success: true,
            message: "Pending Dimension updated successfully",
            data: updatedDimension,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update pending dimension: ${error.message}`,
        });
    }
};

export const deletePendingDimension = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await BomStructurePendingDimension.destroy({ where: { ID: id } });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Pending Dimension not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pending Dimension deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete pending dimension: ${error.message}`,
        });
    }
};