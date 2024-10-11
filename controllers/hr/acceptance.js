import { QueryTypes, Op } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryApprovedPelamarByDate } from "../../models/hr/acceptance.mod.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";
import moment from "moment";



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
        const checkExistingEMP      = await modelSumbiriEmployee.findAll({
            where: {
                NikKTP: dataNewEmp.NikKTP
            }
        });

        let postEmp;

        if(checkExistingEMP.length !== 0){
            postEmp     = await modelSumbiriEmployee.update({
                BPJSKes: dataNewEmp.BPJSKes,
                BPJSKet: dataNewEmp.BPJSKet,
                NPWP: dataNewEmp.NPWP,
                NamaLengkap: dataNewEmp.FullName,
                TempatLahir: dataNewEmp.BirthPlace,
                TanggalLahir: dataNewEmp.BirthDate,
                JenisKelamin: dataNewEmp.JenisKelamin,
                StatusPerkawinan: dataNewEmp.StatusPerkawinan,
                JenjangPendidikan: dataNewEmp.EduLastLevel,
                Agama: dataNewEmp.Agama,
                NoTelp1: dataNewEmp.Phone,
                Email: dataNewEmp.Email,
                AlamatIDProv: dataNewEmp.AddressKTPProvID,
                AlamatIDKabKota: dataNewEmp.AddressKTPKabKotaID,
                AlamatIDKecamatan: dataNewEmp.AddressKTPKecamatanID,
                AlamatKelurahan: dataNewEmp.AddressKTPKelurahanID,
                AlamatRT: dataNewEmp.AddressKTPRT,
                AlamatRW: dataNewEmp.AddressKTPRW,
                AlamatDetail: dataNewEmp.AlamatKTPDetail,
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
            }, {
                where: {
                    NikKTP: dataNewEmp.NikKTP
                }
            });
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
                NamaLengkap: dataNewEmp.FullName,
                TempatLahir: dataNewEmp.BirthPlace,
                TanggalLahir: dataNewEmp.BirthDate,
                JenisKelamin: dataNewEmp.JenisKelamin,
                StatusPerkawinan: dataNewEmp.StatusPerkawinan,
                JenjangPendidikan: dataNewEmp.EduLastLevel,
                Agama: dataNewEmp.Agama,
                NoTelp1: dataNewEmp.Phone,
                Email: dataNewEmp.Email,
                AlamatIDProv: dataNewEmp.AddressKTPProvID,
                AlamatIDKabKota: dataNewEmp.AddressKTPKabKotaID,
                AlamatIDKecamatan: dataNewEmp.AddressKTPKecamatanID,
                AlamatKelurahan: dataNewEmp.AddressKTPKelurahanID,
                AlamatRT: dataNewEmp.AddressKTPRT,
                AlamatRW: dataNewEmp.AddressKTPRW,
                AlamatDetail: dataNewEmp.AlamatKTPDetail,
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
        }
        res.status(200).json({
            success: true,
            message: "success post new emp"
        });
        
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            data: err,
            message: "error cannot post new emp",
        });
    }
}