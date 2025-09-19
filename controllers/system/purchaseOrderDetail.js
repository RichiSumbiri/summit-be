import PurchaseOrderDetailModel from "../../models/system/purchaseOrderDetail.mod.js";
import {PurchaseOrderModel} from "../../models/system/purchaseOrder.mod.js";

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
    const { MPO_ID, REV_ID, ORDER_NO } = req.query;

    try {
        const where = {};
        if (MPO_ID) where.MPO_ID = MPO_ID;
        if (REV_ID) where.REV_ID = REV_ID;
        if (ORDER_NO) where.ORDER_NO = ORDER_NO;

        const details = await PurchaseOrderDetailModel.findAll({ where });

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
        const { id } = req.params;

        const detail = await PurchaseOrderDetailModel.findByPk(id);

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
        const { id } = req.params;
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
        const { id } = req.params;

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