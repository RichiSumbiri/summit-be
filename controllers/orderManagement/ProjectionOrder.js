import moment from "moment";
import { ModelProjectionOrder, queryGetProjectionOrder } from "../../models/orderManagement/ProjectionOrder.mod.js";
import db from "../../config/database.js";
import { QueryTypes } from "sequelize";

export const getProjectionOrder = async(req,res) => {
    try {
        const listDataPRJ = await db.query(queryGetProjectionOrder, { type: QueryTypes.SELECT });
        return res.status(200).json({
            success: true,
            message: "success get projection order",
            data: listDataPRJ
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get projection order"
        });
    }
}

export const postProjectionOrder = async(req,res) => {
    try {
        const { DataPRJ } = req.body;
        if(DataPRJ.PRJ_ID){
            await ModelProjectionOrder.update({
                PRJ_CODE: DataPRJ.PRJ_CODE,
                PRJ_DESCRIPTION: DataPRJ.PRJ_DESCRIPTION,
                PRJ_STATUS: DataPRJ.PRJ_STATUS,
                CUSTOMER_ID: DataPRJ.CUSTOMER_ID,
                CUSTOMER_DIVISION_ID: DataPRJ.CUSTOMER_DIVISION_ID,
                CUSTOMER_SEASON_ID: DataPRJ.CUSTOMER_SEASON_ID,
                UOM_CODE: DataPRJ.UOM_CODE,
                CURRENCY_CODE: DataPRJ.CURRENCY_CODE,
                ORDER_CONFIRMED_DATE: DataPRJ.ORDER_CONFIRMED_DATE,
                CONTRACT_NO: DataPRJ.CONTRACT_NO,
                CONTRACT_CONFIRMED_DATE: DataPRJ.CONTRACT_CONFIRMED_DATE,
                ORDER_PERIOD_DATE_FROM: DataPRJ.ORDER_PERIOD_DATE_FROM,
                ORDER_PERIOD_DATE_TO: DataPRJ.ORDER_PERIOD_DATE_TO,
                ORDER_QTY: DataPRJ.ORDER_QTY,
                UNIT_PRICE: DataPRJ.UNIT_PRICE,
                NOTE_REMARKS: DataPRJ.NOTE_REMARKS,
                UPDATE_BY: DataPRJ.UPDATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    PRJ_ID: DataPRJ.PRJ_ID
                }
            });
        } else {
            const getLastPRJID = await ModelProjectionOrder.findOne({
                order: [['PRJ_ID', 'DESC']],
                raw: true
            }); 
            const newIncrement = !getLastPRJID ? '0000001': parseInt(getLastPRJID.PRJ_ID.slice(-7)) + 1;
            const newPRJID = `PRJ${newIncrement.toString().padStart(7, '0')}`;
            await ModelProjectionOrder.create({
                PRJ_ID: newPRJID,
                PRJ_CODE: DataPRJ.PRJ_CODE,
                PRJ_DESCRIPTION: DataPRJ.PRJ_DESCRIPTION,
                PRJ_STATUS: DataPRJ.PRJ_STATUS,
                CUSTOMER_ID: DataPRJ.CUSTOMER_ID,
                CUSTOMER_DIVISION_ID: DataPRJ.CUSTOMER_DIVISION_ID,
                CUSTOMER_SEASON_ID: DataPRJ.CUSTOMER_SEASON_ID,
                UOM_CODE: DataPRJ.UOM_CODE,
                CURRENCY_CODE: DataPRJ.CURRENCY_CODE,
                ORDER_CONFIRMED_DATE: DataPRJ.ORDER_CONFIRMED_DATE,
                CONTRACT_NO: DataPRJ.CONTRACT_NO,
                CONTRACT_CONFIRMED_DATE: DataPRJ.CONTRACT_CONFIRMED_DATE,
                ORDER_PERIOD_DATE_FROM: DataPRJ.ORDER_PERIOD_DATE_FROM,
                ORDER_PERIOD_DATE_TO: DataPRJ.ORDER_PERIOD_DATE_TO,
                ORDER_QTY: DataPRJ.ORDER_QTY,
                UNIT_PRICE: DataPRJ.UNIT_PRICE,
                NOTE_REMARKS: DataPRJ.NOTE_REMARKS,
                CREATE_BY: DataPRJ.UPDATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        return res.status(200).json({
            success: true,
            message: "success post projection order"
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post projection order"
        });
    }
}