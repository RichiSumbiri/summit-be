import BomTemplateModel, {
    BomTemplateColor,
    BomTemplateRevModel,
    BomTemplateSize
} from "../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import {CustomerDetail, CustomerProductDivision, CustomerProductSeason} from "../../models/system/customer.mod.js";
import BomTemplateListModel from "../../models/system/bomTemplateList.mod.js";
import {MasterOrderType} from "../../models/setup/orderType.mod.js";
import sizeChart, {FGSizeChartModel} from "../../models/system/sizeChart.mod.js";
import Users from "../../models/setup/users.mod.js";
import colorChart, {FGColorChartModel} from "../../models/system/colorChart.mod.js";
import {Op} from "sequelize";

export const createBomTemplate = async (req, res) => {
    try {
        let {
            NAME,
            REVISION_ID,
            MASTER_ITEM_ID,
            CUSTOMER_ID,
            CUSTOMER_DIVISION_ID,
            CUSTOMER_SESSION_ID,
            NOTE,
            IS_ACTIVE,
            USER_ID,
            ORDER_TYPE_ID
        } = req.body;

        if (!NAME || !MASTER_ITEM_ID || !CUSTOMER_ID || !ORDER_TYPE_ID) {
            return res.status(400).json({
                success: false,
                message: "Name, Master Item, Order Type and Customer are required",
            });
        }

        const existingTemplate = await BomTemplateModel.findOne({
            where: { NAME: NAME.trim(), IS_DELETED: false },
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: `A BOM template with the name "${NAME.trim()}" already exists. Please choose a different name.`,
            });
        }

        const getLastID = await BomTemplateModel.findOne({
            order: [['ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001' : Number(getLastID.ID.slice(-7)) + 1;
        const ID = 'BTL' + newIncrement.toString().padStart(7, '0');

        if (!CUSTOMER_DIVISION_ID) {
            CUSTOMER_DIVISION_ID = null
        }

        if (!CUSTOMER_SESSION_ID) {
            CUSTOMER_SESSION_ID = null
        }

        const newData = await BomTemplateModel.create({
            ID,
            NAME,
            REVISION_ID,
            MASTER_ITEM_ID,
            CUSTOMER_ID,
            CUSTOMER_DIVISION_ID,
            ORDER_TYPE_ID,
            CUSTOMER_SESSION_ID,
            NOTE,
            IS_ACTIVE,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date(),
        });

        const template = await BomTemplateModel.findOne({
            where: {ID: newData.ID, IS_DELETED: false},
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ['ITEM_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID'],
                    include: [
                        {
                            model: MasterItemGroup,
                            as: "ITEM_GROUP",
                            attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                        },
                        {
                            model: MasterItemTypes,
                            as: "ITEM_TYPE",
                            attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                        },
                        {
                            model: MasterItemCategories,
                            as: "ITEM_CATEGORY",
                            attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                        },
                    ]
                },
                {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ['CTC_ID', 'CTC_CODE', 'CTC_NAME']
                },
                {
                    model: CustomerProductDivision,
                    as: "CUSTOMER_DIVISION",
                    attributes: ['CTPROD_DIVISION_ID', 'CTPROD_DIVISION_CODE', 'CTPROD_DIVISION_NAME']
                },
                {
                    model: CustomerProductSeason,
                    as: "CUSTOMER_SESSION",
                    attributes: ['CTPROD_SESION_ID', 'CTPROD_SESION_CODE', 'CTPROD_SESION_NAME']
                },
                {
                    model: MasterOrderType,
                    as: "ORDER_TYPE",
                    attributes: ['TYPE_ID', 'TYPE_CODE', 'TYPE_DESC']
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "BOM template created successfully",
            data: template
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template: ${error.message}`,
        });
    }
};

export const cloneBomTemplate = async (req, res) => {
    try {
        const {id} = req.params;
        const {NAME, USER_ID} = req.body

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Bom Template is required",
            });
        }

        const existingTemplate = await BomTemplateModel.findOne({
            where: { NAME: NAME.trim(), IS_DELETED: false },
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: `A BOM template with the name "${NAME.trim()}" already exists. Please choose a different name.`,
            });
        }

        const originalTemplate = await BomTemplateModel.findOne({
            where: {ID: id},
        });

        if (!originalTemplate) {
            return res.status(404).json({
                success: false,
                message: "Original BOM template not found",
            });
        }

        const originalLists = await BomTemplateListModel.findAll({
            where: {BOM_TEMPLATE_ID: id},
        });

        const getLastID = await BomTemplateModel.findOne({
            order: [["ID", "DESC"]],
            raw: true,
        });
        const newIncrement = !getLastID ? "0000001" : Number(getLastID.ID.slice(-7)) + 1;
        const clonedTemplateID = "BTL" + newIncrement.toString().padStart(7, "0");

        await BomTemplateModel.create({
            ID: clonedTemplateID,
            NAME: NAME || originalTemplate.NAME,
            ORDER_TYPE_ID: originalTemplate.ORDER_TYPE_ID,
            REVISION_ID: originalTemplate.REVISION_ID,
            MASTER_ITEM_ID: originalTemplate.MASTER_ITEM_ID,
            CUSTOMER_ID: originalTemplate.CUSTOMER_ID,
            CUSTOMER_DIVISION_ID: originalTemplate.CUSTOMER_DIVISION_ID,
            CUSTOMER_SESSION_ID: originalTemplate.CUSTOMER_SESSION_ID,
            NOTE: originalTemplate.NOTE,
            IS_ACTIVE: originalTemplate.IS_ACTIVE,
            CREATED_ID: originalTemplate.CREATED_ID,
            CREATED_AT: new Date(),
        });

        const clonedLists = originalLists.map((list) => {
            const data = list.dataValues
            return {
                BOM_TEMPLATE_ID: clonedTemplateID,
                BOM_TEMPLATE_LINE_ID: data.BOM_TEMPLATE_LINE_ID,
                STATUS: data.STATUS,
                MASTER_ITEM_ID: data.MASTER_ITEM_ID,
                COSTING_CONSUMER_PER_ITEM: data.COSTING_CONSUMER_PER_ITEM,
                INTERNAL_CUSTOMER_PER_ITEM: data.INTERNAL_CUSTOMER_PER_ITEM,
                IS_SPLIT_COLOR: data.IS_SPLIT_COLOR,
                IS_SPLIT_SIZE: data.IS_SPLIT_SIZE,
                VENDOR_ID: data.VENDOR_ID,
                NOTE: data.NOTE,
                IS_SPLIT_STATUS: data.IS_SPLIT_STATUS,
                ITEM_POSITION: data.ITEM_POSITION,
                CREATED_ID: USER_ID || data.CREATED_ID,
                UPDATED_ID: null,
                UPDATED_AT: null,
                CREATED_AT: new Date(),
            }
        });

        if (clonedLists.length > 0) {
            await BomTemplateListModel.bulkCreate(clonedLists);
        }

        return res.status(201).json({
            success: true,
            message: "BOM template and its lists cloned successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to clone BOM template and its lists: ${error.message}`,
        });
    }
};

export const getAllBomTemplates = async (req, res) => {
    const {MASTER_ITEM_ID, CUSTOMER_ID, REVISION_ID} = req.query
    const where = {IS_DELETED: false}

    if (MASTER_ITEM_ID) {
        where.MASTER_ITEM_ID = MASTER_ITEM_ID
    }

    if (CUSTOMER_ID) {
        where.CUSTOMER_ID = CUSTOMER_ID
    }

    if (REVISION_ID) {
        where.REVISION_ID = REVISION_ID
    }

    try {
        const templates = await BomTemplateModel.findAll({
            where,
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ['ITEM_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID'],
                    include: [
                        {
                            model: MasterItemGroup,
                            as: "ITEM_GROUP",
                            attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                        },
                        {
                            model: MasterItemTypes,
                            as: "ITEM_TYPE",
                            attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                        },
                        {
                            model: MasterItemCategories,
                            as: "ITEM_CATEGORY",
                            attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                        },
                    ]
                },
                {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ['CTC_ID', 'CTC_CODE', 'CTC_NAME']
                },
                {
                    model: CustomerProductDivision,
                    as: "CUSTOMER_DIVISION",
                    attributes: ['CTPROD_DIVISION_ID', 'CTPROD_DIVISION_CODE', 'CTPROD_DIVISION_NAME']
                },
                {
                    model: CustomerProductSeason,
                    as: "CUSTOMER_SESSION",
                    attributes: ['CTPROD_SESION_ID', 'CTPROD_SESION_CODE', 'CTPROD_SESION_NAME']
                },
                {
                    model: MasterOrderType,
                    as: "ORDER_TYPE",
                    attributes: ['TYPE_ID', 'TYPE_CODE', 'TYPE_DESC']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "BOM templates retrieved successfully",
            data: templates,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM templates: ${error.message}`,
        });
    }
};

export const getBomTemplateById = async (req, res) => {
    try {
        const {id} = req.params;

        const template = await BomTemplateModel.findOne({
            where: {ID: id, IS_DELETED: false},
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ['ITEM_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID'],
                    include: [
                        {
                            model: MasterItemGroup,
                            as: "ITEM_GROUP",
                            attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                        },
                        {
                            model: MasterItemTypes,
                            as: "ITEM_TYPE",
                            attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                        },
                        {
                            model: MasterItemCategories,
                            as: "ITEM_CATEGORY",
                            attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                        },
                    ]
                },
                {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ['CTC_ID', 'CTC_CODE', 'CTC_NAME']
                },
                {
                    model: CustomerProductDivision,
                    as: "CUSTOMER_DIVISION",
                    attributes: ['CTPROD_DIVISION_ID', 'CTPROD_DIVISION_CODE', 'CTPROD_DIVISION_NAME']
                },
                {
                    model: CustomerProductSeason,
                    as: "CUSTOMER_SESSION",
                    attributes: ['CTPROD_SESION_ID', 'CTPROD_SESION_CODE', 'CTPROD_SESION_NAME']
                },
                {
                    model: MasterOrderType,
                    as: "ORDER_TYPE",
                    attributes: ['TYPE_ID', 'TYPE_CODE', 'TYPE_DESC']
                }
            ]
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "BOM template not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM template retrieved successfully",
            data: template,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template: ${error.message}`,
        });
    }
};

export const updateBomTemplate = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            NAME,
            REVISION_ID,
            MASTER_ITEM_ID,
            CUSTOMER_ID,
            CUSTOMER_DIVISION_ID,
            CUSTOMER_SESSION_ID,
            NOTE,
            IS_ACTIVE,
            USER_ID,
            ORDER_TYPE_ID
        } = req.body;

        const template = await BomTemplateModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "BOM template not found",
            });
        }


        const existingTemplate = await BomTemplateModel.findOne({
            where: { NAME: NAME.trim(), IS_DELETED: false, ID: { [Op.ne]: id } },
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: `A BOM template with the name "${NAME.trim()}" already exists. Please choose a different name.`,
            });
        }

        await template.update({
            NAME,
            REVISION_ID,
            MASTER_ITEM_ID,
            CUSTOMER_ID,
            CUSTOMER_DIVISION_ID,
            CUSTOMER_SESSION_ID,
            NOTE,
            IS_ACTIVE,
            ORDER_TYPE_ID,
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM template updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM template: ${error.message}`,
        });
    }
};

export const deleteBomTemplate = async (req, res) => {
    try {
        const {id} = req.params;

        const template = await BomTemplateModel.findOne({
            where: {ID: id},
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "BOM template not found",
            });
        }

        await template.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM template deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM template: ${error.message}`,
        });
    }
};

export const createBomTemplateRev = async (req, res) => {
    try {
        const {SEQUENCE, TITLE, DESCRIPTION, BOM_TEMPLATE_ID} = req.body;

        if (!SEQUENCE || !TITLE || !BOM_TEMPLATE_ID) {
            return res.status(400).json({
                success: false,
                message: "Sequence, Title, Bom Template are required",
            });
        }

        await BomTemplateRevModel.create({
            SEQUENCE,
            TITLE,
            DESCRIPTION,
            BOM_TEMPLATE_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "BOM template revision created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template revision: ${error.message}`,
        });
    }
};

export const getAllBomTemplateRevs = async (req, res) => {
    try {
        const {BOM_TEMPLATE_ID, SEQUENCE} = req.query
        const where = {}

        if (BOM_TEMPLATE_ID) {
            where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID
        }

        if (SEQUENCE) {
            where.SEQUENCE = SEQUENCE
        }

        const revs = await BomTemplateRevModel.findAll({
            where,
        });

        return res.status(200).json({
            success: true,
            message: "BOM template revisions retrieved successfully",
            data: revs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template revisions: ${error.message}`,
        });
    }
};

export const getBomTemplateRevById = async (req, res) => {
    try {
        const {id} = req.params;

        const rev = await BomTemplateRevModel.findOne({
            where: {ID: id},
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "BOM template revision not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM template revision retrieved successfully",
            data: rev,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template revision: ${error.message}`,
        });
    }
};

export const updateBomTemplateRev = async (req, res) => {
    try {
        const {id} = req.params;
        const {SEQUENCE, TITLE, DESCRIPTION, BOM_TEMPLATE_ID} = req.body;

        const rev = await BomTemplateRevModel.findOne({
            where: {ID: id},
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "BOM template revision not found",
            });
        }

        await rev.update({
            SEQUENCE,
            TITLE,
            DESCRIPTION,
            BOM_TEMPLATE_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM template revision updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM template revision: ${error.message}`,
        });
    }
};

export const deleteBomTemplateRev = async (req, res) => {
    try {
        const {id} = req.params;

        const rev = await BomTemplateRevModel.findOne({
            where: {ID: id},
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "BOM template revision not found",
            });
        }

        await rev.destroy();
        return res.status(200).json({
            success: true,
            message: "BOM template revision deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM template revision: ${error.message}`,
        });
    }
};

export const bomTemplateGetAllColors = async (req, res) => {
    try {
        const colors = await BomTemplateColor.findAll({
            order: [["ID", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "BOM Template Colors retrieved successfully",
            colors,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM Template Colors: ${error.message}`,
        });
    }
};

export const bomTemplateGetColorById = async (req, res) => {
    try {
        const {id} = req.params;

        const color = await BomTemplateColor.findOne({
            where: {ID: id},
        });

        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Color not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Color retrieved successfully",
            color,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve color: ${error.message}`,
        });
    }
};

export const bomTemplateCreateColor = async (req, res) => {
    try {
        const {COLOR_ID, BOM_TEMPLATE_ID} = req.body;

        if (!BOM_TEMPLATE_ID) {
            return res.status(400).json({
                success: false,
                message: "Bom Template is required",
            });
        }

        const newColor = await BomTemplateColor.create({
            COLOR_ID,
            BOM_TEMPLATE_ID,
        });

        return res.status(201).json({
            success: true,
            message: "Color created successfully",
            newColor,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create color: ${error.message}`,
        });
    }
};

export const bomTemplateUpdateColor = async (req, res) => {
    try {
        const {id} = req.params;
        const {COLOR_ID, BOM_TEMPLATE_ID} = req.body;

        const color = await BomTemplateColor.findOne({
            where: {ID: id},
        });
        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Color not found",
            });
        }

        await color.update({
            COLOR_ID,
            BOM_TEMPLATE_ID: BOM_TEMPLATE_ID || color.BOM_TEMPLATE_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Color updated successfully",
            color: await color.reload(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update color: ${error.message}`,
        });
    }
};

export const bomTemplateDeleteColor = async (req, res) => {
    try {
        const {id} = req.params;

        const color = await BomTemplateColor.findOne({
            where: {ID: id},
        });
        if (!color) {
            return res.status(404).json({
                success: false,
                message: "Color not found",
            });
        }

        await color.update({
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Color deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete color: ${error.message}`,
        });
    }
};


export const bomTemplateGetAllSizes = async (req, res) => {
    try {
        const sizes = await BomTemplateSize.findAll({
            order: [["ID", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "BOM Template Sizes retrieved successfully",
            sizes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sizes: ${error.message}`,
        });
    }
};

export const bomTemplateGetSizeById = async (req, res) => {
    try {
        const {id} = req.params;

        const size = await BomTemplateSize.findOne({
            where: {ID: id},
        });

        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Size not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Size retrieved successfully",
            size,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve size: ${error.message}`,
        });
    }
};

export const bomTemplateCreateSize = async (req, res) => {
    try {
        const {SIZE_ID, BOM_TEMPLATE_ID} = req.body;

        if (!BOM_TEMPLATE_ID) {
            return res.status(400).json({
                success: false,
                message: "Bom Template is required",
            });
        }

        const newSize = await BomTemplateSize.create({
            SIZE_ID,
            BOM_TEMPLATE_ID,
        });

        return res.status(201).json({
            success: true,
            message: "Size created successfully",
            newSize,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create size: ${error.message}`,
        });
    }
};

export const bomTemplateUpdateSize = async (req, res) => {
    try {
        const {id} = req.params;
        const {SIZE_ID, BOM_TEMPLATE_ID} = req.body;

        const size = await BomTemplateSize.findOne({
            where: {ID: id},
        });
        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Size not found",
            });
        }

        await size.update({
            SIZE_ID,
            BOM_TEMPLATE_ID: BOM_TEMPLATE_ID || size.BOM_TEMPLATE_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Size updated successfully",
            size: await size.reload(),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update size: ${error.message}`,
        });
    }
};

export const bomTemplateDeleteSize = async (req, res) => {
    try {
        const {id} = req.params;

        const size = await BomTemplateSize.findOne({
            where: {ID: id},
        });
        if (!size) {
            return res.status(404).json({
                success: false,
                message: "Size not found",
            });
        }

        await size.update({
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Size deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete size: ${error.message}`,
        });
    }
};

export const getAllFGSizeCharts = async (req, res) => {
    try {
        const {MASTER_ITEM_ID, BOM_TEMPLATE_ID} = req.query;

        const isBomTemplateProvided = BOM_TEMPLATE_ID;

        const whereFG = {
            IS_DELETED: false,
        };

        if (MASTER_ITEM_ID) {
            whereFG.MASTER_ITEM_ID = MASTER_ITEM_ID;
        }

        const entries = await FGSizeChartModel.findAll({
            where: whereFG,
            include: [
                {
                    model: sizeChart,
                    as: "SIZE",
                    attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION", "IS_ACTIVE", "CREATED_AT", "UPDATED_AT"],
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"]
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ["USER_NAME"]
                }
            ],
        });

        let selectedSizeIds = [];
        if (isBomTemplateProvided) {
            const selectedRecords = await BomTemplateSize.findAll({
                where: {
                    BOM_TEMPLATE_ID: BOM_TEMPLATE_ID,
                    DELETED_AT: null
                },
                attributes: ["SIZE_ID"],
            });

            selectedSizeIds = selectedRecords.map(record => record.SIZE_ID);
        }

        const responseData = entries.map(entry => {
            const plainEntry = entry.get({plain: true});
            const sizeId = plainEntry.SIZE?.SIZE_ID;

            return {
                ...plainEntry,
                SELECTED: isBomTemplateProvided && sizeId ? selectedSizeIds.includes(sizeId) : false
            };
        });

        return res.status(200).json({
            success: true,
            message: "FG size charts retrieved successfully",
            data: responseData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve FG size charts: ${error.message}`,
        });
    }
};


export const getAllFGColorCharts = async (req, res) => {
    try {
        const {MASTER_ITEM_ID, BOM_TEMPLATE_ID} = req.query;

        const where = {IS_DELETED: false};
        if (MASTER_ITEM_ID) {
            where.MASTER_ITEM_ID = MASTER_ITEM_ID;
        }

        const entries = await FGColorChartModel.findAll({
            where,
            include: [
                {
                    model: colorChart,
                    as: "COLOR",
                    attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION", "IS_ACTIVE", "CREATED_AT", "UPDATED_AT"],
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"]
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ["USER_NAME"]
                }
            ],
        });

        let selectedColorIds = [];
        if (BOM_TEMPLATE_ID) {
            const selectedRecords = await BomTemplateColor.findAll({
                where: {
                    BOM_TEMPLATE_ID: BOM_TEMPLATE_ID,
                    DELETED_AT: null
                },
                attributes: ["COLOR_ID"],
            });

            selectedColorIds = selectedRecords.map(record => record.COLOR_ID);
        }

        const responseData = entries.map(entry => {
            const plainEntry = entry.get({plain: true});
            const colorId = plainEntry.COLOR?.COLOR_ID;

            return {
                ...plainEntry,
                SELECTED: BOM_TEMPLATE_ID && colorId ? selectedColorIds.includes(colorId) : false
            };
        });

        return res.status(200).json({
            success: true,
            message: "FG color charts retrieved successfully",
            data: responseData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve FG color charts: ${error.message}`,
        });
    }
};

export const bulkCreateBomTemplateColor = async (req, res) => {
    const {body} = req;
    try {
        const colors = await Promise.all(
            body.map(item => BomTemplateColor.create(item))
        );
        return res.status(201).json({
            success: true,
            message: "Colors added successfully",
            colors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const bulkCreateBomTemplateSize = async (req, res) => {
    const {body} = req;
    try {
        const colors = await Promise.all(
            body.map(item => BomTemplateSize.create(item))
        );
        return res.status(201).json({
            success: true,
            message: "Sizes added successfully",
            colors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const bulkDeleteBomTemplateColor = async (req, res) => {
    const {ids} = req.body;
    try {
        await BomTemplateColor.update(
            {DELETED_AT: new Date()},
            {where: {ID: ids}}
        );
        return res.status(200).json({
            success: true,
            message: "Colors removed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const bulkDeleteBomTemplateSize = async (req, res) => {
    const {ids} = req.body;
    try {
        await BomTemplateSize.update(
            {DELETED_AT: new Date()},
            {where: {ID: ids}}
        );
        return res.status(200).json({
            success: true,
            message: "Sizes removed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const bulkToggleBomTemplateColor = async (req, res) => {
    const {body} = req;

    if (!Array.isArray(body) || body.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Request body must be a non-empty array",
        });
    }

    try {
        for (const item of body) {
            const {COLOR_ID, BOM_TEMPLATE_ID} = item;

            if (!COLOR_ID || !BOM_TEMPLATE_ID) {
                continue;
            }

            const existing = await BomTemplateColor.findOne({
                where: {
                    COLOR_ID,
                    BOM_TEMPLATE_ID,
                    DELETED_AT: null,
                },
            });

            if (existing) {
                await existing.update({DELETED_AT: new Date()});
            } else {
                await BomTemplateColor.create({
                    COLOR_ID,
                    BOM_TEMPLATE_ID,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Bulk toggle completed",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const bulkToggleBomTemplateSize = async (req, res) => {
    const {body} = req;

    if (!Array.isArray(body) || body.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Request body must be a non-empty array",
        });
    }

    try {

        for (const item of body) {
            const {SIZE_ID, BOM_TEMPLATE_ID} = item;

            if (!SIZE_ID || !BOM_TEMPLATE_ID) {
                continue;
            }

            const existing = await BomTemplateSize.findOne({
                where: {
                    SIZE_ID,
                    BOM_TEMPLATE_ID,
                    DELETED_AT: null,
                },
            });

            if (existing) {
                await existing.update({DELETED_AT: new Date()});
            } else {
                await BomTemplateSize.create({
                    SIZE_ID,
                    BOM_TEMPLATE_ID,
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Bulk toggle completed",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};