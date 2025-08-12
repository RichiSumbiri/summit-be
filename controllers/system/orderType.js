import {MasterOrderType} from "../../models/setup/orderType.mod.js";

export const getAllOrderTypes = async (req, res) => {
    try {
        const orderTypes = await MasterOrderType.findAll();

        return res.status(200).json({
            success: true,
            message: "Order types retrieved successfully",
            orderTypes
        });
    } catch (error) {
        console.error("Error retrieving order types:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve order types: ${error.message}`
        });
    }
};

export const getOrderTypeById = async (req, res) => {
    try {
        const { id } = req.params;

        const orderType = await MasterOrderType.findByPk(id);

        if (!orderType) {
            return res.status(404).json({
                success: false,
                message: "Order type not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order type retrieved successfully",
            orderType
        });
    } catch (error) {
        console.error("Error retrieving order type:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve order type: ${error.message}`
        });
    }
};

export const createOrderType = async (req, res) => {
    try {
        const { TYPE_CODE, TYPE_DESC } = req.body;


        if (!TYPE_CODE || TYPE_CODE.length > 3) {
            return res.status(400).json({
                success: false,
                message: "TYPE_CODE is required and must be 3 characters or less"
            });
        }

        const existing = await MasterOrderType.findOne({ where: { TYPE_CODE } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "TYPE_CODE already exists"
            });
        }

        const newOrderType = await MasterOrderType.create({
            TYPE_CODE,
            TYPE_DESC: TYPE_DESC || null
        });

        return res.status(201).json({
            success: true,
            message: "Order type created successfully",
            newOrderType
        });
    } catch (error) {
        console.error("Error creating order type:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create order type: ${error.message}`
        });
    }
};

export const updateOrderType = async (req, res) => {
    try {
        const { id } = req.params;
        const { TYPE_CODE, TYPE_DESC } = req.body;

        const orderType = await MasterOrderType.findByPk(id);
        if (!orderType) {
            return res.status(404).json({
                success: false,
                message: "Order type not found"
            });
        }


        if (TYPE_CODE && TYPE_CODE !== orderType.TYPE_CODE) {
            const existing = await MasterOrderType.findOne({ where: { TYPE_CODE } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "TYPE_CODE already exists"
                });
            }
        }

        await orderType.update({
            TYPE_CODE: TYPE_CODE || orderType.TYPE_CODE,
            TYPE_DESC: TYPE_DESC || orderType.TYPE_DESC
        });

        return res.status(200).json({
            success: true,
            message: "Order type updated successfully",
            orderType: await orderType.reload()
        });
    } catch (error) {
        console.error("Error updating order type:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update order type: ${error.message}`
        });
    }
};

export const deleteOrderType = async (req, res) => {
    try {
        const { id } = req.params;

        const orderType = await MasterOrderType.findByPk(id);
        if (!orderType) {
            return res.status(404).json({
                success: false,
                message: "Order type not found"
            });
        }

        await orderType.destroy();

        return res.status(200).json({
            success: true,
            message: "Order type deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting order type:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete order type: ${error.message}`
        });
    }
};