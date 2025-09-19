import PurchaseOrderDetailModel from "../../models/system/purchaseOrderDetail.mod.js";
import {PurchaseOrderModel, PurchaseOrderRevModel} from "../../models/system/purchaseOrder.mod.js";
import {ListCountry} from "../../models/list/referensiList.mod.js";
import {ModelWarehouseDetail} from "../../models/setup/WarehouseDetail.mod.js";
import {ModelVendorDetail, ModelVendorShipperLocation} from "../../models/system/VendorDetail.mod.js";
import MasterUnitModel from "../../models/setup/unit.mod.js";
import MasterCompanyModel from "../../models/setup/company.mod.js";
import {MasterPayMethode} from "../../models/system/finance.mod.js";

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