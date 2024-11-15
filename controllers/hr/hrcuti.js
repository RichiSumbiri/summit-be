import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryGetCutiDate, queryMasterCuti, querySummaryCuti, SumbiriCutiMain } from "../../models/hr/cuti.mod.js";
import moment from "moment";

export const getMasterCuti = async(req,res) => {
    try {
        const data = await dbSPL.query(queryMasterCuti, { type: QueryTypes.SELECT });
        if(data){
            res.status(200).json({
                success: true,
                message: "success get master cuti",
                data: data
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master cuti",
        });
    }
}

export const deleteCuti = async(req,res) => {
    try {
        const cutiID = decodeURIComponent(req.params.cutiid);
        const action = await SumbiriCutiMain.update({
            cuti_active: "N"
        }, {
            where: {
                cuti_id: cutiID
            }
        });
        if(action){
            res.status(200).json({
                success: true,
                message: "success delete cuti",
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error delete cuti",
        });
    }
}

export const postCutiNew = async(req,res) => {
    try {
        const dataCuti          = req.body.dataCuti;
        if(dataCuti.cuti_id){
            const updateCuti = await SumbiriCutiMain.update({
                cuti_emp_nik: dataCuti.cuti_emp_nik,
                cuti_emp_tmb: dataCuti.cuti_emp_tmb,
                cuti_emp_name: dataCuti.cuti_emp_name.toUpperCase(),
                cuti_emp_dept: dataCuti.cuti_emp_dept.toUpperCase(),
                cuti_emp_position: dataCuti.cuti_emp_position.toUpperCase(),
                cuti_date_start: dataCuti.cuti_date_start,
                cuti_date_end: dataCuti.cuti_date_end,
                cuti_length: dataCuti.cuti_length,
                cuti_daymonth: dataCuti.cuti_daymonth.toUpperCase(),
                cuti_purpose: dataCuti.cuti_purpose.toUpperCase(),
                id_absen: parseInt(dataCuti.id_absen),
                cuti_createdate: moment().format('YYYY-MM-DD HH:mm:ss'),
                cuti_createby: dataCuti.cuti_createby,
                cuti_active: "Y"
            }, {
                where: {
                    cuti_id: dataCuti.cuti_id
                }
            });
            if(updateCuti){
                res.status(200).json({
                    success: true,
                    message: "success update cuti",
                });
            }
        } else {
            const cutiformat        = `SPC${moment().format('YYYY').toString().substr(-2)}${("0" + (moment().format('MM') + 1)).slice(-2)}${("0" + moment().format('DD')).slice(-2)}`;
            let cuti_id;
            const checkLastCuti     = await SumbiriCutiMain.findAll({
                where: {
                    cuti_id: {
                        [Op.like]: `${cutiformat}%`
                    },
                }, order: [
                    ['cuti_id','DESC']
                ]
            });
            if(checkLastCuti.length===0){
                cuti_id = cutiformat + "001";
            } else {
                var cutilast        = checkLastCuti[0].cuti_id;
                var newcutiid       = parseInt(cutilast.substring(9)) + 1;
                if(newcutiid <= 9){
                    cuti_id      = cutiformat + ("00" + newcutiid);
                } else if(newcutiid >= 10 && newcutiid <= 99){
                    cuti_id      = cutiformat + ("0" + newcutiid);
                } else if(newcutiid >= 100){
                    cuti_id      = cutiformat + newcutiid;
                }
            }
            if(cuti_id){
                const insertCuti = await SumbiriCutiMain.create({
                    cuti_id: cuti_id,
                    cuti_emp_nik: dataCuti.cuti_emp_nik,
                    cuti_emp_tmb: dataCuti.cuti_emp_tmb,
                    cuti_emp_name: dataCuti.cuti_emp_name.toUpperCase(),
                    cuti_emp_dept: dataCuti.cuti_emp_dept.toUpperCase(),
                    cuti_emp_position: dataCuti.cuti_emp_position.toUpperCase(),
                    cuti_date_start: dataCuti.cuti_date_start,
                    cuti_date_end: dataCuti.cuti_date_end,
                    cuti_length: dataCuti.cuti_length,
                    cuti_daymonth: dataCuti.cuti_daymonth.toUpperCase(),
                    cuti_purpose: dataCuti.cuti_purpose.toUpperCase(),
                    id_absen: parseInt(dataCuti.id_absen),
                    cuti_createdate: moment().format('YYYY-MM-DD hh:mm:ss'),
                    cuti_createby: dataCuti.cuti_createby,
                    cuti_active: "Y"
                });
                if(insertCuti){
                    res.status(200).json({
                        success: true,
                        message: "success post cuti",
                    });
                }
            }
        }
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get cuti",
        });
    }
}

export const getCutiByDate = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const dataCuti                  = await dbSPL.query(queryGetCutiDate, { 
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT
        });
        if(dataCuti){
            res.status(200).json({
                success: true,
                data: dataCuti,
                message: `success get cuti ${startDate} - ${endDate}`,
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get cuti",
        });
    }
}

export const getCutiSummary = async(req,res) => {
    try {
        const actionGet = await dbSPL.query(querySummaryCuti, { type: QueryTypes.SELECT });
        if(actionGet){
            res.status(200).json({
                success: true,
                data: actionGet,
                message: `success get cuti summary`,
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get cuti summary",
        });
    }
}