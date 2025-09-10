import {BomStructureSourcingDetailHistory} from "../../../models/system/bomStructure.mod.js";
import Users from "../../../models/setup/users.mod.js";
export const createSourcingDetailHistory = async (req, res) => {
    const { PURCHASE_QTY, NOTE, TYPE, BOM_STRUCTURE_SOURCING_DETAIL_ID, CREATED_ID } = req.body;

    try {
        if (!TYPE || !BOM_STRUCTURE_SOURCING_DETAIL_ID || CREATED_ID === undefined) {
            return res.status(400).json({
                success: false,
                message: "TYPE, BOM_STRUCTURE_SOURCING_DETAIL_ID, and CREATED_ID are required",
            });
        }

        const newHistory = await BomStructureSourcingDetailHistory.create({
            PURCHASE_QTY: PURCHASE_QTY || null,
            NOTE: NOTE || null,
            TYPE,
            BOM_STRUCTURE_SOURCING_DETAIL_ID,
            CREATED_ID
        });

        return res.status(201).json({
            success: true,
            message: "Sourcing detail history created successfully",
            data: newHistory,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to create sourcing detail history: ${err.message}`,
        });
    }
};

export const getAllSourcingDetailHistories = async (req, res) => {
    const { TYPE, BOM_STRUCTURE_SOURCING_DETAIL_ID } = req.query;
    const where = {};

    if (TYPE) where.TYPE = TYPE;
    if (BOM_STRUCTURE_SOURCING_DETAIL_ID) where.BOM_STRUCTURE_SOURCING_DETAIL_ID = BOM_STRUCTURE_SOURCING_DETAIL_ID;

    try {
        const histories = await BomStructureSourcingDetailHistory.findAll({
            where,
            include: [{
               model: Users,
               as: "CREATED",
               attributes: ["USER_NAME"]
            }],
        });

        return res.status(200).json({
            success: true,
            message: "Sourcing detail histories retrieved successfully",
            data: histories,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sourcing detail histories: ${err.message}`,
        });
    }
};

export const getSourcingDetailHistoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const history = await BomStructureSourcingDetailHistory.findByPk(id);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail history not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sourcing detail history retrieved successfully",
            data: history,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sourcing detail history: ${err.message}`,
        });
    }
};

export const updateSourcingDetailHistory = async (req, res) => {
    const { id } = req.params;
    const { PURCHASE_QTY, NOTE, TYPE, BOM_STRUCTURE_SOURCING_DETAIL_ID, CREATED_ID } = req.body;

    try {
        const history = await BomStructureSourcingDetailHistory.findByPk(id);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail history not found",
            });
        }

        await history.update({
            PURCHASE_QTY: PURCHASE_QTY !== undefined ? PURCHASE_QTY : history.PURCHASE_QTY,
            NOTE: NOTE || null,
            TYPE: TYPE !== undefined ? TYPE : history.TYPE,
            BOM_STRUCTURE_SOURCING_DETAIL_ID: BOM_STRUCTURE_SOURCING_DETAIL_ID !== undefined
                ? BOM_STRUCTURE_SOURCING_DETAIL_ID
                : history.BOM_STRUCTURE_SOURCING_DETAIL_ID,
            CREATED_ID: CREATED_ID !== undefined ? CREATED_ID : history.CREATED_ID,
        });

        return res.status(200).json({
            success: true,
            message: "Sourcing detail history updated successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to update sourcing detail history: ${err.message}`,
        });
    }
};

export const deleteSourcingDetailHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const history = await BomStructureSourcingDetailHistory.findByPk(id);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail history not found",
            });
        }

        await history.destroy();
        return res.status(200).json({
            success: true,
            message: "Sourcing detail history deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete sourcing detail history: ${err.message}`,
        });
    }
};