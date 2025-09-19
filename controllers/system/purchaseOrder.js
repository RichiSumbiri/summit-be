import {PurchaseOrderModel, PurchaseOrderRevModel} from "../../models/system/purchaseOrder.mod.js";

export const createPurchaseOrder = async (req, res) => {
    try {
        const {
            MPO_ID,
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
            UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            CREATE_BY,
            UPDATE_BY,
        } = req.body;

        if (!MPO_ID) {
            return res.status(400).json({
                success: false,
                message: "MPO_ID is required",
            });
        }

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
            UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            CREATE_BY,
            CREATE_DATE: new Date(),
            UPDATE_BY,
            UPDATE_DATE: new Date(),
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
    const { UNIT_ID, VENDOR_ID, MPO_STATUS } = req.query;

    try {
        const where = {};
        if (UNIT_ID) where.UNIT_ID = UNIT_ID;
        if (VENDOR_ID) where.VENDOR_ID = VENDOR_ID;
        if (MPO_STATUS) where.MPO_STATUS = MPO_STATUS;

        const purchaseOrders = await PurchaseOrderModel.findAll({ where });

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
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrderModel.findByPk(id);

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
        const { id } = req.params;
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
            UNIT_ID,
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
            UNIT_ID,
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
        const { id } = req.params;

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
        const { NAME, DESCRIPTION, SEQUENCE, CREATED_ID } = req.body;

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
        const { id } = req.params;

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
        const { id } = req.params;
        const { NAME, DESCRIPTION, SEQUENCE, CREATED_ID } = req.body;

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
        const { id } = req.params;

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