import BomTemplateModel, {
    BomTemplateColor, BomTemplateNote,
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
import {Op, where} from "sequelize";
import ColorChartMod from "../../models/system/colorChart.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";

export const createBomTemplate = async (req, res) => {
    try {
        let { NAME, LAST_REV_ID, MASTER_ITEM_ID, CUSTOMER_ID, CUSTOMER_DIVISION_ID, CUSTOMER_SESSION_ID, NOTE, IS_ACTIVE, USER_ID, ORDER_TYPE_ID } = req.body;

        if (!NAME || !MASTER_ITEM_ID || !CUSTOMER_ID || !ORDER_TYPE_ID) {
            return res.status(400).json({
                success: false,
                message: "Name, Master Item, Order Type and Customer are required",
            });
        }

        const existingTemplate = await BomTemplateModel.findOne({
            where: {MASTER_ITEM_ID, ORDER_TYPE_ID, IS_DELETED: false},
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: `A BOM template already exists for this master item and order type. Only one template is allowed per item and order type`,
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
            LAST_REV_ID,
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

        await BomTemplateNote.create({
            BOM_TEMPLATE_ID: newData.ID,
            REV_ID: LAST_REV_ID,
            NOTE,
            IS_APPROVE: false,
        })


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

        const bomNotes = await BomTemplateNote.findOne({
            where: {
                BOM_TEMPLATE_ID: template.ID,
                REV_ID: template.LAST_REV_ID
            }
        })

        return res.status(201).json({
            success: true,
            message: "BOM template created successfully",
            data: {...template.dataValues, NOTE: bomNotes?.NOTE ?? "", IS_APPROVE: bomNotes?.IS_APPROVE ?? false  }
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
        const {NAME, USER_ID, LAST_REV_ID, ORDER_TYPE_ID} = req.body

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "BOM Template ID is required to update the record.",
            });
        }

        if (!ORDER_TYPE_ID || !NAME) {
            return res.status(400).json({
                success: false,
                message: "NAME and ORDER_TYPE_ID are required fields.",
            });
        }

        const originalTemplate = await BomTemplateModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!originalTemplate) {
            return res.status(404).json({
                success: false,
                message: "Original BOM template not found",
            });
        }

        const existingTemplate = await BomTemplateModel.findOne({
            where: {MASTER_ITEM_ID: originalTemplate.MASTER_ITEM_ID, ORDER_TYPE_ID,  IS_DELETED: false},
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: `A BOM template already exists for this master item and order type. Only one template is allowed per item and order type`,
            });
        }

        const originalLists = await BomTemplateListModel.findAll({
            where: {
                BOM_TEMPLATE_ID: id,
                REV_ID: LAST_REV_ID ?? 0,
                IS_DELETED: false,
                STATUS: {[Op.in]: ["Open", "Confirmed"]}
            },
        })

        const originalColor = await BomTemplateColor.findAll({
            where: {BOM_TEMPLATE_ID: id, REV_ID: LAST_REV_ID ?? 0, DELETED_AT: null}
        })

        const originalSize = await BomTemplateSize.findAll({
            where: {BOM_TEMPLATE_ID: id, REV_ID: LAST_REV_ID ?? 0, DELETED_AT: null}
        })

        const getLastID = await BomTemplateModel.findOne({
            order: [["ID", "DESC"]],
            raw: true,
        });
        const newIncrement = !getLastID ? "0000001" : Number(getLastID.ID.slice(-7)) + 1;
        const clonedTemplateID = "BTL" + newIncrement.toString().padStart(7, "0");
        await BomTemplateModel.create({
            ...originalTemplate.dataValues,
            ID: clonedTemplateID,
            NAME: NAME,
            ORDER_TYPE_ID,
            LAST_REV_ID: 0,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date(),
            UPDATED_AT: null,
            UPDATED_ID: null,
        });

        if (originalColor) {
            await BomTemplateColor.bulkCreate(originalColor.map((item) => ({
                ...item.dataValues,
                ID: null,
                BOM_TEMPLATE_ID: clonedTemplateID,
                REV_ID: 0,
                CREATED_AT: new Date(),
                UPDATED_AT: null,
                DELETED_AT: null
            })))
        }
        if (originalSize) {
            await BomTemplateSize.bulkCreate(originalSize.map((item) => ({
                ...item.dataValues,
                ID: null,
                BOM_TEMPLATE_ID: clonedTemplateID,
                REV_ID: 0,
                CREATED_AT: new Date(),
                UPDATED_AT: null,
                DELETED_AT: null
            })))
        }

        const masterNote = await BomTemplateNote.findOne({where: {BOM_TEMPLATE_ID: id, REV_ID: LAST_REV_ID}})
        if (masterNote) {
            await BomTemplateNote.create({
                BOM_TEMPLATE_ID: clonedTemplateID,
                REV_ID: 0,
                NOTE: masterNote.NOTE,
                IS_APPROVE: false,
            })
        }

        if (originalLists.length) {
            const masterItemId = await  MasterItemIdModel.findOne({
                ID: originalTemplate.MASTER_ITEM_ID
            })

            await BomTemplateListModel.bulkCreate(originalLists.map((item, idx) => ({
                ...item.dataValues,
                ID: null,
                BOM_TEMPLATE_ID: clonedTemplateID,
                BOM_TEMPLATE_LINE_ID: idx + 1,
                REV_ID: 0,
                STATUS: "Open",
                IS_SPLIT_STATUS: false,
                CREATED_ID: USER_ID,
                UPDATED_ID: null,
                UPDATED_AT: null,
                CREATED_AT: new Date(),
                CONSUMPTION_UOM: masterItemId?.ITEM_UOM_BASE || "",
            })));
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

export const saveNewRevision = async (req, res) => {
    try {
        const {id} = req.params
        const {USER_ID, NOTE} = req.body
        if (!id) {
            return res.status(400).json({
                success: false, message: "Bom Template is required",
            });
        }

        const originalTemplate = await BomTemplateModel.findOne({
            where: {ID: id},
        });

        if (!originalTemplate) {
            return res.status(404).json({
                success: false, message: "Original BOM template not found",
            });
        }

        if (originalTemplate.LAST_REV_ID) {
            const tempId = originalTemplate.ID
            const LAST_REV_ID = originalTemplate.LAST_REV_ID

            const currentRev = await BomTemplateRevModel.findOne({
                where: {BOM_TEMPLATE_ID: tempId, ID: LAST_REV_ID}
            });

            const olderRev = await BomTemplateRevModel.findOne({
                where: {
                    BOM_TEMPLATE_ID: tempId, SEQUENCE: currentRev.SEQUENCE - 1
                }
            });

            const newColorCount = await BomTemplateColor.count({
                where: {REV_ID: currentRev?.ID ?? 0, BOM_TEMPLATE_ID: tempId, DELETED_AT: null}
            });
            const oldColorCount = await BomTemplateColor.count({
                where: {REV_ID: olderRev?.ID ?? 0, BOM_TEMPLATE_ID: tempId, DELETED_AT: null}
            });
            const newSizeCount = await BomTemplateSize.count({
                where: {REV_ID: currentRev?.ID ?? 0, BOM_TEMPLATE_ID: tempId, DELETED_AT: null}
            });
            const oldSizeCount = await BomTemplateSize.count({
                where: {REV_ID: olderRev?.ID ?? 0, BOM_TEMPLATE_ID: tempId, DELETED_AT: null}
            });

            if (newColorCount === oldColorCount && newSizeCount === oldSizeCount) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot create revision because there are no changes in size or color compared to the previous revision."
                });
            }
        }

        const countRev = await BomTemplateRevModel.count({
            where: {
                BOM_TEMPLATE_ID: id
            }
        })

        const originalLists = await BomTemplateListModel.findAll({
            where: {
                BOM_TEMPLATE_ID: id,
                REV_ID: originalTemplate.LAST_REV_ID,
                IS_DELETED: false,
                STATUS: {[Op.in]: ["Open", "Confirmed"]}
            },
        });

        const originalColor = await BomTemplateColor.findAll({
            where: {BOM_TEMPLATE_ID: id, REV_ID: originalTemplate.LAST_REV_ID, DELETED_AT: null}
        })

        const originalSize = await BomTemplateSize.findAll({
            where: {BOM_TEMPLATE_ID: id, REV_ID: originalTemplate.LAST_REV_ID, DELETED_AT: null}
        })

        if (!originalColor.length) {
            return res.status(404).json({
                success: false, message: "FG Item Color cannot empty",
            });
        }

        if (!originalSize.length) {
            return res.status(404).json({
                success: false, message: "FG Item Size cannot empty",
            });
        }
        if (!originalLists.length) {
            return res.status(404).json({
                success: false, message: "Bom Template List cannot empty",
            });
        }

        const newRev = await BomTemplateRevModel.create({
            TITLE: `Revision ${originalTemplate.NAME}`,
            DESCRIPTION: `Revision ${originalTemplate.NAME} ke ${countRev + 1}`,
            BOM_TEMPLATE_ID: id,
            SEQUENCE: countRev + 1
        })
        await BomTemplateColor.bulkCreate(originalColor.map((item) => ({
            ...item.dataValues,
            ID: null,
            REV_ID: newRev.dataValues.ID,
            CREATED_AT: new Date(),
            UPDATED_AT: null,
            DELETED_AT: null
        })))

        await BomTemplateSize.bulkCreate(originalSize.map((item) => ({
            ...item.dataValues,
            ID: null,
            REV_ID: newRev.dataValues.ID,
            CREATED_AT: new Date(),
            UPDATED_AT: null,
            DELETED_AT: null
        })))

        const masterItemId = await  MasterItemIdModel.findOne({
            ID: originalTemplate.MASTER_ITEM_ID
        })


        await BomTemplateListModel.bulkCreate(originalLists.map((item, idx) => ({
            ...item.dataValues,
            ID: null,
            STATUS: "Open",
            IS_SPLIT_STATUS: false,
            BOM_TEMPLATE_LINE_ID: idx + 1,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date(),
            UPDATED_ID: null,
            UPDATED_AT: null,
            REV_ID: newRev.ID,
            CONSUMPTION_UOM: masterItemId?.ITEM_UOM_BASE || ""
        })));

        await BomTemplateNote.create({
            BOM_TEMPLATE_ID: id, REV_ID: newRev.ID, NOTE: NOTE, IS_APPROVE: false,
        })

        await BomTemplateModel.update({
            LAST_REV_ID: newRev.dataValues.ID,
            NOTE
        }, {
            where: {
                ID: id
            }
        })

        return res.status(201).json({
            success: true, message: "BOM template and its lists cloned successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM templates: ${error.message}`,
        });
    }
}


export const getAllBomTemplates = async (req, res) => {
    const {MASTER_ITEM_ID, CUSTOMER_ID, LAST_REV_ID, ORDER_TYPE_CODE} = req.query
    const where = {IS_DELETED: false}

    if (MASTER_ITEM_ID) {
        where.MASTER_ITEM_ID = MASTER_ITEM_ID
    }

    if (CUSTOMER_ID) {
        where.CUSTOMER_ID = CUSTOMER_ID
    }

    if (LAST_REV_ID) {
        where.LAST_REV_ID = LAST_REV_ID
    }

    if (ORDER_TYPE_CODE) {
        const orderType = await MasterOrderType.findOne({ where: {
                TYPE_CODE: ORDER_TYPE_CODE
        }})
        if (!orderType) {
            return res.status(400).json({status: false, message: "Order Type Code Not Found"})
        }
        where.ORDER_TYPE_ID = orderType.TYPE_ID
    }

    try {
        const templates = await BomTemplateModel.findAll({
            where,
            attributes: ['MASTER_ITEM_ID', 'CUSTOMER_ID', 'CUSTOMER_DIVISION_ID', 'CUSTOMER_SESSION_ID', 'ORDER_TYPE_ID', 'LAST_REV_ID', 'ID', 'NAME', 'CREATED_AT', 'UPDATED_AT', 'IS_DELETED', 'DELETED_AT', 'IS_ACTIVE', 'CREATED_ID', 'UPDATED_ID'],
            include: [
                {
                    model: BomTemplateRevModel,
                    as: "LAST_REV",
                    attributes: ['TITLE', 'DESCRIPTION', 'SEQUENCE']
                },
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

        const templateData = await Promise.all(
            templates.map(async (item) => {
                const bomNotes = await BomTemplateNote.findOne({
                    where: {
                        BOM_TEMPLATE_ID: item.ID,
                        REV_ID: item.LAST_REV_ID,
                    },
                });


                return {
                    ...item.toJSON(),
                    NOTE: bomNotes?.NOTE ?? "",
                    IS_APPROVE: bomNotes?.IS_APPROVE ?? false
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: "BOM templates retrieved successfully",
            data: templateData
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
            LAST_REV_ID,
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
            where: {MASTER_ITEM_ID, ORDER_TYPE_ID, IS_DELETED: false, ID: {[Op.ne]: id}},
        });

        if (existingTemplate) {
            return res.status(400).json({
                success: false,
                message: `A BOM template already exists for this master item and order type. Only one template is allowed per item and order type`,
            });
        }

        await template.update({
            NAME,
            MASTER_ITEM_ID,
            CUSTOMER_ID,
            CUSTOMER_DIVISION_ID,
            CUSTOMER_SESSION_ID,
            IS_ACTIVE,
            ORDER_TYPE_ID,
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date(),
        });

        const [note, created] = await BomTemplateNote.findOrCreate({
            where: { BOM_TEMPLATE_ID: id, REV_ID: LAST_REV_ID },
            defaults: { NOTE }
        });

        if (!created) {
            await note.update({ NOTE });
        }


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
            STATUS: false,
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
    const {REV_ID, BOM_TEMPLATE_ID} = req.query
    const where = {
        REV_ID: REV_ID || 0,
        DELETED_AT: null,
    }
    if (BOM_TEMPLATE_ID) {
        where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID
    }
    try {
        const colors = await BomTemplateColor.findAll({
            where,
            include: [{
                model: ColorChartMod,
                as: "COLOR",
                attributes: ['COLOR_ID', 'COLOR_CODE', 'COLOR_DESCRIPTION', 'IS_ACTIVE']
            }],
            order: [["ID", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "BOM Template Colors retrieved successfully",
            data: colors,
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
            include: [{
                model: ColorChartMod,
                as: "COLOR",
                attributes: ['COLOR_ID', 'COLOR_CODE', 'COLOR_DESCRIPTION', 'IS_ACTIVE']
            }],
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
            data: color,
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
    const {REV_ID, BOM_TEMPLATE_ID} = req.query
    const where = {
        REV_ID: REV_ID || 0,
        DELETED_AT: null,
    }

    if (BOM_TEMPLATE_ID) {
        where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID
    }
    try {
        const sizes = await BomTemplateSize.findAll({
            where,
            include: [{
                model: SizeChartMod,
                as: "SIZE",
                attributes: ['SIZE_ID', 'SIZE_CODE', 'SIZE_DESCRIPTION', 'IS_ACTIVE']
            }],
            order: [["ID", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "BOM Template Sizes retrieved successfully",
            data: sizes,
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
            include: [{
                model: SizeChartMod,
                as: "SIZE",
                attributes: ['SIZE_ID', 'SIZE_CODE', 'SIZE_DESCRIPTION', 'IS_ACTIVE']
            }],
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
            data: size,
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
        const {MASTER_ITEM_ID, BOM_TEMPLATE_ID, REV_ID} = req.query;

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
                    REV_ID: REV_ID ?? 0,
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
        const {MASTER_ITEM_ID, BOM_TEMPLATE_ID, REV_ID} = req.query;

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
                    REV_ID: REV_ID ?? 0,
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

    const bomTemplateId = body[0]?.BOM_TEMPLATE_ID
    const revId = body[0]?.REV_ID

    const validationAlready = await BomTemplateListModel.findOne({
        where: {
            BOM_TEMPLATE_ID: bomTemplateId,
            REV_ID: revId,
            STATUS: {
                [Op.in]: ["confirmed"]
            }
        }
    })
    if (validationAlready) {
        return res.status(400).json({
            success: false,
            message: "Color cannot be manipulated because the BOM template is already confirmed."
        });
    }

    try {
        for (const item of body) {
            const {COLOR_ID, REV_ID, BOM_TEMPLATE_ID} = item;

            if (!COLOR_ID || !BOM_TEMPLATE_ID) {
                continue;
            }

            const existing = await BomTemplateColor.findOne({
                where: {
                    COLOR_ID,
                    REV_ID: REV_ID ?? 0,
                    BOM_TEMPLATE_ID,
                    DELETED_AT: null,
                },
            });

            if (existing) {
                await existing.update({DELETED_AT: new Date()});
            } else {
                await BomTemplateColor.create({
                    COLOR_ID,
                    REV_ID,
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

    const bomTemplateId = body[0]?.BOM_TEMPLATE_ID
    const revId = body[0]?.REV_ID

    const validationAlready = await BomTemplateListModel.findOne({
        where: {
            BOM_TEMPLATE_ID: bomTemplateId,
            REV_ID: revId,
            STATUS: {
                [Op.in]: ["confirmed"]
            }
        }
    })
    if (validationAlready) {
        return res.status(400).json({
            success: false,
            message: "Color cannot be manipulated because the BOM template is already confirmed."
        });
    }

    try {

        for (const item of body) {
            const {SIZE_ID, REV_ID, BOM_TEMPLATE_ID} = item;

            if (!SIZE_ID || !BOM_TEMPLATE_ID) {
                continue;
            }

            const existing = await BomTemplateSize.findOne({
                where: {
                    SIZE_ID,
                    REV_ID,
                    BOM_TEMPLATE_ID,
                    DELETED_AT: null,
                },
            });

            if (existing) {
                await existing.update({DELETED_AT: new Date()});
            } else {
                await BomTemplateSize.create({
                    SIZE_ID,
                    REV_ID,
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

export const getNoteByRevision = async (req, res) => {
    const {BOM_TEMPLATE_ID, REV_ID} = req.query
    const where = {REV_ID: REV_ID}

    if (BOM_TEMPLATE_ID) {
        where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID
    }


    const note = await BomTemplateNote.findOne({where})

    try {
        return res.status(200).json({
            success: true,
            message: "Note updated successfully.",
            data: note,
        });
    } catch (error) {
        console.error("Error updating note:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update note: " + error.message,
        });
    }
};

export const updateNoteByBomTemplateIdAndRevId = async (req, res) => {
    try {
        const { BOM_TEMPLATE_ID, REV_ID } = req.params;
        const { NOTE, IS_APPROVE, USER_ID } = req.body;

        if (!BOM_TEMPLATE_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_TEMPLATE_ID and REV_ID are required in URL parameters.",
            });
        }

        const bomTemplate = await BomTemplateModel.findByPk(BOM_TEMPLATE_ID)
        if (!bomTemplate) return res.status(404).json({status: false, message: "Bom template not found"})

        const foundOpenStatusList = await BomTemplateListModel.findOne({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID,
                STATUS: "Open"
            }
        })

        if (foundOpenStatusList) return res.status(500).json({
            status: false,
            message: "Failed to approve status because there are still open statuses in the BOM list"
        })

        const colorCount = await BomTemplateColor.count({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID
            }
        })
        if (!colorCount) return res.status(500).json({status: false, message: "Failed to approve status because color is empty"})

        const sizeCount = await BomTemplateSize.count({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID
            }
        })
        if (!sizeCount) return res.status(500).json({status: false, message: "Failed to approve status because size is empty"})

        const dataNote = await BomTemplateNote.findOne({ where: { BOM_TEMPLATE_ID, REV_ID } });
        if (!dataNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found for the given BOM template and revision.",
            });
        }

        await dataNote.update({
            NOTE, IS_APPROVE, UPDATED_ID: USER_ID, UPDATED_AT: new Date()
        }, {where: dataNote.ID});

        return res.status(200).json({
            success: true,
            message: "Note updated successfully.",
        });
    } catch (error) {
        console.error("Error updating note:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update note: " + error.message,
        });
    }
};