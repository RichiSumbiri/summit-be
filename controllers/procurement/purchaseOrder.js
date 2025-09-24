import {PurchaseOrderModel, PurchaseOrderRevModel} from "../../models/procurement/purchaseOrder.mod.js";
import {ListCountry} from "../../models/list/referensiList.mod.js";
import {ModelWarehouseDetail} from "../../models/setup/WarehouseDetail.mod.js";
import {ModelVendorDetail, ModelVendorShipperLocation} from "../../models/system/VendorDetail.mod.js";
import MasterUnitModel from "../../models/setup/unit.mod.js";
import MasterCompanyModel from "../../models/setup/company.mod.js";
import {MasterPayMethode} from "../../models/system/finance.mod.js";

export const createPurchaseOrder = async (req, res) => {
    try {
        const {
            REV_ID = 0,
            MPO_DATE,
            MPO_STATUS,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            WAREHOUSE_ID,
            VENDOR_ID,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            DELIVERY_UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            CREATE_BY,
        } = req.body;

        if (!COUNTRY_ID || !WAREHOUSE_ID || !VENDOR_ID || !VENDOR_SHIPPER_LOCATION_ID || !COMPANY_ID || !INVOICE_UNIT_ID || !DELIVERY_UNIT_ID || !PAYMENT_TERM_ID) {
            return res.status(400).json({
                status: false,
                message: "Field are required"
            })
        }

        const getLastID = await PurchaseOrderModel.findOne({
            order: [['MPO_ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001' : Number(getLastID.ID.slice(-7)) + 1;
        const MPO_ID = 'MPO' + newIncrement.toString().padStart(7, '0');

        await PurchaseOrderModel.create({
            MPO_ID,
            REV_ID,
            MPO_DATE,
            MPO_STATUS,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            WAREHOUSE_ID,
            VENDOR_ID,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            DELIVERY_UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            CREATE_BY,
            CREATE_DATE: new Date(),

        });

        return res.status(201).json({
            success: true,
            message: "Purchase Order created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create purchase order: ${error.message}`,
        });
    }
};

export const getAllPurchaseOrders = async (req, res) => {
    const {UNIT_ID, REV_ID, VENDOR_ID, MPO_STATUS} = req.query;

    try {
        const where = {};
        if (REV_ID) where.REV_ID = REV_ID;
        if (UNIT_ID) where.UNIT_ID = UNIT_ID;
        if (VENDOR_ID) where.VENDOR_ID = VENDOR_ID;
        if (MPO_STATUS) where.MPO_STATUS = MPO_STATUS;

        const purchaseOrders = await PurchaseOrderModel.findAll({
            where,
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
                    model: MasterUnitModel,
                    as: "INVOICE_UNIT",
                    attributes: ["UNIT_CODE", "UNIT_NAME", "UNIT_LOCATION"]
                },
                {
                    model: MasterUnitModel,
                    as: "DELIVERY_UNIT",
                    attributes: ["UNIT_CODE", "UNIT_NAME", "UNIT_LOCATION"]
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
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Orders retrieved successfully",
            data: purchaseOrders,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase orders: ${error.message}`,
        });
    }
};

export const getPurchaseOrderById = async (req, res) => {
    try {
        const {id} = req.params;

        const purchaseOrder = await PurchaseOrderModel.findOne({
            where: {
                MPO_ID: id
            },
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
                    model: MasterUnitModel,
                    as: "INVOICE_UNIT",
                    attributes: ["UNIT_CODE", "UNIT_NAME", "UNIT_LOCATION"]
                },
                {
                    model: MasterUnitModel,
                    as: "DELIVERY_UNIT",
                    attributes: ["UNIT_CODE", "UNIT_NAME", "UNIT_LOCATION"]
                },
                {
                    model: MasterCompanyModel,
                    as: "COMPANY",
                    attributes: ["NAME", "CODE", "EMAIL", "FAX", "NO_TEL", "ADDRESS"]
                },
                {
                    model: MasterPayMethode,
                    as: "PAYMENT_TERM",
                    attributes: ["PAYMET_CODE", "PAYMET_DESC", "PAYMET_LEADTIME"]
                },
            ]
        });

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Purchase Order retrieved successfully",
            data: purchaseOrder,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order: ${error.message}`,
        });
    }
};

export const updatePurchaseOrder = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            REV_ID,
            MPO_DATE,
            MPO_STATUS,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            WAREHOUSE_ID,
            VENDOR_ID,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            DELIVERY_UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            UPDATE_BY,
        } = req.body;

        const purchaseOrder = await PurchaseOrderModel.findByPk(id);

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order not found",
            });
        }

        await purchaseOrder.update({
            REV_ID,
            MPO_DATE,
            MPO_STATUS,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            WAREHOUSE_ID,
            VENDOR_ID,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            DELIVERY_UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            UPDATE_BY,
            UPDATE_DATE: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Order updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update purchase order: ${error.message}`,
        });
    }
};

export const deletePurchaseOrder = async (req, res) => {
    try {
        const {id} = req.params;

        const purchaseOrder = await PurchaseOrderModel.findByPk(id);

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order not found",
            });
        }

        await purchaseOrder.destroy();

        return res.status(200).json({
            success: true,
            message: "Purchase Order deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete purchase order: ${error.message}`,
        });
    }
};

export const createPurchaseOrderRev = async (req, res) => {
    try {
        const {NAME, DESCRIPTION, SEQUENCE, CREATED_ID} = req.body;

        await PurchaseOrderRevModel.create({
            NAME,
            DESCRIPTION,
            SEQUENCE,
            CREATED_ID,
        });

        return res.status(201).json({
            success: true,
            message: "Purchase Order Revision created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create purchase order revision: ${error.message}`,
        });
    }
};

export const getAllPurchaseOrderRevs = async (req, res) => {
    try {
        const records = await PurchaseOrderRevModel.findAll();

        return res.status(200).json({
            success: true,
            message: "Purchase Order Revisions retrieved successfully",
            data: records,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order revisions: ${error.message}`,
        });
    }
};

export const getPurchaseOrderRevById = async (req, res) => {
    try {
        const {id} = req.params;

        const record = await PurchaseOrderRevModel.findByPk(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Revision not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Purchase Order Revision retrieved successfully",
            data: record,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order revision: ${error.message}`,
        });
    }
};

export const updatePurchaseOrderRev = async (req, res) => {
    try {
        const {id} = req.params;
        const {NAME, DESCRIPTION, SEQUENCE, CREATED_ID} = req.body;

        const record = await PurchaseOrderRevModel.findByPk(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Revision not found",
            });
        }

        await record.update({
            NAME,
            DESCRIPTION,
            SEQUENCE,
            CREATED_ID,
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Order Revision updated successfully",
            data: record,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update purchase order revision: ${error.message}`,
        });
    }
};

export const deletePurchaseOrderRev = async (req, res) => {
    try {
        const {id} = req.params;

        const record = await PurchaseOrderRevModel.findByPk(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Revision not found",
            });
        }

        await record.destroy();

        return res.status(200).json({
            success: true,
            message: "Purchase Order Revision deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete purchase order revision: ${error.message}`,
        });
    }
};