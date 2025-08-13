import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { ModelOrderPODetail, ModelOrderPOHeader, queryGetListOrderHeader } from "../../models/orderManagement/orderManagement.mod.js";
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
        if(DataHeader.ORDER_ID){
            await ModelOrderPOHeader.update({
                ORDER_STATUS: DataHeader.ORDER_STATUS,
                UOM_CODE: DataHeader.UOM_CODE,
                CURRENCY_CODE: DataHeader.CURRENCY_CODE,
                ORDER_PLACEMENT_COMPANY: DataHeader.ORDER_PLACEMENT_COMPANY,
                ITEM_ID: DataHeader.ITEM_ID,
                ORDER_STYLE_DESCRIPTION: DataHeader.ORDER_STYLE_DESCRIPTION,
                PRICE_TYPE_CODE: DataHeader.PRICE_TYPE_CODE,
                CURRENCY_CODE: DataHeader.CURRENCY_CODE,
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
                NOTE_REMARKS: DataHeader.NOTE_REMARKS,
                SIZE_TEMPLATE_ID: DataHeader.SIZE_TEMPLATE_ID,
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
                    CURRENCY_CODE: DataHeader.CURRENCY_CODE,
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
                    NOTE_REMARKS: DataHeader.NOTE_REMARKS,
                    SIZE_TEMPLATE_ID: DataHeader.SIZE_TEMPLATE_ID,
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


export const postPOListing = async(req,res) => {
    try {
        const { DataPOID } = req.body;
        if(DataPOID.ORDER_PO_ID){
            await OrderPoListing.update({
                MANUFACTURING_COMPANY: DataPOID.MANUFACTURING_COMPANY,
                MANUFACTURING_SITE: DataPOID.MANUFACTURING_SITE,
                ORDER_PLACEMENT_COMPANY: DataPOID.ORDER_PLACEMENT_COMPANY,
                ORDER_TYPE_CODE: DataPOID.ORDER_TYPE_CODE,
                ORDER_NO: DataPOID.ORDER_ID,
                ORDER_REFERENCE_PO_NO: DataPOID.ORDER_REFERENCE_PO_NO,
                ORDER_STYLE_DESCRIPTION: DataPOID.ORDER_STYLE_DESCRIPTION,
                PRODUCT_ITEM_ID: DataPOID.PRODUCT_ITEM_ID,
                PRODUCT_ITEM_CODE: DataPOID.PRODUCT_ITEM_CODE,
                PRODUCT_ITEM_DESCRIPTION: DataPOID.PRODUCT_ITEM_DESCRIPTION,
                CUSTOMER_ID: DataPOID.CUSTOMER_ID,
                CUSTOMER_NAME: DataPOID.CUSTOMER_NAME,
                CUSTOMER_DIVISION_ID: DataPOID.CUSTOMER_DIVISION_ID,
                CUSTOMER_DIVISION: DataPOID.CUSTOMER_DIVISION,
                CUSTOMER_SEASON_ID: DataPOID.CUSTOMER_SEASON_ID,
                CUSTOMER_SEASON: DataPOID.CUSTOMER_SEASON,
                CUSTOMER_BUYPLAN_ID: DataPOID.CUSTOMER_BUYPLAN_ID,
                CUSTOMER_BUY_PLAN: DataPOID.CUSTOMER_BUY_PLAN,
                CUSTOMER_PROGRAM_ID: DataPOID.CUSTOMER_PROGRAM_ID,
                CUSTOMER_PROGRAM: DataPOID.CUSTOMER_PROGRAM,
                PO_REF_CODE: DataPOID.PO_REF_CODE,
                ITEM_COLOR_ID: DataPOID.ITEM_COLOR_ID,
                ITEM_COLOR_CODE: DataPOID.ITEM_COLOR_CODE,
                ITEM_COLOR_NAME: DataPOID.ITEM_COLOR_NAME,
                COUNTRY: DataPOID.COUNTRY,
                DELIVERY_LOCATION_ID: DataPOID.DELIVERY_LOCATION_ID,
                DELIVERY_LOCATION_CODE: DataPOID.DELIVERY_LOCATION_CODE,
                DELIVERY_LOCATION_NAME: DataPOID.DELIVERY_LOCATION_NAME,
                PACKING_METHOD: DataPOID.PACKING_METHOD,
                DELIVERY_MODE_CODE: DataPOID.DELIVERY_MODE_CODE,
                PO_CONFIRMED_DATE: DataPOID.PO_CONFIRMED_DATE,
                PO_EXPIRED_DATE: DataPOID.PO_EXPIRED_DATE,
                ORIGINAL_DELIVERY_DATE: DataPOID.ORIGINAL_DELIVERY_DATE,
                FINAL_DELIVERY_DATE: DataPOID.FINAL_DELIVERY_DATE,
                PLAN_EXFACTORY_DATE: DataPOID,
                PRODUCTION_MONTH: moment(DataPOID.PRODUCTION_MONTH, "YYYY-MM").format("MMMM/YYYY"),
                SHIPPING_TERMS_CODE: DataPOID.SHIPPING_TERMS_CODE,
                PRICE_TYPE: DataPOID.PRICE_TYPE,
                UNIT_PRICE: DataPOID.UNIT_PRICE,
                MO_COST: DataPOID.MO_COST,
                REVISED_UNIT_PRICE: DataPOID.REVISED_UNIT_PRICE,
                ORDER_UOM: DataPOID.ORDER_UOM,
                ORDER_QTY: DataPOID.ORDER_QTY,
                MO_QTY: DataPOID.MO_QTY,
                TOTAL_ORDER_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.ORDER_QTY),
                TOTAL_MO_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.MO_QTY),
                SCRAP_PERCENTAGE: DataPOID.SCRAP_PERCENTAGE,
                CURRENCY_CODE: DataPOID.CURRENCY_CODE,
                NOTE_REMARKS: DataPOID.NOTE_REMARKS,
                DELIVERY_TERM: DataPOID.SHIPPING_TERMS_CODE,
                PO_CREATED_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                CREATE_BY: DataPOID.CREATE_BY
            }, {
                where: {
                    ORDER_PO_ID: DataPOID.ORDER_PO_ID,
                    ORDER_NO: DataPOID.ORDER_ID
                }
            });
        } else {
            const getLastPOID = await OrderPoListing.findOne({
                order: [['ORDER_PO_ID', 'DESC']],
                raw: true
            }); 
            const newIncrement = !getLastPOID ? '0000001' : parseInt(getLastPOID.ORDER_PO_ID.slice(-8)) + 1;
            const newPOID = 'PO' + newIncrement.toString().padStart(8, '0');
            await OrderPoListing.create({
                MANUFACTURING_COMPANY: DataPOID.MANUFACTURING_COMPANY,
                MANUFACTURING_SITE: DataPOID.MANUFACTURING_SITE,
                ORDER_PLACEMENT_COMPANY: DataPOID.ORDER_PLACEMENT_COMPANY,
                ORDER_TYPE_CODE: DataPOID.ORDER_TYPE_CODE,
                ORDER_NO: DataPOID.ORDER_ID,
                ORDER_REFERENCE_PO_NO: DataPOID.ORDER_REFERENCE_PO_NO,
                ORDER_STYLE_DESCRIPTION: DataPOID.ORDER_STYLE_DESCRIPTION,
                PRODUCT_ITEM_ID: DataPOID.PRODUCT_ITEM_ID,
                PRODUCT_ITEM_CODE: DataPOID.PRODUCT_ITEM_CODE,
                PRODUCT_ITEM_DESCRIPTION: DataPOID.PRODUCT_ITEM_DESCRIPTION,
                CUSTOMER_ID: DataPOID.CUSTOMER_ID,
                CUSTOMER_NAME: DataPOID.CUSTOMER_NAME,
                CUSTOMER_DIVISION_ID: DataPOID.CUSTOMER_DIVISION_ID,
                CUSTOMER_DIVISION: DataPOID.CUSTOMER_DIVISION,
                CUSTOMER_SEASON_ID: DataPOID.CUSTOMER_SEASON_ID,
                CUSTOMER_SEASON: DataPOID.CUSTOMER_SEASON,
                CUSTOMER_BUYPLAN_ID: DataPOID.CUSTOMER_BUYPLAN_ID,
                CUSTOMER_BUY_PLAN: DataPOID.CUSTOMER_BUY_PLAN,
                CUSTOMER_PROGRAM_ID: DataPOID.CUSTOMER_PROGRAM_ID,
                CUSTOMER_PROGRAM: DataPOID.CUSTOMER_PROGRAM,
                ORDER_PO_ID: newPOID,
                PO_REF_CODE: DataPOID.PO_REF_CODE,
                ITEM_COLOR_ID: DataPOID.ITEM_COLOR_ID,
                ITEM_COLOR_CODE: DataPOID.ITEM_COLOR_CODE,
                ITEM_COLOR_NAME: DataPOID.ITEM_COLOR_NAME,
                COUNTRY: DataPOID.COUNTRY,
                DELIVERY_LOCATION_ID: DataPOID.DELIVERY_LOCATION_ID,
                DELIVERY_LOCATION_CODE: DataPOID.DELIVERY_LOCATION_CODE,
                DELIVERY_LOCATION_NAME: DataPOID.DELIVERY_LOCATION_NAME,
                PACKING_METHOD: DataPOID.PACKING_METHOD,
                DELIVERY_MODE_CODE: DataPOID.DELIVERY_MODE_CODE,
                PO_CONFIRMED_DATE: DataPOID.PO_CONFIRMED_DATE,
                PO_EXPIRED_DATE: DataPOID.PO_EXPIRED_DATE,
                ORIGINAL_DELIVERY_DATE: DataPOID.ORIGINAL_DELIVERY_DATE,
                FINAL_DELIVERY_DATE: DataPOID.FINAL_DELIVERY_DATE,
                PLAN_EXFACTORY_DATE: DataPOID,
                PRODUCTION_MONTH: moment(DataPOID.PRODUCTION_MONTH, "YYYY-MM").format("MMMM/YYYY"),
                SHIPPING_TERMS_CODE: DataPOID.SHIPPING_TERMS_CODE,
                PRICE_TYPE: DataPOID.PRICE_TYPE,
                UNIT_PRICE: DataPOID.UNIT_PRICE,
                MO_COST: DataPOID.MO_COST,
                REVISED_UNIT_PRICE: DataPOID.REVISED_UNIT_PRICE,
                ORDER_UOM: DataPOID.ORDER_UOM,
                ORDER_QTY: DataPOID.ORDER_QTY,
                MO_QTY: DataPOID.MO_QTY,
                TOTAL_ORDER_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.ORDER_QTY),
                TOTAL_MO_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.MO_QTY),
                SCRAP_PERCENTAGE: DataPOID.SCRAP_PERCENTAGE,
                NOTE_REMARKS: DataPOID.NOTE_REMARKS,
                CURRENCY_CODE: DataPOID.CURRENCY_CODE,
                DELIVERY_TERM: DataPOID.SHIPPING_TERMS_CODE,
                PO_CREATED_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                CREATE_BY: DataPOID.CREATE_BY
            });
        }

        
        return res.status(200).json({
            success: true,
            message: "success post po listing"
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post po listing"
        });
    }
}