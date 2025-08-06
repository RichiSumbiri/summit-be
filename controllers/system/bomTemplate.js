import BomTemplateModel, {BomTemplateRevModel} from "../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import {CustomerDetail, CustomerProductDivision, CustomerProductSeason} from "../../models/system/customer.mod.js";

export const createBomTemplate = async (req, res) => {
    try {
        const { NAME, REVISION_ID, MASTER_ITEM_ID, CUSTOMER_ID, CUSTOMER_DIVISION_ID, CUSTOMER_SESSION_ID, NOTE, IS_ACTIVE, USER_ID } = req.body;

        if (!NAME || !MASTER_ITEM_ID || !CUSTOMER_ID) {
            return res.status(400).json({
                success: false,
                message: "NAME, MASTER_ITEM_ID, and CUSTOMER_ID are required",
            });
        }

        const getLastID = await BomTemplateModel.findOne({
            order: [['ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001': Number(getLastID.ID.slice(-7)) + 1;
        const ID = 'BLT' + newIncrement.toString().padStart(7, '0');

        await BomTemplateModel.create({
            ID,
            NAME,
            REVISION_ID,
            MASTER_ITEM_ID,
            CUSTOMER_ID,
            CUSTOMER_DIVISION_ID,
            CUSTOMER_SESSION_ID,
            NOTE,
            IS_ACTIVE,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "BOM template created successfully",
        });
    } catch (error) {
        console.error("Error creating BOM template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM template: ${error.message}`,
        });
    }
};

export const getAllBomTemplates = async (req, res) => {
    const {MASTER_ITEM_ID, CUSTOMER_ID, REVISION_ID} = req.query
    const where= {IS_DELETED: false}

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
                            attributes: ['ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                        },
                        {
                            model: MasterItemTypes,
                            as: "ITEM_TYPE",
                            attributes: ['ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                        },
                        {
                            model: MasterItemCategories,
                            as: "ITEM_CATEGORY",
                            attributes: ['ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
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
            ]
        });

        return res.status(200).json({
            success: true,
            message: "BOM templates retrieved successfully",
            data: templates,
        });
    } catch (error) {
        console.error("Error retrieving BOM templates:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM templates: ${error.message}`,
        });
    }
};

export const getBomTemplateById = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await BomTemplateModel.findOne({
            where: { ID: id, IS_DELETED: false },
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ['ITEM_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID'],
                    include: [
                        {
                            model: MasterItemGroup,
                            as: "ITEM_GROUP",
                            attributes: ['ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                        },
                        {
                            model: MasterItemTypes,
                            as: "ITEM_TYPE",
                            attributes: ['ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                        },
                        {
                            model: MasterItemCategories,
                            as: "ITEM_CATEGORY",
                            attributes: ['ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                        },
                    ]
                },
                {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ['CTC_ID', 'CTC_CODE']
                },
                {
                    model: CustomerProductDivision,
                    as: "CUSTOMER_DIVISION",
                    attributes: ['CTPROD_DIVISION_ID', 'CTPROD_DIVISION_CODE']
                },
                {
                    model: CustomerProductSeason,
                    as: "CUSTOMER_SESSION",
                    attributes: ['CTPROD_SESION_ID', 'CTPROD_SESION_CODE']
                },
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
        console.error("Error retrieving BOM template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template: ${error.message}`,
        });
    }
};

export const updateBomTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { NAME, REVISION_ID, MASTER_ITEM_ID, CUSTOMER_ID, CUSTOMER_DIVISION_ID, CUSTOMER_SESSION_ID, NOTE, IS_ACTIVE, USER_ID } = req.body;

        const template = await BomTemplateModel.findOne({
            where: { ID: id, IS_DELETED: false },
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "BOM template not found",
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
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM template updated successfully",
        });
    } catch (error) {
        console.error("Error updating BOM template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM template: ${error.message}`,
        });
    }
};

export const deleteBomTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await BomTemplateModel.findOne({
            where: { ID: id },
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
        console.error("Error deleting BOM template:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM template: ${error.message}`,
        });
    }
};

export const createBomTemplateRev = async (req, res) => {
    try {
        const { SEQUENCE, TITLE, DESCRIPTION, BOM_TEMPLATE_ID } = req.body;

        if (!SEQUENCE || !TITLE || !BOM_TEMPLATE_ID) {
            return res.status(400).json({
                success: false,
                message: "SEQUENCE, TITLE, BOM_TEMPLATE_ID are required",
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
        console.error("Error creating BOM template revision:", error);
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
        console.error("Error retrieving BOM template revisions:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template revisions: ${error.message}`,
        });
    }
};

export const getBomTemplateRevById = async (req, res) => {
    try {
        const { id } = req.params;

        const rev = await BomTemplateRevModel.findOne({
            where: { ID: id },
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
        console.error("Error retrieving BOM template revision:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM template revision: ${error.message}`,
        });
    }
};

export const updateBomTemplateRev = async (req, res) => {
    try {
        const { id } = req.params;
        const { SEQUENCE, TITLE, DESCRIPTION, BOM_TEMPLATE_ID } = req.body;

        const rev = await BomTemplateRevModel.findOne({
            where: { ID: id },
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
        console.error("Error updating BOM template revision:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM template revision: ${error.message}`,
        });
    }
};

export const deleteBomTemplateRev = async (req, res) => {
    try {
        const { id } = req.params;

        const rev = await BomTemplateRevModel.findOne({
            where: { ID: id },
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
        console.error("Error deleting BOM template revision:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM template revision: ${error.message}`,
        });
    }
};