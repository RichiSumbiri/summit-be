import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryGetCutiDate, queryGetQuotaCuti, queryMasterAbsentee, queryMasterCuti, querySummaryCuti, SumbiriCutiMain } from "../../models/hr/cuti.mod.js";
import moment from "moment";
import { EmpGroup, GroupJadwal } from "../../models/hr/JadwalDanJam.mod.js";
import { Attandance, MasterAbsentee } from "../../models/hr/attandance.mod.js";

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
        const cutiID            = decodeURIComponent(req.params.cutiid);
        const DetailCuti        = await SumbiriCutiMain.findOne({ where: { cuti_id: cutiID } });
        const getNikGroupId     = await EmpGroup.findOne({ where: { Nik: DetailCuti.cuti_emp_nik } });
        const getCodeAbsen      = await MasterAbsentee.findOne({ where: { id_absen: DetailCuti.id_absen }}); 
        const dateNow           = moment();
        const startDate         = moment(DetailCuti.cuti_date_start);
        const endDate           = moment(DetailCuti.cuti_date_end);
        const CutiDateList      = [];
        
        // isi list tanggal range cuti 
        while (startDate.isSameOrBefore(endDate)) {
            CutiDateList.push(startDate.format('YYYY-MM-DD'));
            startDate.add(1, 'day');
        }

        // jika hari berjalan kurang dari tanggal cuti selesai
        if(dateNow <= endDate){
            for (const CutiDate of CutiDateList) {
                // check jam kerja base on tanggel schedule dan group id
                const getJKID   = await GroupJadwal.findOne({
                    where: {
                        scheduleDate: CutiDate,
                        groupId: getNikGroupId.groupId
                    }
                })
                if(getJKID){
                    // hapus dari sumbiri absen
                    await Attandance.destroy({
                        where:{
                            Nik: DetailCuti.cuti_emp_nik,
                            groupId: getNikGroupId.groupId,
                            jk_id: getJKID.jk_id,
                            tanggal_in: CutiDate,
                            keterangan: getCodeAbsen.code_absen,
                            ket_in: DetailCuti.cuti_purpose.toUpperCase(),
                            validasi: 0
                    }});
                } 
            }
        }

        const deactiveCuti = await SumbiriCutiMain.update({ cuti_active: "N" }, { where: { cuti_id: cutiID } });
        if(deactiveCuti){
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
        const getNikGroupId     = await EmpGroup.findOne({ where: { Nik: dataCuti.cuti_emp_nik } });
        const getCodeAbsen      = await MasterAbsentee.findOne({ where: { id_absen: dataCuti.id_absen }}); 
        const startDate         = moment(dataCuti.cuti_date_start);
        const endDate           = moment(dataCuti.cuti_date_end);
        const CutiDateList      = [];
        while (startDate.isSameOrBefore(endDate)) {
            CutiDateList.push(startDate.format('YYYY-MM-DD'));
            startDate.add(1, 'day');
        }
        if(dataCuti.cuti_id){
            const getPreviousData   = await SumbiriCutiMain.findOne({ where: { cuti_id: dataCuti.cuti_id }});
            const startDatePrev     = moment(getPreviousData.cuti_date_start);
            const endDatePrev       = moment(getPreviousData.cuti_date_end);
            const CutiDateListPrev  = [];
            while (startDatePrev.isSameOrBefore(endDatePrev)) {
                CutiDateList.push(startDatePrev.format('YYYY-MM-DD'));
                startDatePrev.add(1, 'day');
            }
            for (const CutiDatePrev of CutiDateListPrev) {
                const getJKID   = await GroupJadwal.findOne({
                    where: {
                        scheduleDate: CutiDatePrev,
                        groupId: getNikGroupId.groupId
                    }
                })
                if(getJKID){
                    await Attandance.destroy({
                        Nik: getPreviousData.cuti_emp_nik,
                        groupId: getNikGroupId.groupId,
                        jk_id: getJKID.jk_id,
                        tanggal_in: CutiDatePrev,
                        keterangan: getCodeAbsen.code_absen,
                        ket_in: getPreviousData.cuti_purpose.toUpperCase(),
                        validasi: 0
                    });
                }
            }
            const updateCuti = await SumbiriCutiMain.update({
                cuti_emp_nik: parseInt(dataCuti.cuti_emp_nik),
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
                cuti_active: "Y"
            }, {
                where: {
                    cuti_id: dataCuti.cuti_id
                }
            });
            if(updateCuti){
                for (const CutiDate of CutiDateList) {
                    const getJKID   = await GroupJadwal.findOne({
                        where: {
                            scheduleDate: CutiDate,
                            groupId: getNikGroupId.groupId
                        }
                    })
                    if(getJKID){
                        await Attandance.create({
                            Nik: dataCuti.cuti_emp_nik,
                            groupId: getNikGroupId.groupId,
                            jk_id: getJKID.jk_id,
                            tanggal_in: CutiDate,
                            keterangan: getCodeAbsen.code_absen,
                            ket_in: dataCuti.cuti_purpose.toUpperCase(),
                            validasi: 0
                        });
                    }
                }
                res.status(200).json({
                    success: true,
                    message: "success update cuti",
                });
            }
        } else {
            const cutiformat        = `SPC${moment().format('YYYY').toString().substr(-2)}${("0" + (moment().format('MM') + 1)).slice(-2)}${("0" + moment().format('DD')).slice(-2)}`;
            let cuti_id;
            const checkLastCuti     = await SumbiriCutiMain.findAll({
                where: { cuti_id: { [Op.like]: `${cutiformat}%` }, }, order: [ ['cuti_id','DESC'] ]
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
                    cuti_emp_nik: parseInt(dataCuti.cuti_emp_nik),
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
                });
                if(insertCuti){
                    for (const CutiDate of CutiDateList) {
                        const getJKID   = await GroupJadwal.findOne({
                            where: {
                                scheduleDate: CutiDate,
                                groupId: getNikGroupId.groupId
                            }
                        })
                        if(getJKID){
                            await Attandance.create({
                                Nik: dataCuti.cuti_emp_nik,
                                groupId: getNikGroupId.groupId,
                                jk_id: getJKID.jk_id ? getJKID.jk_id : 0,
                                tanggal_in: CutiDate,
                                keterangan: getCodeAbsen.code_absen,
                                ket_in: dataCuti.cuti_purpose.toUpperCase(),
                                validasi: 0
                            });
                        }
                    }
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
            message: "error get cuti",
            error: err
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
                message: `success get cuti ${startDate} - ${endDate}`,
                data: dataCuti
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get cuti",
            error: err
        });
    }
}

export const getCutiSummary = async(req,res) => {
    try {
        const actionGet = await dbSPL.query(querySummaryCuti, { type: QueryTypes.SELECT });
        if(actionGet){
            res.status(200).json({
                success: true,
                message: `success get cuti summary`,
                data: actionGet
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get cuti summary",
            error: err
        });
    }
}

export const getCutiQuota = async(req,res) => {
    try {
        const { empNik } = req.params;
        let data;
        data = await dbSPL.query(queryGetQuotaCuti, {
            replacements: {
                empNik: parseInt(empNik)
            }, type: QueryTypes.SELECT
        });
        if(data.length===0){
            data = [{
                "employee_id": parseInt(empNik),
                "remaining_leaves": 12
            }]
        }
        res.status(200).json({
            success: true,
            data: data,
            message: `success get cuti quota for emp ${empNik}`,
        });
        
        
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get cuti quota",
            error: err,
        });
    }
}



export const getMasterAbsentee = async(req,res) => {
    try {
        const actionGet = await dbSPL.query(queryMasterAbsentee, { type: QueryTypes.SELECT });
        if(actionGet){
            res.status(200).json({
                success: true,
                message: `success get master absente`,
                data: actionGet
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: `error get master absente`,
            error: err
        });
    }
}