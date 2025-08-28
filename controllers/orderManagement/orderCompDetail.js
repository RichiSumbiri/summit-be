import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { qryGetListCompDetail } from "../../models/orderManagement/orderCompDetail.mod.js";

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