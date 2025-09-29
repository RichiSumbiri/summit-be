import BomStructureModel, {
    BomStructureListDetailModel,
    BomStructureListModel,
    BomStructureNoteModel, BomStructurePendingDimension, BomStructureRevModel, BomStructureSourcingDetail
} from "../../../models/system/bomStructure.mod.js";
import BomTemplateModel, {
    BomTemplateNote,
} from "../../../models/materialManagement/bomTemplate/bomTemplate.mod.js";
import {ModelOrderPOHeader} from "../../../models/orderManagement/orderManagement.mod.js";
import {
    CustomerBuyPlan,
    CustomerDetail, CustomerProductDivision, CustomerProductSeason, CustomerProgramName
} from "../../../models/system/customer.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import BomTemplateListModel from "../../../models/materialManagement/bomTemplate/bomTemplateList.mod.js";
import {Op} from "sequelize";
import CompanyMod from "../../../models/setup/company.mod.js";
import {ModelProjectionOrder} from "../../../models/orderManagement/ProjectionOrder.mod.js";
import ProductItemModel from "../../../models/system/productItem.mod.js";
import MasterAttributeValue from "../../../models/system/masterAttributeValue.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import {OrderPoListing} from "../../../models/production/order.mod.js";
import MasterCompanyModel from "../../../models/setup/company.mod.js";

export const getAllBomStructures = async (req, res) => {
    try {
        const {BOM_TEMPLATE_ID, ORDER_ID, COMPANY_ID, LAST_REV_ID = 0} = req.query;

        const where = {IS_DELETED: false};

        if (BOM_TEMPLATE_ID) where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID;
        if (ORDER_ID) where.ORDER_ID = ORDER_ID;
        if (COMPANY_ID) where.COMPANY_ID = COMPANY_ID;
        if (LAST_REV_ID) where.LAST_REV_ID = LAST_REV_ID

        const structures = await BomStructureModel.findAll({
            where, include: [
                {model: CompanyMod, as: "COMPANY", attributes: ['ID', 'NAME', 'CODE']}, {
                model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID", "MASTER_ITEM_ID"], include: [{
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"]
                }]
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
            const noteBomStructure = await BomStructureNoteModel.findOne({
                where: {
                    REV_ID: item.LAST_REV_ID,
                    BOM_STRUCTURE_ID: item.ID
                }
            })
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
            where: {ID: id, IS_DELETED: false},
            include: [
                {model: CompanyMod, as: "COMPANY", attributes: ['ID', 'NAME', 'CODE']},
                {
                    model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"], include: [{
                        model: MasterItemIdModel,
                        as: "MASTER_ITEM",
                        attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"]
                    }]
                }, {
                    model: BomStructureRevModel,
                    as: "REV",
                    attributes: ["ID", "TITLE", "SEQUENCE"]
                }, {
                    model: ModelOrderPOHeader,
                    as: "ORDER",
                    attributes: ["ORDER_ID", "ORDER_TYPE_CODE", "ORDER_STATUS", "ORDER_PLACEMENT_COMPANY", "ORDER_REFERENCE_PO_NO", "ORDER_STYLE_DESCRIPTION", "PRICE_TYPE_CODE", "ORDER_UOM", "CONTRACT_NO", "NOTE_REMARKS", "ITEM_ID", "CUSTOMER_ID", "CUSTOMER_DIVISION_ID", "CUSTOMER_SEASON_ID", "CUSTOMER_PROGRAM_ID", "CUSTOMER_BUYPLAN_ID", "CUSTOMER_BUYPLAN_ID", "ORDER_CONFIRMED_DATE", "PROJECTION_ORDER_ID", "PRODUCT_ID"],
                    required: false,
                    duplicating: false,
                    include: [
                        {
                            model: MasterItemIdModel,
                            as: "ITEM",
                            attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                        },
                            {
                            model: CustomerDetail,
                            as: "CUSTOMER",
                            attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"],
                            required: false
                        },
                        {
                            model: CustomerProductDivision,
                            as: "CUSTOMER_DIVISION",
                            attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_CODE", "CTPROD_DIVISION_NAME", "CTPROD_DIVISION_STATUS"],
                            required: false
                        },
                        {
                            model: CustomerProductSeason,
                            as: "CUSTOMER_SEASON",
                            attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_CODE", "CTPROD_SESION_NAME", "CTPROD_SESION_YEAR"],
                            required: false
                        },
                        {
                            model: CustomerProgramName,
                            as: "CUSTOMER_PROGRAM",
                            attributes: ["CTPROG_ID", "CTPROG_CODE", "CTPROG_NAME", "CTPROG_STATUS"],
                            required: false
                        },
                        {
                            model: CustomerBuyPlan,
                            as: "CUSTOMER_BUYPLAN",
                            attributes: ["CTBUYPLAN_ID", "CTBUYPLAN_CODE", "CTBUYPLAN_NAME"],
                            required: false
                        }, {
                            model: ModelProjectionOrder,
                            as: "PROJECTION_ORDER",
                            attributes: ["PRJ_ID", "PRJ_CODE", "PRJ_DESCRIPTION"],
                            required: false
                        },
                        {
                            model: ProductItemModel,
                            as: "PRODUCT",
                            attributes: ['PRODUCT_TYPE_ATTB', 'PRODUCT_CAT_ATTB'],
                            include: [
                                {
                                    model: MasterAttributeValue,
                                    as: "PRODUCT_TYPE",
                                    attributes: ["ID", "NAME", "CODE"]
                                },
                                {
                                    model: MasterAttributeValue,
                                    as: "PRODUCT_CAT",
                                    attributes: ["ID", "NAME", "CODE"]
                                },
                            ]
                        }
                    ]
                }, {
                    model: Users, as: "CREATED", attributes: ['USER_NAME'], required: false
                }, {
                    model: Users, as: "UPDATED", attributes: ['USER_NAME'], required: false
                }]
        })

        if (!structure) {
            return res.status(404).json({
                success: false, message: "BOM structure not found",
            });
        }

        const noteBomStructure = await BomStructureNoteModel.findOne({
            where: {
                REV_ID: structure.LAST_REV_ID,
                BOM_STRUCTURE_ID: id
            }
        })


        return res.status(200).json({
            success: true,
            message: "BOM structure retrieved successfully",
            data: {
                ...structure.toJSON(),
                NOTE: noteBomStructure?.NOTE ?? "",
            },
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

        const alreadyOrder = await BomStructureModel.findOne({
            where: {
                ORDER_ID,
                IS_DELETED: false
            }
        })

        if (alreadyOrder) return res.status(500).json({
            status: false,
            message: "Order is already used in another BOM structure"
        })

        const bomTemplate = await BomTemplateModel.findByPk(BOM_TEMPLATE_ID)
        if (!bomTemplate) {
            return res.status(400).json({status: false, message: "Bom template not found"})
        }

        const bomNotes = await BomTemplateNote.findOne({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID,
            },
        });

        if (!bomNotes.IS_APPROVE) {
            return res.status(400).json({
                status: false,
                message: "BOM template must be approved before it can be used in a BOM structure"
            })
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

        const noteResp = await BomStructureNoteModel.create({
            REV_ID: LAST_REV_ID || 0,
            NOTE,
            BOM_STRUCTURE_ID: ID
        })


        const bomTemplateList = await BomTemplateListModel.findAll({
            where: {
                REV_ID: bomTemplate.LAST_REV_ID,
                BOM_TEMPLATE_ID,
                STATUS: {[Op.in]: ["Confirmed"]},
                IS_DELETED: false
            },
            order: [['ID', 'ASC']]
        })

        if (bomTemplateList.length) {
            await BomStructureListModel.bulkCreate(await Promise.all(bomTemplateList.map(async (item, idx) => {
                const data = item.dataValues
                const masterItemId = await MasterItemIdModel.findByPk(item.MASTER_ITEM_ID)
                return {
                    ...data,
                    ID: null,
                    COMPANY_ID,
                    STATUS: "Open",
                    STANDARD_CONSUMPTION_PER_ITEM: 0,
                    INTERNAL_CONSUMPTION_PER_ITEM: data.INTERNAL_CUSTOMER_PER_ITEM,
                    BOOKING_CONSUMPTION_PER_ITEM: data.COSTING_CONSUMER_PER_ITEM,
                    PRODUCTION_CONSUMPTION_PER_ITEM: 0,
                    CONSUMPTION_UOM: masterItemId.ITEM_UOM_BASE,
                    BOM_LINE_ID: idx + 1,
                    BOM_STRUCTURE_ID: ID,
                    IS_SPLIT_STATUS: false,
                    CREATED_ID,
                    CREATED_AT: new Date(),
                    UPDATED_ID: null,
                    UPDATED_AT: null
                }
            })))
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
            success: true,
            message: "BOM structure created successfully",
            data: {
                ...bomStructure.toJSON(),
                NOTE: noteResp.NOTE,
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create BOM structure: ${error.message}`,
        });
    }
};


export const importBomTemplateListToStructure = async (req, res) => {
    const {id} = req.params
    const {COMPANY_ID, USER_ID, REV_ID = 0} = req.body

    try {
        const bomStrucute = await BomStructureModel.findByPk(id)
        if (!bomStrucute) return res.status(404).json({status: false, message: "Bom structure no found"})

        const bomTemplate = await BomTemplateModel.findByPk(bomStrucute.BOM_TEMPLATE_ID)
        if (!bomTemplate) return res.status(404).json({status: false, message: "Bom Template not found"})


        const bomTemplateNote = await BomTemplateNote.findOne({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID
            }
        })

        if (!bomTemplateNote) return res.status(404).json({status: false, message: "Bom template note not found"})
        if (!bomTemplateNote.IS_APPROVE) return res.status(500).json({
            status: false,
            message: "Cannot retrieve the BOM template in the latest revision because its status is not yet approved"
        })

        const bomTemplateList = await BomTemplateListModel.findAll({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID,
                STATUS: {[Op.in]: ["Confirmed"]},
                IS_DELETED: false
            },
            order: [['ID', 'ASC']]
        })
        if (!bomTemplateList.length) return res.status(500).json({
            success: false,
            message: "Bom Template List not found"
        })

        const listBomStructure = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID: id,
                IS_DELETED: false
            }
        })

        for (const item in listBomStructure) {
            const data = listBomStructure[item].dataValues
            if (data.STATUS.toLowerCase() === "confirmed") return res.status(500).json({
                status: false,
                message: "Bom Structure List already confirmed"
            })
        }

        for (const item in listBomStructure) {
            const data2 = listBomStructure[item].dataValues
            await BomStructureListDetailModel.update({
                IS_DELETED: true,
                DELETED_AT: new Date(),
            }, {
                where: {
                    BOM_STRUCTURE_LIST_ID: data2.ID
                }
            })

            await BomStructureSourcingDetail.update({
                IS_DELETED: true,
                DELETED_AT: new Date(),
            }, {
                where: {
                    BOM_STRUCTURE_LINE_ID: data2.ID
                }
            })

            await BomStructurePendingDimension.destroy({
                where: {
                    BOM_STRUCTURE_LIST_ID: data2.ID
                }
            })
        }

        await BomStructureListModel.update({IS_DELETED: true, DELETED_AT: new Date()}, {
            where: {
                BOM_STRUCTURE_ID: id,
            }
        })

        const newBomStructureListData = await Promise.all(bomTemplateList.map(async (item, idx) => {
            const templateData = item.dataValues;
            const masterItem = await MasterItemIdModel.findByPk(templateData.MASTER_ITEM_ID);
            if (!masterItem) {
                throw new Error(`Master Item ${templateData.MASTER_ITEM_ID} not found`);
            }

            return {
                COMPANY_ID,
                BOM_LINE_ID: idx + 1,
                STATUS: "Open",
                BOM_STRUCTURE_ID: id,
                MASTER_ITEM_ID: templateData.MASTER_ITEM_ID,
                STANDARD_CONSUMPTION_PER_ITEM: parseFloat(templateData.STANDARD_CONSUMER_PER_ITEM) || 0,
                INTERNAL_CONSUMPTION_PER_ITEM: parseFloat(templateData.INTERNAL_CUSTOMER_PER_ITEM) || 0,
                BOOKING_CONSUMPTION_PER_ITEM: parseFloat(templateData.COSTING_CONSUMER_PER_ITEM) || 0,
                PRODUCTION_CONSUMPTION_PER_ITEM: 0,
                CONSUMPTION_UOM: masterItem.ITEM_UOM_BASE || masterItem.ITEM_UOM_DEFAULT || null,
                VENDOR_ID: templateData.VENDOR_ID || null,
                ITEM_POSITION: templateData.ITEM_POSITION || null,
                NOTE: templateData.NOTE || null,
                IS_SPLIT_COLOR: templateData.IS_SPLIT_COLOR || false,
                IS_SPLIT_SIZE: templateData.IS_SPLIT_SIZE || false,
                IS_SPLIT_NO_PO: templateData.IS_SPLIT_NO_PO || false,
                IS_SPLIT_STATUS: false,
                IS_ACTIVE: true,
                IS_DELETED: false,
                CREATED_ID: USER_ID,
                CREATED_AT: new Date(),
                UPDATED_ID: null,
                UPDATED_AT: null,
                DELETED_AT: null
            }
        }));

        await BomStructureListModel.bulkCreate(newBomStructureListData, {
            validate: true
        });
        return res.status(200).json({success: true, message: "Success import bom structure"})
    } catch (err) {
        return res.status(500).json({status: false, message: "Failed to import bom template list" + err.message})
    }
}

export const getBomStructureListDetailsByBomId = async (req, res) => {
    const { BOM_STRUCTURE_ID, ITEM_TYPE_ID } = req.query;

    if (!BOM_STRUCTURE_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM_STRUCTURE_ID is required"
        });
    }

    try {
        const details = await BomStructureListDetailModel.findAll({
            where: {
                IS_DELETED: false
            },
            include: [
                {
                    model: BomStructureListModel,
                    as: 'BOM_STRUCTURE_LIST',
                    attributes: ['ID', 'BOM_LINE_ID', 'STATUS', 'COMPANY_ID', 'CONSUMPTION_UOM', 'ITEM_POSITION', 'NOTE', 'CREATED_AT', 'UPDATED_AT'],
                    where: {
                        IS_DELETED: false,
                        ...(BOM_STRUCTURE_ID ? { BOM_STRUCTURE_ID } : {})
                    },
                    required: true,
                    include: [
                        {
                            model: MasterItemIdModel,
                            as: 'MASTER_ITEM',
                            attributes: ['ITEM_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_TYPE_ID'],
                            where: {
                                IS_DELETED: false,
                                ...(ITEM_TYPE_ID ? { ITEM_TYPE_ID } : {}),
                            }
                        },
                        {
                            model: ModelVendorDetail,
                            as: 'VENDOR',
                            attributes: ['VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
                        },
                        {
                            model: MasterCompanyModel, as: "COMPANY", attributes: ["CODE"]
                        },
                        {
                            model: Users,
                            as: "CREATED",
                            attributes: ['USER_NAME']
                        },
                        {
                            model: Users,
                            as: "UPDATED",
                            attributes: ['USER_NAME']
                        },
                        {
                            model: Users,
                            as: "APPROVE",
                            attributes: ['USER_NAME']
                        },
                    ]
                },
                {
                    model: MasterItemDimensionModel,
                    as: 'ITEM_DIMENSION',
                    attributes: ['DIMENSION_ID', 'COLOR_ID', 'SIZE_ID', 'SERIAL_NO'],
                    include: [
                        {
                            model: ColorChartMod,
                            as: 'MASTER_COLOR',
                            attributes: ['COLOR_CODE', 'COLOR_DESCRIPTION']
                        },
                        {
                            model: SizeChartMod,
                            as: 'MASTER_SIZE',
                            attributes: ['SIZE_CODE', 'SIZE_DESCRIPTION']
                        }
                    ]
                },
                {
                    model: OrderPoListing,
                    as: 'ORDER_PO',
                    attributes: ['ORDER_PO_ID', 'PO_REF_CODE', 'DELIVERY_LOCATION_NAME', 'DELIVERY_TERM', 'DELIVERY_MODE_CODE', 'COUNTRY']
                },
                {
                    model: ColorChartMod,
                    as: "COLOR",
                    attributes: ['COLOR_ID', 'COLOR_CODE', 'COLOR_DESCRIPTION']
                },
                {
                    model: SizeChartMod,
                    as: "SIZE",
                    attributes: ['SIZE_ID', 'SIZE_CODE', 'SIZE_DESCRIPTION']
                },
            ],
        });



        return res.status(200).json({
            success: true,
            message: "BOM Structure List Details retrieved successfully",
            data: details
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM structure details: ${err.message}`
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
            where: {ID: id}
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