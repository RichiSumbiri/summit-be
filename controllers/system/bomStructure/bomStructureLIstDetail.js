import {BomStructureListDetailModel, BomStructureListModel} from "../../../models/system/bomStructure.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";

export const getAllBomStructureListDetails = async (req, res) => {
    const { BOM_STRUCTURE_LIST_ID, ITEM_DIMENSION_ID, COLOR_ID, SIZE_ID } = req.query;
    const where = {};

    if (BOM_STRUCTURE_LIST_ID) where.BOM_STRUCTURE_LIST_ID = BOM_STRUCTURE_LIST_ID;
    if (ITEM_DIMENSION_ID) where.ITEM_DIMENSION_ID = ITEM_DIMENSION_ID;
    if (COLOR_ID) where.COLOR_ID = COLOR_ID;
    if (SIZE_ID) where.SIZE_ID = SIZE_ID;

    try {
        const details = await BomStructureListDetailModel.findAll({
            where,
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "MASTER_ITEM_ID", "STATUS"],
                },
                {
                    model: ColorChartMod,
                    as: "COLOR",
                    attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                },
                {
                    model: SizeChartMod,
                    as: "SIZE",
                    attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                },
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION",
                    attributes: ["ID", "SERIAL_NO", "MASTER_ITEM_ID"],
                }
            ],
            order: [['ID', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: "Detail BOM Structure List berhasil diambil",
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data: ${error.message}`,
        });
    }
};

export const getBomStructureListDetailById = async (req, res) => {
    const { id } = req.params;

    try {
        const detail = await BomStructureListDetailModel.findByPk(id, {
            include: [
                { model: BomStructureListModel, as: "BOM_STRUCTURE_LIST" },
                { model: ColorChartMod, as: "COLOR" },
                { model: SizeChartMod, as: "SIZE" },
                { model: MasterItemDimensionModel, as: "ITEM_DIMENSION" },
            ]
        });

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Detail tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail berhasil diambil",
            data: detail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil detail: ${error.message}`,
        });
    }
};

export const createBomStructureListDetail = async (req, res) => {
    const {
        BOM_STRUCTURE_LIST_ID,
        ITEM_SPLIT_ID,
        ORDER_PO_ID,
        COLOR_ID,
        SIZE_ID,
        ITEM_DIMENSION_ID,
        ORDER_QUANTITY,
        STANDARD_CONSUMPTION_PER_ITEM,
        INTERNAL_CONSUMPTION_PER_ITEM,
        BOOKING_CONSUMPTION_PER_ITEM,
        PRODUCTION_CONSUMPTION_PER_ITEM,
        EXTRA_BOOKS,
        MATERIAL_ITEM_REQUIREMENT_QUANTITY,
        EXTRA_REQUIRE_QUANTITY,
        TOTAL_EXTRA_PURCHASE_PLAN,
        IS_BOOKING = true,
        EXTRA_APPROVAL_ID,
        CREATED_ID
    } = req.body;

    try {
        if (!BOM_STRUCTURE_LIST_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_STRUCTURE_LIST_ID wajib diisi",
            });
        }

        await BomStructureListDetailModel.create({
            BOM_STRUCTURE_LIST_ID,
            ITEM_SPLIT_ID,
            ORDER_PO_ID,
            COLOR_ID,
            SIZE_ID,
            ITEM_DIMENSION_ID,
            ORDER_QUANTITY,
            STANDARD_CONSUMPTION_PER_ITEM,
            INTERNAL_CONSUMPTION_PER_ITEM,
            BOOKING_CONSUMPTION_PER_ITEM,
            PRODUCTION_CONSUMPTION_PER_ITEM,
            EXTRA_BOOKS,
            MATERIAL_ITEM_REQUIREMENT_QUANTITY,
            EXTRA_REQUIRE_QUANTITY,
            TOTAL_EXTRA_PURCHASE_PLAN,
            IS_BOOKING,
            EXTRA_APPROVAL_ID,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Detail berhasil dibuat",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal membuat detail: ${error.message}`,
        });
    }
};

export const updateBomStructureListDetail = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const [updated] = await BomStructureListDetailModel.update(updateData, {
            where: { ID: id }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Detail tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail berhasil diperbarui",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui detail: ${error.message}`,
        });
    }
};

export const deleteBomStructureListDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await BomStructureListDetailModel.destroy({ where: { ID: id } });
        if (!deleted) return res.status(404).json({
            success: false,
            message: "Detail tidak ditemukan",
        });

        return res.status(200).json({
            success: true,
            message: "Detail berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus detail: ${error.message}`,
        });
    }
};