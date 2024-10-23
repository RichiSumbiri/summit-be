import { QueryTypes, DataTypes, Op } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryLastSPKK, querySPKKbyRange, sumbiriKontrakKerja } from "../../models/hr/kontrakkerja.mod.js";
import moment from "moment";
import { convertMonthToRoman } from "../util/Utility.js";

export const getKontrakKerjaByRange = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const dataSPKK                  = await dbSPL.query(querySPKKbyRange, { 
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT
        });
        res.status(200).json({
            success: true,
            message: "success get kontrak kerja by range",
            data: dataSPKK
        });
    } catch(err){
        res.status(404).json({
            success: false,
            message: "fail get kontrak kerja by range"
        });
    }
}

export const updateKontrakKerja = async(req,res) => {
    try {
        const dataSPKK      = req.body.dataSPKK;
        const action        = await sumbiriKontrakKerja.update({
            PeriodeKontrak: dataSPKK.PeriodeKontrak,
            StartKontrak: dataSPKK.StartKontrak,
            FinishKontrak: dataSPKK.FinishKontrak,
            UpdateBy: dataSPKK.UpdateBy,
            UpdateTime: moment().format('YYYY-MM-DD HH:MM:SS')
        }, {
            where: {
                IDSPKK: dataSPKK.IDSPKK
            }
        });
        if(action){
            res.status(200).json({
                success: true,
                message: "success update kontrak kerja"
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "fail update kontrak kerja"
        });
    }
    
}

export const newKontrakKerja = async(req,res) => {
    try {
        const dataSPKK      = req.body.dataSPKK;
        const yearNow       = moment().format('YYYY');
        const monthNow      = convertMonthToRoman(moment().format('MM'));
        const formatIDSPKK  = `/HRD/SBR/${monthNow}/${yearNow}`;
        
        
        let lastSPKID;
        let nomorUrut;
        
        const findLastSPKK  = await dbSPL.query(queryLastSPKK, {
            replacements: {
                formatSPKK: '%'+formatIDSPKK
            }, type: QueryTypes.SELECT
        });
        
        
        if(findLastSPKK.length===0){
            nomorUrut   = 1;
        } else {
            lastSPKID       = findLastSPKK[0].IDSPKK;
            const lastCount = lastSPKID.match(/-(\d{3})\//);
            nomorUrut   = parseInt(lastCount[1]) + 1;
        }
        
        const newNoUrut     = nomorUrut.toString().padStart(3, '0');
        
        const CountSPKK     = await sumbiriKontrakKerja.count({
            where: {
                Nik: dataSPKK.Nik,
                NikKTP: dataSPKK.NikKTP,    
            }
        });
        
        const stringSPKK    = `KK${convertMonthToRoman(parseInt(CountSPKK)+1)}-`;
        const newIdSPKK     = stringSPKK + newNoUrut + formatIDSPKK;
        const newSPKK       = await sumbiriKontrakKerja.create({
            IDSPKK: newIdSPKK,
            Nik: dataSPKK.Nik.toString(),
            NikKTP: dataSPKK.NikKTP.toString(),
            PeriodeKontrak: dataSPKK.PeriodeKontrak,
            StartKontrak: dataSPKK.StartKontrak,
            FinishKontrak: dataSPKK.FinishKontrak,
            isActive: 'Y',
            CreateBy: moment().format('YYYY-MM-DD hh:mm:ss')
        });
        if(newSPKK){
            res.status(200).json({
                success: true,
                message: "success post new kontrak kerja "
            });  
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "fail create new kontrak kerja"
        });
    }
}



export const newMassKontrakKerja = async(req,res) => {
    try {
        const dataSPKK      = req.body.dataSPKK;
        const yearNow       = moment().format('YYYY');
        const monthNow      = convertMonthToRoman(moment().format('MM'));
        const formatIDSPKK  = `/HRD/SBR/${monthNow}/${yearNow}`;
        const SuccessSPKK   = [];
        const ListEmp       = dataSPKK.listEmp;
        
        
        let lastSPKID;
        let nomorUrut;

        for await (const row of ListEmp) {
            const findLastSPKK  = await dbSPL.query(queryLastSPKK, {
                replacements: {
                    formatSPKK: '%'+formatIDSPKK
                }, type: QueryTypes.SELECT
            });
            
            if(findLastSPKK.length===0){
                nomorUrut   = 1;
            } else {
                lastSPKID       = findLastSPKK[0].IDSPKK;
                const lastCount = lastSPKID.match(/-(\d{3})\//);
                nomorUrut   = parseInt(lastCount[1]) + 1;
            }
            
            const newNoUrut     = nomorUrut.toString().padStart(3, '0');
            
            const CountSPKK     = await sumbiriKontrakKerja.count({
                where: {
                    Nik: row.Nik,
                    NikKTP: row.NikKTP,    
                }
            });
            
            const stringSPKK    = `KK${convertMonthToRoman(parseInt(CountSPKK)+1)}-`;
            const newIdSPKK     = stringSPKK + newNoUrut + formatIDSPKK;
            const newSPKK       = await sumbiriKontrakKerja.create({
                IDSPKK: newIdSPKK,
                Nik: row.Nik.toString(),
                NikKTP: row.NikKTP.toString(),
                PeriodeKontrak: dataSPKK.PeriodeKontrak,
                StartKontrak: dataSPKK.StartKontrak,
                FinishKontrak: dataSPKK.FinishKontrak,
                isActive: 'Y',
                CreateBy: dataSPKK.CreateBy
            });
            if(newSPKK){
                SuccessSPKK.push({Nik: row.Nik, status: true});
            }
        }
        if(SuccessSPKK.length===ListEmp.length){
            res.status(200).json({
                success: true,
                message: "success post new kontrak kerja "
            });  
        }
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            message: "fail create new kontrak kerja"
        });
    }
}