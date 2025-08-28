import BomStructureModel, {
    BomStructureListModel,
    BomStructureNoteModel, BomStructurePendingDimension, BomStructureRevModel
} from "../../../models/system/bomStructure.mod.js";
import BomTemplateModel, {BomTemplateNote} from "../../../models/system/bomTemplate.mod.js";
import {ModelOrderPOHeader} from "../../../models/orderManagement/orderManagement.mod.js";
import {
    CustomerDetail, CustomerProductDivision, CustomerProductSeason, CustomerProgramName
} from "../../../models/system/customer.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import BomTemplateListModel from "../../../models/system/bomTemplateList.mod.js";
import {Op} from "sequelize";
import BomTemplateListDetail from "../../../models/system/bomTemplateListDetail.mod.js";

export const getAllBomStructures = async (req, res) => {
    try {
        const {BOM_TEMPLATE_ID, ORDER_ID, COMPANY_ID, LAST_REV_ID= 0} = req.query;

        const where = {IS_DELETED: false, LAST_REV_ID};

        if (BOM_TEMPLATE_ID) where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID;
        if (ORDER_ID) where.ORDER_ID = ORDER_ID;
        if (COMPANY_ID) where.COMPANY_ID = COMPANY_ID;
        if (LAST_REV_ID) where.LAST_REV_ID = LAST_REV_ID

        const structures = await BomStructureModel.findAll({
            where, include: [{
                model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"], required: false,
            }, {
                model: BomStructureRevModel,
                as: "REV",
                attributes: ["ID", "TITLE", "SEQUENCE"]
            }, {
                model: ModelOrderPOHeader,
                as: "ORDER",
                attributes: ["ORDER_ID", "ORDER_TYPE_CODE", "ORDER_STATUS", "ORDER_PLACEMENT_COMPANY", "ORDER_REFERENCE_PO_NO", "ORDER_STYLE_DESCRIPTION", "PRICE_TYPE_CODE", "ORDER_UOM", "CONTRACT_NO", "NOTE_REMARKS", "ITEM_ID", "CUSTOMER_ID", "CUSTOMER_DIVISION_ID", "CUSTOMER_SEASON_ID", "CUSTOMER_PROGRAM_ID", "CUSTOMER_BUYPLAN_ID"],
                required: false,
                duplicating: false,
                include: [{
                    model: MasterItemIdModel,
                    as: "ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                }, {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"],
                    required: false
                }, {
                    model: CustomerProductDivision,
                    as: "CUSTOMER_DIVISION",
                    attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_CODE", "CTPROD_DIVISION_NAME", "CTPROD_DIVISION_STATUS"],
                    required: false
                }, {
                    model: CustomerProductSeason,
                    as: "CUSTOMER_SEASON",
                    attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_CODE", "CTPROD_SESION_NAME", "CTPROD_SESION_YEAR"],
                    required: false
                }, {
                    model: CustomerProgramName,
                    as: "CUSTOMER_PROGRAM",
                    attributes: ["CTPROG_ID", "CTPROG_CODE", "CTPROG_NAME", "CTPROG_STATUS"],
                    required: false
                }]
            }, {
                model: Users, as: "CREATED", attributes: ['USER_NAME'], required: false
            }, {
                model: Users, as: "UPDATED", attributes: ['USER_NAME'], required: false
            },]
        });

        const validResponse = await Promise.all(structures.map(async (item) => {
            const noteBomStructure = await BomStructureNoteModel.findOne({where: {REV_ID: LAST_REV_ID, BOM_STRUCTURE_ID: item.ID}})
            return {
                ...item.toJSON(),
                NOTE: noteBomStructure?.NOTE ?? ""
            }
        }))

        return res.status(200).json({
            success: true, message: "BOM structures retrieved successfully", data: validResponse,
        });

    } catch (error) {
        return res.status(500).json({
            success: false, message: error.message,
        });
    }
};

export const getBomStructureById = async (req, res) => {
    try {
        const {id} = req.params;

        const structure = await BomStructureModel.findOne({
            where: {ID: id, IS_DELETED: false}, include: [{
                model: BomTemplateModel, as: "BOM_TEMPLATE", include: [{
                    model: CustomerDetail, as: "CUSTOMER"
                }, {
                    model: CustomerProductDivision, as: "CUSTOMER_DIVISION"
                }, {
                    model: CustomerProductSeason, as: "CUSTOMER_SESSION"
                },]
            }, {
                model: ModelOrderPOHeader, as: "ORDER"
            }]
        });

        if (!structure) {
            return res.status(404).json({
                success: false, message: "BOM structure not found",
            });
        }

        const noteBomStructure = await BomStructureNoteModel.findOne({where: {REV_ID: structure.LAST_REV_ID}})

        return res.status(200).json({
            success: true, message: "BOM structure retrieved successfully", data: {...structure, NOTE: noteBomStructure?.NOTE ?? ""},
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM structure: ${error.message}`,
        });
    }
};
export const createBomStructure = async (req, res) => {
    try {
        const {
            LAST_REV_ID, NOTE, IS_ACTIVE, STATUS_STRUCTURE, BOM_TEMPLATE_ID, ORDER_ID, COMPANY_ID, CREATED_ID,
        } = req.body;

        if (!BOM_TEMPLATE_ID || !ORDER_ID) {
            return res.status(400).json({
                success: false, message: "Order and Bom Template are required",
            });
        }

        const bomTemplate = await BomTemplateModel.findByPk(BOM_TEMPLATE_ID)
        if (!bomTemplate) {
            return res.status(400).json({ status: false, message: "Bom template not found" })
        }

        const bomNotes = await BomTemplateNote.findOne({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID,
            },
        });
        if (!bomNotes.IS_APPROVE) {
            return res.status(400).json({ status: false, message: "BOM template must be approved before it can be used in a BOM structure" })
        }

        const getLastID = await BomStructureModel.findOne({
            order: [['ID', 'DESC']], raw: true
        });
        const newIncrement = !getLastID ? '0000001' : Number(getLastID.ID.slice(-7)) + 1;
        const ID = 'BOM' + newIncrement.toString().padStart(7, '0');

        await BomStructureModel.create({
            ID,
            LAST_REV_ID: LAST_REV_ID || 0,
            IS_ACTIVE,
            STATUS_STRUCTURE,
            BOM_TEMPLATE_ID,
            ORDER_ID,
            COMPANY_ID,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        await BomStructureNoteModel.create({
            REV_ID: LAST_REV_ID || 0,
            NOTE,
            BOM_STRUCTURE_ID: ID
        })

        const bomTemplateListDetail = await  BomTemplateListDetail.findAll({
            where: { DELETED_AT: null },
            include: [{
                model: BomTemplateListModel,
                as: 'ITEM_LIST',
                attributes: [],
                where: { BOM_TEMPLATE_ID },
                required: true
            }],
        })

        const bomTemplateList = await BomTemplateListModel.findAll({
            where: {
                REV_ID: bomTemplate.dataValues.LAST_REV_ID,
                BOM_TEMPLATE_ID,
                STATUS: {[Op.in]: ["Confirmed"]},
                IS_DELETED: false
            },
            order: [['ID', 'ASC']]
        })

        if (bomTemplateList.length) {
            await BomStructureListModel.bulkCreate(bomTemplateList.map((item, idx) => {
                const data = item.dataValues
                return {
                    ...data,
                    ID: null,
                    COMPANY_ID,
                    STATUS: "Open",
                    CONSUMPTION_UOM: data.CONSUMPTION_UOM,
                    BOM_LINE_ID: idx + 1,
                    REV_ID: bomTemplate.dataValues.LAST_REV_ID,
                    BOM_STRUCTURE_ID: ID,
                    IS_SPLIT_STATUS: false,
                    CREATED_ID,
                    CREATED_AT: new Date(),
                    UPDATED_ID: null,
                    UPDATED_AT: null
                }
            }))
        }

        const bomStructure = await BomStructureModel.findOne({
            where: {ID}, include: [{
                model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"], required: false,
            }, {
                model: ModelOrderPOHeader,
                as: "ORDER",
                attributes: ["ORDER_ID", "ORDER_TYPE_CODE", "ORDER_STATUS", "ORDER_PLACEMENT_COMPANY", "ORDER_REFERENCE_PO_NO", "ORDER_STYLE_DESCRIPTION", "PRICE_TYPE_CODE", "ORDER_UOM", "CONTRACT_NO", "NOTE_REMARKS", "ITEM_ID", "CUSTOMER_ID", "CUSTOMER_DIVISION_ID", "CUSTOMER_SEASON_ID", "CUSTOMER_PROGRAM_ID", "CUSTOMER_BUYPLAN_ID"],
                required: false,
                duplicating: false,
                include: [{
                    model: MasterItemIdModel,
                    as: "ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                }, {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"],
                    required: false
                }, {
                    model: CustomerProductDivision,
                    as: "CUSTOMER_DIVISION",
                    attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_CODE", "CTPROD_DIVISION_NAME", "CTPROD_DIVISION_STATUS"],
                    required: false
                }, {
                    model: CustomerProductSeason,
                    as: "CUSTOMER_SEASON",
                    attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_CODE", "CTPROD_SESION_NAME", "CTPROD_SESION_YEAR"],
                    required: false
                }, {
                    model: CustomerProgramName,
                    as: "CUSTOMER_PROGRAM",
                    attributes: ["CTPROG_ID", "CTPROG_CODE", "CTPROG_NAME", "CTPROG_STATUS"],
                    required: false
                }]
            }, {
                model: Users, as: "CREATED", attributes: ['USER_NAME'], required: false
            }, {
                model: Users, as: "UPDATED", attributes: ['USER_NAME'], required: false
            },]
        })

        return res.status(201).json({
            success: true, message: "BOM structure created successfully", data: bomStructure.toJSON()
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create BOM structure: ${error.message}`,
        });
    }
};


export const updateBomStructure = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            LAST_REV_ID, IS_ACTIVE, STATUS_STRUCTURE, BOM_TEMPLATE_ID, ORDER_ID, COMPANY_ID, UPDATED_ID
        } = req.body;

        const structure = await BomStructureModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!structure) {
            return res.status(404).json({
                success: false, message: "BOM structure not found",
            });
        }

        await structure.update({
            LAST_REV_ID,
            IS_ACTIVE,
            STATUS_STRUCTURE,
            BOM_TEMPLATE_ID,
            ORDER_ID,
            COMPANY_ID,
            UPDATED_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true, message: "BOM structure updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update BOM structure: ${error.message}`,
        });
    }
};
export const deleteBomStructure = async (req, res) => {
    try {
        const {id} = req.params;

        const structure = await BomStructureModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!structure) {
            return res.status(404).json({
                success: false, message: "BOM structure not found",
            });
        }

        await structure.update({
            IS_DELETED: true, DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true, message: "BOM structure deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete BOM structure: ${error.message}`,
        });
    }
};