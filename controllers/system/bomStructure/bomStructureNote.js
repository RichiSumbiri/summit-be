import BomStructureModel, {BomStructureNoteModel} from "../../../models/system/bomStructure.mod.js";

export const getAllBomStructureNotes = async (req, res) => {
    const { BOM_STRUCTURE_ID, REV_ID } = req.query;
    const whereCondition = {};

    if (BOM_STRUCTURE_ID) whereCondition.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
    if (REV_ID !== undefined) whereCondition.REV_ID = REV_ID;

    try {
        const notes = await BomStructureNoteModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "STATUS_STRUCTURE"],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "BOM Structure Notes retrieved successfully",
            data: notes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM notes: ${error.message}`,
        });
    }
};

export const getBomStructureNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await BomStructureNoteModel.findByPk(id, {
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "STATUS_STRUCTURE"],
                },
            ],
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "BOM Structure Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM Structure Note retrieved successfully",
            data: note,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM note: ${error.message}`,
        });
    }
};

export const createBomStructureNote = async (req, res) => {
    const { NOTE, BOM_STRUCTURE_ID, REV_ID = 0 } = req.body;

    try {
        if (!NOTE || !BOM_STRUCTURE_ID) {
            return res.status(400).json({
                success: false,
                message: "NOTE and BOM_STRUCTURE_ID are required",
            });
        }

        const exists = await BomStructureModel.findByPk(BOM_STRUCTURE_ID);
        if (!exists) {
            return res.status(400).json({
                success: false,
                message: "Invalid BOM_STRUCTURE_ID",
            });
        }

        await BomStructureNoteModel.create({
            NOTE,
            BOM_STRUCTURE_ID,
            REV_ID,
        });

        return res.status(201).json({
            success: true,
            message: "BOM Structure Note created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM note: ${error.message}`,
        });
    }
};

export const updateBomStructureNote = async (req, res) => {
    const { id } = req.params;
    const { NOTE, REV_ID } = req.body;

    try {
        const [updated] = await BomStructureNoteModel.update(
            { NOTE, REV_ID },
            { where: { ID: id } }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "BOM Structure Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM Structure Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM note: ${error.message}`,
        });
    }
};

export const deleteBomStructureNote = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await BomStructureNoteModel.destroy({ where: { ID: id } });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "BOM Structure Note not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM Structure Note deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM note: ${error.message}`,
        });
    }
};