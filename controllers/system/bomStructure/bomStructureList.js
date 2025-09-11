import BomStructureModel, {
    BomStructureListDetailModel,
    BomStructureListModel, BomStructureSourcingDetail
} from "../../../models/system/bomStructure.mod.js";
import BomTemplateModel from "../../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../../models/setup/ItemCategories.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterCompanyModel from "../../../models/setup/company.mod.js";
import BomTemplateListModel from "../../../models/system/bomTemplateList.mod.js";
import {Op} from "sequelize";

export const getAllBomStructureList = async (req, res) => {
    try {
        const {BOM_STRUCTURE_ID, MASTER_ITEM_ID, STATUS} = req.query;

        const where = {IS_DELETED: false};
        if (BOM_STRUCTURE_ID) {
            const bomStructure = await BomStructureModel.findByPk(BOM_STRUCTURE_ID)
            if (!bomStructure) return res.status(404).json({status: false, message: "Bom structure not found"})

            where.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID
        }
        if (MASTER_ITEM_ID) where.MASTER_ITEM_ID = MASTER_ITEM_ID;
        if (STATUS) where.STATUS = STATUS;

        const data = await BomStructureListModel.findAll({
            where, include: [{
                model: BomStructureModel,
                as: "BOM_STRUCTURE",
                attributes: ["ID", "LAST_REV_ID", "STATUS_STRUCTURE"],
                required: false,
                include: [{
                    model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"],
                }]
            }, {
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE", "ITEM_GROUP_ID", "ITEM_TYPE_ID", "ITEM_CATEGORY_ID"],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                }]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ["USER_NAME"], required: false
            }, {
                model: Users, as: "UPDATED", attributes: ["USER_NAME"], required: false
            }, {
                model: MasterCompanyModel, as: "COMPANY", attributes: ["CODE"]
            }], order: [['ID', 'ASC']]
        });

        return res.status(200).json({
            success: true, message: "BOM structure list retrieved successfully", data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM structure list: ${error.message}`,
        });
    }
};

export const getBomStructureListById = async (req, res) => {
    try {
        const {id} = req.params;

        const data = await BomStructureListModel.findOne({
            where: {ID: id, IS_DELETED: false}, include: [{
                model: BomStructureModel,
                as: "BOM_STRUCTURE",
                attributes: ["ID", "LAST_REV_ID", "STATUS_STRUCTURE"],
                required: false,
                include: [{
                    model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"],
                }]
            }, {
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                }]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ["USER_NAME"], required: false
            }, {
                model: Users, as: "UPDATED", attributes: ["USER_NAME"], required: false
            }, {
                model: MasterCompanyModel, as: "COMPANY", attributes: ["CODE"]
            }]
        });

        if (!data) {
            return res.status(404).json({
                success: false, message: "BOM structure list not found",
            });
        }

        return res.status(200).json({
            success: true, message: "BOM structure list retrieved successfully", data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM structure list: ${error.message}`,
        });
    }
};

export const createBomStructureList = async (req, res) => {
    try {
        const {
            BOM_STRUCTURE_ID,
            MASTER_ITEM_ID,
            STANDARD_CONSUMPTION_PER_ITEM,
            INTERNAL_CONSUMPTION_PER_ITEM,
            BOOKING_CONSUMPTION_PER_ITEM,
            PRODUCTION_CONSUMPTION_PER_ITEM,
            EXTRA_BOOKS,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            IS_SPLIT_NO_PO,
            COMPANY_ID,
            VENDOR_ID,
            ITEM_POSITION,
            NOTE,
            IS_SPLIT_STATUS,
            IS_ACTIVE,
            CREATED_ID
        } = req.body;

        if (!BOM_STRUCTURE_ID || !MASTER_ITEM_ID || !COMPANY_ID) {
            return res.status(400).json({
                success: false, message: "Bom Structure, Master Item, and company are required",
            });
        }

        if (STANDARD_CONSUMPTION_PER_ITEM < 0 || INTERNAL_CONSUMPTION_PER_ITEM < 0 || BOOKING_CONSUMPTION_PER_ITEM < 0 || PRODUCTION_CONSUMPTION_PER_ITEM < 0) {
            return res.status(400).json({
                success: false, message: "Coasting cannot be negative",
            });
        }

        const masterItemId = await MasterItemIdModel.findByPk(MASTER_ITEM_ID)
        if (!masterItemId) return res.status(404).json({
            status: false,
            message: "Master item id not found"
        })

        const lastStructure = await BomStructureListModel.findOne({
            where: {BOM_STRUCTURE_ID: BOM_STRUCTURE_ID},
            order: [['BOM_LINE_ID', 'DESC']],
        });
        const nextId = lastStructure ? lastStructure.BOM_LINE_ID + 1 : 1;

        const newEntry = await BomStructureListModel.create({
            BOM_STRUCTURE_ID,
            COMPANY_ID,
            MASTER_ITEM_ID,
            STATUS: "Open",
            BOM_LINE_ID: nextId,
            STANDARD_CONSUMPTION_PER_ITEM: STANDARD_CONSUMPTION_PER_ITEM || 0,
            INTERNAL_CONSUMPTION_PER_ITEM: INTERNAL_CONSUMPTION_PER_ITEM || 0,
            BOOKING_CONSUMPTION_PER_ITEM: BOOKING_CONSUMPTION_PER_ITEM || 0,
            PRODUCTION_CONSUMPTION_PER_ITEM: PRODUCTION_CONSUMPTION_PER_ITEM || 0,
            EXTRA_BOOKS: EXTRA_BOOKS || 0,
            CONSUMPTION_UOM: masterItemId?.ITEM_UOM_BASE,
            IS_SPLIT_COLOR: IS_SPLIT_COLOR ? 1 : 0,
            IS_SPLIT_SIZE: IS_SPLIT_SIZE ? 1 : 0,
            IS_SPLIT_NO_PO: IS_SPLIT_NO_PO ? 1 : 0,
            VENDOR_ID,
            ITEM_POSITION,
            NOTE,
            IS_SPLIT_STATUS: IS_SPLIT_STATUS ? 1 : 0,
            IS_ACTIVE: IS_ACTIVE ? 1 : 0,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true, message: "BOM structure list created successfully", data: newEntry,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create BOM structure list: ${error.message}`,
        });
    }
};

export const createBomStructureListBulk = async (req, res) => {
    try {
        const payload = req.body;

        if (!Array.isArray(payload) || payload.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Payload must be a non-empty array",
            });
        }


        const data = await Promise.all(payload.map(async (item, idx) => {
            const lastStructure = await BomStructureListModel.findOne({
                where: {BOM_STRUCTURE_ID: item.BOM_STRUCTURE_ID},
                order: [['BOM_LINE_ID', 'DESC']],
            });
            const masterItemId = await MasterItemIdModel.findByPk(item.MASTER_ITEM_ID)
            const nextId = lastStructure ? lastStructure.BOM_LINE_ID + 1 : 1;
            return {
                BOM_STRUCTURE_ID: item.BOM_STRUCTURE_ID,
                STATUS: item.STATUS || "Open",
                MASTER_ITEM_ID: item.MASTER_ITEM_ID,
                CONSUMPTION_UOM: masterItemId.ITEM_UOM_DEFAULT,
                BOM_LINE_ID: nextId + idx,
                COMPANY_ID: item.COMPANY_ID,
                STANDARD_CONSUMPTION_PER_ITEM: item.STANDARD_CONSUMPTION_PER_ITEM ?? 0,
                INTERNAL_CONSUMPTION_PER_ITEM: item.INTERNAL_CONSUMPTION_PER_ITEM ?? 0,
                BOOKING_CONSUMPTION_PER_ITEM: item.BOOKING_CONSUMPTION_PER_ITEM ?? 0,
                PRODUCTION_CONSUMPTION_PER_ITEM: item.PRODUCTION_CONSUMPTION_PER_ITEM ?? 0,
                EXTRA_BOOKS: item.EXTRA_BOOKS ?? 0,
                IS_SPLIT_COLOR: item.IS_SPLIT_COLOR ? 1 : 0,
                IS_SPLIT_SIZE: item.IS_SPLIT_SIZE ? 1 : 0,
                IS_SPLIT_NO_PO: item.IS_SPLIT_NO_PO ? 1 : 0,
                VENDOR_ID: item.VENDOR_ID || null,
                ITEM_POSITION: item.ITEM_POSITION || null,
                NOTE: item.NOTE || null,
                IS_SPLIT_STATUS: item.IS_SPLIT_STATUS ? 1 : 0,
                IS_ACTIVE: item.IS_ACTIVE ? 1 : 0,
                CREATED_ID: item.CREATED_ID,
                CREATED_AT: new Date(),
            }
        }));

        for (const item of data) {
            if (!item.BOM_STRUCTURE_ID || !item.MASTER_ITEM_ID || !item.CREATED_ID) {
                return res.status(400).json({
                    success: false,
                    message: "BOM_STRUCTURE_ID, MASTER_ITEM_ID, and CREATED_ID are required for all items",
                });
            }
        }

        const result = await BomStructureListModel.bulkCreate(data, {
            validate: true,
            returning: true,
        });

        return res.status(201).json({
            success: true,
            message: `Created ${result.length} item(s) successfully`,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM structure: ${error.message}`,

        });
    }
};

export const updateBomStructureList = async (req, res) => {
    try {
        const {id} = req.params;
        const body = req.body;

        const data = await BomStructureListModel.findOne({
            where: {ID: id}
        });

        if (!data) {
            return res.status(404).json({
                success: false, message: "BOM structure list not found",
            });
        }

        const isSplitNoPO = body.IS_SPLIT_NO_PO ? body.IS_SPLIT_NO_PO : data.IS_SPLIT_NO_PO;
        const isSplitColor = body.IS_SPLIT_COLOR ? body.IS_SPLIT_COLOR : data.IS_SPLIT_COLOR;

        if (isSplitNoPO && isSplitColor) {
            return res.status(400).json({
                success: false,
                message: "Split po no and Split color cannot both be true at the same time",
            });
        }


        if (body?.MASTER_ITEM_ID || body?.VENDOR_ID || body?.IS_SPLIT_NO_PO !== undefined || body?.IS_SPLIT_COLOR !== undefined || body?.IS_SPLIT_SIZE !== undefined) {
            const bomStructureListDetailCount = await BomStructureListDetailModel.count({
                where: {
                    BOM_STRUCTURE_LIST_ID: id
                }
            })
            if (bomStructureListDetailCount) return res.status(500).json({
                status: false,
                message: "Failed to change master item and vendor because split detail already declared"
            })
        }

        await data.update({
            ...body, UPDATED_ID: req.body.UPDATED_ID || null, UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true, message: "BOM structure list updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update BOM structure list: ${error.message}`,
        });
    }
};

export const deleteBomStructureList = async (req, res) => {
    try {
        const {id} = req.params;
        const {USER_ID} = req.query

        const data = await BomStructureListModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!data) {
            return res.status(404).json({
                success: false, message: "BOM structure list not found",
            });
        }

        await data.update({
            STATUS: "Deleted",
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date()
        });

        return res.status(200).json({
            success: true, message: "BOM structure list deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete BOM structure list: ${error.message}`,
        });
    }
};


export const getBomTemplateListByBomStructureList = async (req, res) => {
    const {id} = req.params
    if (!id) return res.status(400).json({status: false, message: "Id is required"})
    try {
        const bomStructureList = await BomStructureListModel.findByPk(id)
        if (!bomStructureList) return res.status(404).json({status: false, message: "Bom structure list not found"})

        const bomStructure = await BomStructureModel.findByPk(bomStructureList.BOM_STRUCTURE_ID)
        if (!bomStructure) return res.status(404).json({status: false, message: "Bom structure not found"})

        const bomTemplate = await BomTemplateModel.findByPk(bomStructure.BOM_TEMPLATE_ID)
        if (!bomTemplate) return res.status(404).json({status: false, message: "Bom template not found"})

        const lists = await BomTemplateListModel.findAll({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                MASTER_ITEM_ID: bomStructureList.MASTER_ITEM_ID,
                VENDOR_ID: bomStructureList.VENDOR_ID,
                IS_DELETED: false,
            }, include: [{
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ['ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_UOM_BASE'],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                },]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ['USER_NAME']
            }, {
                model: Users, as: "UPDATED", attributes: ['USER_NAME']
            },],
        });

        return res.status(200).json({status: true, message: "Success get bom template list", data: lists})
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Failed to show bom structure " + err.message
        })
    }
}


export const updateBomStructureListStatus = async (req, res) => {
    const {id, status, UPDATED_ID} = req.body;

    if (!["Confirmed", "Canceled", "Deleted"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status only: Confirmed, Canceled, Deleted",
        });
    }

    try {
        const record = await BomStructureListModel.findByPk(id, {
            include: [
                {
                    model: BomStructureModel,
                    as: 'BOM_STRUCTURE',
                    attributes: ['ORDER_ID']
                }
            ]
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Bom Structure List not found",
            });
        }

        if (record.STATUS === "Deleted" || record.STATUS === "Canceled") {
            return res.status(400).json({
                success: false,
                message: `Status cannot be change`,
            });
        }

        if (status === "Confirmed") {
            const listDetails = await BomStructureListDetailModel.findAll({
                where: {BOM_STRUCTURE_LIST_ID: id},
                include: [{
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ['VENDOR_ID', 'CONSUMPTION_UOM'],
                    include: [{
                        model: ModelVendorDetail,
                        as: "VENDOR",
                        attributes: ['VENDOR_PAYMENT_CURRENCY']
                    }]
                }]
            });

            if (listDetails.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot confirm: BOM details are missing",
                });
            }

            const validItemDimensionIds = new Set(
                listDetails.map(detail => detail.ITEM_DIMENSION_ID).filter(Boolean)
            );
            const existingSourcings = await BomStructureSourcingDetail.findAll({
                where: {
                    BOM_STRUCTURE_LINE_ID: id,
                    IS_DELETED: false
                }
            });

            const sourcingToDelete = existingSourcings.filter(sourcing =>
                !validItemDimensionIds.has(sourcing.ITEM_DIMENSION_ID)
            );

            if (sourcingToDelete.length > 0) {
                await Promise.all(
                    sourcingToDelete.map(sourcing =>
                        BomStructureSourcingDetail.update(
                            {
                                IS_DELETED: true,
                                DELETED_AT: new Date(),
                            },
                            { where: { ID: sourcing.ID } }
                        )
                    )
                );
            }

            const grouped = listDetails.reduce((acc, detail) => {
                const itemId = detail.ITEM_DIMENSION_ID;
                if (!acc[itemId]) {
                    acc[itemId] = {
                        ITEM_DIMENSION_ID: itemId,
                        BOOKING_CONSUMPTION_PER_ITEM: 0,
                        EXTRA_BOOKS: 0,
                        EXTRA_ORDER_QTY: 0,
                        CUSTOMER_ORDER_QTY: 0,
                        REQUIRE_QTY: 0,
                        REQUIRE_PURCHASE_QTY: 0,
                        PLAN_PURCHASE_QTY: 0,
                        VENDOR_ID: detail?.BOM_STRUCTURE_LIST?.VENDOR_ID || detail.VENDOR_ID,
                        PURCHASE_UOM: detail?.BOM_STRUCTURE_LIST?.CONSUMPTION_UOM || detail.PURCHASE_UOM,
                        CURRENCY_CODE: detail?.BOM_STRUCTURE_LIST?.VENDOR?.VENDOR_PAYMENT_CURRENCY || detail.CURRENCY_CODE
                    };
                }

                const requirementQty = parseFloat(detail.MATERIAL_ITEM_REQUIREMENT_QUANTITY) || 0;
                const extraBooks = parseFloat(detail.EXTRA_BOOKS) || 0;
                const extraOrderQty = parseFloat(detail.EXTRA_REQUIRE_QUANTITY) || 0;
                const orderQuantity = parseInt(detail.ORDER_QUANTITY) || 0;
                const bookingConsumption = parseFloat(detail.BOOKING_CONSUMPTION_PER_ITEM) || 0;

                acc[itemId].BOOKING_CONSUMPTION_PER_ITEM += bookingConsumption;
                acc[itemId].EXTRA_BOOKS += extraBooks;
                acc[itemId].EXTRA_ORDER_QTY += extraOrderQty;
                acc[itemId].CUSTOMER_ORDER_QTY += orderQuantity;
                acc[itemId].REQUIRE_QTY += requirementQty;
                acc[itemId].REQUIRE_PURCHASE_QTY += requirementQty;
                acc[itemId].PLAN_PURCHASE_QTY += requirementQty;

                return acc;
            }, {});

            const sourcingToCreate = [];
            const sourcingToUpdate = [];

            for (const group of Object.values(grouped)) {
                const existingSourcing = await BomStructureSourcingDetail.findOne({
                    where: {
                        BOM_STRUCTURE_LINE_ID: id,
                        ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID,
                        IS_DELETED: false
                    }
                });
                const PLAN_PURCHASE_QTY_VARIANCE = group.PLAN_PURCHASE_QTY - group.REQUIRE_QTY;
                const PLAN_PURCHASE_QTY_VARIANCE_PERCENT = group.REQUIRE_QTY > 0
                    ? (PLAN_PURCHASE_QTY_VARIANCE / group.REQUIRE_QTY) * 100
                    : 0;
                const COST_PER_ITEM = existingSourcing?.COST_PER_ITEM || 0;
                const FINANCE_COST = existingSourcing?.FINANCE_COST || 0;
                const FREIGHT_COST = existingSourcing?.FREIGHT_COST || 0;
                const OTHER_COST = existingSourcing?.OTHER_COST || 0;

                const TOTAL_ITEM_COST = COST_PER_ITEM + FINANCE_COST + FREIGHT_COST + OTHER_COST;
                const PLAN_PURCHASE_COST = COST_PER_ITEM * group.PLAN_PURCHASE_QTY;

                const commonData = {
                    BOM_STRUCTURE_LINE_ID: id,
                    ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID,
                    BOOKING_CONSUMPTION_PER_ITEM: group.BOOKING_CONSUMPTION_PER_ITEM,
                    EXTRA_BOOKS: group.EXTRA_BOOKS,
                    EXTRA_ORDER_QTY: group.EXTRA_ORDER_QTY,
                    CUSTOMER_ORDER_QTY: group.CUSTOMER_ORDER_QTY,
                    REQUIRE_QTY: group.REQUIRE_QTY,
                    VENDOR_ID: group.VENDOR_ID,
                    PURCHASE_UOM: group.PURCHASE_UOM,
                    REQUIRE_PURCHASE_QTY: group.REQUIRE_PURCHASE_QTY,
                    PLAN_PURCHASE_QTY: group.PLAN_PURCHASE_QTY,
                    CURRENCY_CODE: group.CURRENCY_CODE,
                    PLAN_PURCHASE_QTY_VARIANCE,
                    PLAN_PURCHASE_QTY_VARIANCE_PERCENT,
                    LATEST_PER_ITEM_PURCHASE_DETAIL: null,
                    COST_PER_ITEM,
                    FINANCE_COST,
                    FREIGHT_COST,
                    OTHER_COST,
                    TOTAL_ITEM_COST,
                    PLAN_PURCHASE_COST,
                    NOTE: null,
                    APPROVE_PURCHASE_QUANTITY: 0,
                    PENDING_APPROVE_PURCHASE_QUANTITY: group.REQUIRE_QTY,
                    PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: 100,
                    TOTAL_APPROVE_PURCHASE_QUANTITY: 0,
                    IS_APPROVAL_SECTION: false,
                    APPROVAL_QTY: 0.00,
                    STOCK_ALLOCATE_QTY: 0.00,
                    PURCHASE_QTY: 0.00,
                    UNCONFIRM_PO_QTY: 0.00,
                    PENDING_PURCHASE_ORDER_QTY: 0.00,
                    IS_ACTIVE: true,

                };

                if (existingSourcing) {
                    sourcingToUpdate.push({
                        ...commonData,
                        UPDATED_ID,
                        UPDATED_AT: new Date(),
                        ID: existingSourcing.ID
                    });
                } else {
                    sourcingToCreate.push({...commonData, CREATED_ID: UPDATED_ID, CREATED_AT: new Date()});
                }
            }

            if (sourcingToCreate.length > 0) {
                await BomStructureSourcingDetail.bulkCreate(sourcingToCreate, {validate: true});
            }

            if (sourcingToUpdate.length > 0) {
                const updatePromises = sourcingToUpdate.map(async (detail) => {
                    try {
                        const COST_PER_ITEM = parseFloat(detail.COST_PER_ITEM) || 0;
                        const FINANCE_COST = parseFloat(detail.FINANCE_COST) || 0;
                        const FREIGHT_COST = parseFloat(detail.FREIGHT_COST) || 0;
                        const OTHER_COST = parseFloat(detail.OTHER_COST) || 0;

                        const TOTAL_ITEM_COST = COST_PER_ITEM + FINANCE_COST + FREIGHT_COST + OTHER_COST;

                        const safeValue = (num, precision = 6) => {
                            const parsed = parseFloat(num) || 0;
                            return parseFloat(parsed.toFixed(precision));
                        };

                        const updateData = {
                            BOOKING_CONSUMPTION_PER_ITEM: safeValue(detail.BOOKING_CONSUMPTION_PER_ITEM, 6),
                            EXTRA_BOOKS: safeValue(detail.EXTRA_BOOKS, 2),
                            EXTRA_ORDER_QTY: safeValue(detail.EXTRA_ORDER_QTY, 6),
                            CUSTOMER_ORDER_QTY: Math.floor(detail.CUSTOMER_ORDER_QTY || 0),
                            REQUIRE_QTY: safeValue(detail.REQUIRE_QTY, 2),
                            VENDOR_ID: detail.VENDOR_ID || null,
                            PURCHASE_UOM: detail.PURCHASE_UOM || null,
                            REQUIRE_PURCHASE_QTY: safeValue(detail.REQUIRE_PURCHASE_QTY, 2),
                            PLAN_PURCHASE_QTY: safeValue(detail.PLAN_PURCHASE_QTY, 2),
                            CURRENCY_CODE: detail.CURRENCY_CODE || null,
                            PLAN_PURCHASE_QTY_VARIANCE: safeValue(detail.PLAN_PURCHASE_QTY_VARIANCE, 2),
                            PLAN_PURCHASE_QTY_VARIANCE_PERCENT: safeValue(detail.PLAN_PURCHASE_QTY_VARIANCE_PERCENT, 2),
                            LATEST_PER_ITEM_PURCHASE_DETAIL: detail.LATEST_PER_ITEM_PURCHASE_DETAIL || null,
                            COST_PER_ITEM: safeValue(COST_PER_ITEM, 6),
                            FINANCE_COST: safeValue(FINANCE_COST, 6),
                            FREIGHT_COST: safeValue(FREIGHT_COST, 6),
                            OTHER_COST: safeValue(OTHER_COST, 6),
                            TOTAL_ITEM_COST: safeValue(TOTAL_ITEM_COST, 6),
                            PLAN_PURCHASE_COST: safeValue(detail.PLAN_PURCHASE_COST, 6),
                            NOTE: detail.NOTE || null,
                            IS_APPROVE: false,
                            APPROVE_PURCHASE_QUANTITY: safeValue(detail.APPROVE_PURCHASE_QUANTITY, 2),
                            PENDING_APPROVE_PURCHASE_QUANTITY: safeValue(detail.PENDING_APPROVE_PURCHASE_QUANTITY, 2),
                            PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: safeValue(detail.PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT, 2),
                            TOTAL_APPROVE_PURCHASE_QUANTITY: safeValue(detail.TOTAL_APPROVE_PURCHASE_QUANTITY, 6),
                            IS_APPROVAL_SECTION: false,
                            APPROVAL_QTY: 0.00,
                            STOCK_ALLOCATE_QTY: safeValue(detail.STOCK_ALLOCATE_QTY, 2),
                            PURCHASE_QTY: safeValue(detail.PURCHASE_QTY, 2),
                            UNCONFIRM_PO_QTY: safeValue(detail.UNCONFIRM_PO_QTY, 2),
                            PENDING_PURCHASE_ORDER_QTY: safeValue(detail.PENDING_PURCHASE_ORDER_QTY, 2),
                            IS_ACTIVE: detail.IS_ACTIVE === true,
                            UPDATED_ID: detail.UPDATED_ID || null,
                            UPDATED_AT: new Date()
                        };

                        return await BomStructureSourcingDetail.update(updateData, {
                            where: { ID: detail.ID }
                        });
                    } catch (err) {
                        console.error(`Error updating sourcing detail ID ${detail.ID}:`, err.message);
                        throw err;
                    }
                });

                await Promise.all(updatePromises);
            }
        }

        await record.update({
            STATUS: status,
            UPDATED_AT: new Date(),
            UPDATED_ID
        });

        return res.status(200).json({
            success: true,
            message: `Status successfully changed to ${status}`
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to change status: ${error.message}`,
        });
    }
};

export const updateBomStructureListStatusBulk = async (req, res) => {
    const {bom_structure_list, status, UPDATED_ID} = req.body;

    if (!Array.isArray(bom_structure_list) || bom_structure_list.length === 0) {
        return res.status(400).json({
            success: false,
            message: "bom structure list must be array and cannot empty",
        });
    }

    if (!["Confirmed", "Canceled", "Deleted"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status only: Confirmed, Canceled, Deleted",
        });
    }

    try {
        let validStatuses = [];
        switch (status) {
            case "Confirmed":
                validStatuses = ["Open", "Re-Confirmed"];
                break;
            case "Canceled":
                validStatuses = ["Confirmed", "Re-Confirmed"];
                break;
            case "Deleted":
                validStatuses = ["Open"];
                break;
            default:
                validStatuses = [];
        }

        const records = await BomStructureListModel.findAll({
            where: {
                ID: {[Op.in]: bom_structure_list},
                STATUS: {[Op.in]: validStatuses}
            },
            include: [{
                model: BomStructureModel,
                as: 'BOM_STRUCTURE',
                attributes: ['ORDER_ID']
            }]
        });

        if (records.length === 0) {
            return res.status(200).json({
                success: true,
                message: `No data available for processing`,
                updated_count: 0
            });
        }

        let updatedCount = 0;

        for (const record of records) {
            try {
                if (status === "Confirmed") {
                    const listDetails = await BomStructureListDetailModel.findAll({
                        where: { BOM_STRUCTURE_LIST_ID: record.ID },
                        include: [
                            {
                                model: BomStructureListModel,
                                as: "BOM_STRUCTURE_LIST",
                                attributes: ['VENDOR_ID', 'CONSUMPTION_UOM'],
                                include: [
                                    {
                                        model: ModelVendorDetail,
                                        as: "VENDOR",
                                        attributes: ['VENDOR_PAYMENT_CURRENCY']
                                    }
                                ]
                            }
                        ]
                    });

                    if (listDetails.length === 0) {
                        continue
                    }

                    const validItemDimensionIds = new Set(
                        listDetails.map(detail => detail.ITEM_DIMENSION_ID).filter(Boolean)
                    );

                    const existingSourcings = await BomStructureSourcingDetail.findAll({
                        where: {
                            BOM_STRUCTURE_LINE_ID: id,
                            IS_DELETED: false
                        }
                    });

                    const sourcingToDelete = existingSourcings.filter(sourcing =>
                        !validItemDimensionIds.has(sourcing.ITEM_DIMENSION_ID)
                    );

                    if (sourcingToDelete.length > 0) {
                        await Promise.all(
                            sourcingToDelete.map(sourcing =>
                                BomStructureSourcingDetail.update(
                                    {
                                        IS_DELETED: true,
                                        DELETED_AT: new Date(),
                                    },
                                    { where: { ID: sourcing.ID } }
                                )
                            )
                        );
                    }


                    const grouped = listDetails.reduce((acc, detail) => {
                        const itemId = detail.ITEM_DIMENSION_ID;
                        if (!acc[itemId]) {
                            acc[itemId] = {
                                ITEM_DIMENSION_ID: itemId,
                                BOOKING_CONSUMPTION_PER_ITEM: 0,
                                EXTRA_BOOKS: 0,
                                EXTRA_ORDER_QTY: 0,
                                CUSTOMER_ORDER_QTY: 0,
                                REQUIRE_QTY: 0,
                                REQUIRE_PURCHASE_QTY: 0,
                                PLAN_PURCHASE_QTY: 0,
                                VENDOR_ID: detail?.BOM_STRUCTURE_LIST?.VENDOR_ID || detail.VENDOR_ID,
                                PURCHASE_UOM: detail?.BOM_STRUCTURE_LIST?.CONSUMPTION_UOM || detail.PURCHASE_UOM,
                                CURRENCY_CODE: detail?.BOM_STRUCTURE_LIST?.VENDOR?.VENDOR_PAYMENT_CURRENCY || detail.CURRENCY_CODE
                            };
                        }

                        const requirementQty = parseFloat(detail.MATERIAL_ITEM_REQUIREMENT_QUANTITY) || 0;
                        const extraBooks = parseFloat(detail.EXTRA_BOOKS) || 0;
                        const extraOrderQty = parseFloat(detail.EXTRA_REQUIRE_QTY) || 0;
                        const orderQuantity = parseInt(detail.ORDER_QUANTITY) || 0;
                        const bookingConsumption = parseFloat(detail.BOOKING_CONSUMPTION_PER_ITEM) || 0;

                        acc[itemId].BOOKING_CONSUMPTION_PER_ITEM += bookingConsumption;
                        acc[itemId].EXTRA_BOOKS += extraBooks;
                        acc[itemId].EXTRA_ORDER_QTY += extraOrderQty;
                        acc[itemId].CUSTOMER_ORDER_QTY += orderQuantity;
                        acc[itemId].REQUIRE_QTY += requirementQty;
                        acc[itemId].REQUIRE_PURCHASE_QTY += requirementQty;
                        acc[itemId].PLAN_PURCHASE_QTY += requirementQty;

                        return acc;
                    }, {});

                    const sourcingToCreate = [];
                    const sourcingToUpdate = [];

                    for (const group of Object.values(grouped)) {
                        const existingSourcing = await BomStructureSourcingDetail.findOne({
                            where: {
                                BOM_STRUCTURE_LINE_ID: record.ID,
                                ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID,
                                IS_DELETED: false
                            }
                        });
                        const PLAN_PURCHASE_QTY_VARIANCE = group.PLAN_PURCHASE_QTY - group.REQUIRE_QTY;
                        const PLAN_PURCHASE_QTY_VARIANCE_PERCENT = group.REQUIRE_QTY > 0
                            ? (PLAN_PURCHASE_QTY_VARIANCE / group.REQUIRE_QTY) * 100
                            : 0;
                        const COST_PER_ITEM = existingSourcing?.COST_PER_ITEM || 0;
                        const FINANCE_COST = existingSourcing?.FINANCE_COST || 0;
                        const FREIGHT_COST = existingSourcing?.FREIGHT_COST || 0;
                        const OTHER_COST = existingSourcing?.OTHER_COST || 0;

                        const TOTAL_ITEM_COST = COST_PER_ITEM + FINANCE_COST + FREIGHT_COST + OTHER_COST;
                        const PLAN_PURCHASE_COST = COST_PER_ITEM * group.PLAN_PURCHASE_QTY;

                        const commonData = {
                            BOM_STRUCTURE_LINE_ID: record.ID,
                            ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID,
                            BOOKING_CONSUMPTION_PER_ITEM: group.BOOKING_CONSUMPTION_PER_ITEM,
                            EXTRA_BOOKS: group.EXTRA_BOOKS,
                            EXTRA_ORDER_QTY: group.EXTRA_ORDER_QTY,
                            CUSTOMER_ORDER_QTY: group.CUSTOMER_ORDER_QTY,
                            REQUIRE_QTY: group.REQUIRE_QTY,
                            VENDOR_ID: group.VENDOR_ID,
                            PURCHASE_UOM: group.PURCHASE_UOM,
                            REQUIRE_PURCHASE_QTY: group.REQUIRE_PURCHASE_QTY,
                            PLAN_PURCHASE_QTY: group.PLAN_PURCHASE_QTY,
                            CURRENCY_CODE: group.CURRENCY_CODE,
                            PLAN_PURCHASE_QTY_VARIANCE,
                            PLAN_PURCHASE_QTY_VARIANCE_PERCENT,
                            LATEST_PER_ITEM_PURCHASE_DETAIL: null,
                            COST_PER_ITEM,
                            FINANCE_COST,
                            FREIGHT_COST,
                            OTHER_COST,
                            TOTAL_ITEM_COST,
                            PLAN_PURCHASE_COST,
                            NOTE: null,
                            APPROVE_PURCHASE_QUANTITY: 0,
                            PENDING_APPROVE_PURCHASE_QUANTITY: group.REQUIRE_QTY,
                            PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: 100,
                            TOTAL_APPROVE_PURCHASE_QUANTITY: 0,
                            IS_APPROVAL_SECTION: false,
                            APPROVAL_QTY: 0.00,
                            STOCK_ALLOCATE_QTY: 0.00,
                            PURCHASE_QTY: 0.00,
                            UNCONFIRM_PO_QTY: 0.00,
                            PENDING_PURCHASE_ORDER_QTY: 0.00,
                            IS_ACTIVE: true,
                            CREATED_ID: UPDATED_ID,
                            UPDATED_ID,
                            CREATED_AT: new Date(),
                            UPDATED_AT: new Date()
                        };

                        if (existingSourcing) {
                            sourcingToUpdate.push({
                                ...commonData,
                                ID: existingSourcing.ID
                            });
                        } else {
                            sourcingToCreate.push(commonData);
                        }
                    }
                    if (sourcingToCreate.length > 0) {
                        await BomStructureSourcingDetail.bulkCreate(sourcingToCreate, { validate: true });
                    }
                    if (sourcingToUpdate.length > 0) {
                        await Promise.all(
                            sourcingToUpdate.map(detail =>
                                BomStructureSourcingDetail.update(
                                    {
                                        BOOKING_CONSUMPTION_PER_ITEM: detail.BOOKING_CONSUMPTION_PER_ITEM,
                                        EXTRA_BOOKS: detail.EXTRA_BOOKS,
                                        EXTRA_ORDER_QTY: detail.EXTRA_ORDER_QTY,
                                        CUSTOMER_ORDER_QTY: detail.CUSTOMER_ORDER_QTY,
                                        REQUIRE_QTY: detail.REQUIRE_QTY,
                                        VENDOR_ID: detail.VENDOR_ID,
                                        PURCHASE_UOM: detail.PURCHASE_UOM,
                                        REQUIRE_PURCHASE_QTY: detail.REQUIRE_PURCHASE_QTY,
                                        PLAN_PURCHASE_QTY: detail.PLAN_PURCHASE_QTY,
                                        CURRENCY_CODE: detail.CURRENCY_CODE,
                                        PLAN_PURCHASE_QTY_VARIANCE: detail.PLAN_PURCHASE_QTY_VARIANCE,
                                        PLAN_PURCHASE_QTY_VARIANCE_PERCENT: detail.PLAN_PURCHASE_QTY_VARIANCE_PERCENT,
                                        LATEST_PER_ITEM_PURCHASE_DETAIL: detail.LATEST_PER_ITEM_PURCHASE_DETAIL,
                                        COST_PER_ITEM: detail.COST_PER_ITEM,
                                        FINANCE_COST: detail.FINANCE_COST,
                                        FREIGHT_COST: detail.FREIGHT_COST,
                                        OTHER_COST: detail.OTHER_COST,
                                        TOTAL_ITEM_COST: detail.TOTAL_ITEM_COST,
                                        PLAN_PURCHASE_COST: detail.PLAN_PURCHASE_COST,
                                        NOTE: detail.NOTE,
                                        APPROVE_PURCHASE_QUANTITY: detail.APPROVE_PURCHASE_QUANTITY,
                                        PENDING_APPROVE_PURCHASE_QUANTITY: detail.PENDING_APPROVE_PURCHASE_QUANTITY,
                                        PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: detail.PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT,
                                        TOTAL_APPROVE_PURCHASE_QUANTITY: detail.TOTAL_APPROVE_PURCHASE_QUANTITY,
                                        IS_APPROVAL_SECTION: detail.IS_APPROVAL_SECTION,
                                        APPROVAL_QTY: detail.APPROVAL_QTY,
                                        STOCK_ALLOCATE_QTY: detail.STOCK_ALLOCATE_QTY,
                                        PURCHASE_QTY: detail.PURCHASE_QTY,
                                        UNCONFIRM_PO_QTY: detail.UNCONFIRM_PO_QTY,
                                        PENDING_PURCHASE_ORDER_QTY: detail.PENDING_PURCHASE_ORDER_QTY,
                                        IS_ACTIVE: detail.IS_ACTIVE,
                                        UPDATED_ID: detail.UPDATED_ID,
                                        UPDATED_AT: new Date()
                                    },
                                    { where: { ID: detail.ID } }
                                )
                            )
                        );
                    }
                }


                if (status === "Canceled") {
                    const sourcingDetail = await BomStructureSourcingDetail.findOne({
                        where: {
                            BOM_STRUCTURE_LINE_ID: record.ID,
                            IS_APPROVE: true
                        }
                    })

                    if (sourcingDetail) return res.status(500).json({
                        status: false,
                        message: "failed to cancel bom structure list because sourcing detail already confirmed"
                    })
                }
                await record.update({
                    STATUS: status,
                    UPDATED_AT: new Date(),
                    UPDATED_ID: UPDATED_ID || null
                });

                updatedCount++;
            } catch (err) {
                console.error("Error updating record ID:", record.ID, err.message);
                continue;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Success change ${updatedCount} data to status ${status}`,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update status: " + error.message,
        });
    }
};