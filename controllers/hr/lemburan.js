import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryLemburanComplete, queryLemburanCreated, queryLemburanPending, queryLemburanPendingAll, queryLemburanPendingHead, queryLemburanPendingHRD, queryLemburanPendingManager, queryLemburanPendingSPV } from "../../models/hr/lemburanspl.mod.js";
import { ModelSPLData, ModelSPLMain, sumbiriUserSummitNIK } from "../../models/hr/lemburan.mod.js";
import { modelMasterDepartment } from "../../models/hr/employe.mod.js";
import moment from "moment";

export const getSPLAccess = async(req,res) => {
    try {
        const { userId }    = req.params;
        const checkAccess   = await sumbiriUserSummitNIK.findAll({ where: { USER_ID: userId }});
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
        res.status(404).json({
            success: false,
            message: "error get spl access",
        });
    }
}


export const getLemburanCreated = async(req,res) => {
    try {
        const { userId }    = req.params;
        const listSPL       = await dbSPL.query(queryLemburanCreated, { replacements: { userId: userId }, type: QueryTypes.SELECT });
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
        const listPending = await dbSPL.query(queryLemburanPending, { type: QueryTypes.SELECT });
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
        const listPending = await dbSPL.query(queryLemburanPendingAll, { type: QueryTypes.SELECT });
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
        const listPending   = await dbSPL.query(queryLemburanPendingSPV, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
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
        const listPending   = await dbSPL.query(queryLemburanPendingHead, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
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
        const listPending   = await dbSPL.query(queryLemburanPendingManager, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
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
        const listPending   = await dbSPL.query(queryLemburanPendingHRD, {replacements: { empNik: Nik }, type: QueryTypes.SELECT });
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan hrd",
                data: listPending
            });
        }
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}


export const getLemburanApprovalComplete = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const listComplete              = await dbSPL.query(queryLemburanComplete, { replacements: { startDate: startDate, endDate: endDate }, type: QueryTypes.SELECT });
        if(listComplete){
            res.status(200).json({
                success: true,
                message: "success get list complete lemburan",
                data: listComplete
            });
        }
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            message: "error get list complete lemburan",
        });
    }
}


export const getLemburanDetail = async(req,res) => {
    try {
        const { splnumber }     = req.params;
        const querySPL          = `
        SELECT
            spl_number AS SPLNumber,
            Nik AS Nik,
            nama AS NamaLengkap,
            start AS StartTime,
            finish AS FinishTime,
            minutes AS Minutes
        FROM
	        sumbiri_spl_data
        WHERE spl_number = :splnumber
        `;
        const action            = await dbSPL.query(querySPL, {
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
            await ModelSPLMain.update({
                spl_date: dataSPL.SPLDate,
                spl_dept: parseInt(dataSPL.SPLDept),
                spl_section: dataSPL.SPLSection,
                spl_line: parseInt(dataSPL.SPLSubDept),
                spl_foremanspv: parseInt(dataSPL.SPLForemanSPV),
                spl_head: parseInt(dataSPL.SPLHead),
                spl_manager: parseInt(getIDManager.IDManager),
                spl_hrd: 101707004,
                spl_approve_foreman: 1,
                spl_foreman_ts: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_type: dataSPL.SPLType,
                spl_release: 1,
                spl_updatedby: dataSPL.SPLCreatedBy,
                spl_updateddate: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_active: 1,
                spl_version: 1
            }, {
                where: {
                    spl_number: dataSPL.SPLNumber
                }
            });
            
            for (const emp of dataSPL.SPLEmp) {
                await ModelSPLData.update({
                    spl_date: dataSPL.SPLDate,
                    Nik: emp.Nik,
                    nama: emp.NamaLengkap,
                    start: emp.StartTime,
                    finish: emp.FinishTime,
                    minutes: emp.Minutes,
                    status: 0,
                    time_insert: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: {
                        spl_number: dataSPL.SPLNumber
                    }
                });       
            }
        } else {
            await ModelSPLMain.create({
                spl_number: newQueueSPL,
                spl_date: dataSPL.SPLDate,
                spl_dept: parseInt(dataSPL.SPLDept),
                spl_section: dataSPL.SPLSection,
                spl_line: parseInt(dataSPL.SPLSubDept),
                spl_foremanspv: parseInt(dataSPL.SPLForemanSPV),
                spl_head: parseInt(dataSPL.SPLHead),
                spl_manager: parseInt(getIDManager.IDManager),
                spl_hrd: 101707004,
                spl_approve_foreman: 1,
                spl_foreman_ts: moment().format('YYYY-MM-DD HH:mm:ss'),
                spl_type: dataSPL.SPLType,
                spl_release: 1,
                spl_createdby: dataSPL.SPLCreatedBy,
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
