import BomStructureModel, {BomStructureRevModel} from "../../../models/system/bomStructure.mod.js";
import Users from "../../../models/setup/users.mod.js";
import {Op} from "sequelize";

export const getAllBomStructureRevs = async (req, res) => {
    const { BOM_STRUCTURE_ID, SEQUENCE, TITLE } = req.query;
    const whereCondition = {};

    if (BOM_STRUCTURE_ID) whereCondition.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
    if (SEQUENCE !== undefined) whereCondition.SEQUENCE = parseInt(SEQUENCE);
    if (TITLE) whereCondition.TITLE = { [Op.like]: `%${TITLE}%` };

    try {
        const revs = await BomStructureRevModel.findAll({
            where: {
                DELETED_AT: null,
                ...whereCondition,
            },
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "STATUS_STRUCTURE"],
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"],
                },
            ],
            order: [["SEQUENCE", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "Daftar revisi BOM berhasil diambil",
            data: revs,
        });
    } catch (error) {
        console.error("Error fetching BOM revisions:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data revisi BOM: ${error.message}`,
        });
    }
};

export const getBomStructureRevById = async (req, res) => {
    const { id } = req.params;

    try {
        const rev = await BomStructureRevModel.findByPk(id, {
            where: { DELETED_AT: null },
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "STATUS_STRUCTURE"],
                },
            ],
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "Revisi BOM tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Revisi BOM berhasil diambil",
            data: rev,
        });
    } catch (error) {
        console.error("Error fetching BOM revision by ID:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil revisi BOM: ${error.message}`,
        });
    }
};

export const createBomStructureRev = async (req, res) => {
    const { TITLE, DESCRIPTION, BOM_STRUCTURE_ID, SEQUENCE, CREATED_ID } = req.body;

    if (!BOM_STRUCTURE_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM_STRUCTURE_ID wajib diisi",
        });
    }

    try {
        const bomExists = await BomStructureModel.findOne({
            where: { ID: BOM_STRUCTURE_ID, IS_DELETED: false },
        });
        if (!bomExists) {
            return res.status(400).json({
                success: false,
                message: "BOM Structure tidak ditemukan atau sudah dihapus",
            });
        }

        const existingSequence = await BomStructureRevModel.findOne({
            where: {
                BOM_STRUCTURE_ID,
                SEQUENCE,
                DELETED_AT: null,
            },
        });

        if (existingSequence) {
            return res.status(400).json({
                success: false,
                message: `SEQUENCE ${SEQUENCE} sudah digunakan untuk BOM ini`,
            });
        }

        const newRev = await BomStructureRevModel.create({
            TITLE,
            DESCRIPTION,
            BOM_STRUCTURE_ID,
            SEQUENCE: SEQUENCE || (await getNextSequence(BOM_STRUCTURE_ID)),
            CREATED_AT: new Date(),
            UPDATED_AT: new Date(),
            DELETED_AT: null,
        });

        return res.status(201).json({
            success: true,
            message: "Revisi BOM berhasil dibuat",
            data: newRev,
        });
    } catch (error) {
        console.error("Error creating BOM revision:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal membuat revisi BOM: ${error.message}`,
        });
    }
};

const getNextSequence = async (bomId) => {
    const lastRev = await BomStructureRevModel.findOne({
        where: { BOM_STRUCTURE_ID: bomId, DELETED_AT: null },
        order: [["SEQUENCE", "DESC"]],
        attributes: ["SEQUENCE"],
    });
    return lastRev ? lastRev.SEQUENCE + 1 : 1;
};

export const updateBomStructureRev = async (req, res) => {
    const { id } = req.params;
    const { TITLE, DESCRIPTION, SEQUENCE, UPDATED_ID } = req.body;

    try {
        const rev = await BomStructureRevModel.findOne({
            where: { ID: id, DELETED_AT: null },
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "Revisi BOM tidak ditemukan",
            });
        }

        if (SEQUENCE !== undefined) {
            const conflict = await BomStructureRevModel.findOne({
                where: {
                    BOM_STRUCTURE_ID: rev.BOM_STRUCTURE_ID,
                    SEQUENCE,
                    ID: { [Op.ne]: id },
                    DELETED_AT: null,
                },
            });
            if (conflict) {
                return res.status(400).json({
                    success: false,
                    message: `SEQUENCE ${SEQUENCE} sudah digunakan`,
                });
            }
        }

        await rev.update({
            TITLE,
            DESCRIPTION,
            SEQUENCE: SEQUENCE !== undefined ? SEQUENCE : rev.SEQUENCE,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Revisi BOM berhasil diperbarui",
            data: rev,
        });
    } catch (error) {
        console.error("Error updating BOM revision:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui revisi BOM: ${error.message}`,
        });
    }
};

export const deleteBomStructureRev = async (req, res) => {
    const { id } = req.params;
    const { UPDATED_ID } = req.body;

    try {
        const rev = await BomStructureRevModel.findOne({
            where: { ID: id, DELETED_AT: null },
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "Revisi BOM tidak ditemukan",
            });
        }

        await rev.update({
            DELETED_AT: new Date(),
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Revisi BOM berhasil dihapus (soft delete)",
        });
    } catch (error) {
        console.error("Error deleting BOM revision:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus revisi BOM: ${error.message}`,
        });
    }
};