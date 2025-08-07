import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { queryGetListOrderHeader } from "../../models/orderManagement/orderManagement.mod.js";
import { OrderPoListing, OrderPoListingSize } from "../../models/production/order.mod.js";


export const getListOrderHeaderByStatus = async(req,res) => {
    try {
        const { status } = req.params;
        const getList = await db.query(queryGetListOrderHeader, {
            replacements: {
                orderStatus: status
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get list order header by status",
            data: getList
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order header by status"
        });
    }
}

export const getListPODetailByOrderID = async(req,res) => {
    try {
        const { orderID } = req.params;
        const listDetail = await OrderPoListing.findAll({
            where: {
                ORDER_NO: orderID
            }, raw: true
        });
         return res.status(200).json({
            success: true,
            message: "success get list order detail by order id",
            data: listDetail
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order detail by order id"
        });
    }
}

export const getPOListingSizeByPOID = async(req,res) => {
    try {
        const { poid } = req.params;
        const getData = await OrderPoListingSize.findAll({
            where: {
                ORDER_PO_ID: poid
            }
        });
         return res.status(200).json({
            success: true,
            message: "success get list po listing size by poid",
            data: getData
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get po listing size by order poid"
        });
    }
}