import { QueryTypes, Op } from "sequelize";
import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { queryApprovedPelamarByDate } from "../../models/hr/acceptance.mod.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";
import moment from "moment";
const { HOST_WDMS, USER_WDMS, PASS_WDMS, TOKEN_WDMS } = process.env;
import axios from "axios";


export const getApprovedPelamar = async(req,res) => {
    try {
        const { startDate, endDate }    = req.params;
        const data                      = await dbSPL.query(queryApprovedPelamarByDate, {
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT
        });
        res.status(200).json({
            success: true,
            message: "success get approved lamaran",
            data: data
        });
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            data: err,
            message: "error get approved lamaran",
        });
    }
}

export const postNewEmp = async(req,res) => {
    try {
        const dataNewEmp            = req.body.dataNewEmp;
        const checkExistingEMP      = await modelSumbiriEmployee.findAll({ where: { NikKTP: dataNewEmp.NikKTP }});

        let postEmp;

        if(checkExistingEMP.length !== 0){
            postEmp     = await modelSumbiriEmployee.upsert({
                BPJSKes: dataNewEmp.BPJSKes,
                BPJSKet: dataNewEmp.BPJSKet,
                NPWP: dataNewEmp.NPWP,
                NamaLengkap: dataNewEmp.NamaLengkap,
                TempatLahir: dataNewEmp.TempatLahir,
                TanggalLahir: dataNewEmp.TanggalLahir,
                JenisKelamin: dataNewEmp.JenisKelamin,
                StatusPerkawinan: dataNewEmp.StatusPerkawinan,
                JenjangPendidikan: dataNewEmp.JenjangPendidikan,
                Agama: dataNewEmp.Agama,
                NoTelp1: dataNewEmp.NoTelp1,
                Email: dataNewEmp.Email,
                NamaAyah: dataNewEmp.NamaAyah,
                NamaIbu: dataNewEmp.NamaIbu,
                AlamatIDProv: dataNewEmp.AlamatIDProv,
                AlamatIDKabKota: dataNewEmp.AlamatIDKabKota,
                AlamatIDKecamatan: dataNewEmp.AlamatIDKecamatan,
                AlamatKelurahan: dataNewEmp.AlamatKelurahan,
                AlamatRT: dataNewEmp.AlamatRT,
                AlamatRW: dataNewEmp.AlamatRW,
                AlamatDetail: dataNewEmp.AlamatDetail,
                IDDepartemen: dataNewEmp.IDDepartemen,
                IDSubDepartemen: dataNewEmp.IDSubDepartemen,
                IDPosisi: dataNewEmp.IDPosisi,
                IDSection: dataNewEmp.IDSection,
                JenisUpah: dataNewEmp.JenisUpah,
                TanggalMasuk: moment(dataNewEmp.TanggalMasuk).format('YYYY-MM-DD'),
                TanggalKeluar: '0000-00-00',
                StatusKaryawan: dataNewEmp.StatusKaryawan,
                StatusAktif: 0,
                CreateDate: new Date(),
                CreateBy: dataNewEmp.CreateBy
            }, {
                where: {
                    NikKTP: dataNewEmp.NikKTP,
                    Nik: dataNewEmp.Nik
                }
            });
            if(postEmp){
                const queryCheckEmp = `SELECT emp_code FROM personnel_employee WHERE emp_code = :empNik`;
                const checkEmpWDMS  = await dbWdms.query(queryCheckEmp, {
                    replacements: {
                        empNik: newNik
                    },
                    type: QueryTypes.SELECT
                });
                if(checkEmpWDMS.length===0){
                    const loginWdms = await axios.post(`${HOST_WDMS}/jwt-api-token-auth/`, {
                        username: USER_WDMS,
                        password: PASS_WDMS
                    }, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    if(loginWdms){
                        await axios.post(`${HOST_WDMS}/personnel/api/employees/`,  
                            {
                                "emp_code": newNik,
                                "first_name": dataNewEmp.NamaLengkap,
                                "hire_date": dataNewEmp.TanggalMasuk,
                                "birthday": dataNewEmp.TanggalLahir,
                                "department": 1,
                                "position": 1,
                                "company": 1,
                                "area": [3]
                            }
                            ,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `JWT ${loginWdms.data.token}`,
                                }
                            });    
                    }
                }
            }
            
        } else {
            let prefixNik;
            let sequenceNik;
            let newNik;
            switch(dataNewEmp.JenisUpah){
                case 'HARIAN':
                    prefixNik         = "20";
                    break;
                case 'BULANAN':
                    prefixNik         = "10";
                    break;
                default:
                    prefixNik         = "20";
                    break;
            }
    
            const prefixBulanMasuk  = moment(dataNewEmp.TanggalMasuk).format("MM");
            const prefixTahunMasuk  = moment(dataNewEmp.TanggalMasuk).year()  % 100;
            const initNik           = prefixNik + prefixTahunMasuk + prefixBulanMasuk;
            
            const checkLastNik      = await modelSumbiriEmployee.findOne({
                where: {
                    Nik: {
                        [Op.like]: `${initNik}%`
                    } 
            },
                order: [['Nik', 'DESC']]
            });
            
            if(checkLastNik === null) {
                sequenceNik     = '001';
                newNik          = initNik + sequenceNik;
            } else {
                const lastNik   = String(checkLastNik.dataValues.Nik);
                sequenceNik     = parseInt(lastNik.slice(-3)) + 1;
                newNik          = initNik + sequenceNik.toString().padStart(3, '0');;
            }
            
            postEmp     = await modelSumbiriEmployee.create({
                Nik: newNik,
                NikKTP: dataNewEmp.NikKTP,
                BPJSKes: dataNewEmp.BPJSKes,
                BPJSKet: dataNewEmp.BPJSKet,
                NPWP: dataNewEmp.NPWP,
                NamaLengkap: dataNewEmp.NamaLengkap,
                TempatLahir: dataNewEmp.TempatLahir,
                TanggalLahir: dataNewEmp.TanggalLahir,
                JenisKelamin: dataNewEmp.JenisKelamin,
                StatusPerkawinan: dataNewEmp.StatusPerkawinan,
                JenjangPendidikan: dataNewEmp.JenjangPendidikan,
                Agama: dataNewEmp.Agama,
                NoTelp1: dataNewEmp.NoTelp1,
                Email: dataNewEmp.Email,
                NamaAyah: dataNewEmp.NamaAyah,
                NamaIbu: dataNewEmp.NamaIbu,
                AlamatIDProv: dataNewEmp.AlamatIDProv,
                AlamatIDKabKota: dataNewEmp.AlamatIDKabKota,
                AlamatIDKecamatan: dataNewEmp.AlamatIDKecamatan,
                AlamatKelurahan: dataNewEmp.AlamatKelurahan,
                AlamatRT: dataNewEmp.AlamatRT,
                AlamatRW: dataNewEmp.AlamatRW,
                AlamatDetail: dataNewEmp.AlamatDetail,
                IDDepartemen: dataNewEmp.IDDepartemen,
                IDSubDepartemen: dataNewEmp.IDSubDepartemen,
                IDPosisi: dataNewEmp.IDPosisi,
                IDSection: dataNewEmp.IDSection,
                JenisUpah: dataNewEmp.JenisUpah,
                TanggalMasuk: moment(dataNewEmp.TanggalMasuk).format('YYYY-MM-DD'),
                StatusKaryawan: dataNewEmp.StatusKaryawan,
                StatusAktif: 0,
                CreateDate: new Date(),
                CreateBy: dataNewEmp.CreateBy
            });
            if(postEmp){
                const queryCheckEmp = `SELECT emp_code FROM personnel_employee WHERE emp_code = :empNik`;
                const checkEmpWDMS  = await dbWdms.query(queryCheckEmp, {
                    replacements: {
                        empNik: newNik
                    },
                    type: QueryTypes.SELECT
                });
                if(checkEmpWDMS.length===0){
                    const loginWdms = await axios.post(`${HOST_WDMS}/jwt-api-token-auth/`, {
                        username: USER_WDMS,
                        password: PASS_WDMS
                    }, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    if(loginWdms){
                        await axios.post(`${HOST_WDMS}/personnel/api/employees/`,  
                            {
                                "emp_code": newNik,
                                "first_name": dataNewEmp.NamaLengkap,
                                "hire_date": dataNewEmp.TanggalMasuk,
                                "birthday": dataNewEmp.TanggalLahir,
                                "department": 1,
                                "position": 1,
                                "company": 1,
                                "area": [3]
                            }
                            ,
                            {
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `JWT ${loginWdms.data.token}`,
                                }
                            });    
                    }
                }
            }
            


        }

        
        res.status(200).json({
            success: true,
            message: "success post new emp"
        });
    } catch(err){
        console.log(err);
        res.status(404).json({
            success: false,
            data: err,
            message: "error cannot post new emp",
        });
    }
}