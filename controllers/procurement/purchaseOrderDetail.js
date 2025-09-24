import PurchaseOrderDetailModel from "../../models/procurement/purchaseOrderDetail.mod.js";
import {PurchaseOrderModel, PurchaseOrderRevModel} from "../../models/procurement/purchaseOrder.mod.js";
import {ListCountry} from "../../models/list/referensiList.mod.js";
import {ModelWarehouseDetail} from "../../models/setup/WarehouseDetail.mod.js";
import {ModelVendorDetail, ModelVendorShipperLocation} from "../../models/system/VendorDetail.mod.js";
import MasterUnitModel from "../../models/setup/unit.mod.js";
import MasterCompanyModel from "../../models/setup/company.mod.js";
import {MasterPayMethode} from "../../models/system/finance.mod.js";
import BomStructureModel, {BomStructureListModel} from "../../models/system/bomStructure.mod.js";
import BomTemplateModel from "../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import Users from "../../models/setup/users.mod.js";
import {ModelOrderPOHeader} from "../../models/orderManagement/orderManagement.mod.js";
import {
    CustomerDetail,
    CustomerProductDivision,
    CustomerProductSeason,
    CustomerProgramName
} from "../../models/system/customer.mod.js";

export const createPurchaseOrderDetail = async (req, res) => {
    try {
        const {
            MPO_ID,
            REV_ID = 0,
            BOM_STRUCTURE_LINE_ID,
            ORDER_NO,
            PURCHASE_ORDER_QTY,
            UNIT_COST,
            FINANCE_COST,
            FREIGHT_COST,
            OTHER_COST,
            TOTAL_UNIT_COST,
            TOTAL_PURCHASE_COST,
            CREATE_BY,
            UPDATE_BY,
        } = req.body;

        if (!MPO_ID || !BOM_STRUCTURE_LINE_ID) {
            return res.status(400).json({status: false, message: "Field are required"})
        }

        const purchaseOrder = await PurchaseOrderModel.findOne({where: {MPO_ID}})
        if (!purchaseOrder) return res.status(404).json({status: false, message: "Purchase Order not found"})

        await PurchaseOrderDetailModel.create({
            MPO_ID,
            REV_ID,
            BOM_STRUCTURE_LINE_ID,
            ORDER_NO,
            PURCHASE_ORDER_QTY,
            UNIT_COST,
            FINANCE_COST,
            FREIGHT_COST,
            OTHER_COST,
            TOTAL_UNIT_COST,
            TOTAL_PURCHASE_COST,
            CREATE_BY,
            CREATE_DATE: new Date(),
            UPDATE_BY,
            UPDATE_DATE: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Purchase Order Detail created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create purchase order detail: ${error.message}`,
        });
    }
};


export const getAllPurchaseOrderDetails = async (req, res) => {
    const {MPO_ID, REV_ID, ORDER_NO} = req.query;

    try {
        const where = {};
        if (MPO_ID) where.MPO_ID = MPO_ID;
        if (REV_ID) where.REV_ID = REV_ID;
        if (ORDER_NO) where.ORDER_NO = ORDER_NO;

        const details = await PurchaseOrderDetailModel.findAll({
            where,
            include: [
                {
                    model: PurchaseOrderModel,
                    as: "MPO",
                    attributes: ["REV_ID", "COUNTRY_ID", "WAREHOUSE_ID", "VENDOR_ID", "VENDOR_SHIPPER_LOCATION_ID", "COMPANY_ID", "PAYMENT_TERM_ID"],
                    include: [
                        {
                            model: PurchaseOrderRevModel,
                            as: "REV",
                            attributes: ["NAME", "DESCRIPTION", "SEQUENCE"]
                        },
                        {
                            model: ListCountry,
                            as: "COUNTRY",
                            attributes: ["BUYER_CODE", "COUNTRY_CODE", "COUNTRY_NAME"]
                        },
                        {
                            model: ModelWarehouseDetail,
                            as: "WAREHOUSE",
                            attributes: ["WHI_CODE", "WHI_NAME"]
                        },
                        {
                            model: ModelVendorDetail,
                            as: "VENDOR",
                            attributes: ["VENDOR_CODE", "VENDOR_NAME", "VENDOR_ACTIVE", "VENDOR_COMPANY_NAME", "VENDOR_PHONE", "VENDOR_FAX", "VENDOR_WEB", "VENDOR_ADDRESS_1", "VENDOR_ADDRESS_2", "VENDOR_CITY", "VENDOR_PROVINCE", "VENDOR_POSTAL_CODE", "VENDOR_COUNTRY_CODE", "VENDOR_CONTACT_TITLE", "VENDOR_CONTACT_NAME", "VENDOR_CONTACT_POSITION", "VENDOR_CONTACT_PHONE_1", "VENDOR_CONTACT_PHONE_2", "VENDOR_CONTACT_EMAIL"]
                        },
                        {
                            model: ModelVendorShipperLocation,
                            as: "VENDOR_SHIPPER_LOCATION",
                            attributes: ["VSL_NAME", "VSL_CONTACT_TITLE", "VSL_CONTACT_NAME", "VSL_CONTACT_POSITION", "VSL_ADDRESS_1"]
                        },
                        {
                            model: MasterCompanyModel,
                            as: "COMPANY",
                            attributes: ["NAME", "CODE"]
                        },
                        {
                            model: MasterPayMethode,
                            as: "PAYMENT_TERM",
                            attributes: ["PAYMET_CODE", "PAYMET_DESC", "PAYMET_LEADTIME"]
                        },
                    ]
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Order Details retrieved successfully",
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order details: ${error.message}`,
        });
    }
};


export const getPurchaseOrderDetailById = async (req, res) => {
    try {
        const {id} = req.params;

        const detail = await PurchaseOrderDetailModel.findOne({
            where: {ID: id},
            include: [
                {
                    model: PurchaseOrderModel,
                    as: "MPO",
                    attributes: ["REV_ID", "COUNTRY_ID", "WAREHOUSE_ID", "VENDOR_ID", "VENDOR_SHIPPER_LOCATION_ID", "COMPANY_ID", "PAYMENT_TERM_ID"]
                },
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "MASTER_ITEM_ID", "STATUS", "BOM_LINE_ID", "CONSUMPTION_UOM", "VENDOR_ID"],
                    include: [
                        {
                            model: BomStructureModel,
                            as: "BOM_STRUCTURE",
                            attributes: ["ID", "LAST_REV_ID", "STATUS_STRUCTURE"],
                            required: false,
                            include: [
                                {
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
                                }
                            ]
                        },
                        {
                            model: MasterItemIdModel,
                            as: "MASTER_ITEM",
                            attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"],
                            include: [
                                {
                                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                                },
                                {
                                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                                },
                                {
                                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                                }
                            ]
                        },
                        {
                            model: ModelVendorDetail,
                            as: "VENDOR",
                            attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
                        },
                        {
                            model: Users, as: "CREATED", attributes: ["USER_NAME"], required: false
                        },
                        {
                            model: Users, as: "UPDATED", attributes: ["USER_NAME"], required: false
                        },
                        {
                            model: MasterCompanyModel, as: "COMPANY", attributes: ["CODE"]
                        }
                    ]
                }
            ]
        });

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Purchase Order Detail retrieved successfully",
            data: detail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order detail: ${error.message}`,
        });
    }
};


export const updatePurchaseOrderDetail = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            MPO_ID,
            REV_ID,
            BOM_STRUCTURE_LINE_ID,
            ORDER_NO,
            PURCHASE_ORDER_QTY,
            UNIT_COST,
            FINANCE_COST,
            FREIGHT_COST,
            OTHER_COST,
            TOTAL_UNIT_COST,
            TOTAL_PURCHASE_COST,
            UPDATE_BY,
        } = req.body;

        if (!MPO_ID || !BOM_STRUCTURE_LINE_ID) {
            return res.status(400).json({status: false, message: "Field are required"})
        }

        const detail = await PurchaseOrderDetailModel.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Detail not found",
            });
        }

        const purchaseOrder = await PurchaseOrderModel.findOne({where: {MPO_ID}})
        if (!purchaseOrder) return res.status(404).json({status: false, message: "Purchase Order not found"})

        await detail.update({
            MPO_ID,
            REV_ID,
            BOM_STRUCTURE_LINE_ID,
            ORDER_NO,
            PURCHASE_ORDER_QTY,
            UNIT_COST,
            FINANCE_COST,
            FREIGHT_COST,
            OTHER_COST,
            TOTAL_UNIT_COST,
            TOTAL_PURCHASE_COST,
            UPDATE_BY,
            UPDATE_DATE: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Order Detail updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update purchase order detail: ${error.message}`,
        });
    }
};


export const deletePurchaseOrderDetail = async (req, res) => {
    try {
        const {id} = req.params;

        const detail = await PurchaseOrderDetailModel.findByPk(id);
        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Detail not found",
            });
        }

        await detail.destroy();
        return res.status(200).json({
            success: true,
            message: "Purchase Order Detail deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete purchase order detail: ${error.message}`,
        });
    }
};