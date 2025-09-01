import MasterExtraPurchaseLimit from "../../models/system/masterPurchaseLimit.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";

export const getAllExtraPurchaseLimits = async (req, res) => {
    const {ITEM_TYPE_ID} = req.query;
    const where = {};

    if (ITEM_TYPE_ID) where.ITEM_TYPE_ID = ITEM_TYPE_ID;

    try {
        const limits = await MasterExtraPurchaseLimit.findAll({
            where,
            include: [
                {
                    model: MasterItemTypes,
                    as: "ITEM_TYPE",
                    attributes: ["ITEM_TYPE_ID", "ITEM_TYPE_CODE", "ITEM_TYPE_DESCRIPTION"],
                    required: false
                }
            ],
            order: [["ID", "ASC"]]
        });

        return res.status(200).json({
            success: true,
            message: "Data limit pembelian tambahan berhasil diambil",
            data: limits,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data limit pembelian tambahan: ${error.message}`,
        });
    }
};

export const getExtraPurchaseLimitById = async (req, res) => {
    const {id} = req.params;

    try {
        const limit = await MasterExtraPurchaseLimit.findByPk(id, {
            include: [
                {
                    model: MasterItemTypes,
                    as: "ITEM_TYPE",
                    attributes: ["ITEM_TYPE_ID", "ITEM_TYPE_CODE", "ITEM_TYPE_DESCRIPTION"]
                }
            ]
        });

        if (!limit) return res.status(404).json({
            success: false,
            message: "Limit pembelian tambahan tidak ditemukan",
        });

        return res.status(200).json({
            success: true,
            message: "Limit pembelian tambahan berhasil diambil",
            data: limit,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil limit: ${error.message}`,
        });
    }
};


export const createExtraPurchaseLimit = async (req, res) => {
    const {ITEM_TYPE_ID, EXTRA_PURCHASING_LIMIT} = req.body;

    if (!ITEM_TYPE_ID) {
        return res.status(400).json({
            success: false,
            message: "ITEM_TYPE_ID wajib diisi",
        });
    }

    const parsedLimit = Number(EXTRA_PURCHASING_LIMIT) || 0;

    try {
        const itemType = await MasterItemTypes.findByPk(ITEM_TYPE_ID);
        if (!itemType) return res.status(400).json({
            success: false,
            message: "ITEM_TYPE_ID tidak valid atau tidak ditemukan",
        });

        const existing = await MasterExtraPurchaseLimit.findOne({
            where: {ITEM_TYPE_ID}
        });

        if (existing) return res.status(400).json({
            success: false,
            message: `Limit untuk ITEM_TYPE_ID ${ITEM_TYPE_ID} sudah ada. Gunakan PUT untuk update.`,
        });

        await MasterExtraPurchaseLimit.create({
            ITEM_TYPE_ID,
            EXTRA_PURCHASING_LIMIT: parsedLimit
        });

        return res.status(201).json({
            success: true,
            message: "Limit pembelian tambahan berhasil dibuat",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal membuat limit: ${error.message}`,
        });
    }
};

export const updateExtraPurchaseLimit = async (req, res) => {
    const {id} = req.params;
    const {EXTRA_PURCHASING_LIMIT} = req.body;

    try {
        const limit = await MasterExtraPurchaseLimit.findByPk(id);

        if (!limit) return res.status(404).json({
            success: false,
            message: "Limit tidak ditemukan",
        });

        const newLimitValue = EXTRA_PURCHASING_LIMIT !== undefined
            ? (Number(EXTRA_PURCHASING_LIMIT) || 0)
            : limit.EXTRA_PURCHASING_LIMIT;

        await limit.update({
            EXTRA_PURCHASING_LIMIT: newLimitValue
        });

        return res.status(200).json({
            success: true,
            message: "Limit pembelian tambahan berhasil diperbarui",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui limit: ${error.message}`,
        });
    }
};

export const deleteExtraPurchaseLimit = async (req, res) => {
    const {id} = req.params;

    try {
        const limit = await MasterExtraPurchaseLimit.findByPk(id);

        if (!limit) return res.status(404).json({
            success: false,
            message: "Limit tidak ditemukan",
        });

        await limit.destroy();

        return res.status(200).json({
            success: true,
            message: "Limit pembelian tambahan berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus limit: ${error.message}`,
        });
    }
};