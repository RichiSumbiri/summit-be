import {BomStructureListModel, BomStructureSourcingDetail} from "../../../models/system/bomStructure.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import {ModelOrderPOHeader} from "../../../models/orderManagement/orderManagement.mod.js";

export const getAllSourcingDetails = async (req, res) => {
    const { BOM_STRUCTURE_LINE_ID, ITEM_DIMENSION_ID, ORDER_PO_ID } = req.query;
    const where = {};

    if (BOM_STRUCTURE_LINE_ID) where.BOM_STRUCTURE_LINE_ID = BOM_STRUCTURE_LINE_ID;
    if (ITEM_DIMENSION_ID) where.ITEM_DIMENSION_ID = ITEM_DIMENSION_ID;
    if (ORDER_PO_ID) where.ORDER_PO_ID = ORDER_PO_ID;

    try {
        const details = await BomStructureSourcingDetail.findAll({ where, include: [
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION"
                },
                {
                    model: ModelOrderPOHeader,
                    as: "ORDER_PO"
                },
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LINE"
                },
            ] });

        return res.status(200).json({
            success: true,
            message: "Data sourcing detail berhasil diambil",
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data sourcing detail: ${error.message}`,
        });
    }
};

export const getSourcingDetailById = async (req, res) => {
    const { id } = req.params;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(id);

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sourcing detail berhasil diambil",
            data: detail
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil sourcing detail: ${error.message}`,
        });
    }
};

export const createSourcingDetail = async (req, res) => {
    const {
        BOM_STRUCTURE_LINE_ID,
        ITEM_DIMENSION_ID,
        ORDER_PO_ID,
        COST_PER_ITEM = 0,
        FINANCE_COST = 0,
        FREIGHT_COST = 0,
        OTHER_COST = 0,
        NOTE,
        APPROVE_PURCHASE_QUANTITY = 0,
        PLAN_CURRENT_QUANTITY = 0
    } = req.body;

    try {
        if (!BOM_STRUCTURE_LINE_ID || !ITEM_DIMENSION_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_STRUCTURE_LINE_ID dan ITEM_DIMENSION_ID wajib diisi",
            });
        }

        const newDetail = await BomStructureSourcingDetail.create({
            BOM_STRUCTURE_LINE_ID,
            ITEM_DIMENSION_ID,
            ORDER_PO_ID: ORDER_PO_ID || null,
            COST_PER_ITEM,
            FINANCE_COST,
            FREIGHT_COST,
            OTHER_COST,
            NOTE: NOTE || null,
            APPROVE_PURCHASE_QUANTITY,
            PLAN_CURRENT_QUANTITY
        });

        return res.status(201).json({
            success: true,
            message: "Sourcing detail berhasil dibuat",
            newDetail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal membuat sourcing detail: ${error.message}`,
        });
    }
};

export const updateSourcingDetail = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(id);

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail tidak ditemukan",
            });
        }

        await detail.update({
            ...updateData,
            COST_PER_ITEM: updateData.COST_PER_ITEM !== undefined ? updateData.COST_PER_ITEM : detail.COST_PER_ITEM,
            FINANCE_COST: updateData.FINANCE_COST !== undefined ? updateData.FINANCE_COST : detail.FINANCE_COST,
            FREIGHT_COST: updateData.FREIGHT_COST !== undefined ? updateData.FREIGHT_COST : detail.FREIGHT_COST,
            OTHER_COST: updateData.OTHER_COST !== undefined ? updateData.OTHER_COST : detail.OTHER_COST,
            APPROVE_PURCHASE_QUANTITY: updateData.APPROVE_PURCHASE_QUANTITY !== undefined ? updateData.APPROVE_PURCHASE_QUANTITY : detail.APPROVE_PURCHASE_QUANTITY,
            PLAN_CURRENT_QUANTITY: updateData.PLAN_CURRENT_QUANTITY !== undefined ? updateData.PLAN_CURRENT_QUANTITY : detail.PLAN_CURRENT_QUANTITY,
        });

        return res.status(200).json({
            success: true,
            message: "Sourcing detail berhasil diperbarui",
            detail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui sourcing detail: ${error.message}`,
        });
    }
};

export const deleteSourcingDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(id);

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail tidak ditemukan",
            });
        }

        await detail.destroy();

        return res.status(200).json({
            success: true,
            message: "Sourcing detail berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus sourcing detail: ${error.message}`,
        });
    }
};