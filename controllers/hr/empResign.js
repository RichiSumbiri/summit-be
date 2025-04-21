import { QueryTypes, where } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryEmpResignSPK, queryLastEmpResignSPK, sumbiriSPK } from "../../models/hr/empResign.mod.js";
import { convertMonthToRoman } from "../util/Utility.js";
import moment from "moment";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

export const getEmpResignSPK = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const actionGetEmpSPK           = await dbSPL.query(queryEmpResignSPK, {
            replacements: {
                startDate: startDate,
                endDate: endDate,
            }, type: QueryTypes.SELECT
        });
        if(actionGetEmpSPK){
            res.status(200).json({
                success: true,
                message: `Success get list Emp Resign SPK between ${startDate} and :${endDate}`,
                data: actionGetEmpSPK,
            })
        } else {
            res.status(404).json({
                success:false,
                message: `fail get list Emp Resign SPK between ${startDate} and :${endDate}`
            })    
        }
    } catch(err){
        res.status(404).json({
            success:false,
            message: err
        })
    }
}



export const postNewEmpResignSPK = async(req,res) => {
    try {
        const dataEmpResign     = req.body.dataEmpResign;
        if(dataEmpResign.id_spk){
            const putSPK        = await sumbiriSPK.update({
                Nik: dataEmpResign.Nik,
                FlagReason: dataEmpResign.FlagReason,
                Remark: dataEmpResign.Remark
            }, {
                where: {
                    id_spk: dataEmpResign.id_spk
                }
            });
            if(putSPK){
                const updateEmp = await modelSumbiriEmployee.update({
                    TanggalKeluar: dataEmpResign.TanggalKeluar,
                    UpdateBy: dataEmpResign.UpdateBy,
                    UpdateDate: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: {
                        Nik: parseInt(dataEmpResign.Nik)
                    }
                });
                
                if(updateEmp){
                    return res.status(200).json({
                        success: true,
                        message: `success put emp resign SPK`
                    });
                }
            }
        } else {
            const yearNow           = moment().format('YYYY');
            const monthNow          = convertMonthToRoman(moment().format('M'));
            const formatNoSPK       = `/SPK/HRD-SBR/${monthNow}/${yearNow}`; 
            
            let lastSPK;
            let nomorUrut           = 1;
            
            const findLastSPK       = await dbSPL.query(queryLastEmpResignSPK, {
                replacements: {
                    formatSPK: '%'+formatNoSPK
                }, type: QueryTypes.SELECT
            });
            
            
            if(findLastSPK.length===0){
                nomorUrut   = 1;
            } else {
                lastSPK     = findLastSPK[0].id_spk;
                nomorUrut   = parseInt(lastSPK.substring(0, 3)) + 1;
            }
            
            const newNoUrut     = nomorUrut.toString().padStart(3, '0');
            const newIdSPK      = newNoUrut + formatNoSPK;
            
            const postNewSPK    = await sumbiriSPK.create({
                id_spk: newIdSPK,
                Nik: dataEmpResign.Nik,
                FlagReason: dataEmpResign.FlagReason,
                Remark: dataEmpResign.Remark,
                CreateBy: dataEmpResign.CreateBy,
                CreateDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            })
    
            if(postNewSPK){
                const updateEmp = await modelSumbiriEmployee.update({
                    TanggalKeluar: dataEmpResign.TanggalKeluar,
                    UpdateBy: dataEmpResign.CreateBy,
                    UpdateDate: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: {
                        Nik: parseInt(dataEmpResign.Nik)
                    }
                });
                
                if(updateEmp){
                    return res.status(200).json({
                        success: true,
                        message: `success post new emp resign SPK`
                    });
                }
            }
    
        }
        
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail post new emp resign spk"
        });
    }
}


export const deleteEmpResignSPK = async(req,res) => {
    try {
        const idSPK             = decodeURIComponent(req.params.idSPK);
        const getExistingData   = await sumbiriSPK.findOne({
            where: {
                id_spk: idSPK
            }
        });
        
        if(getExistingData){
            // remove tanggal keluar di employee
            const updateEmp = await modelSumbiriEmployee.update({
                TanggalKeluar: null,
                UpdateBy: getExistingData.UpdateBy,
                UpdateDate: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    Nik: parseInt(getExistingData.Nik)
                }
            });
            if(updateEmp){
                const actionHapus   = await sumbiriSPK.destroy({
                    where: {
                        id_spk: idSPK
                    }
                });
                if(actionHapus){
                    return res.status(200).json({
                        success: true,
                        message: `success delete emp resign SPK`
                    });
                }
            } else {
                return res.status(404).json({
                    success: false,
                    message: "fail update employee"
                });
            }
        } 
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail delete emp resign spk"
        });
    }
}