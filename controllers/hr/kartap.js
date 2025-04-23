import { QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryGetLastSPKT, queryGetSPKTByNIK, queryGetSPKTByRange, queryListSPKT, sumbiriSPKT } from "../../models/hr/kartap.mod.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";
import moment from "moment";
import { convertMonthToRoman } from "../util/Utility.js";

export const getKarTap = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const listKarTap = await dbSPL.query(queryGetSPKTByRange, { 
            replacements: {
                startDate: startDate,
                endDate: endDate
            },
            type: QueryTypes.SELECT
        });
        if(listKarTap){
            res.status(200).json({
                success: true,
                message: "success get list kartap docs",
                data: listKarTap
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list kartap docs",
        });
    }
}

export const getKarTapByNIK = async(req,res) => {
    try {
        const { empNik }    = req.params;
        const listKarTap = await dbSPL.query(queryGetSPKTByNIK, { 
            replacements: {
                empNik: empNik
            },
            type: QueryTypes.SELECT
        });
        if(listKarTap){
            res.status(200).json({
                success: true,
                message: `success get list kartap docs for NIk ${empNik}`,
                data: listKarTap
            });
        }
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            message: "error get list kartap docs",
            error: err
        });
    }
}



export const updateKarTap = async(req,res) => {
    try {
        const dataSPKT      = req.body.dataSPKT;
        const putAction     = await sumbiriSPKT.update({
                DateSPKT: dataSPKT.DateSPKT
            }, {
                where: {
                    IDSPKT: dataSPKT.IDSPKT,
                    Nik: parseInt(dataSPKT.Nik)
                }
            });
        if(putAction){
            return res.status(200).json({
                success: true,
                message: "success update spkt emp"
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail post update spkt emp"
        });
    }
}

export const newKarTap = async(req,res) => {
    try {
        const dataSPKT      = req.body.dataSPKT;
        const formatNoSPKT  = `/HRD-SBR/${convertMonthToRoman(moment().format('M'))}/${moment().format('YYYY')}`; 
        
        let lastSPKT;
        let nomorUrut       = 1;
        
        const findLastSPKT  = await dbSPL.query(queryGetLastSPKT, {
            replacements: {
                formatSPKT: `%${formatNoSPKT}`
            }, type: QueryTypes.SELECT
        })
        
        if(findLastSPKT.length===0){
            nomorUrut   = 1;
        } else {
            lastSPKT    = findLastSPKT[0].IDSPKT;
            nomorUrut   = parseInt(lastSPKT.substring(0, 3)) + 1;
        }
        
        const newIdSPKT     = nomorUrut.toString().padStart(3, '0') + formatNoSPKT;
        
        const postSPKT = await sumbiriSPKT.create({
            Nik: parseInt(dataSPKT.Nik),
            IDSPKT: newIdSPKT,
            DateSPKT: dataSPKT.DateSPKT,
            CreateBy: dataSPKT.CreateBy,
            CreateDate: moment().format('YYYY-MM-DD HH:mm:ss') 
        });

        if(postSPKT){
            const updateEmp = await modelSumbiriEmployee.update({
                StatusKaryawan: 'TETAP',
                UpdateBy: dataSPKT.CreateBy,
                UpdateDate: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    Nik: parseInt(dataSPKT.Nik)
                }
            });
            
            if(updateEmp){
                return res.status(200).json({
                    success: true,
                    message: `success post new spkt emp`
                });
            }    
        }

    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail post new spkt emp"
        });
    }
}

