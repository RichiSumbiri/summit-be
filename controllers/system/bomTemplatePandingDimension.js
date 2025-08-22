import BomTemplateListModel from "../../models/system/bomTemplateList.mod.js";
import BomTemplateModel, {BomTemplateSize, BomTemplateColor} from "../../models/system/bomTemplate.mod.js";
import ColorChartMod from "../../models/system/colorChart.mod.js";
import BomTemplatePendingDimension from "../../models/system/bomTemplatePandingDimension.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import {DataTypes} from "sequelize";
import {MIN_ALLOWED_VALUE} from "../../util/enum.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {ModelVendorDetail} from "../../models/system/VendorDetail.mod.js";
import BomTemplateListDetail from "../../models/system/bomTemplateListDetail.mod.js";

export const getAllPendingDimensions = async (req, res) => {
    try {
        const {BOM_TEMPLATE_LIST_ID} = req.query;

        const where = {};
        if (BOM_TEMPLATE_LIST_ID) {
            where.BOM_TEMPLATE_LIST_ID = BOM_TEMPLATE_LIST_ID;
        }

        const pending = await BomTemplatePendingDimension.findAll({
            where,
            include: [
                {
                    model: BomTemplateListModel,
                    as: "LIST_ITEM",
                    attributes: ["ID", "BOM_TEMPLATE_LINE_ID", "BOM_TEMPLATE_ID", "MASTER_ITEM_ID", "COSTING_CONSUMER_PER_ITEM", "INTERNAL_CUSTOMER_PER_ITEM", "VENDOR_ID", "NOTE", "ITEM_POSITION"],
                    include: [
                        {
                            model: MasterItemIdModel,
                            as: "MASTER_ITEM",
                            attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_UOM_BASE"]
                        },
                        {
                            model: BomTemplateModel,
                            as: "BOM_TEMPLATE",
                            attributes: ["ID", "NAME"]
                        },
                        {
                            model: ModelVendorDetail,
                            as: "VENDOR",
                            attributes: ["VENDOR_ID", "VENDOR_CODE", "VENDOR_NAME"]
                        }
                    ]
                },
                {
                    model: BomTemplateSize,
                    required: false,
                    as: "SIZE",
                    attributes: ["ID", "SIZE_ID", "BOM_TEMPLATE_ID", "REV_ID"],
                    include: [
                        {
                            model: SizeChartMod,
                            as: "SIZE",
                            attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                        },
                    ],
                },
                {
                    model: BomTemplateColor,
                    as: "COLOR",
                    required: false,
                    attributes: ["ID", "COLOR_ID", "BOM_TEMPLATE_ID", "REV_ID"],
                    include: [
                        {
                            model: ColorChartMod,
                            as: "COLOR",
                            attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                        },
                    ],
                }
            ],
            order: [["CREATED_AT", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            message: "Pending dimensions retrieved successfully",
            data: pending,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve pending dimensions: ${error.message}`,
        });
    }
};

export const getPendingDimensionById = async (req, res) => {
    try {
        const {id} = req.params;

        const pending = await BomTemplatePendingDimension.findByPk(id, {
            include: [
                {
                    model: BomTemplateListModel,
                    as: "LIST_ITEM",
                    attributes: ["BOM_TEMPLATE_LINE_ID"],
                },
                {
                    model: BomTemplateSize,
                    as: "SIZE",
                    include: [
                        {
                            model: SizeChartMod,
                            as: "SIZE",
                            attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                        },
                    ],
                },
                {
                    model: BomTemplateColor,
                    as: "COLOR",
                    include: [
                        {
                            model: ColorChartMod,
                            as: "COLOR",
                            attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                        },
                    ],
                },
            ],
        });

        if (!pending) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Pending dimension retrieved successfully",
            data: pending,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve pending dimension: ${error.message}`,
        });
    }
};

export const createCustomPendingDimensionDetail = async (req, res) => {
    const {BOM_TEMPLATE_LIST_ID, SIZE_IDS, COLOR_IDS, REV_ID} = req.body;

    if (!BOM_TEMPLATE_LIST_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM_TEMPLATE_LIST_ID is required in request body",
        });
    }

    try {
        const bomTemplateList = await BomTemplateListModel.findByPk(BOM_TEMPLATE_LIST_ID);
        if (!bomTemplateList) {
            return res.status(404).json({
                success: false,
                message: "BOM template list not found",
            });
        }

        const BOM_TEMPLATE_ID = bomTemplateList.BOM_TEMPLATE_ID;
        if (bomTemplateList.REV_ID !== REV_ID) {
            return res.status(400).json({
                success: false,
                message: `REV_ID mismatch. Expected ${bomTemplateList.REV_ID}, got ${REV_ID}`,
            });
        }

        await BomTemplatePendingDimension.destroy({
            where: {BOM_TEMPLATE_LIST_ID},
        });

        let validSizeIds = [];
        let validColorIds = [];
        const sizeIdMap = new Map();
        const colorIdMap = new Map();


        const allBomTemplateSizes = await BomTemplateSize.findAll({
            where: {BOM_TEMPLATE_ID, REV_ID},
            include: [
                {
                    model: SizeChartMod,
                    as: "SIZE",
                    attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                },
            ],
        });

        const allBomTemplateColors = await BomTemplateColor.findAll({
            where: {BOM_TEMPLATE_ID, REV_ID},
            include: [
                {
                    model: ColorChartMod,
                    as: "COLOR",
                    attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                },
            ],
        });

        const allSizeIds = allBomTemplateSizes.map(s => s.SIZE.SIZE_ID);
        const allColorIds = allBomTemplateColors.map(c => c.COLOR.COLOR_ID);

        allBomTemplateSizes.forEach(s => {
            sizeIdMap.set(s.SIZE.SIZE_ID, s.ID);
        });

        allBomTemplateColors.forEach(c => {
            colorIdMap.set(c.COLOR.COLOR_ID, c.ID);
        });

        if (Array.isArray(SIZE_IDS) && SIZE_IDS.length > 0) {
            const invalidSizes = SIZE_IDS.filter(id => !allSizeIds.includes(id));
            if (invalidSizes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid SIZE_ID(s): ${invalidSizes.join(", ")}`,
                });
            }
            validSizeIds = SIZE_IDS;
        }

        if (Array.isArray(COLOR_IDS) && COLOR_IDS.length > 0) {
            const invalidColors = COLOR_IDS.filter(id => !allColorIds.includes(id));
            if (invalidColors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid COLOR_ID(s): ${invalidColors.join(", ")}`,
                });
            }
            validColorIds = COLOR_IDS;
        }

        const sizeKeys = validSizeIds.length > 0 ? validSizeIds : [null];
        const colorKeys = validColorIds.length > 0 ? validColorIds : [null];

        const combinations = [];
        for (const sizeId of sizeKeys) {
            for (const colorId of colorKeys) {
                combinations.push({
                    BOM_TEMPLATE_LIST_ID,
                    BOM_TEMPLATE_SIZE_ID: sizeId ? sizeIdMap.get(sizeId) || null : null,
                    BOM_TEMPLATE_COLOR_ID: colorId ? colorIdMap.get(colorId) || null : null,
                });
            }
        }

        await BomTemplatePendingDimension.bulkCreate(combinations);

        return res.status(201).json({
            success: true,
            message: "Pending dimension details created successfully",
        });
    } catch (error) {
        console.error("Error in createCustomPendingDimensionDetail:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create pending dimension details: ${error.message}`,
        });
    }
};

export const createPendingDimensionDetail = async (req, res) => {
    const { BOM_TEMPLATE_LIST_ID } = req.body;

    if (!BOM_TEMPLATE_LIST_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM_TEMPLATE_LIST_ID is required in request body",
        });
    }

    const MIN_ALLOWED_VALUE = 0.00001;
    try {
        const bomTemplateList = await BomTemplateListModel.findByPk(BOM_TEMPLATE_LIST_ID);
        if (!bomTemplateList) {
            return res.status(404).json({
                success: false,
                message: "BOM template list not found",
            });
        }

        const {
            IS_SPLIT_SIZE,
            IS_SPLIT_COLOR,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            BOM_TEMPLATE_ID } = bomTemplateList.dataValues;

        if (COSTING_CONSUMER_PER_ITEM < MIN_ALLOWED_VALUE || INTERNAL_CUSTOMER_PER_ITEM < MIN_ALLOWED_VALUE) {
            return res.status(400).json({
                success: false,
                message: `Costing values must be at least ${MIN_ALLOWED_VALUE}.`,
            });
        }

        await BomTemplatePendingDimension.destroy({
            where: { BOM_TEMPLATE_LIST_ID },
        });

        const sizes = await BomTemplateSize.findAll({
            where: { BOM_TEMPLATE_ID },
            include: [{
                model: SizeChartMod,
                as: "SIZE",
                attributes: ["SIZE_ID"]
            }]
        });

        const colors = await BomTemplateColor.findAll({
            where: { BOM_TEMPLATE_ID },
            include: [{
                model: ColorChartMod,
                as: "COLOR",
                attributes: ["COLOR_ID"]
            }]
        });

        const existingDetails = await BomTemplateListDetail.findAll({
            where: {
                BOM_TEMPLATE_LIST_ID,
                IS_DELETED: false
            },
            attributes: ['SIZE_ID', 'COLOR_ID']
        });

        const existingCombos = new Set(
            existingDetails.map(d => `${d.SIZE_ID}:${d.COLOR_ID}`)
        );

        const sizeIdToCode = Object.fromEntries(
            sizes.map(s => [s.ID, s.SIZE_ID])
        );

        const colorIdToCode = Object.fromEntries(
            colors.map(c => [c.ID, c.COLOR_ID])
        )

        const sizeIds = sizes.map(s => s.ID);
        const colorIds = colors.map(c => c.ID);

        let templatePending = [];
        if (IS_SPLIT_SIZE && IS_SPLIT_COLOR) {
            for (const sizeId of sizeIds) {
                for (const colorId of colorIds) {
                    const sizeCode = sizeIdToCode[sizeId];
                    const colorCode = colorIdToCode[colorId];
                    if (!existingCombos.has(`${sizeCode}:${colorCode}`)) {
                        templatePending.push({
                            BOM_TEMPLATE_LIST_ID,
                            BOM_TEMPLATE_SIZE_ID: sizeId,
                            BOM_TEMPLATE_COLOR_ID: colorId,
                        });
                    }
                }
            }
        } else if (IS_SPLIT_SIZE) {
            if (sizeIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No sizes found",
                });
            }
            for (const sizeId of sizeIds) {
                const sizeCode = sizeIdToCode[sizeId];
                if (!existingCombos.has(`${sizeCode}:null`)) {
                    templatePending.push({
                        BOM_TEMPLATE_LIST_ID,
                        BOM_TEMPLATE_SIZE_ID: sizeId,
                        BOM_TEMPLATE_COLOR_ID: null,
                    });
                }
            }
        } else if (IS_SPLIT_COLOR) {
            if (colorIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "No colors found",
                });
            }
            for (const colorId of colorIds) {
                const colorCode = colorIdToCode[colorId];
                if (!existingCombos.has(`null:${colorCode}`)) {
                    templatePending.push({
                        BOM_TEMPLATE_LIST_ID,
                        BOM_TEMPLATE_SIZE_ID: null,
                        BOM_TEMPLATE_COLOR_ID: colorId,
                    });
                }
            }
        } else {
            if (!existingCombos.has(`null:null`)) {
                templatePending.push({
                    BOM_TEMPLATE_LIST_ID,
                    BOM_TEMPLATE_SIZE_ID: null,
                    BOM_TEMPLATE_COLOR_ID: null,
                });
            }
        }

        if (templatePending.length > 0) {
            await BomTemplatePendingDimension.bulkCreate(templatePending);
        }

        return res.status(201).json({
            success: true,
            message: "Pending dimension details created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create pending dimension details: ${error.message}`,
        });
    }
};
export const createPendingDimension = async (req, res) => {
    try {
        const {BOM_TEMPLATE_LIST_ID, SIZE_ID, COLOR_ID} = req.body;

        await BomTemplatePendingDimension.create({BOM_TEMPLATE_LIST_ID, SIZE_ID, COLOR_ID});
        return res.status(201).json({
            success: true,
            message: "Pending dimensions created for preview",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create pending dimensions: ${error.message}`,
        });
    }
};


export const updatePendingDimension = async (req, res) => {
    try {
        const {id} = req.params;
        const {BOM_TEMPLATE_LIST_ID, BOM_TEMPLATE_SIZE_ID, BOM_TEMPLATE_COLOR_ID} = req.body;

        const pending = await BomTemplatePendingDimension.findByPk(id);
        if (!pending) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension not found",
            });
        }

        if (!BOM_TEMPLATE_LIST_ID || !BOM_TEMPLATE_SIZE_ID || !BOM_TEMPLATE_COLOR_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_TEMPLATE_LIST_ID, BOM_TEMPLATE_SIZE_ID, and BOM_TEMPLATE_COLOR_ID are required",
            });
        }

        await pending.update({
            BOM_TEMPLATE_LIST_ID,
            BOM_TEMPLATE_SIZE_ID,
            BOM_TEMPLATE_COLOR_ID,
        });

        return res.status(200).json({
            success: true,
            message: "Pending dimension updated successfully",
            data: pending,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update pending dimension: ${error.message}`,
        });
    }
};

export const deletePendingDimension = async (req, res) => {
    try {
        const {id} = req.params;

        const pending = await BomTemplatePendingDimension.findByPk(id);
        if (!pending) {
            return res.status(404).json({
                success: false,
                message: "Pending dimension not found",
            });
        }

        await pending.destroy();

        return res.status(200).json({
            success: true,
            message: "Pending dimension deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete pending dimension: ${error.message}`,
        });
    }
};