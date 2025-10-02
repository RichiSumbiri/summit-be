import BomStructureModel, {
    BomStructureListModel, BomStructureRevModel,
    BomStructureSourcingDetail, BomStructureSourcingDetailHistory
} from "../../../models/materialManagement/bomStructure/bomStructure.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import CompanyMod from "../../../models/setup/company.mod.js";
import {MasterItemGroup} from "../../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../../models/setup/ItemCategories.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import Users from "../../../models/setup/users.mod.js";
import {MIN_ALLOWED_VALUE} from "../../../util/enum.js";
import {DataTypes, Op} from "sequelize";
import { CustomerBuyPlan, CustomerDetail, CustomerProductDivision, CustomerProductSeason, CustomerProgramName } from "../../../models/system/customer.mod.js";
import { ModelOrderPOHeader } from "../../../models/orderManagement/orderManagement.mod.js";
import { OrderPoListing } from "../../../models/production/order.mod.js";
import { ModelProjectionOrder } from "../../../models/orderManagement/ProjectionOrder.mod.js";
import PurchaseOrderDetailModel from "../../../models/procurement/purchaseOrderDetail.mod.js";
import {PurchaseOrderModel} from "../../../models/procurement/purchaseOrder.mod.js";

export const getAllSourcingDetails = async (req, res) => {
    const {BOM_STRUCTURE_LINE_ID, ITEM_DIMENSION_ID, BOM_STRUCTURE_ID, IS_APPROVE, COMPANY_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID, MPO_ID} = req.query;

    const where = {IS_DELETED: false};
    const where2 = {}

    if (ITEM_TYPE_ID) where2.ITEM_TYPE_ID = ITEM_TYPE_ID
    if (ITEM_CATEGORY_ID) where2.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID

    if (IS_APPROVE) {
        where.APPROVE_PURCHASE_QUANTITY =  {
            [Op.ne]: 0
        }
    }

    if (BOM_STRUCTURE_LINE_ID) where.BOM_STRUCTURE_LINE_ID = BOM_STRUCTURE_LINE_ID;
    if (ITEM_DIMENSION_ID) where.ITEM_DIMENSION_ID = ITEM_DIMENSION_ID;

    try {
        const response = []
        const details = await BomStructureSourcingDetail.findAll({
            where,
            include: [
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION",
                    attributes: ['DIMENSION_ID', 'COLOR_ID', 'SIZE_ID', 'SERIAL_NO'],
                    include: [
                        {
                            model: ColorChartMod,
                            as: "MASTER_COLOR",
                            attributes: ['COLOR_CODE', 'COLOR_DESCRIPTION']
                        },
                        {
                            model: SizeChartMod,
                            as: "MASTER_SIZE",
                            attributes: ['SIZE_CODE', 'SIZE_DESCRIPTION']
                        }
                    ]
                },
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LINE",
                    required: true,
                    where: {
                        ...(BOM_STRUCTURE_ID ? {BOM_STRUCTURE_ID} : {}),
                        IS_DELETED: false
                    },
                    attributes: ['BOM_STRUCTURE_ID', 'COMPANY_ID', 'BOM_LINE_ID', 'STATUS', 'MASTER_ITEM_ID', 'CONSUMPTION_UOM'],
                    include: [
                        {
                            model: BomStructureModel,
                            as: "BOM_STRUCTURE",
                            attributes: ['ID', 'LAST_REV_ID', 'IS_ACTIVE', 'ORDER_ID'],
                            include: [
                                {
                                    model: BomStructureRevModel,
                                    as: "REV",
                                    attributes: ['TITLE', 'DESCRIPTION', 'SEQUENCE']
                                },
                                {
                                    model: ModelOrderPOHeader,
                                    as: "ORDER",
                                    attributes: ['ORDER_ID','ORDER_TYPE_CODE', 'CUSTOMER_ID','ORDER_REFERENCE_PO_NO','ORDER_STYLE_DESCRIPTION'],
                                    include: [
                                        {
                                            model: ModelProjectionOrder,
                                            as:"PROJECTION_ORDER",
                                            attributes: ['PRJ_ID','PRJ_CODE','PRJ_DESCRIPTION']
                                        },

                                        {
                                            model: CustomerDetail,
                                            as: "CUSTOMER",
                                            attributes: [
                                                'CTC_ID',
                                                'CTC_CODE',
                                                'CTC_NAME',
                                                'CTC_COMPANY_NAME',
                                                'CTC_CREDIT_LIMIT',
                                                'CTC_TITLE_OF_PERSON',
                                                'CTC_NAME_OF_PERSON',
                                                'CTC_POSITION_PERSON',
                                                'CTC_PHONE1',
                                                'CTC_PHONE2',
                                                'CTC_FAX',
                                                'CTC_EMAIL',
                                                'CTC_SITE',
                                                'CTC_ADDRESS1',
                                                'CTC_ADDRESS2',
                                                'CTC_CITY',
                                                'CTC_PROVINCE',
                                                'CTC_POS_CODE',
                                                'CTC_COUNTRY_ID',
                                                'CTC_CLASS',
                                                'CTC_ACTIVE',
                                                'CTC_SHIP_TERM_CODE',
                                                'CTC_SHIP_VIA',
                                                'CTC_PAY_LEADTIME',
                                                'CTC_FOB_POINT_CODE',
                                                'CTC_CURRENCY',
                                                'CTC_PAY_METHODE',
                                                'IS_DELETE',
                                                'ADD_ID',
                                                'MOD_ID',
                                                'createdAt',
                                                'updatedAt'
                                            ],
                                        },
                                        { 
                                            model: CustomerProductSeason,
                                            as: "CUSTOMER_SEASON",
                                            attributes: ['CTPROD_SESION_ID', 'CTPROD_SESION_CODE', 'CTPROD_SESION_NAME']
                                        },
                                        { 
                                            model: CustomerProductDivision,
                                            as: "CUSTOMER_DIVISION",
                                            attributes: ['CTPROD_DIVISION_ID', 'CTPROD_DIVISION_CODE', 'CTPROD_DIVISION_NAME']
                                        },
                                        { 
                                            model: CustomerProgramName,
                                            as: "CUSTOMER_PROGRAM",
                                            attributes: ['CTPROG_ID', 'CTPROG_CODE', 'CTPROG_NAME']
                                        },
                                        {
                                            model: CustomerBuyPlan,
                                            as: "CUSTOMER_BUYPLAN",
                                            attributes: ['CTBUYPLAN_ID', 'CTBUYPLAN_CODE', 'CTBUYPLAN_NAME']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: CompanyMod,
                            as: "COMPANY",
                            where: COMPANY_ID ? {ID: COMPANY_ID} : undefined,
                            attributes: ['ID', 'CODE', 'NAME']
                        },
                        {
                            model: MasterItemIdModel,
                            as: "MASTER_ITEM",
                            required: true,
                            where: where2,
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
                                }
                            ]
                        }
                    ]
                },
                {
                    model: ModelVendorDetail,
                    as: "VENDOR",
                    attributes: ['VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE', 'VENDOR_ADDRESS_1']
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
                }
            ],
            order: [['ID', 'DESC']]
        });

        for (let i = 0; i < details.length; i++) {
            const data = details[i].dataValues
            if (MPO_ID) {
                const purchaseOrder = await PurchaseOrderModel.findByPk(MPO_ID)
                if (!purchaseOrder) return res.status(404).json({
                    success: false,
                    message: `Purchsase order not found`,
                });

                const prdOdrDtl = await PurchaseOrderDetailModel.findOne({where: {MPO_ID, REV_ID: purchaseOrder.REV_ID, BOM_STRUCTURE_LINE_ID: data.BOM_STRUCTURE_LINE_ID, ITEM_DIMENSION_ID: data.ITEM_DIMENSION_ID}})
                data.IS_SELECTED = false
                data.DEFAULT_VALUE = 0

                if (prdOdrDtl) {
                    data.IS_SELECTED = true
                    data.DEFAULT_VALUE = prdOdrDtl.PURCHASE_ORDER_QTY
                }
            }

            response.push(data)
        }

        return res.status(200).json({
            success: true,
            message: "Sourcing detail data retrieved successfully",
            data: await Promise.all(response.map(async (item) => {
                const orderPoListing = await OrderPoListing.findAll({where: {ORDER_NO: item.BOM_STRUCTURE_LINE.BOM_STRUCTURE.ORDER_ID}, attributes: ['PRODUCTION_MONTH', 'PLAN_EXFACTORY_DATE']})
                return{
                    ...item,
                    BOM_STRUCTURE_LINE: {
                        ...item.BOM_STRUCTURE_LINE.dataValues,
                        BOM_STRUCTURE: {
                            ...item.BOM_STRUCTURE_LINE.BOM_STRUCTURE.dataValues,
                            ORDER: {
                                ...item.BOM_STRUCTURE_LINE.BOM_STRUCTURE.ORDER.dataValues,
                                PO_LISTING: orderPoListing
                            }
                        }
                    }
                }
            }))
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sourcing detail data: ${error.message}`,
        });
    }
};

export const getAllBomSourcingCategory = async (req, res) => {
    const {BOM_STRUCTURE_ID} = req.params;

    if (!BOM_STRUCTURE_ID) {
        return res.status(400).json({
            success: false,
            message: "BOM Structure ID is required"
        });
    }

    try {
        const bomStructure = await BomStructureModel.findByPk(BOM_STRUCTURE_ID);
        if (!bomStructure) {
            return res.status(404).json({
                success: false,
                message: "BOM Structure not found"
            });
        }

        const bomStructureList = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID,
                IS_DELETED: false,
                STATUS: {
                    [Op.in]: ["Confirmed", "Canceled", "Re-Confirmed"]
                }
            },
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ['ITEM_TYPE_ID'],
                    include: [
                        {
                            model: MasterItemTypes,
                            as: "ITEM_TYPE",
                            attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                        }
                    ],
                }
            ]
        });

        const itemTypeSet = new Set();
        const uniqueItemTypes = [];

        bomStructureList.forEach(listItem => {
            const itemType = listItem.MASTER_ITEM?.ITEM_TYPE;

            if (itemType && !itemTypeSet.has(itemType.ITEM_TYPE_CODE)) {
                itemTypeSet.add(itemType.ITEM_TYPE_CODE);
                uniqueItemTypes.push({
                    ITEM_TYPE_ID: itemType.ITEM_TYPE_ID,
                    ITEM_TYPE_CODE: itemType.ITEM_TYPE_CODE,
                    ITEM_TYPE_DESCRIPTION: itemType.ITEM_TYPE_DESCRIPTION
                });
            }
        });

        return res.status(200).json({
            success: true,
            message: "Item type categories retrieved successfully",
            data: uniqueItemTypes
        });

    } catch (error) {
        console.error("Error in getAllBomSourchingCategory:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sourcing category data: ${error.message}`,
        });
    }
};
export const getSourcingDetailById = async (req, res) => {
    const {id} = req.params;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(id, {
            include: [
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION"
                },
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LINE"
                }
            ]
        });

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sourcing detail retrieved successfully",
            data: detail
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sourcing detail: ${error.message}`,
        });
    }
};

export const createSourcingDetail = async (req, res) => {
    const {
        BOM_STRUCTURE_LINE_ID,
        ITEM_DIMENSION_ID,
        BOOKING_CONSUMPTION_PER_ITEM = 0,
        EXTRA_BOOKS = 0,
        EXTRA_ORDER_QTY = 0,
        CUSTOMER_ORDER_QTY = 0,
        REQUIRE_QTY = 0,
        VENDOR_ID,
        PURCHASE_UOM,
        REQUIRE_PURCHASE_QTY = 0,
        PLAN_PURCHASE_QTY = 0,
        PLAN_PURCHASE_QTY_VARIANCE = 0,
        PLAN_PURCHASE_QTY_VARIANCE_PERCENT = 0,
        CURRENCY_CODE,
        LATEST_PER_ITEM_PURCHASE_DETAIL,
        COST_PER_ITEM = 0,
        FINANCE_COST = 0,
        FREIGHT_COST = 0,
        OTHER_COST = 0,
        TOTAL_ITEM_COST = 0,
        PLAN_PURCHASE_COST = 0,
        NOTE,
        APPROVE_PURCHASE_QUANTITY = 0,
        PENDING_APPROVE_PURCHASE_QUANTITY = 0,
        PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT = 0,
        TOTAL_APPROVE_PURCHASE_QUANTITY = 0,
        IS_APPROVAL_SECTION = 0,
        APPROVAL_QTY = 0,
        STOCK_ALLOCATE_QTY = 0,
        CONFIRM_PO_QTY = 0,
        UNCONFIRM_PO_QTY = 0,
        PENDING_PURCHASE_ORDER_QTY = 0,
        ORDER_PO_ID,
    CONFIRMED_GRN_QTY,
    GRN_VARIANCE,
    UNCONFIRMED_GRN_QTY,
        CREATED_ID
    } = req.body;

    try {
        if (!BOM_STRUCTURE_LINE_ID || !ITEM_DIMENSION_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_STRUCTURE_LINE_ID and ITEM_DIMENSION_ID are required",
            });
        }

        const newDetail = await BomStructureSourcingDetail.create({
            BOM_STRUCTURE_LINE_ID,
            ITEM_DIMENSION_ID,
            BOOKING_CONSUMPTION_PER_ITEM,
            EXTRA_BOOKS,
            EXTRA_ORDER_QTY,
            CUSTOMER_ORDER_QTY,
            REQUIRE_QTY,
            VENDOR_ID: VENDOR_ID || null,
            PURCHASE_UOM: PURCHASE_UOM || null,
            REQUIRE_PURCHASE_QTY,
            PLAN_PURCHASE_QTY,
            PLAN_PURCHASE_QTY_VARIANCE,
            PLAN_PURCHASE_QTY_VARIANCE_PERCENT,
            CURRENCY_CODE: CURRENCY_CODE || null,
            LATEST_PER_ITEM_PURCHASE_DETAIL: LATEST_PER_ITEM_PURCHASE_DETAIL || null,
            COST_PER_ITEM,
            FINANCE_COST,
            FREIGHT_COST,
            OTHER_COST,
            TOTAL_ITEM_COST,
            PLAN_PURCHASE_COST,
            NOTE: NOTE || null,
            APPROVE_PURCHASE_QUANTITY,
            PENDING_APPROVE_PURCHASE_QUANTITY,
            PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT,
            TOTAL_APPROVE_PURCHASE_QUANTITY,
            IS_APPROVAL_SECTION,
            APPROVAL_QTY,
            STOCK_ALLOCATE_QTY,
            CONFIRM_PO_QTY,
            UNCONFIRM_PO_QTY,
            PENDING_PURCHASE_ORDER_QTY,
            ORDER_PO_ID,
            CONFIRMED_GRN_QTY,
            GRN_VARIANCE,
            UNCONFIRMED_GRN_QTY,
            IS_ACTIVE: false,
            CREATED_ID: CREATED_ID,
            CREATED_AT: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Sourcing detail created successfully",
            data: newDetail
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create sourcing detail: ${error.message}`,
        });
    }
};

export const updateSourcingDetail = async (req, res) => {
    const {id} = req.params;
    const updateData = req.body;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(id);

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail not found",
            });
        }


        const PLAN_PURCHASE_QTY = updateData.PLAN_PURCHASE_QTY ?? detail.PLAN_PURCHASE_QTY

        if (PLAN_PURCHASE_QTY < detail.APPROVE_PURCHASE_QUANTITY) {
            return res.status(404).json({
                success: false,
                message: "Plan purchase quantity cannot be smaller than the plan approve quantity",
            });
        }
        const COST_PER_ITEM = updateData.COST_PER_ITEM ?? detail.COST_PER_ITEM
        const FINANCE_COST = updateData.FINANCE_COST ?? detail.FINANCE_COST
        const FREIGHT_COST = updateData.FREIGHT_COST ?? detail.FREIGHT_COST
        const OTHER_COST = updateData.OTHER_COST ?? detail.OTHER_COST

        const REQUIRE_QTY = updateData.REQUIRE_QTY ?? detail.REQUIRE_QTY
        const TOTAL_ITEM_COST = Number(COST_PER_ITEM) + Number(FINANCE_COST) + Number(FREIGHT_COST) + Number(OTHER_COST)
        const PLAN_PURCHASE_COST = Number(PLAN_PURCHASE_QTY) * Number(TOTAL_ITEM_COST);
        const PENDING_APPROVE_PURCHASE_QUANTITY = Number(PLAN_PURCHASE_QTY) - Number(detail.APPROVE_PURCHASE_QUANTITY)

        const IS_APPROVAL_SECTION = updateData.IS_APPROVAL_SECTION !== undefined ? updateData.IS_APPROVAL_SECTION : detail.IS_APPROVAL_SECTION

        const PLAN_PURCHASE_QTY_VARIANCE = Number(PLAN_PURCHASE_QTY) - Number(REQUIRE_QTY);
        const PLAN_PURCHASE_QTY_VARIANCE_PERCENT = Number(REQUIRE_QTY) > 0 ? (Number(PLAN_PURCHASE_QTY_VARIANCE) / Number(REQUIRE_QTY)) * 100 : 0;

        let APPROVAL_QTY = updateData.APPROVAL_QTY ?? detail.APPROVAL_QTY

        if (!IS_APPROVAL_SECTION) {
            APPROVAL_QTY = 0
        } else {
            if (!Number(APPROVAL_QTY)) {
                APPROVAL_QTY = Number(detail.PENDING_APPROVE_PURCHASE_QUANTITY)
            }
        }

        if (!IS_APPROVAL_SECTION) {
            APPROVAL_QTY = 0
        }

        await detail.update({
            ...updateData,
            TOTAL_ITEM_COST,
            PLAN_PURCHASE_COST,
            PLAN_PURCHASE_QTY_VARIANCE,
            APPROVAL_QTY,
            PLAN_PURCHASE_QTY_VARIANCE_PERCENT,
            PENDING_APPROVE_PURCHASE_QUANTITY,
            PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: (PENDING_APPROVE_PURCHASE_QUANTITY / detail.PLAN_PURCHASE_QTY) * 100,
            UPDATED_ID: updateData.UPDATED_ID || detail.UPDATED_ID,
            UPDATED_AT: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Sourcing detail updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update sourcing detail: ${error.message}`,
        });
    }
};


export const unApproveSourcingDetail = async (req, res) => {
    const {ID, UN_APPROVE_QTY, NOTE, USER_ID} = req.body;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(ID);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail not found",
            });
        }


        if (Number(UN_APPROVE_QTY) > (Number(detail.APPROVE_PURCHASE_QUANTITY) - Number(detail.UNCONFIRM_PO_QTY) - Number(detail.CONFIRM_PO_QTY))) return res.status(400).json({status: false, message: "un-approve quantity must not be greater than un-approve available"})

        const PENDING_APPROVE_PURCHASE_QUANTITY = Number(detail.PENDING_APPROVE_PURCHASE_QUANTITY) + Number(UN_APPROVE_QTY)
        const APPROVE_PURCHASE_QUANTITY = Number(detail.APPROVE_PURCHASE_QUANTITY) -  Number(UN_APPROVE_QTY)
        await detail.update({
            APPROVE_PURCHASE_QUANTITY,
            TOTAL_APPROVE_PURCHASE_QUANTITY: Number(detail.COST_PER_ITEM) * APPROVE_PURCHASE_QUANTITY,
            PENDING_APPROVE_PURCHASE_QUANTITY,
            PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: (PENDING_APPROVE_PURCHASE_QUANTITY / detail.PLAN_PURCHASE_QTY) * 100,
            IS_APPROVAL_SECTION: false,
            APPROVAL_QTY: 0,
            PENDING_PURCHASE_ORDER_QTY: APPROVE_PURCHASE_QUANTITY,
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date()
        });

        await BomStructureSourcingDetailHistory.create({
            PURCHASE_QTY: Number(UN_APPROVE_QTY),
            NOTE,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date(),
            TYPE: "UN-APPROVE",
            BOM_STRUCTURE_SOURCING_DETAIL_ID: detail.ID
        })

        return res.status(200).json({
            success: true,
            message: "Sourcing detail updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update sourcing detail: ${error.message}`,
        });
    }
};

export const approveSourcingDetail = async (req, res) => {
    const {BOM_STRUCTURE_ID, ITEM_TYPE_ID, USER_ID} = req.body;

    try {
        const details = await BomStructureSourcingDetail.findAll({
            where: {IS_DELETED: false, IS_APPROVAL_SECTION: true},
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LINE",
                    required: true,
                    where: {
                        ...(BOM_STRUCTURE_ID ? {BOM_STRUCTURE_ID} : {}),
                        IS_DELETED: false
                    },
                    attributes: ['BOM_STRUCTURE_ID', 'COMPANY_ID', 'BOM_LINE_ID', 'STATUS', 'MASTER_ITEM_ID', 'CONSUMPTION_UOM'],
                    include: [
                        {
                            model: MasterItemIdModel,
                            as: "MASTER_ITEM",
                            required: true,
                            where: ITEM_TYPE_ID ? {ITEM_TYPE_ID} : undefined,
                            attributes: ['ITEM_ID', 'ITEM_DESCRIPTION', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID'],
                        }
                    ]
                },
            ]
        });

        for (let i = 0; i < details.length; i++) {
            const sourcing = details[i].dataValues
            if (Number(sourcing.COST_PER_ITEM) < MIN_ALLOWED_VALUE) {
                return res.status(500).json({
                    status: false,
                    message: "Failed to approve because Cost per Unit min " + MIN_ALLOWED_VALUE
                })
            }
            if (Number(sourcing.APPROVAL_QTY) > Number(sourcing.PENDING_APPROVE_PURCHASE_QUANTITY)) {
                return res.status(500).json({
                    status: false,
                    message: "Approval quantity cannot be greater than pending approved purchase quantity"
                })
            }
        }

        for (let i = 0; i < details.length; i++) {
            const sourcing = details[i].dataValues
            const PENDING_APPROVE_PURCHASE_QUANTITY = Number(sourcing.PENDING_APPROVE_PURCHASE_QUANTITY) - Number(sourcing.APPROVAL_QTY)
            const APPROVE_PURCHASE_QUANTITY = Number(sourcing.APPROVE_PURCHASE_QUANTITY) +  Number(sourcing.APPROVAL_QTY)
            await  BomStructureSourcingDetail.update({
                APPROVE_PURCHASE_QUANTITY,
                TOTAL_APPROVE_PURCHASE_QUANTITY: Number(sourcing.COST_PER_ITEM) * Number(APPROVE_PURCHASE_QUANTITY),
                PENDING_APPROVE_PURCHASE_QUANTITY,
                PENDING_APPROVE_PURCHASE_QUANTITY_PERCENT: (PENDING_APPROVE_PURCHASE_QUANTITY / Number(sourcing.PLAN_PURCHASE_QTY)) * 100,
                IS_APPROVAL_SECTION: false,
                APPROVAL_QTY: 0,
                PENDING_PURCHASE_ORDER_QTY: APPROVE_PURCHASE_QUANTITY,
                UPDATED_ID: USER_ID,
                UPDATED_AT: new Date()
            }, {
                where: {
                    ID: sourcing.ID
                }
            })
            await BomStructureSourcingDetailHistory.create({
                PURCHASE_QTY: Number(sourcing.APPROVAL_QTY),
                NOTE: "",
                CREATED_ID: USER_ID,
                CREATED_AT: new Date(),
                TYPE: "APPROVE",
                BOM_STRUCTURE_SOURCING_DETAIL_ID: sourcing.ID
            })
        }

        return res.status(200).json({status: true, message: "Success update sourcing detail"})
    } catch (err) {
        return res.status(500).json({status: false, message: err.message})
    }
}

export const deleteSourcingDetail = async (req, res) => {
    const {id} = req.params;
    const {DELETED_BY} = req.body;

    try {
        const detail = await BomStructureSourcingDetail.findByPk(id);

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Sourcing detail not found",
            });
        }

        await detail.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
            UPDATED_ID: DELETED_BY || null
        });

        return res.status(200).json({
            success: true,
            message: "Sourcing detail deleted (soft delete) successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete sourcing detail: ${error.message}`,
        });
    }
};