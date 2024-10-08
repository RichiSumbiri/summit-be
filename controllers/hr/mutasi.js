import { QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryGetLastMutasi, queryGetMutasiByMutDate, sumbiriMutasiEmp } from "../../models/hr/mutasi.mod.js";
import moment from "moment";
import { convertMonthToRoman } from "../util/Utility.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

export const getMutasiEmpByDate = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const getData                   = await dbSPL.query(queryGetMutasiByMutDate, {
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT
        });
        if(getData){
            return res.status(200).json({
                success: true,
                message: `success get mutasi emp for date between ${startDate} and ${endDate}`,
                data: getData
            });
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail get mutasi emp for date"
        });
    }
}

export const newMutasi = async(req,res) => {
    try {
        const dataMutasi    = req.body.dataMutasi;
        const yearNow       = moment().format('YYYY');
        const monthNow      = convertMonthToRoman(moment().format('M'));
        const formatNoSPM   = `/SPM/HRD-SBR/${monthNow}/${yearNow}`; 
        
        let lastSPM;
        let nomorUrut       = 1;
        
        const findLastSPM   = await dbSPL.query(queryGetLastMutasi, {
            replacements: {
                formatMutasi: '%'+formatNoSPM
            }, type: QueryTypes.SELECT
        })
        
        
        if(findLastSPM.length===0){
            nomorUrut   = 1;
        } else {
            lastSPM     = findLastSPM[0].NoMutasi;
            nomorUrut   = parseInt(lastSPM.substring(0, 3)) + 1;
        }
        
        const newNoUrut     = nomorUrut.toString().padStart(3, '0');
        const newIdSPM      = newNoUrut + formatNoSPM;
        
        const postMutasi = await sumbiriMutasiEmp.create({
            Nik: dataMutasi.NIK,
            number_mutasi: newIdSPM,
            date_mutasi: dataMutasi.TanggalMutasi,
            source_dept: dataMutasi.ID_Source_Dept,
            source_subdept: dataMutasi.ID_Source_SubDept,
            source_position: dataMutasi.ID_Source_Position,
            source_section: dataMutasi.Source_Section,
            destination_dept: dataMutasi.ID_Destination_Dept,
            destination_subdept: dataMutasi.ID_Destination_SubDept,
            destination_position: dataMutasi.ID_Destination_Position,
            destination_section: dataMutasi.Destination_Section,
            CreateBy: dataMutasi.CreateBy,
            create_time: moment().format('YYYY-MM-DD hh:mm:ss') 
        });

        if(postMutasi){
            const updateEmp = await modelSumbiriEmployee.update({
                IDDepartemen: dataMutasi.ID_Destination_Dept,
                IDSubDepartemen: dataMutasi.ID_Destination_SubDept,
                IDPosisi: dataMutasi.ID_Destination_Position,
                IDSection: dataMutasi.Destination_Section
            }, {
                where: {
                    Nik: parseInt(dataMutasi.NIK)
                }
            });
            
            if(updateEmp){
                return res.status(200).json({
                    success: true,
                    message: `success post new mutasi emp`
                });
            }
            
        }

    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail post new mutasi emp"
        });
    }
}


export const updateMutasi = async(req,res) => {
    try {
        const dataMutasi    = req.body.dataMutasi;
        const TryPutMutasi  = await sumbiriMutasiEmp.update({
            date_mutasi: dataMutasi.TanggalMutasi,
            destination_dept: dataMutasi.ID_Destination_Dept,
            destination_subdept: dataMutasi.ID_Destination_SubDept,
            destination_position: dataMutasi.ID_Destination_Position,
            destination_section: dataMutasi.Destination_Section,
            update_by: dataMutasi.UpdateBy,
            update_time: moment().format('YYYY-MM-DD hh:mm:ss')
        }, {
            where: {
                Nik: dataMutasi.NIK,
                number_mutasi: dataMutasi.NoMutasi,
            }
        });
        if(TryPutMutasi){
            const updateEmp = await modelSumbiriEmployee.update({
                IDDepartemen: dataMutasi.ID_Destination_Dept,
                IDSubDepartemen: dataMutasi.ID_Destination_SubDept,
                IDPosisi: dataMutasi.ID_Destination_Position,
                IDSection: dataMutasi.Destination_Section
            }, {
                where: {
                    Nik: parseInt(dataMutasi.NIK)
                }
            });
            
            if(updateEmp){
                return res.status(200).json({
                    success: true,
                    message: `success update new mutasi emp`
                });
            }
            
        }
    } catch(err){
        return res.status(404).json({
            success: false,
            message: "fail update mutasi emp"
        });
    }
}