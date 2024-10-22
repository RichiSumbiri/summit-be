import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryGetCutiDate, SumbiriCutiMain } from "../../models/hr/cuti.mod.js";
import moment from "moment";

export const postCutiNew = async(req,res) => {
    try {
        const dataCuti          = req.body.dataCuti;
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
                cuti_createdate: moment().format('YYYY-MM-DD hh:mm:ss'),
                cuti_createby: dataCuti.cuti_createby
            });
            if(insertCuti){
                res.status(200).json({
                    success: true,
                    message: "success post cuti",
                });
            }
        }
        
    } catch(err){
        console.error(err);
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