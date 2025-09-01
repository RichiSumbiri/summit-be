import BomStructureMod, {
    BomStructureColorModel,
    BomStructureListDetailModel,
    BomStructureListModel,
    BomStructurePendingDimension, BomStructureSizeModel
} from "../../../models/system/bomStructure.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import BomStructureModel from "../../../models/system/bomStructure.mod.js";
import {DataTypes, Op} from "sequelize";
import BomTemplatePendingDimension from "../../../models/system/bomTemplatePandingDimension.mod.js";
import BomTemplateListModel from "../../../models/system/bomTemplateList.mod.js";
import {OrderPoListing, OrderPoListingSize} from "../../../models/production/order.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";

export const getAllPendingDimensionStructure = async (req, res) => {
    const {BOM_STRUCTURE_LIST_ID, COLOR_ID, SIZE_ID, ITEM_DIMENSION_ID} = req.query;
    const where = {};

    if (BOM_STRUCTURE_LIST_ID) where.BOM_STRUCTURE_LIST_ID = BOM_STRUCTURE_LIST_ID;
    if (COLOR_ID) where.COLOR_ID = COLOR_ID;
    if (SIZE_ID) where.SIZE_ID = SIZE_ID;
    if (ITEM_DIMENSION_ID) where.ITEM_DIMENSION_ID = ITEM_DIMENSION_ID;

    try {
        const dimensions = await BomStructurePendingDimension.findAll({
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
            message: "Pending dimensions berhasil diambil",
            data: dimensions,
        });
    } catch (error) {
        console.error("Error fetching pending dimensions:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data: ${error.message}`,
        });
    }
};

export const getPendingDimensionStructureById = async (req, res) => {
    const {id} = req.params;

    try {
        const dim = await BomStructurePendingDimension.findByPk(id, {
            include: [
                {model: BomStructureListModel, as: "BOM_STRUCTURE_LIST"},
                {model: ColorChartMod, as: "COLOR"},
                {model: SizeChartMod, as: "SIZE"},
                {model: MasterItemDimensionModel, as: "ITEM_DIMENSION"},
            ]
        });

        if (!dim) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pending dimension berhasil diambil",
            data: dim,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data: ${error.message}`,
        });
    }
};

export const createPendingDimensionStructure = async (req, res) => {
    const { BOM_STRUCTURE_LIST_ID, BOM_STRUCTURE_ID, IS_BOOKING = true } = req.body;

    try {
        if (!BOM_STRUCTURE_LIST_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_STRUCTURE_LIST_ID wajib diisi",
            });
        }

        const bomStructureList = await BomStructureListModel.findByPk(BOM_STRUCTURE_LIST_ID);
        if (!bomStructureList) {
            return res.status(404).json({
                success: false,
                message: "Bom Structure list not found",
            });
        }

        const bomStructure = await BomStructureModel.findByPk(BOM_STRUCTURE_ID);
        if (!bomStructure) {
            return res.status(404).json({
                success: false,
                message: "Bom Structure not found",
            });
        }

        const { IS_SPLIT_SIZE, IS_SPLIT_COLOR, IS_SPLIT_NO_PO } = bomStructureList;

        // Validasi consumption
        if (
            bomStructureList.STANDARD_CONSUMPTION_PER_ITEM < 0 ||
            bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM <= 0 ||
            bomStructureList.BOOKING_CONSUMPTION_PER_ITEM <= 0 ||
            bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Consumption cannot be negative or zero",
            });
        }

        if (!IS_SPLIT_SIZE && !IS_SPLIT_COLOR && !IS_SPLIT_NO_PO) {
            return res.status(400).json({
                success: false,
                message: "At least one split (Size, Color, or No PO) must be enabled",
            });
        }

        if (IS_SPLIT_NO_PO && IS_SPLIT_COLOR) {
            return res.status(400).json({
                success: false,
                message: "IS_SPLIT_NO_PO and IS_SPLIT_COLOR cannot both be true",
            });
        }

        // Hapus data lama
        await BomStructurePendingDimension.destroy({
            where: { BOM_STRUCTURE_LIST_ID }
        });

        // Ambil semua PO dan Size berdasarkan ORDER_NO
        const orderPos = await OrderPoListing.findAll({
            where: { ORDER_NO: bomStructure.ORDER_ID },
            attributes: ["ORDER_PO_ID", "ITEM_COLOR_ID", "ORDER_QTY"]
        });

        if (orderPos.length === 0 && IS_SPLIT_NO_PO) {
            return res.status(400).json({
                success: false,
                message: "No order PO found for this order",
            });
        }

        const allSizeRecords = await OrderPoListingSize.findAll({
            where: { ORDER_NO: bomStructure.ORDER_ID },
            attributes: ["ORDER_PO_ID", "SIZE_ID", "ORDER_QTY"]
        });

        const finalRequest = [];

        // 1. Hanya IS_SPLIT_NO_PO
        if (IS_SPLIT_NO_PO && !IS_SPLIT_COLOR && !IS_SPLIT_SIZE) {
            for (const po of orderPos) {
                const quantity = po.ORDER_QTY || 0;
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                    COLOR_ID: null,
                    SIZE_ID: null,
                    ORDER_PO_ID: po.ORDER_PO_ID,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructure.EXTRA_BOOKS,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING,
                    CREATED_AT: new Date(),
                });
            }
        }

        // 2. Hanya IS_SPLIT_COLOR
        else if (IS_SPLIT_COLOR && !IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
            const colors = await BomStructureColorModel.findAll({
                where: { BOM_STRUCTURE_ID },
                attributes: ["COLOR_ID"]
            });

            for (const color of colors) {
                const relevantPos = orderPos.filter(po => po.ITEM_COLOR_ID === color.COLOR_ID);
                const quantity = relevantPos.reduce((sum, po) => sum + (po.ORDER_QTY || 0), 0);
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                    COLOR_ID: color.COLOR_ID,
                    SIZE_ID: null,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructure.EXTRA_BOOKS,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING,
                    CREATED_AT: new Date(),
                });
            }
        }

        // 3. Hanya IS_SPLIT_SIZE
        else if (IS_SPLIT_SIZE && !IS_SPLIT_COLOR && !IS_SPLIT_NO_PO) {
            const sizes = await BomStructureSizeModel.findAll({
                where: { BOM_STRUCTURE_ID },
                attributes: ["SIZE_ID"]
            });
            for (const size of sizes) {
                const quantity = allSizeRecords
                    .filter(r => r.dataValues.SIZE_ID === size.SIZE_ID)
                    .reduce((sum, r) => sum + (r.ORDER_QTY || 0), 0);



                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                    COLOR_ID: null,
                    SIZE_ID: size.SIZE_ID,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructure.EXTRA_BOOKS,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_COLOR && IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
            const colors = await BomStructureColorModel.findAll({
                where: { BOM_STRUCTURE_ID },
                attributes: ["COLOR_ID"]
            });
            const sizes = await BomStructureSizeModel.findAll({
                where: { BOM_STRUCTURE_ID },
                attributes: ["SIZE_ID"]
            });

            for (const color of colors) {
                for (const size of sizes) {
                    const relevantPos = orderPos.filter(po => po.ITEM_COLOR_ID === color.COLOR_ID);
                    const relevantPoIds = relevantPos.map(po => po.ORDER_PO_ID);

                    const quantity = allSizeRecords
                        .filter(r => relevantPoIds.includes(r.ORDER_PO_ID) && r.dataValues.SIZE_ID === size.SIZE_ID)
                        .reduce((sum, r) => sum + (r.ORDER_QTY || 0), 0);

                    const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                    finalRequest.push({
                        BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                        COLOR_ID: color.COLOR_ID,
                        SIZE_ID: size.SIZE_ID,
                        ORDER_PO_ID: null,
                        ORDER_QUANTITY: quantity,
                        STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                        INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                        BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                        PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                        EXTRA_BOOKS: bomStructure.EXTRA_BOOKS,
                        MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                        TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                        EXTRA_REQUIRE_QTY: 0,
                        ITEM_DIMENSION_ID: null,
                        IS_BOOKING,
                        CREATED_AT: new Date(),
                    });
                }
            }
        }

        // 5. IS_SPLIT_NO_PO + IS_SPLIT_SIZE
        else if (IS_SPLIT_NO_PO && IS_SPLIT_SIZE && !IS_SPLIT_COLOR) {
            const sizes = await BomStructureSizeModel.findAll({
                where: { BOM_STRUCTURE_ID },
                attributes: ["SIZE_ID"]
            });

            for (const po of orderPos) {
                for (const size of sizes) {
                    const sizeRecord = allSizeRecords.find(
                        r => r.ORDER_PO_ID === po.ORDER_PO_ID && r.dataValues.SIZE_ID === size.SIZE_ID
                    );
                    const quantity = sizeRecord?.ORDER_QTY || 0;
                    const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                    finalRequest.push({
                        BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                        COLOR_ID: null,
                        SIZE_ID: size.SIZE_ID,
                        ORDER_PO_ID: po.ORDER_PO_ID,
                        ORDER_QUANTITY: quantity,
                        STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                        INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                        BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                        PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                        EXTRA_BOOKS: bomStructure.EXTRA_BOOKS,
                        MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                        TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                        EXTRA_REQUIRE_QTY: 0,
                        ITEM_DIMENSION_ID: null,
                        IS_BOOKING,
                        CREATED_AT: new Date(),
                    });
                }
            }
        }

        // 6. Default / fallback
        else {
            finalRequest.push({
                BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                COLOR_ID: null,
                SIZE_ID: null,
                ORDER_PO_ID: null,
                ORDER_QUANTITY: 0,
                STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                EXTRA_BOOKS: bomStructure.EXTRA_BOOKS,
                MATERIAL_ITEM_REQUIREMENT_QTY: 0,
                TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                EXTRA_REQUIRE_QTY: 0,
                ITEM_DIMENSION_ID: null,
                IS_BOOKING,
                CREATED_AT: new Date(),
            });
        }

        if (finalRequest.length > 0) {
            const existingDetails = await BomStructureListDetailModel.findAll({
                where: {
                    BOM_STRUCTURE_LIST_ID,
                    [Op.or]: finalRequest.map(r => ({
                        COLOR_ID: r.COLOR_ID,
                        SIZE_ID: r.SIZE_ID,
                        ORDER_PO_ID: r.ORDER_PO_ID
                    }))
                },
                attributes: ['COLOR_ID', 'SIZE_ID', 'ORDER_PO_ID']
            });

            const existingKeys = new Set(
                existingDetails.map(d => `${d.COLOR_ID || ''}-${d.SIZE_ID || ''}-${d.ORDER_PO_ID || ''}`)
            );

            const toCreate = finalRequest.filter(req =>
                !existingKeys.has(`${req.COLOR_ID || ''}-${req.SIZE_ID || ''}-${req.ORDER_PO_ID || ''}`)
            );

            if (toCreate.length > 0) {
                await BomStructurePendingDimension.bulkCreate(toCreate, { validate: true });
            }
        }

        // Ambil hasil
        const response = await BomStructurePendingDimension.findAll({
            where: { BOM_STRUCTURE_LIST_ID },
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "BOM_LINE_ID", "MASTER_ITEM_ID", "STATUS", "CONSUMPTION_UOM", "VENDOR_ID"],
                    where: { BOM_STRUCTURE_ID },
                    required: true,
                    include: {
                        model: ModelVendorDetail,
                        as: "VENDOR",
                        attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
                    }
                },
                {
                    model: OrderPoListing,
                    as: "ORDER_PO",
                    attributes: ["ORDER_PO_ID", "ITEM_COLOR_ID", "ITEM_COLOR_CODE", "ITEM_COLOR_NAME"],
                },
                { model: ColorChartMod, as: "COLOR", attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"] },
                { model: SizeChartMod, as: "SIZE", attributes: ["SIZE_ID", "SIZE_CODE"] }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Pending dimension berhasil dibuat",
            data: response
        });

    } catch (error) {
        console.error("Error in createPendingDimensionStructure:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal membuat pending dimension: ${error.message}`,
        });
    }
};

export const updatePendingDimensionStructure = async (req, res) => {
    const {id} = req.params;
    const updateData = req.body;

    try {
        const [updated] = await BomStructurePendingDimension.update(updateData, {
            where: {ID: id}
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension tidak ditemukan",
            });
        }

        await BomStructurePendingDimension.findByPk(id);
        return res.status(200).json({
            success: true,
            message: "Pending dimension berhasil diperbarui",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui pending dimension: ${error.message}`,
        });
    }
};

export const deletePendingDimensionStructure = async (req, res) => {
    const {id} = req.params;

    try {
        const deleted = await BomStructurePendingDimension.destroy({where: {ID: id}});
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pending dimension berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus pending dimension: ${error.message}`,
        });
    }
};