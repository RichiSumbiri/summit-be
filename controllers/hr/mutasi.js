import { QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryGetLastMutasi, queryGetMutasiByMutDate, sumbiriMutasiEmp } from "../../models/hr/mutasi.mod.js";
import moment from "moment";
import { convertMonthToRoman } from "../util/Utility.js";
import { modelMasterSiteline, modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

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
            reason_mutasi: dataMutasi.Reason_mutasi,
            create_by: dataMutasi.CreateBy,
            create_time: moment().format('YYYY-MM-DD hh:mm:ss') 
        });

        if(postMutasi){
            // check emp siteline
            const checkEmpSiteline = await modelMasterSiteline.findOne({
                where: {
                IDSection: dataMutasi.Destination_Section,
                IDDept: dataMutasi.ID_Destination_Dept,
                IDSubDept: dataMutasi.ID_Destination_SubDept
                }
            });

            const EmpIDSiteline = checkEmpSiteline===null ? null : checkEmpSiteline.IDSiteline;
  
            const updateEmp = await modelSumbiriEmployee.update({
                IDDepartemen: dataMutasi.ID_Destination_Dept,
                IDSubDepartemen: dataMutasi.ID_Destination_SubDept,
                IDPosisi: dataMutasi.ID_Destination_Position,
                IDSection: dataMutasi.Destination_Section,
                IDSiteline: EmpIDSiteline
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


export const newMutasiMass = async(req,res) => {
    try {
        const dataMutasi    = req.body.dataMutasi;
        const ListEmp       = dataMutasi.listEmp;
        const SuccessMutasi = [];
        const yearNow       = moment().format('YYYY');
        const monthNow      = convertMonthToRoman(moment().format('M'));
        const formatNoSPM   = `/SPM/HRD-SBR/${monthNow}/${yearNow}`; 
        // const jenisMutasi   = dataMutasi.jenisMutasi;
        let lastSPM;
        let nomorUrut       = 1;
        
        
        for await (const row of ListEmp) {
            
            if(dataMutasi.jenis_mutasi==="MUTASI"){
                const findLastSPM   = await dbSPL.query(queryGetLastMutasi, {
                    replacements: {
                        formatMutasi: '%'+formatNoSPM
                    }, type: QueryTypes.SELECT
                });
    
                if(findLastSPM.length===0){
                    nomorUrut   = 1;
                } else {
                    lastSPM     = findLastSPM[0].NoMutasi;
                    nomorUrut   = parseInt(lastSPM.substring(0, 3)) + 1;
                }
            
                const newNoUrut     = nomorUrut.toString().padStart(3, '0');
                const newIdSPM      = newNoUrut + formatNoSPM;
                await sumbiriMutasiEmp.create({
                     Nik: row.Nik,
                     number_mutasi: newIdSPM,
                     date_mutasi: dataMutasi.date_mutasi,
                     reason_mutasi: dataMutasi.reason_mutasi,
                     source_dept: parseInt(row.IDDepartemen),
                     source_subdept: parseInt(row.IDSubDepartemen),
                     source_position: parseInt(row.IDPosisi),
                     source_section: row.NamaSection,
                     destination_dept: dataMutasi.destination_dept,
                     destination_subdept: dataMutasi.destination_subdept,
                     destination_position: dataMutasi.destination_position,
                     destination_section: dataMutasi.destination_section,
                     CreateBy: dataMutasi.CreateBy,
                     create_time: moment().format('YYYY-MM-DD hh:mm:ss') 
                });
            } 
            
            // check emp siteline
            const checkEmpSiteline = await modelMasterSiteline.findOne({
                where: {
                IDSection: dataMutasi.Destination_Section ? dataMutasi.Destination_Section : null,
                IDDept: dataMutasi.ID_Destination_Dept ? dataMutasi.ID_Destination_Dept : null,
                IDSubDept: dataMutasi.ID_Destination_SubDept ? dataMutasi.ID_Destination_SubDept : null
                }
            });
            
            const EmpIDSiteline = checkEmpSiteline===null ? null : checkEmpSiteline.IDSiteline;

            const updateEmp = await modelSumbiriEmployee.update({
                IDDepartemen: dataMutasi.destination_dept ? dataMutasi.destination_dept : row.IDDepartemen,
                IDSubDepartemen: dataMutasi.destination_subdept ? dataMutasi.destination_subdept : row.IDSubDepartemen,
                IDPosisi: dataMutasi.destination_position ? dataMutasi.destination_position : row.IDPosisi,
                IDSection: dataMutasi.destination_section ? dataMutasi.destination_section : row.IDSection,
                IDSiteline: EmpIDSiteline ? EmpIDSiteline : row.IDSiteline
            }, {
                where: {
                    Nik: parseInt(row.Nik)
                }
            });
            if(updateEmp){
                await SuccessMutasi.push({Nik: row.Nik, status: true});
            }
        }
        
        if(SuccessMutasi.length===ListEmp.length){
            return res.status(200).json({
                success: true,
                message: `success post new mass mutasi emp`
            });
        }
    } catch(err){
        console.error(err);
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