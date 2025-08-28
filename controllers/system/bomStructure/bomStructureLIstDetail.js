import {BomStructureListDetailModel} from "../../../models/system/bomStructure.mod.js";
import BomTemplateListModel from "../../../models/system/bomTemplateList.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import {OrderPoListing} from "../../../models/production/order.mod.js";

export const getAllBomStructureListDetails = async (req, res) => {
    const { BOM_STRUCTURE_LIST_ID, ITEM_DIMENSION_ID, SIZE_ID, COLOR_ID, ORDER_PO_ID } = req.query;
    const whereCondition = { IS_DELETED: false };

    if (BOM_STRUCTURE_LIST_ID) whereCondition.BOM_STRUCTURE_LIST_ID = BOM_STRUCTURE_LIST_ID;
    if (ITEM_DIMENSION_ID) whereCondition.ITEM_DIMENSION_ID = ITEM_DIMENSION_ID;
    if (SIZE_ID) whereCondition.SIZE_ID = SIZE_ID;
    if (COLOR_ID) whereCondition.COLOR_ID = COLOR_ID;
    if (ORDER_PO_ID) whereCondition.ORDER_PO_ID = ORDER_PO_ID;

    try {
        const details = await BomStructureListDetailModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: BomTemplateListModel,
                    as: "ITEM_DIMENSION",
                    attributes: ["ID", "ITEM_CODE", "DESCRIPTION"],
                },
                {
                    model: SizeChartMod,
                    as: "SIZE",
                    attributes: ["ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                },
                {
                    model: ColorChartMod,
                    as: "COLOR",
                    attributes: ["ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                },
                {
                    model: OrderPoListing,
                    as: "ORDER_PO",
                    attributes: ["ORDER_PO_ID", "PO_NUMBER"],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "BOM Structure List Details retrieved successfully",
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM list details: ${error.message}`,
        });
    }
};

export const getBomStructureListDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        const detail = await BomStructureListDetailModel.findByPk(id, {
            where: { IS_DELETED: false },
            include: [
                { model: BomTemplateListModel, as: "ITEM_DIMENSION" },
                { model: SizeChartMod, as: "SIZE" },
                { model: ColorChartMod, as: "COLOR" },
                { model: OrderPoListing, as: "ORDER_PO" },
            ],
        });

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "BOM Structure List Detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM Structure List Detail retrieved successfully",
            data: detail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve detail: ${error.message}`,
        });
    }
};

export const createBomStructureListDetail = async (req, res) => {
    const {
        BOM_STRUCTURE_LIST_ID,
        ITEM_SPLIT_ID,
        ITEM_DIMENSION_ID,
        SIZE_ID,
        COLOR_ID,
        ORDER_PO_ID,
        EXTRA_BOOKING = 0,
        MATERIAL_ITEM_REQUIREMENT_QTY = 0,
        TOTAL_EXTRA_PURCHASE_PLAN_PERCENT = 0,
        BOOKING_APPROVAL_STATUS = false,
        EXTRA_APPROVAL_ID,
    } = req.body;

    try {

        await BomStructureListDetailModel.create({
            BOM_STRUCTURE_LIST_ID,
            ITEM_SPLIT_ID,
            ITEM_DIMENSION_ID,
            SIZE_ID,
            COLOR_ID,
            ORDER_PO_ID,
            EXTRA_BOOKING,
            MATERIAL_ITEM_REQUIREMENT_QTY,
            TOTAL_EXTRA_PURCHASE_PLAN_PERCENT,
            BOOKING_APPROVAL_STATUS,
            EXTRA_APPROVAL_ID,
            IS_DELETED: false,
        });

        return res.status(201).json({
            success: true,
            message: "BOM Structure List Detail created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create detail: ${error.message}`,
        });
    }
};

export const updateBomStructureListDetail = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const [updated] = await BomStructureListDetailModel.update(updateData, {
            where: { ID: id, IS_DELETED: false },
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Detail not found or already deleted",
            });
        }

        const updatedDetail = await BomStructureListDetailModel.findByPk(id);
        return res.status(200).json({
            success: true,
            message: "Detail updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update detail: ${error.message}`,
        });
    }
};

export const deleteBomStructureListDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const [deleted] = await BomStructureListDetailModel.update(
            {
                IS_DELETED: true,
                DELETED_AT: new Date(),
            },
            { where: { ID: id, IS_DELETED: false } }
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail soft deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete detail: ${error.message}`,
        });
    }
};