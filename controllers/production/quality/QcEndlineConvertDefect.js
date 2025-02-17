import { Sequelize, Op } from "sequelize";
import { QcEndlineOutput } from "../../../models/production/quality.mod.js";
import { modelLogConvertDefect } from "../../../models/production/convertDefect.mod.js";
import moment from "moment";


export const postQcEndlineConvertDefect = async(req, res) => {
    try {
        const { dataConvert } = req.body;
        const checkData = await QcEndlineOutput.findAll({
            where: {
                ENDLINE_ACT_SCHD_ID: dataConvert.ENDLINE_ACT_SCHD_ID,
                ENDLINE_SCHD_DATE: dataConvert.ENDLINE_PROD_DATE,
                [Op.and]: [
                    Sequelize.where(Sequelize.fn("HOUR", Sequelize.col("ENDLINE_TIME")), "=", Sequelize.fn("HOUR", dataConvert.ENDLINE_TIME))
                ],
                ENDLINE_PLAN_SIZE: dataConvert.ENDLINE_PLAN_SIZE,
                ENDLINE_OUT_TYPE: 'DEFECT'
            }, raw: true
        });
        if(checkData.length>0){
            const updateData = await QcEndlineOutput.update({
                ENDLINE_OUT_TYPE: 'RTT',
                ENDLINE_DEFECT_CODE: null,
                ENDLINE_PART_CODE: null,
                ENDLINE_REPAIR: null,
                ENDLINE_ACT_RPR_SCHD_ID: null
            },{ 
                where: {
                    ENDLINE_ACT_SCHD_ID: dataConvert.ENDLINE_ACT_SCHD_ID,
                    ENDLINE_SCHD_DATE: dataConvert.ENDLINE_PROD_DATE,
                    [Op.and]: [
                        Sequelize.where(Sequelize.fn("HOUR", Sequelize.col("ENDLINE_TIME")), "=", Sequelize.fn("HOUR", dataConvert.ENDLINE_TIME))
                    ],
                    ENDLINE_PLAN_SIZE: dataConvert.ENDLINE_PLAN_SIZE,
                    ENDLINE_OUT_TYPE: 'DEFECT'
                }, raw: true
            });
            if(updateData){
                await modelLogConvertDefect.create({
                    ENDLINE_ACT_SCHD_ID: dataConvert.ENDLINE_ACT_SCHD_ID,
                    ENDLINE_PROD_DATE: dataConvert.ENDLINE_PROD_DATE,
                    ENDLINE_TIME: dataConvert.ENDLINE_TIME,
                    ENDLINE_PLAN_SIZE: dataConvert.ENDLINE_PLAN_SIZE,
                    ENDLINE_OUT_TYPE: dataConvert.ENDLINE_OUT_TYPE,
                    UPDATE_BY: dataConvert.UPDATE_BY,
                    UPDATE_TIME: moment().format('YYYY-MM-DD HH:mm:ss')
                });
                return res.status(200).json({
                    message: "success convert defect to RTT",
                });
            } else {
                return res.status(200).json({
                    message: "fail convert defect to RTT",
                });
            }
        } else {
            return res.status(200).json({
                message: "fail convert defect to RTT, data not found",
                data: checkData,
            });
        }
    } catch(err){
        console.error(err);
        return res.status(404).json({
            message: "error processing convert defect to RTT",
            error: err,
        });
    }
}