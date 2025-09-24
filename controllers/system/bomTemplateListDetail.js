import BomTemplateListDetail from "../../models/materialManagement/bomTemplate/bomTemplateListDetail.mod.js";
import BomTemplateListModel from "../../models/materialManagement/bomTemplate/bomTemplateList.mod.js";
import MasterItemDimensionModel from "../../models/system/masterItemDimention.mod.js";
import ColorChartMod from "../../models/system/colorChart.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import BomTemplateModel, {BomTemplateColor, BomTemplateSize} from "../../models/materialManagement/bomTemplate/bomTemplate.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {ModelVendorDetail} from "../../models/system/VendorDetail.mod.js";
import BomTemplatePendingDimension from "../../models/materialManagement/bomTemplate/bomTemplatePandingDimension.mod.js";
import {DataTypes} from "sequelize";
import {MIN_ALLOWED_VALUE} from "../../util/enum.js";


export const getAllBomTemplateListDetails = async (req, res) => {
    try {
        const { BOM_TEMPLATE_LIST_ID } = req.query;

        const where = {IS_DELETED: false};
        if (BOM_TEMPLATE_LIST_ID) {
            where.BOM_TEMPLATE_LIST_ID = BOM_TEMPLATE_LIST_ID;
        }

        const details = await BomTemplateListDetail.findAll({
            where,
            include: [
                {
                    model: BomTemplateListModel,
                    as: "ITEM_LIST",
                    attributes: ["BOM_TEMPLATE_LINE_ID", "BOM_TEMPLATE_ID", "STATUS", "MASTER_ITEM_ID", "VENDOR_ID", "INTERNAL_CUSTOMER_PER_ITEM", "COSTING_CONSUMER_PER_ITEM"],
                    include: [
                        {
                            model: ModelVendorDetail,
                            as: "VENDOR",
                            attributes: ["VENDOR_ID", "VENDOR_CODE", "VENDOR_NAME"]
                        },
                        {
                            model: MasterItemIdModel,
                            as: "MASTER_ITEM",
                            attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_UOM_BASE"]
                        }
                    ]
                },
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION",
                    attributes: ["ID", "DIMENSION_ID", "COLOR_ID", "SIZE_ID", "SERIAL_NO"],
                    include: [
                        {
                            model: ColorChartMod,
                            as: "MASTER_COLOR",
                            attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                        },
                        {
                            model: SizeChartMod,
                            as: "MASTER_SIZE",
                            attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                        },
                    ]
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
            ],
            order: [["ITEM_SPLIT_ID", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "BOM template list details retrieved successfully",
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template list details: ${error.message}`,
        });
    }
};


export const getBomTemplateListDetailById = async (req, res) => {
    try {
        const { id } = req.params;

        const detail = await BomTemplateListDetail.findByPk(id, {
            include: [
                {
                    model: BomTemplateListModel,
                    as: "ITEM_LIST",
                    attributes: ["BOM_TEMPLATE_LINE_ID", "STATUS"],
                },
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION",
                    attributes: ["ID", "DESCRIPTION"],
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
            ],
        });

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "BOM template list detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM template list detail retrieved successfully",
            data: detail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template list detail: ${error.message}`,
        });
    }
};


export const createBomTemplateListDetailBulk = async (req, res) => {
    try {
        const {ITEM_DIMENSION_ID, BOM_TEMPLATE_LIST_ID, PENDING_LIST} = req.body;
        if (!ITEM_DIMENSION_ID || !BOM_TEMPLATE_LIST_ID) {
            return res.status(400).json({status: false, message: "Item Dimension and Bom Template List are required"})
        }

        if (!Array.isArray(PENDING_LIST)) {
            return res.status(400).json({status: false, message: "Pending list must be array"})
        }

        const itemDimension = await MasterItemDimensionModel.findOne({
            where: {
                ID:ITEM_DIMENSION_ID
            }
        })
        if (!itemDimension) {
            return res.status(400).json({
                status: false,
                message: "Item dimension not found"
            });
        }

        const listPendingDimension = await Promise.all(PENDING_LIST.map(async (item) => {
            const pending = await BomTemplatePendingDimension.findOne({where: {ID: item?.ID}, include: [
                    {
                        model: BomTemplateSize,
                        as: "SIZE",
                        attributes: ["SIZE_ID"]
                    },
                    {
                        model: BomTemplateColor,
                        as: "COLOR",
                        attributes: ["COLOR_ID"]
                    }
                ]})
            if (!pending) {
                throw new Error(`Pending dimension with ID ${item} not found`);
            }

            if (pending.COSTING_CONSUMER_PER_ITEM < MIN_ALLOWED_VALUE || pending.INTERNAL_CUSTOMER_PER_ITEM < MIN_ALLOWED_VALUE) {
                throw new Error(`Costing and internal values must not be zero`);
            }
            return { ...pending.dataValues }
        }))

        const count = await BomTemplateListDetail.count({
            where: {BOM_TEMPLATE_LIST_ID}
        })

        const listDetail = []
        listPendingDimension.forEach((item, idx) => {
            listDetail.push({
                BOM_TEMPLATE_LIST_ID: BOM_TEMPLATE_LIST_ID,
                ITEM_SPLIT_ID: count + (idx+1),
                COSTING_CONSUMER_PER_ITEM: item.COSTING_CONSUMER_PER_ITEM,
                INTERNAL_CUSTOMER_PER_ITEM: item.INTERNAL_CUSTOMER_PER_ITEM,
                ITEM_DIMENSION_ID: ITEM_DIMENSION_ID,
                SIZE_ID: item.SIZE?.SIZE_ID,
                COLOR_ID: item.COLOR?.COLOR_ID
            })
        })

        await BomTemplateListDetail.bulkCreate(listDetail);

        await Promise.all(listPendingDimension.map(async (item) => {
            await BomTemplatePendingDimension.destroy({
                where: {ID: item.ID}
            })
        }))

        return res.status(201).json({
            success: true,
            message: `Created BOM template list detail(s)`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template list detail: ${error.message}`,
        });
    }
};


export const revertListDetailBulk = async (req, res) => {
    const {list, BOM_TEMPLATE_LIST_ID } = req.body

    if (!Array.isArray(list)) {
        return res.status(400).json({
            success: false,
            message: `Request list must be array`,
        });
    }

    if (!BOM_TEMPLATE_LIST_ID) {
        return res.status(400).json({
            success: false,
            message: `Bom Template list must be required`,
        });
    }

    const templateListId = await BomTemplateListModel.findByPk(BOM_TEMPLATE_LIST_ID)
    if (!templateListId) {
        return res.status(404).json({
            success: false,
            message: `Bom Template list not found`,
        });
    }
    try {
        const listDetail = await Promise.all(list.map(async (item) => {
            const dt = await BomTemplateListDetail.findByPk(item)
            if (!dt) {
                throw new Error("Bom Template List Detail not found")
            }
            const templateSize = await BomTemplateSize.findOne({
                where: {
                    BOM_TEMPLATE_ID: templateListId.dataValues.BOM_TEMPLATE_ID,
                    SIZE_ID: dt.SIZE_ID
                }
            })

            const templateColor = await BomTemplateColor.findOne({ where: {
                    BOM_TEMPLATE_ID: templateListId.dataValues.BOM_TEMPLATE_ID,
                    COLOR_ID: dt.COLOR_ID
            }})

            return {...dt.dataValues, SIZE_TEMP: templateSize ? templateSize.dataValues : null, COLOR_TEMP: templateColor ? templateColor.dataValues : null}
        }))
        await  BomTemplatePendingDimension.bulkCreate(listDetail.map((item) => ({
            BOM_TEMPLATE_LIST_ID: BOM_TEMPLATE_LIST_ID,
            BOM_TEMPLATE_SIZE_ID: item?.SIZE_TEMP?.ID,
            BOM_TEMPLATE_COLOR_ID:item?.COLOR_TEMP?.ID,
            INTERNAL_CUSTOMER_PER_ITEM: item.INTERNAL_CUSTOMER_PER_ITEM,
            COSTING_CONSUMER_PER_ITEM: item.COSTING_CONSUMER_PER_ITEM,
            CREATED_AT: new Date()
        })))

        await BomTemplateListDetail.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        },{
            where: {
                id: listDetail.map((item) => item.ID),
            },
        });

        return res.status(200).json({
            success: true,
            message: `Success add bom template list`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template list detail: ${error.message}`,
        });
    }
}

export const createBomTemplateListDetail = async (req, res) => {
    try {
        const { BOM_TEMPLATE_LIST_ID, INTERNAL_CUSTOMER_PER_ITEM, COSTING_CONSUMER_PER_ITEM, ITEM_SPLIT_ID, ITEM_DIMENSION_ID, SIZE_ID, COLOR_ID } = req.body;

        if (!ITEM_DIMENSION_ID || !SIZE_ID || !COLOR_ID) {
            return res.status(400).json({
                success: false,
                message: "ITEM_DIMENSION_ID, SIZE_ID, and COLOR_ID are required",
            });
        }

        await BomTemplateListDetail.create({
            BOM_TEMPLATE_LIST_ID, ITEM_SPLIT_ID: ITEM_SPLIT_ID ?? null, ITEM_DIMENSION_ID, INTERNAL_CUSTOMER_PER_ITEM, COSTING_CONSUMER_PER_ITEM, SIZE_ID, COLOR_ID,
        });

        return res.status(201).json({
            success: true,
            message: "BOM template list detail created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template list detail: ${error.message}`,
        });
    }
};

export const updateBomTemplateListDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { ITEM_SPLIT_ID, ITEM_DIMENSION_ID, SIZE_ID, COLOR_ID } = req.body;

        const detail = await BomTemplateListDetail.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "BOM template list detail not found",
            });
        }

        await detail.update({
            ITEM_SPLIT_ID: ITEM_SPLIT_ID || null,
            ITEM_DIMENSION_ID: ITEM_DIMENSION_ID ?? detail.ITEM_DIMENSION_ID,
            SIZE_ID: SIZE_ID ?? detail.SIZE_ID,
            COLOR_ID: COLOR_ID ?? detail.COLOR_ID,
        });

        return res.status(200).json({
            success: true,
            message: "BOM template list detail updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM template list detail: ${error.message}`,
        });
    }
};


export const deleteBomTemplateListDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const detail = await BomTemplateListDetail.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "BOM template list detail not found",
            });
        }

        await detail.destroy();

        return res.status(200).json({
            success: true,
            message: "BOM template list detail deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM template list detail: ${error.message}`,
        });
    }
};