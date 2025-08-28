import {BomStructureColorModel, BomStructureSizeModel} from "../../../models/system/bomStructure.mod.js";

export const getAllBomStructureSizes = async (req, res) => {
    const { BOM_STRUCTURE_ID, SIZE_ID, REV_ID = 0 } = req.query;
    const where = {REV_ID};

    if (BOM_STRUCTURE_ID) where.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
    if (SIZE_ID) where.SIZE_ID = SIZE_ID;

    try {
        const sizes = await BomStructureSizeModel.findAll({ where });

        return res.status(200).json({
            success: true,
            message: "Daftar ukuran BOM berhasil diambil",
            data: sizes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data ukuran BOM: ${error.message}`,
        });
    }
};

export const getBomStructureSizeById = async (req, res) => {
    const { id } = req.params;

    try {
        const size = await BomStructureSizeModel.findByPk(id);

        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Ukuran BOM tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ukuran BOM berhasil diambil",
            data: size,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil ukuran BOM: ${error.message}`,
        });
    }
};

export const createBomStructureSize = async (req, res) => {
    const { BOM_STRUCTURE_ID, SIZE_ID, REV_ID = 0 } = req.body;

    if (!BOM_STRUCTURE_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM_STRUCTURE_ID wajib diisi",
        });
    }

    try {
        await BomStructureSizeModel.create({
            BOM_STRUCTURE_ID,
            SIZE_ID: SIZE_ID || null,
            REV_ID,
        });

        return res.status(201).json({
            success: true,
            message: "Ukuran BOM berhasil ditambahkan",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menambahkan ukuran BOM: ${error.message}`,
        });
    }
};

export const updateBomStructureSize = async (req, res) => {
    const { id } = req.params;
    const { SIZE_ID, REV_ID } = req.body;

    try {
        const size = await BomStructureSizeModel.findByPk(id);

        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Ukuran BOM tidak ditemukan",
            });
        }

        await size.update({
            SIZE_ID: SIZE_ID,
            REV_ID: REV_ID,
        });

        return res.status(200).json({
            success: true,
            message: "Ukuran BOM berhasil diperbarui",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui ukuran BOM: ${error.message}`,
        });
    }
};

export const deleteBomStructureSize = async (req, res) => {
    const { id } = req.params;

    try {
        const size = await BomStructureSizeModel.findByPk(id);

        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Ukuran BOM tidak ditemukan",
            });
        }

        await size.destroy();

        return res.status(200).json({
            success: true,
            message: "Ukuran BOM berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus ukuran BOM: ${error.message}`,
        });
    }
};


export const getAllBomStructureColors = async (req, res) => {
    const { BOM_STRUCTURE_ID, COLOR_ID, REV_ID = 0 } = req.query;
    const where = {REV_ID};

    if (BOM_STRUCTURE_ID) where.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
    if (COLOR_ID) where.COLOR_ID = COLOR_ID;

    try {
        const colors = await BomStructureColorModel.findAll({ where });

        return res.status(200).json({
            success: true,
            message: "Daftar warna BOM berhasil diambil",
            data: colors,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data warna BOM: ${error.message}`,
        });
    }
};

export const getBomStructureColorById = async (req, res) => {
    const { id } = req.params;

    try {
        const color = await BomStructureColorModel.findByPk(id);

        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Warna BOM tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Warna BOM berhasil diambil",
            data: color,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil warna BOM: ${error.message}`,
        });
    }
};

export const createBomStructureColor = async (req, res) => {
    const { BOM_STRUCTURE_ID, COLOR_ID, REV_ID = 0 } = req.body;

    if (!BOM_STRUCTURE_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM_STRUCTURE_ID wajib diisi",
        });
    }

    try {
        await BomStructureColorModel.create({
            BOM_STRUCTURE_ID,
            COLOR_ID: COLOR_ID || null,
            REV_ID,
        });

        return res.status(201).json({
            success: true,
            message: "Warna BOM berhasil ditambahkan",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menambahkan warna BOM: ${error.message}`,
        });
    }
};

export const updateBomStructureColor = async (req, res) => {
    const { id } = req.params;
    const { COLOR_ID, REV_ID } = req.body;

    try {
        const color = await BomStructureColorModel.findByPk(id);

        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Warna BOM tidak ditemukan",
            });
        }

        await color.update({
            COLOR_ID: COLOR_ID,
            REV_ID: REV_ID ?? 0,
        });

        return res.status(200).json({
            success: true,
            message: "Warna BOM berhasil diperbarui",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui warna BOM: ${error.message}`,
        });
    }
};

export const deleteBomStructureColor = async (req, res) => {
    const { id } = req.params;

    try {
        const color = await BomStructureColorModel.findByPk(id);

        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Warna BOM tidak ditemukan",
            });
        }

        await color.destroy();

        return res.status(200).json({
            success: true,
            message: "Warna BOM berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus warna BOM: ${error.message}`,
        });
    }
};