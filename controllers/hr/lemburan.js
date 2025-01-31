import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { modelSPLMain, queryLemburanComplete, queryLemburanCreated, queryLemburanDetail, queryLemburanPending, queryLemburanPendingAll, queryLemburanPendingHead, queryLemburanPendingHRD, queryLemburanPendingManager, queryLemburanPendingSPV, queryOvertimeReport } from "../../models/hr/lemburanspl.mod.js";
import { ModelSPLData, ModelSPLMain, sumbiriUserSummitNIK } from "../../models/hr/lemburan.mod.js";
import { modelMasterDepartment } from "../../models/hr/employe.mod.js";
import moment from "moment";


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export const getSPLAccess = async(req,res) => {
    try {
        const { userName }    = req.params;
        const checkAccess   = await sumbiriUserSummitNIK.findAll({ where: { username: userName }, raw: true});
        if(checkAccess.length !== 0){
            res.status(200).json({
                success: true,
                message: "success get spl access for specified user",
                data: checkAccess
            });
        } else {
            res.status(400).json({
                success: false,
                message: "fail get spl access for specified user",
            });
        }
    } catch(err){
        console.log(err);
        res.status(404).json({
            success: false,
            message: "error get spl access",
        });
    }
}


export const getLemburanCreated = async(req,res) => {
    try {
        const { userName }    = req.params;
        let listSPL         = await dbSPL.query(queryLemburanCreated, { replacements: { userId: userName }, type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listSPL) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listSPL[index].SPLEmp = action 
        }

        if(listSPL){
            res.status(200).json({
                success: true,
                message: "success get list created lemburan",
                data: listSPL
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}



export const getLemburanPending = async(req,res) => {
    try {
        let listPending = await dbSPL.query(queryLemburanPending, { type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listPending) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listPending[index].SPLEmp = action 
        }
        
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}

export const getLemburanPendingAll = async(req,res) => {
    try {
        let listPending = await dbSPL.query(queryLemburanPendingAll, { type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listPending) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listPending[index].SPLEmp = action 
        }
        
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}


export const getLemburanPendingSPV = async(req,res) => {
    try {
        const Nik           = req.params.nik;
        let listPending   = await dbSPL.query(queryLemburanPendingSPV, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listPending) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listPending[index].SPLEmp = action 
        }
        
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}


export const getLemburanPendingHead = async(req,res) => {
    try {
        const Nik           = req.params.nik;
        let listPending   = await dbSPL.query(queryLemburanPendingHead, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listPending) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listPending[index].SPLEmp = action 
        }
        
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}

export const getLemburanPendingManager = async(req,res) => {
    try {
        const Nik           = req.params.nik;
        let listPending   = await dbSPL.query(queryLemburanPendingManager, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listPending) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listPending[index].SPLEmp = action 
        }
        
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}


export const getLemburanPendingHRD = async(req,res) => {
    try {
        const Nik           = req.params.nik;
        let listPending   = await dbSPL.query(queryLemburanPendingHRD, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
        let i = 0;
            
        for await (const row of listPending) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listPending[index].SPLEmp = action 
        }
        
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan hrd",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}


export const getLemburanApprovalComplete = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        let listComplete              = await dbSPL.query(queryLemburanComplete, 
            { replacements: 
                { 
                    startTgl: startDate, 
                    endTgl: endDate 
                }, type: QueryTypes.SELECT 
            }
        );
        let i = 0;
            
        for await (const row of listComplete) {   
            let index = i++;
            const action            = await dbSPL.query(queryLemburanDetail, {
                replacements: {
                    splnumber: row.SPLID
                }, type: QueryTypes.SELECT
            });
            listComplete[index].SPLEmp = action 
        }
        if(listComplete){
            res.status(200).json({
                success: true,
                message: "success get list complete lemburan",
                data: listComplete
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list complete lemburan",
        });
    }
}


export const getLemburanDetail = async(req,res) => {
    try {
        const { splnumber }     = req.params;
        const action            = await dbSPL.query(queryLemburanDetail, {
            replacements: {
                splnumber: splnumber
            }, type: QueryTypes.SELECT
        });
        res.status(200).json({
            success: true,
            message: "success get data lemburan for spl",
            data: action
        });
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}

export const getCheckEmpLemburan = async(req,res) => {
    try {
        const { splDate, empNik } = req.params;
        const empNIKZero    = empNik.padStart(10, "0");
        const queryCheck    = `
        SELECT
	        sd.*
        FROM
	        sumbiri_spl_data sd
        LEFT JOIN sumbiri_spl_main ssm ON ssm.spl_number = sd.spl_number 
        WHERE WHERE sd.spl_date=:splDate AND sd.Nik=:empNik AND ssm.spl_active = '1'`;
        const dataCheck     = await dbSPL.query(queryCheck, {
            replacements: {
                splDate: splDate,
                empNik: empNIKZero
        }, type:QueryTypes.SELECT});
        if(dataCheck){
            res.status(200).json({
                success: true,
                message: "success chec data lemburan for spl",
                data: dataCheck
            }); 
        } 
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            message: "error check emp for lemburan",
        });
    }
}

export const postLemburan = async(req,res) => {
    try {
        let dataSPL         = req.body.dataSPL;
        const getIDManager  = await modelMasterDepartment.findOne({
            where: {
                IdDept: dataSPL.SPLDept
            }
        });
        dataSPL.IDManager = parseInt(getIDManager.IDManager);
        
        const splformat     = `SPL` + moment().format('YY') + moment().format('MM') + moment().format('DD');
        
        const getLastSPL    = await ModelSPLMain.findOne({
            where: {
                spl_number: {
                    [Op.like]: `${splformat}%`
                }
            },
            order: [
                ['spl_number', 'DESC'] // Replace 'spl_number' with the column you want to order by
              ]
        });
        const newQueueSPL   =  splformat + String(parseInt(getLastSPL.spl_number.slice(-4)) + 1).padStart(4, '0');;
        if(dataSPL.SPLNumber){
            
            // update spl main header
            await ModelSPLMain.update({
                spl_date: dataSPL.SPLDate,
                spl_dept: parseInt(dataSPL.SPLDept),
                spl_section: dataSPL.SPLSection,
                spl_line: dataSPL.SPLSubDept || dataSPL.SPLLine,
                spl_foremanspv: parseInt(dataSPL.SPLForemanSPV),
                spl_head: parseInt(dataSPL.SPLHead),
                spl_manager: parseInt(getIDManager.IDManager),
                spl_hrd: 101707004,
                spl_approve_foreman: 1,
                spl_foreman_ts: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_type: dataSPL.SPLType,
                spl_release: 1,
                spl_updatedby: dataSPL.CreatedBy,
                spl_updateddate: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_active: 1,
                spl_version: 1
            }, {
                where: {
                    spl_number: dataSPL.SPLNumber,
                    spl_date: dataSPL.SPLDate
                }
            });
            
            // reset spl data
            await ModelSPLData.destroy({
                where: {
                    spl_number: dataSPL.SPLNumber
                }
            });
            
            // insert spl data
            for (const emp of dataSPL.SPLEmp) {
                await ModelSPLData.create({
                    spl_number: dataSPL.SPLNumber,
                    spl_date: dataSPL.SPLDate,
                    Nik: emp.Nik,
                    nama: emp.NamaLengkap,
                    start: emp.StartTime,
                    finish: emp.FinishTime,
                    minutes: emp.Minutes,
                    status: 0,
                    time_insert: moment().format('YYYY-MM-DD HH:mm:ss')
                });
                await delay(1000);           
            }
        } else {
            await ModelSPLMain.create({
                spl_number: newQueueSPL,
                spl_date: dataSPL.SPLDate,
                spl_dept: parseInt(dataSPL.SPLDept),
                spl_section: dataSPL.SPLSection,
                spl_line: dataSPL.SPLSubDept || dataSPL.SPLLine,
                spl_foremanspv: parseInt(dataSPL.SPLForemanSPV),
                spl_head: parseInt(dataSPL.SPLHead),
                spl_manager: parseInt(getIDManager.IDManager),
                spl_hrd: 101707004,
                spl_approve_foreman: 1,
                spl_foreman_ts: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_type: dataSPL.SPLType,
                spl_release: 1,
                spl_createdby: dataSPL.CreatedBy,
                spl_createddate: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_active: 1,
                spl_version: 1
            });
            
            for (const emp of dataSPL.SPLEmp) {
                await ModelSPLData.create({
                    spl_number: newQueueSPL,
                    spl_date: dataSPL.SPLDate,
                    Nik: emp.Nik,
                    nama: emp.NamaLengkap,
                    start: emp.StartTime,
                    finish: emp.FinishTime,
                    minutes: emp.Minutes,
                    status: 0,
                    time_insert: moment().format('YYYY-MM-DD HH:mm:ss')
                }); 
                await delay(1000);      
            }
        }
        
        
        res.status(200).json({
            success: true,
            message: "success post new lemburan"
        });
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}



export const postApproveLemburan = async(req,res) => {
    try {
        const { empNik, Level, SPLNumber } = req.body;
        let checkSPL;
        let resultCheckSPL;
        let actionApprove;
        switch(Level){
            case 'PENDING-SPV':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_foremanspv: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_foremanspv: 1,
                        spl_foremanspv_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_foremanspv: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;            
            case 'PENDING-HEAD':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_head: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_head: 1,
                        spl_head_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_head: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;
            case 'PENDING-MANAGER':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_manager: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_manager: 1,
                        spl_manager_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_manager: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;
            case 'PENDING-HRD':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_hrd: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_hrd: 1,
                        spl_hrd_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_hrd: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;
        }
        if(resultCheckSPL===true){
            res.status(200).json({
                success: true,
                message: "success post approve lemburan"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "fail post approve lemburan"
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error approve pending lemburan",
        });
    }
}

export const postRejectLemburan = async(req,res) => {
    try {
        const { empNik, Level, SPLNumber } = req.body;
        let checkSPL;
        let resultCheckSPL;
        let actionApprove;
        switch(Level){
            case 'PENDING-SPV':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_foremanspv: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_foremanspv: 0,
                        spl_foremanspv_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_foremanspv: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;            
            case 'PENDING-HEAD':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_head: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_head: 0,
                        spl_head_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_head: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;
            case 'PENDING-MANAGER':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_manager: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_manager: 0,
                        spl_manager_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_manager: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;
            case 'PENDING-HRD':
                checkSPL = await ModelSPLMain.findOne({ where: { spl_number: SPLNumber, spl_hrd: empNik }});
                if(checkSPL.length!==0){
                    actionApprove = await ModelSPLMain.update({
                        spl_approve_hrd: 0,
                        spl_hrd_ts: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            spl_number: SPLNumber,
                            spl_hrd: empNik
                        }
                    });
                    if(actionApprove){
                        resultCheckSPL = true;
                    }
                } else {
                    resultCheckSPL = false;
                }
            break;
        }
        if(resultCheckSPL===true){
            res.status(200).json({
                success: true,
                message: "success post approve lemburan"
            });
        } else {
            res.status(400).json({
                success: false,
                message: "fail post approve lemburan"
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error approve pending lemburan",
        });
    }
}


export const postDeleteLemburan = async(req,res) => {
    try {
        const { SPLID }     = req.params;
        const actionDelete  = await modelSPLMain.update({
            spl_active: 0
        }, { 
            where: {
                spl_number: SPLID
            }
        });
        if(actionDelete){
            res.status(200).json({
                success: true,
                message: `success delete spl ${SPLID}`
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error cannot delete lemburan",
            error: err
        });
    }
}


export const getLemburanExportAmano = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const queryAmano = `
        SELECT
            sumbiri_spl_data.Nik AS EmpCode,
            CAST(DATE_FORMAT(sumbiri_spl_main.spl_date, '%Y%m%d') AS UNSIGNED INTEGER) AS ProDay,
            IF(sumbiri_spl_main.spl_type = 'BH',sumbiri_spl_mcsetting.mc_id,0) AS InMC,
            IF(sumbiri_spl_main.spl_type != 'BH',sumbiri_spl_mcsetting.mc_id,0) AS OutMC,
            IF(sumbiri_spl_mcsetting.mc_id > 1200, 0, 1) AS DailyCalculation
        FROM
            sumbiri_spl_main
        JOIN sumbiri_spl_data ON
            sumbiri_spl_main.spl_number = sumbiri_spl_data.spl_number
        JOIN sumbiri_spl_mcsetting ON
            ( sumbiri_spl_mcsetting.mc_minutes = sumbiri_spl_data.minutes
                AND sumbiri_spl_mcsetting.mc_type = sumbiri_spl_main.spl_type )
        WHERE
            sumbiri_spl_main.spl_hrd_ts IS NOT NULL
            AND sumbiri_spl_main.spl_release = '1'
            AND sumbiri_spl_main.spl_version = '1'
            AND sumbiri_spl_main.spl_active = '1'
            AND sumbiri_spl_main.spl_date BETWEEN :startDate AND :endDate
        
        `;
        const dataExport = await dbSPL.query(queryAmano, { replacements: { startDate: startDate, endDate: endDate }, type: QueryTypes.SELECT });
        if(dataExport){
            res.status(200).json({
                success: true,
                message: "success get data calculation lemburan for amano",
                data: dataExport
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}


export const getLemburanReport = async(req,res) => {
    try {
        const { startDate, endDate } = req.params;
        const getData = await dbSPL.query(queryOvertimeReport, {
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT
        });
        if (getData) {
            res.status(200).json({
                success: true,
                message: "success get data lemburan report",
                data: getData,
                count: getData.length
            });
        }
    } catch(err){
        console.log(err);
        res.status(404).json({
            success: false,
            message: "error get lemburan report",
        });
    }
}