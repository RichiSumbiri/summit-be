import { Op, QueryTypes } from "sequelize";
import { dbSPL, redisConn } from "../../config/dbAudit.js";
import { queryGetCutiDate, queryGetQuotaCuti, queryMasterAbsentee, queryMasterCuti, querySummaryCuti, SumbiriCutiMain } from "../../models/hr/cuti.mod.js";
import moment from "moment";
import { EmpGroup, GroupJadwal } from "../../models/hr/JadwalDanJam.mod.js";
import { Attandance, MasterAbsentee, qryAbsenIndividu } from "../../models/hr/attandance.mod.js";
import db from "../../config/database.js";
import { QueryGetHolidayByDate } from "../../models/setup/holidays.mod.js";
import { qryEmployeCuti } from "../../models/hr/employe.mod.js";

export const getMasterCuti = async(req,res) => {
    try {
        let dataAbsentee;
        const getAbsenteeRedis = await redisConn.get('list-absentee');
        if(getAbsenteeRedis){
            dataAbsentee = JSON.parse(getAbsenteeRedis);
        } else {
            dataAbsentee = await dbSPL.query(queryMasterCuti, { type: QueryTypes.SELECT });
            redisConn.set('list-absentee', JSON.stringify(dataAbsentee), { EX: 86400 })
        }
        res.status(200).json({
            success: true,
            message: "success get master cuti",
            data: dataAbsentee
        });
    } catch(err){
        console.error(err);
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
        // const getNikGroupId     = await EmpGroup.findOne({ where: { Nik: DetailCuti.cuti_emp_nik } });
        const getCodeAbsen      = await MasterAbsentee.findOne({ where: { id_absen: DetailCuti.id_absen }}); 
        const startDate         = moment(DetailCuti.cuti_date_start);
        const endDate           = moment(DetailCuti.cuti_date_end);
        const CutiDateList      = [];
        
        // isi list tanggal range cuti 
        while (startDate.isSameOrBefore(endDate)) {
            CutiDateList.push(startDate.format('YYYY-MM-DD'));
            startDate.add(1, 'day');
        }

        for (const CutiDate of CutiDateList) {
            // hapus dari sumbiri absen
            await Attandance.destroy({
                where:{
                    Nik: DetailCuti.cuti_emp_nik,
                    tanggal_in: CutiDate,
                    keterangan: getCodeAbsen.code_absen
            }}); 
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
            const getPreviousData   = await SumbiriCutiMain.findOne({ where: { cuti_id: dataCuti.cuti_id }, raw: true});
            const startDatePrev     = moment(getPreviousData.cuti_date_start);
            const endDatePrev       = moment(getPreviousData.cuti_date_end);
            const CutiDateListPrev  = [];
            while (startDatePrev.isSameOrBefore(endDatePrev)) {
                CutiDateListPrev.push(startDatePrev.format('YYYY-MM-DD'));
                startDatePrev.add(1, 'day');
            }
             
            // delete absen cuti sebelumnya
            for (const CutiDatePrev of CutiDateListPrev) {
                // check jam kerja base on tanggel schedule dan group id;
                await Attandance.destroy({
                    where: {
                      Nik: getPreviousData.cuti_emp_nik,
                      tanggal_in: CutiDatePrev,
                      keterangan: getCodeAbsen.code_absen
                    }
                });
            }

            // update cuti detail data
            const updateCuti = await SumbiriCutiMain.update({
                cuti_emp_nik: parseInt(dataCuti.cuti_emp_nik),
                cuti_emp_tmb: dataCuti.cuti_emp_tmb,
                cuti_emp_name: String(dataCuti.cuti_emp_name).toUpperCase(),
                cuti_emp_dept: String(dataCuti.cuti_emp_dept).toUpperCase(),
                cuti_emp_position: String(dataCuti.cuti_emp_position).toUpperCase(),
                cuti_date_start: dataCuti.cuti_date_start,
                cuti_date_end: dataCuti.cuti_date_end,
                cuti_length: dataCuti.cuti_length,
                cuti_daymonth: String(dataCuti.cuti_daymonth).toUpperCase(),
                cuti_purpose: String(dataCuti.cuti_purpose).toUpperCase(),
                id_absen: parseInt(dataCuti.id_absen),
                cuti_active: "Y"
            }, {
                where: {
                    cuti_id: dataCuti.cuti_id
                }
            });
            if(updateCuti){
                // buat absen cuti terbaru
                for (const CutiDate of CutiDateList) {
                    // check jadwal kerja karyawan ada libur kerja
                    const checkFromJadwal = await dbSPL.query(qryAbsenIndividu, {
                        replacements: {
                            nik: dataCuti.cuti_emp_nik,
                            startDate: CutiDate,
                            endDate: CutiDate,
                        }, type: QueryTypes.SELECT
                    });

                    // check jika karyawan tidak ada jadwal kerja
                    if(checkFromJadwal.length===0){
                        // check hari libur sesuai kalender
                        const checkHolidayFromCalender = await db.query(QueryGetHolidayByDate, {
                            replacements: {
                                startDate: CutiDate,
                                endDate: CutiDate
                            }, type: QueryTypes.SELECT
                        });
                        if(checkHolidayFromCalender.length===0){
                            await Attandance.upsert({
                                id: checkFromJadwal[0].id,
                                Nik: dataCuti.cuti_emp_nik,
                                groupId: 0,
                                jk_id: 0,
                                tanggal_in: CutiDate,
                                keterangan: getCodeAbsen.code_absen,
                                ket_in: String(dataCuti.cuti_purpose).toUpperCase(),
                                validasi: 0
                            });
                        }
                    } else {
                        // jika karyawan ada jadwal kerja dan tidak libur
                        if(checkFromJadwal[0].calendar==="WD"){
                            await Attandance.upsert({
                                id: checkFromJadwal[0].id,
                                Nik: dataCuti.cuti_emp_nik,
                                groupId: checkFromJadwal.groupId,
                                jk_id: checkFromJadwal.jk_id,
                                tanggal_in: CutiDate,
                                keterangan: getCodeAbsen.code_absen,
                                ket_in: String(dataCuti.cuti_purpose).toUpperCase(),
                                validasi: 0
                            });
                        }
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
                cuti_id = `${cutiformat}001`;
            } else {
                var cutilast        = checkLastCuti[0].cuti_id;
                var newcutiid       = parseInt(cutilast.substring(9)) + 1;
                if(newcutiid <= 9){
                    cuti_id      = cutiformat + (`00${newcutiid}`);
                } else if(newcutiid >= 10 && newcutiid <= 99){
                    cuti_id      = cutiformat + (`0${newcutiid}`);
                } else if(newcutiid >= 100){
                    cuti_id      = cutiformat + newcutiid;
                }
            }
            if(cuti_id){
                // create cuti detail data
                const insertCuti = await SumbiriCutiMain.create({
                    cuti_id: cuti_id,
                    cuti_emp_nik: parseInt(dataCuti.cuti_emp_nik),
                    cuti_emp_tmb: dataCuti.cuti_emp_tmb,
                    cuti_emp_name: String(dataCuti.cuti_emp_name).toUpperCase(),
                    cuti_emp_dept: String(dataCuti.cuti_emp_dept).toUpperCase(),
                    cuti_emp_position: String(dataCuti.cuti_emp_position).toUpperCase(),
                    cuti_date_start: dataCuti.cuti_date_start,
                    cuti_date_end: dataCuti.cuti_date_end,
                    cuti_length: dataCuti.cuti_length,
                    cuti_daymonth: String(dataCuti.cuti_daymonth).toUpperCase(),
                    cuti_purpose: String(dataCuti.cuti_purpose).toUpperCase(),
                    id_absen: parseInt(dataCuti.id_absen),
                    cuti_createdate: moment().format('YYYY-MM-DD HH:mm:ss'),
                    cuti_createby: dataCuti.cuti_createby,
                    cuti_active: "Y"
                });
                // jika sukses, maka insert ke attandance
                if(insertCuti){
                    for (const CutiDate of CutiDateList) {
                        // check jadwal kerja karyawan ada libur kerja
                        const checkFromJadwal = await dbSPL.query(qryAbsenIndividu, {
                            replacements: {
                                nik: dataCuti.cuti_emp_nik,
                                startDate: CutiDate,
                                endDate: CutiDate,
                            }, type: QueryTypes.SELECT
                        });

                        // check jika karyawan tidak ada jadwal kerja
                        if(checkFromJadwal.length===0){
                            // check hari libur sesuai kalender
                            const checkHolidayFromCalender = await db.query(QueryGetHolidayByDate, {
                                replacements: {
                                    startDate: CutiDate,
                                    endDate: CutiDate
                                }, type: QueryTypes.SELECT
                            });
                            if(checkHolidayFromCalender.length===0){
                                await Attandance.upsert({
                                    id: checkFromJadwal[0].id,
                                    Nik: dataCuti.cuti_emp_nik,
                                    groupId: 0,
                                    jk_id: 0,
                                    tanggal_in: CutiDate,
                                    keterangan: getCodeAbsen.code_absen,
                                    ket_in: String(dataCuti.cuti_purpose).toUpperCase(),
                                    validasi: 0
                                });
                            }
                        } else {
                            // jika karyawan ada jadwal kerja dan tidak libur
                            if(checkFromJadwal[0].calendar==="WD"){
                                await Attandance.upsert({
                                    id: checkFromJadwal[0].id,
                                    Nik: dataCuti.cuti_emp_nik,
                                    groupId: checkFromJadwal.groupId,
                                    jk_id: checkFromJadwal.jk_id,
                                    tanggal_in: CutiDate,
                                    keterangan: getCodeAbsen.code_absen,
                                    ket_in: String(dataCuti.cuti_purpose).toUpperCase(),
                                    validasi: 0
                                });
                            }
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
        let dataAbsentee;
        const getAbsenteeRedis = await redisConn.get('list-absentee-1');
        if(getAbsenteeRedis){
            dataAbsentee = JSON.parse(getAbsenteeRedis);
        } else {
            dataAbsentee = await dbSPL.query(queryMasterAbsentee, { type: QueryTypes.SELECT });
            redisConn.set('list-absentee-1', JSON.stringify(dataAbsentee), { EX: 86400 })
        }
        res.status(200).json({
            success: true,
            message: `success get master absente`,
            data: dataAbsentee
        });
    } catch(err){
        res.status(404).json({
            success: false,
            message: `error get master absente`,
            error: err
        });
    }
}



export const postCutiBersama = async(req,res) => {
    try {
        console.log('Start Create Cuti Bersama at ' + moment().format('YYYY-MM-DD HH:mm:ss'));
        const { dataCutiBersama } = req.body;
        const dataKaryawan = await dbSPL.query(qryEmployeCuti, {
            replacements: {
                tglCuti: dataCutiBersama.cuti_date
            },
            type: QueryTypes.SELECT
        });
        if(dataKaryawan.length>0){
            for (const emp of dataKaryawan){
                
                const cutiformat        = `CB${moment(dataCutiBersama.cuti_date).format('YYMMDD')}`;
                let cuti_id;
                const checkLastCuti     = await SumbiriCutiMain.findAll({
                    where: { cuti_id: { [Op.like]: `${cutiformat}%` }, }, order: [ ['cuti_id','DESC'] ]
                });
                if(checkLastCuti.length===0){
                        cuti_id = `${cutiformat}0001`;
                } else {
                    const cutilast  = checkLastCuti[0].cuti_id;
                    const newcutiid = parseInt(cutilast.slice(-4)) + 1;
                    if(newcutiid <= 9){
                        cuti_id = cutiformat + (`000${newcutiid}`);
                    } else if(newcutiid >= 10 && newcutiid <= 99){
                        cuti_id = cutiformat + (`00${newcutiid}`);
                    } else if(newcutiid >= 100 && newcutiid <= 999){
                        cuti_id = cutiformat + (`0${newcutiid}`);
                    } else if(newcutiid >= 1000){
                        cuti_id = cutiformat + String(newcutiid);
                    }
                }
                if(cuti_id){
                    // create cuti data
                    const createCuti = await SumbiriCutiMain.create({
                        cuti_id: cuti_id,
                        cuti_emp_nik: parseInt(emp.Nik),
                        cuti_emp_tmb: emp.TanggalMasuk,
                        cuti_emp_name: String(emp.NamaLengkap),
                        cuti_emp_dept: String(emp.NamaDepartemen),
                        cuti_emp_position: String(emp.NamaPosisi),
                        cuti_date_start: dataCutiBersama.cuti_date,
                        cuti_date_end: dataCutiBersama.cuti_date,
                        cuti_length: 1,
                        cuti_daymonth: 'HARI',
                        cuti_purpose: 'CUTI TAHUNAN',
                        id_absen: 7,
                        cuti_createdate: moment().format('YYYY-MM-DD HH:mm:ss'),
                        cuti_createby: dataCutiBersama.cuti_createby,
                        cuti_active: "Y"
                    });
                    if(createCuti){
                            // check jadwal kerja karyawan ada libur kerja
                            const checkFromJadwal = await dbSPL.query(qryAbsenIndividu, {
                                replacements: {
                                    nik: emp.Nik,
                                    startDate: dataCutiBersama.cuti_date,
                                    endDate: dataCutiBersama.cuti_date,
                                }, type: QueryTypes.SELECT
                            });
                            
                            // check jika karyawan tidak ada jadwal kerja
                            if(checkFromJadwal.length===0){
                                // check hari libur sesuai kalender
                                const checkHolidayFromCalender = await db.query(QueryGetHolidayByDate, {
                                    replacements: {
                                        startDate: dataCutiBersama.cuti_date,
                                        endDate: dataCutiBersama.cuti_date
                                    }, type: QueryTypes.SELECT
                                });
                                if(checkHolidayFromCalender.length===0){
                                    const existingAttendance = await Attandance.findOne({
                                        where: {
                                            Nik: emp.Nik,
                                            tanggal_in: dataCutiBersama.cuti_date,
                                            keterangan: 'CH'
                                        }
                                    });
                                    if(existingAttendance===null){
                                        // buat absen cuti bersama
                                        await Attandance.create({
                                            Nik: emp.Nik,
                                            groupId: 0,
                                            jk_id: 0,
                                            tanggal_in: dataCutiBersama.cuti_date,
                                            keterangan: 'CT',
                                            ket_in: 'CUTI TAHUNAN',
                                            validasi: 0
                                        });
                                    }
                                }
                            } else {
                                // jika karyawan ada jadwal kerja
                                if(checkFromJadwal[0].calendar==="WD"){
                                    const existingAttendance = await Attandance.findOne({
                                        where: {
                                            Nik: emp.Nik,
                                            tanggal_in: dataCutiBersama.cuti_date,
                                            keterangan: 'CH'
                                        }
                                    });
                                    if(existingAttendance===null){
                                        await Attandance.create({
                                            Nik: emp.Nik,
                                            groupId: checkFromJadwal.groupId,
                                            jk_id: checkFromJadwal.jk_id,
                                            tanggal_in: dataCutiBersama.cuti_date,
                                            keterangan: 'CT',
                                            ket_in: 'CUTI TAHUNAN',
                                            validasi: 0
                                        });
                                    }
                                }               
                            }
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: "Success create cuti bersama for date" + moment(dataCutiBersama.cuti_date).format('YYYY-MM-DD'),
            });
        } else {
            res.status(404).json({
                success: true,
                message: "fail post cuti bersama, employee not found"
            });
        }
        console.log('Finish Create Cuti Bersama at ' + moment().format('YYYY-MM-DD HH:mm:ss'));
        
    } catch(err){
        console.error(err);
        res.status(500).json({
            success: false,
            message: "error get cuti",
            error: err
        });
    }
}
