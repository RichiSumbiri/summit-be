import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { OrderComponentDetail, qryGetBomRmList, qryGetCompListColor, qryGetListCompDetail, qryListOrderCompDetail } from "../../models/orderManagement/orderCompDetail.mod.js";

export const createOrderCompDetail = async (req, res) => {
    try {
        // const { DIMD,
        //         ITEM_CATEGORY_CODE,
        //         ITEM_COLOR_CODE,
        //         ITEM_COLOR_ID,
        //         MASTER_ITEM_ID,
        //         ARRAY_COMP,
        //         ORDER_ID
        // } = req.data;

        const dataPost = req.body
console.log(dataPost);

        const createOrderCompDetail = await OrderComponentDetail.bulkCreate(dataPost)


        return res.status(200).json({
            success: true,
            message: "success create list component detail",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order component detail",
        });
    }
}

export const getListCompDetail = async (req, res) => {
    try {
        const {productId} = req.params;
        const getList = await db.query(qryGetListCompDetail, {
            replacements: {
                productId: productId
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get list component detail",
            data: getList
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order component detail",
        });
    }
}

export const getListOrderCompDetail = async (req, res) => {
    try {
        const {orderId} = req.params;
        const getListRm = await db.query(qryListOrderCompDetail, {
            replacements: {
                orderId: orderId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get list order component detail",
            data: getListRm
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order component detail",
        });
    }
}


export const getCompRmList = async (req, res) => {
    try {
        const {orderId} = req.params;
        const getListRm = await db.query(qryGetBomRmList, {
            replacements: {
                orderId: orderId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get list raw material",
            data: getListRm
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order raw  material",
        });
    }
}


export const getComFgColorList = async (req, res) => {
    try {
        const {orderId} = req.params;
        
        const getListRm = await db.query(qryGetCompListColor, {
            replacements: {
                orderId: orderId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get po FG color",
            data: getListRm
        });
    } catch (err) {
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get  Po FG color",
        });
    }
}
