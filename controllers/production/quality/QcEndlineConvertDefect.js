import { Sequelize, Op } from "sequelize";
import { QcEndlineOutput } from "../../../models/production/quality.mod.js";
import { modelLogConvertDefect } from "../../../models/production/convertDefect.mod.js";
import moment from "moment";
import { LogDailyQcDefect, LogDailyQcPart } from "../../../models/production/logQcDefPart.mod.js";


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
                ENDLINE_OUT_TYPE: 'DEFECT',
                ENDLINE_OUT_UNDO: null
            }, raw: true
        });
        
        if(checkData.length>0){
            for await(const qcdata of checkData){
                // get log defect data
                const getLogDefect = await LogDailyQcDefect.findOne({
                    where: {
                        SCHEDULE_DATE: dataConvert.ENDLINE_PROD_DATE,
                        SCH_ID: parseInt(qcdata.ENDLINE_SCH_ID),
                        SITELINE: qcdata.ENDLINE_ID_SITELINE,
                        DEFECT_CODE: qcdata.ENDLINE_DEFECT_CODE
                    }, raw: true
                });
                //get log part data
                const getLogPart = await LogDailyQcPart.findOne({
                    where: {
                        SCHEDULE_DATE: dataConvert.ENDLINE_PROD_DATE,
                        SCH_ID: parseInt(qcdata.ENDLINE_SCH_ID),
                        SITELINE: qcdata.ENDLINE_ID_SITELINE,
                        PART_CODE: qcdata.ENDLINE_PART_CODE
                    }, raw: true
                });

                // hitung qty baru untuk log defect & part
                const NewDefectQty  = parseInt(getLogDefect.DEFECT_QTY) - parseInt(qcdata.ENDLINE_OUT_QTY);
                const NewPartQty    = parseInt(getLogPart.DEFECT_QTY) - parseInt(qcdata.ENDLINE_OUT_QTY);
                
                // Manipulasi Qty Log QC Defect
                if(NewDefectQty>0){
                    // update qty log qc defect
                    await LogDailyQcDefect.update({
                            DEFECT_QTY: NewDefectQty
                        }, {
                            where: {
                                SCHEDULE_DATE: dataConvert.ENDLINE_PROD_DATE,
                                SCH_ID: qcdata.ENDLINE_SCH_ID,
                                SITELINE: qcdata.ENDLINE_ID_SITELINE,
                                DEFECT_CODE: qcdata.ENDLINE_DEFECT_CODE
                            }, raw: true
                    });
                } else if(NewDefectQty===0) {
                    // hapus log qc defect
                    await LogDailyQcDefect.destroy({
                        where: {
                            SCHEDULE_DATE: dataConvert.ENDLINE_PROD_DATE,
                            SCH_ID: qcdata.ENDLINE_SCH_ID,
                            SITELINE: qcdata.ENDLINE_ID_SITELINE,
                            DEFECT_CODE: qcdata.ENDLINE_DEFECT_CODE
                        }, raw: true
                    });
                } 

                // Manipulasi Qty Log QC Part
                if(NewPartQty>0){
                    // update qty log qc part
                    await LogDailyQcPart.update({
                            DEFECT_QTY: NewPartQty
                        }, {
                            where: {
                                SCHEDULE_DATE: dataConvert.ENDLINE_PROD_DATE,
                                SCH_ID: qcdata.ENDLINE_SCH_ID,
                                SITELINE: qcdata.ENDLINE_ID_SITELINE,
                                PART_CODE: qcdata.ENDLINE_PART_CODE
                            }, raw: true
                    });
                } else if(NewDefectQty===0) {
                    // hapus log qc part
                    await LogDailyQcPart.destroy({
                        where: {
                            SCHEDULE_DATE: dataConvert.ENDLINE_PROD_DATE,
                            SCH_ID: qcdata.ENDLINE_SCH_ID,
                            SITELINE: qcdata.ENDLINE_ID_SITELINE,
                            PART_CODE: qcdata.ENDLINE_PART_CODE
                        }, raw: true
                    });
                }

                
            }

            // update qc_endline_output convert defect to RTT
            const updateQcEndlineOut = await QcEndlineOutput.update({
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

            if(updateQcEndlineOut){
                // insert data to log convert
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

        }
        
    } catch(err){
        console.error(err);
        return res.status(404).json({
            message: "error processing convert defect to RTT",
            error: err,
        });
    }
}