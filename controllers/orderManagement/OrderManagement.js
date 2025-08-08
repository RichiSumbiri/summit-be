import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { ModelOrderPOHeader, queryGetListOrderHeader } from "../../models/orderManagement/orderManagement.mod.js";
import { OrderPoListing, OrderPoListingSize } from "../../models/production/order.mod.js";
import moment from "moment";


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
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order header by status"
        });
    }
}

export const postOrderHeader = async(req,res) => {
    try {
        const { DataHeader } = req.body;
        console.log(DataHeader);
        if(DataHeader.ORDER_ID){
            await ModelOrderPOHeader.update({
                ORDER_STATUS: DataHeader.ORDER_STATUS,
                UOM_CODE: DataHeader.UOM_CODE,
                CURRENCY_CODE: DataHeader.CURRENCY_CODE,
                ORDER_PLACEMENT_COMPANY: DataHeader.ORDER_PLACEMENT_COMPANY,
                ITEM_ID: DataHeader.ITEM_ID,
                ORDER_STYLE_DESCRIPTION: DataHeader.ORDER_STYLE_DESCRIPTION,
                PRICE_TYPE_CODE: DataHeader.PRICE_TYPE_CODE,
                CUSTOMER_ID: DataHeader.CUSTOMER_ID,
                CUSTOMER_DIVISION_ID: DataHeader.CUSTOMER_DIVISION_ID,
                CUSTOMER_SEASON_ID: DataHeader.CUSTOMER_SEASON_ID,
                CUSTOMER_PROGRAM_ID: DataHeader.CUSTOMER_PROGRAM_ID,
                CUSTOMER_BUYPLAN_ID: DataHeader.CUSTOMER_BUYPLAN_ID,
                ORDER_CONFIRMED_DATE: DataHeader.ORDER_CONFIRMED_DATE,
                CONTRACT_CONFIRMED_DATE: DataHeader.CONTRACT_CONFIRMED_DATE,
                CONTRACT_EXPIRED_DATE: DataHeader.CONTRACT_EXPIRED_DATE,
                CONTRACT_REF_NO: DataHeader.CONTRACT_REF_NO,
                ORDER_REFERENCE_PO_NO: DataHeader.ORDER_REFERENCE_PO_NO,
                FLAG_MULTISET_ITEMS: DataHeader.FLAG_MULTISET_ITEMS,
                UPDATE_BY: DataHeader.CREATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    ORDER_ID: DataHeader.ORDER_ID
                }
            });
        } else {
            const latestOrder = await ModelOrderPOHeader.findOne({
                where: {
                    ORDER_TYPE_CODE: DataHeader.ORDER_TYPE_CODE
                },
                order: [['ORDER_ID', 'DESC']],
                raw: true
            });
            const newIncrement = !latestOrder ? '0000001' : parseInt(latestOrder.ORDER_ID.slice(-7)) + 1;
            const newOrderID = DataHeader.ORDER_TYPE_CODE + newIncrement.toString().padStart(7, '0');
            await ModelOrderPOHeader.create({
                    ORDER_ID: newOrderID,
                    ORDER_TYPE_CODE: DataHeader.ORDER_TYPE_CODE,
                    ORDER_STATUS: DataHeader.ORDER_STATUS,
                    ORDER_UOM: DataHeader.UOM_CODE,
                    ORDER_QTY: DataHeader.ORDER_UOM,
                    CURRENCY_CODE: DataHeader.CURRENCY_CODE,
                    ORDER_PLACEMENT_COMPANY: DataHeader.ORDER_PLACEMENT_COMPANY,
                    ITEM_ID: DataHeader.ITEM_ID,
                    ORDER_STYLE_DESCRIPTION: DataHeader.ORDER_STYLE_DESCRIPTION,
                    PRICE_TYPE_CODE: DataHeader.PRICE_TYPE_CODE,
                    CUSTOMER_ID: DataHeader.CUSTOMER_ID,
                    CUSTOMER_DIVISION_ID: DataHeader.CUSTOMER_DIVISION_ID,
                    CUSTOMER_SEASON_ID: DataHeader.CUSTOMER_SEASON_ID,
                    CUSTOMER_PROGRAM_ID: DataHeader.CUSTOMER_PROGRAM_ID,
                    CUSTOMER_BUYPLAN_ID: DataHeader.CUSTOMER_BUYPLAN_ID,
                    ORDER_CONFIRMED_DATE: DataHeader.ORDER_CONFIRMED_DATE,
                    CONTRACT_CONFIRMED_DATE: DataHeader.CONTRACT_CONFIRMED_DATE,
                    CONTRACT_EXPIRED_DATE: DataHeader.CONTRACT_EXPIRED_DATE,
                    CONTRACT_REF_NO: DataHeader.CONTRACT_REF_NO,
                    ORDER_REFERENCE_PO_NO: DataHeader.ORDER_REFERENCE_PO_NO,
                    FLAG_MULTISET_ITEMS: DataHeader.FLAG_MULTISET_ITEMS,
                    CREATE_BY: DataHeader.CREATE_BY,
                    CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        return res.status(200).json({
            success: true,
            message: "success post order header"
        });
    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post order header"
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