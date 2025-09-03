import {
    BomStructureListDetailModel,
    BomStructureListModel,
    BomStructurePendingDimension
} from "../../../models/system/bomStructure.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import BomStructureModel from "../../../models/system/bomStructure.mod.js";
import {Op} from "sequelize";
import {OrderPoListing, OrderPoListingSize} from "../../../models/production/order.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import BomTemplateListModel from "../../../models/system/bomTemplateList.mod.js";
import BomTemplateListDetail from "../../../models/system/bomTemplateListDetail.mod.js";

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

        const orderPos = await OrderPoListing.findAll({
            where: { ORDER_NO: bomStructure.ORDER_ID, PO_STATUS: "Confirmed" },
            attributes: ["ORDER_PO_ID", "ITEM_COLOR_ID", "ORDER_QTY"]
        });

        if (orderPos.length === 0 && IS_SPLIT_NO_PO) {
            return res.status(400).json({
                success: false,
                message: "No order PO found for this order",
            });
        }

        const allSizeRecords = await OrderPoListingSize.findAll({
            where: { ORDER_NO: bomStructure.ORDER_ID, PO_STATUS: "Confirmed" },
            attributes: ["ORDER_PO_ID", "SIZE_ID", "ORDER_QTY"]
        });

        await BomStructurePendingDimension.destroy({
            where: { BOM_STRUCTURE_LIST_ID }
        });

        const finalRequest = [];

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
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_COLOR && !IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
            const colorMap = new Map();
            for (const po of orderPos) {
                const colorId = po.ITEM_COLOR_ID;
                if (!colorMap.has(colorId)) {
                    colorMap.set(colorId, 0);
                }
                colorMap.set(colorId, colorMap.get(colorId) + (po.ORDER_QTY || 0));
            }

            for (const [colorId, quantity] of colorMap) {
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                    COLOR_ID: colorId,
                    SIZE_ID: null,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_SIZE && !IS_SPLIT_COLOR && !IS_SPLIT_NO_PO) {
            const sizeMap = new Map();
            for (const record of allSizeRecords) {
                const sizeId = record.SIZE_ID;
                if (!sizeMap.has(sizeId)) {
                    sizeMap.set(sizeId, 0);
                }
                sizeMap.set(sizeId, sizeMap.get(sizeId) + (record.ORDER_QTY || 0));
            }

            for (const [sizeId, quantity] of sizeMap) {
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                    COLOR_ID: null,
                    SIZE_ID: sizeId,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
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
            const comboMap = new Map();

            for (const record of allSizeRecords) {
                const po = orderPos.find(p => p.ORDER_PO_ID === record.ORDER_PO_ID);
                if (!po || !record.SIZE_ID) continue;

                const key = `${po.ITEM_COLOR_ID}-${record.SIZE_ID}`;
                if (!comboMap.has(key)) {
                    comboMap.set(key, {
                        COLOR_ID: po.ITEM_COLOR_ID,
                        SIZE_ID: record.SIZE_ID,
                        quantity: 0
                    });
                }
                comboMap.get(key).quantity += record.ORDER_QTY || 0;
            }

            for (const { COLOR_ID, SIZE_ID, quantity } of comboMap.values()) {
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                    COLOR_ID,
                    SIZE_ID,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_NO_PO && IS_SPLIT_SIZE && !IS_SPLIT_COLOR) {
            for (const po of orderPos) {
                const sizeRecords = allSizeRecords.filter(r => r.ORDER_PO_ID === po.ORDER_PO_ID);
                for (const record of sizeRecords) {
                    const quantity = record.ORDER_QTY || 0;
                    const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                    finalRequest.push({
                        BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                        COLOR_ID: null,
                        SIZE_ID: record.SIZE_ID,
                        ORDER_PO_ID: po.ORDER_PO_ID,
                        ORDER_QUANTITY: quantity,
                        STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                        INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                        BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                        PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                        EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
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

        else {
            const totalQty = orderPos.reduce((sum, po) => sum + (po.ORDER_QTY || 0), 0);
            const materialRequirement = totalQty * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

            finalRequest.push({
                BOM_STRUCTURE_LIST_ID: bomStructureList.ID,
                COLOR_ID: null,
                SIZE_ID: null,
                ORDER_PO_ID: null,
                ORDER_QUANTITY: totalQty,
                STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                INTERNAL_CONSUMPTION_PER_ITEM: bomStructureList.INTERNAL_CONSUMPTION_PER_ITEM,
                BOOKING_CONSUMPTION_PER_ITEM: bomStructureList.BOOKING_CONSUMPTION_PER_ITEM,
                PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
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


export const updatePendingDimensionStructureCustom = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const pending = await BomStructurePendingDimension.findByPk(id, {
            include: [
                { model: BomStructureListModel, as: "BOM_STRUCTURE_LIST" }
            ]
        });

        if (!pending) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension tidak ditemukan",
            });
        }

        const ORDER_QUANTITY = parseFloat(pending.ORDER_QUANTITY) || 0;
        const PRODUCTION_CONSUMPTION = parseFloat(updateData.PRODUCTION_CONSUMPTION_PER_ITEM ?? pending.PRODUCTION_CONSUMPTION_PER_ITEM) || 0;
        const EXTRA_BOOKS = parseFloat(updateData.EXTRA_BOOKS ?? pending.EXTRA_BOOKS) || 0;
        const EXTRA_REQUIRE_QTY = parseFloat(updateData.EXTRA_REQUIRE_QTY ?? pending.EXTRA_REQUIRE_QTY) || 0;

        const baseRequirement = ORDER_QUANTITY * PRODUCTION_CONSUMPTION;

        const additionalFromPercent = baseRequirement * (EXTRA_BOOKS / 100);
        const totalRequirement = baseRequirement + additionalFromPercent + EXTRA_REQUIRE_QTY;

        const MATERIAL_ITEM_REQUIREMENT_QTY = totalRequirement;

        let TOTAL_EXTRA_PURCHASE_PLAN_PERCENT = 0;
        if (baseRequirement > 0) {
            TOTAL_EXTRA_PURCHASE_PLAN_PERCENT = ((totalRequirement - baseRequirement) / baseRequirement) * 100;
        }
        TOTAL_EXTRA_PURCHASE_PLAN_PERCENT = parseFloat(TOTAL_EXTRA_PURCHASE_PLAN_PERCENT.toFixed(2));

        const IS_BOOKING = TOTAL_EXTRA_PURCHASE_PLAN_PERCENT <= 3;
        const finalUpdate = {
            ...updateData,
            MATERIAL_ITEM_REQUIREMENT_QTY,
            TOTAL_EXTRA_PURCHASE_PLAN_PERCENT,
            IS_BOOKING,
            UPDATED_AT: new Date()
        };

        const [updated] = await BomStructurePendingDimension.update(finalUpdate, {
            where: { ID: id }
        });

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: "Gagal memperbarui pending dimension",
            });
        }


        const response = await BomStructurePendingDimension.findAll({
            where: { BOM_STRUCTURE_LIST_ID: pending.BOM_STRUCTURE_LIST_ID },
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "BOM_LINE_ID", "MASTER_ITEM_ID", "STATUS", "CONSUMPTION_UOM", "VENDOR_ID"],
                    where: { BOM_STRUCTURE_ID: pending?.BOM_STRUCTURE_LIST?.BOM_STRUCTURE_ID },
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


        return res.status(200).json({
            success: true,
            message: "Pending dimension berhasil diperbarui",
            data: response
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui pending dimension: ${error.message}`,
        });
    }
};

export const createPendingDimensionFromBomTemplateList = async (req, res) => {
    const { id, bomTemplateListId } = req.body;

    if (!id || !bomTemplateListId) {
        return res.status(400).json({
            success: false,
            message: "ID and bomTemplateListId cannot be empty",
        });
    }

    try {
        const bomStructureList = await BomStructureListModel.findByPk(id);
        if (!bomStructureList) {
            return res.status(404).json({
                success: false,
                message: "Bom Structure List not found",
            });
        }

        if (bomStructureList.STATUS !== "Open") {
            return res.status(400).json({
                success: false,
                message: "Bom Structure List must be in 'Open' status",
            });
        }

        const existingDetailCount = await BomStructureListDetailModel.count({
            where: { BOM_STRUCTURE_LIST_ID: id }
        });

        if (existingDetailCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Bom Structure List Detail already exists",
            });
        }

        const bomTemplateList = await BomTemplateListModel.findByPk(bomTemplateListId);
        if (!bomTemplateList) {
            return res.status(404).json({
                success: false,
                message: "Bom Template List not found",
            });
        }

        const { IS_SPLIT_COLOR, IS_SPLIT_SIZE, IS_SPLIT_NO_PO } = bomStructureList;
        if (
            bomTemplateList.IS_SPLIT_COLOR !== IS_SPLIT_COLOR ||
            bomTemplateList.IS_SPLIT_SIZE !== IS_SPLIT_SIZE
        ) {
            return res.status(400).json({
                success: false,
                message: "Split status of BOM structure does not match split status of BOM template."
            });
        }

        if (IS_SPLIT_NO_PO && IS_SPLIT_COLOR) {
            return res.status(400).json({
                success: false,
                message: "IS_SPLIT_NO_PO and IS_SPLIT_COLOR cannot both be true",
            });
        }

        if (!IS_SPLIT_SIZE && !IS_SPLIT_COLOR && !IS_SPLIT_NO_PO) {
            return res.status(400).json({
                success: false,
                message: "At least one split (Size, Color, or No PO) must be enabled",
            });
        }

        const bomStructure = await BomStructureModel.findByPk(bomStructureList.BOM_STRUCTURE_ID);
        if (!bomStructure) {
            return res.status(404).json({
                success: false,
                message: "Bom Structure not found",
            });
        }

        await BomStructurePendingDimension.destroy({
            where: { BOM_STRUCTURE_LIST_ID: id }
        });

        const orderPos = await OrderPoListing.findAll({
            where: { ORDER_NO: bomStructure.ORDER_ID, PO_STATUS: "Confirmed" },
            attributes: ["ORDER_PO_ID", "ITEM_COLOR_ID", "ORDER_QTY"]
        });

        if (orderPos.length === 0 && IS_SPLIT_NO_PO) {
            return res.status(400).json({
                success: false,
                message: "No order PO found for this order",
            });
        }

        const allSizeRecords = await OrderPoListingSize.findAll({
            where: { ORDER_NO: bomStructure.ORDER_ID, PO_STATUS: "Confirmed" },
            attributes: ["ORDER_PO_ID", "SIZE_ID", "ORDER_QTY"]
        });

        const finalRequest = [];

        if (IS_SPLIT_NO_PO && !IS_SPLIT_COLOR && !IS_SPLIT_SIZE) {
            for (const po of orderPos) {
                const quantity = po.ORDER_QTY || 0;
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: id,
                    COLOR_ID: null,
                    SIZE_ID: null,
                    ORDER_PO_ID: po.ORDER_PO_ID,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM:  bomTemplateList.INTERNAL_CUSTOMER_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomTemplateList.COSTING_CONSUMER_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING: true,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_COLOR && !IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
            const colorMap = new Map();
            for (const po of orderPos) {
                const colorId = po.ITEM_COLOR_ID;
                if (!colorMap.has(colorId)) {
                    colorMap.set(colorId, 0);
                }
                colorMap.set(colorId, colorMap.get(colorId) + (po.ORDER_QTY || 0));
            }

            for (const [colorId, quantity] of colorMap) {
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: id,
                    COLOR_ID: colorId,
                    SIZE_ID: null,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM:  bomTemplateList.INTERNAL_CUSTOMER_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomTemplateList.COSTING_CONSUMER_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING: true,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_SIZE && !IS_SPLIT_COLOR && !IS_SPLIT_NO_PO) {
            const sizeMap = new Map();
            for (const record of allSizeRecords) {
                const sizeId = record.SIZE_ID;
                if (!sizeMap.has(sizeId)) {
                    sizeMap.set(sizeId, 0);
                }
                sizeMap.set(sizeId, sizeMap.get(sizeId) + (record.ORDER_QTY || 0));
            }

            for (const [sizeId, quantity] of sizeMap) {
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: id,
                    COLOR_ID: null,
                    SIZE_ID: sizeId,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM:  bomTemplateList.INTERNAL_CUSTOMER_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomTemplateList.COSTING_CONSUMER_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING: true,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_COLOR && IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
            const comboMap = new Map();

            for (const record of allSizeRecords) {
                const po = orderPos.find(p => p.ORDER_PO_ID === record.ORDER_PO_ID);
                if (!po || !record.SIZE_ID) continue;

                const key = `${po.ITEM_COLOR_ID}-${record.SIZE_ID}`;
                if (!comboMap.has(key)) {
                    comboMap.set(key, {
                        COLOR_ID: po.ITEM_COLOR_ID,
                        SIZE_ID: record.SIZE_ID,
                        quantity: 0
                    });
                }
                comboMap.get(key).quantity += record.ORDER_QTY || 0;
            }

            for (const { COLOR_ID, SIZE_ID, quantity } of comboMap.values()) {
                const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                finalRequest.push({
                    BOM_STRUCTURE_LIST_ID: id,
                    COLOR_ID,
                    SIZE_ID,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: quantity,
                    STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                    INTERNAL_CONSUMPTION_PER_ITEM:  bomTemplateList.INTERNAL_CUSTOMER_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: bomTemplateList.COSTING_CONSUMER_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                    MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                    EXTRA_REQUIRE_QTY: 0,
                    ITEM_DIMENSION_ID: null,
                    IS_BOOKING: true,
                    CREATED_AT: new Date(),
                });
            }
        }

        else if (IS_SPLIT_NO_PO && IS_SPLIT_SIZE && !IS_SPLIT_COLOR) {
            for (const po of orderPos) {
                const sizeRecords = allSizeRecords.filter(r => r.ORDER_PO_ID === po.ORDER_PO_ID);
                for (const record of sizeRecords) {
                    const quantity = record.ORDER_QTY || 0;
                    const materialRequirement = quantity * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

                    finalRequest.push({
                        BOM_STRUCTURE_LIST_ID: id,
                        COLOR_ID: null,
                        SIZE_ID: record.SIZE_ID,
                        ORDER_PO_ID: po.ORDER_PO_ID,
                        ORDER_QUANTITY: quantity,
                        STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                        INTERNAL_CONSUMPTION_PER_ITEM:  bomTemplateList.INTERNAL_CUSTOMER_PER_ITEM,
                        BOOKING_CONSUMPTION_PER_ITEM: bomTemplateList.COSTING_CONSUMER_PER_ITEM,
                        PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                        EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                        MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                        TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                        EXTRA_REQUIRE_QTY: 0,
                        ITEM_DIMENSION_ID: null,
                        IS_BOOKING: true,
                        CREATED_AT: new Date(),
                    });
                }
            }
        }

        else {
            const totalQty = orderPos.reduce((sum, po) => sum + (po.ORDER_QTY || 0), 0);
            const materialRequirement = totalQty * bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM;

            finalRequest.push({
                BOM_STRUCTURE_LIST_ID: id,
                COLOR_ID: null,
                SIZE_ID: null,
                ORDER_PO_ID: null,
                ORDER_QUANTITY: totalQty,
                STANDARD_CONSUMPTION_PER_ITEM: bomStructureList.STANDARD_CONSUMPTION_PER_ITEM,
                INTERNAL_CONSUMPTION_PER_ITEM:  bomTemplateList.INTERNAL_CUSTOMER_PER_ITEM,
                BOOKING_CONSUMPTION_PER_ITEM: bomTemplateList.COSTING_CONSUMER_PER_ITEM,
                PRODUCTION_CONSUMPTION_PER_ITEM: bomStructureList.PRODUCTION_CONSUMPTION_PER_ITEM,
                EXTRA_BOOKS: bomStructureList.EXTRA_BOOKS ?? 0,
                MATERIAL_ITEM_REQUIREMENT_QTY: materialRequirement,
                TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: 0,
                EXTRA_REQUIRE_QTY: 0,
                ITEM_DIMENSION_ID: null,
                IS_BOOKING: true,
                CREATED_AT: new Date(),
            });
        }

        if (finalRequest.length > 0) {
            const existingDetails = await BomStructureListDetailModel.findAll({
                where: {
                    BOM_STRUCTURE_LIST_ID: id,
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

            console.log("existingKeys ", existingKeys)
            console.log("toCreate ", toCreate)

            if (toCreate.length > 0) {
                await BomStructurePendingDimension.bulkCreate(toCreate, { validate: true });
            }
        }

        const response = await BomStructurePendingDimension.findAll({
            where: { BOM_STRUCTURE_LIST_ID: id },
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "BOM_LINE_ID", "MASTER_ITEM_ID", "STATUS", "CONSUMPTION_UOM", "VENDOR_ID"],
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
            message: "Pending dimension berhasil dibuat dari template",
            data: response
        });

    } catch (error) {
        console.error("Error in createPendingDimensionFromBomTemplateList:", error);
        return res.status(500).json({
            success: false,
            message: `Gagal membuat pending dimension: ${error.message}`,
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