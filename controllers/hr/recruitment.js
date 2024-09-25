import { QueryTypes, Op, fn, col, Sequelize } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { findLamaranByDate, SumbiriPelamar, SumbiriRecruitmentPassKey } from "../../models/hr/recruitment.mod.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

export const checkLokerLanding = async(req,res) => {
    try {
        res.status(200).json({
            success: true,
            message: "success check loker",
            data: ''
        });
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error check loker",
        });
    }
}


export const GeneratePassKey = async(req,res) => {
    try {
        function generateRandomString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            const charactersLength = characters.length;
            
            for (let i = 0; i < length; i++) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
          
            return result;
          }
          
          const randomString = generateRandomString(6).toUpperCase();
          
          const postPassKey = await SumbiriRecruitmentPassKey.create({
            PassKey: randomString,
            CreateBy: 'system'
          });
          
          res.status(200).json({
            success: true,
            message: "success generate passkey loker",
            data: randomString
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error generate passkey",
          });
    }
}

export const CheckPassKey= async(req,res) => {
    try {
        const { PassKey } = req.body;
        const checkOnDB = await SumbiriRecruitmentPassKey.findOne({where: {PassKey: PassKey}});
        if(checkOnDB.length !== 0){
            res.status(200).json({
                success: true,
                message: "success check passkey",
            });
        } else {
            res.status(401).json({
                success: false,
                message: "check passkey result wrong",
            });
        }
        
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error check passkey",
          });
    }
}

export const getMasterProv = async(req,res) => {
    try {
        const query     = ` SELECT * FROM master_alamat_provinsi `;
        const result    = await dbSPL.query(query, { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master provinsi",
            data: result
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master alamat",
        });
    }
}

export const getMasterKabkota = async(req,res) => {
    try {
        const query     = ` SELECT * FROM master_alamat_kabkota `;
        const result    = await dbSPL.query(query, { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master kabkota",
            data: result
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master alamat",
        });
    }
}

export const getMasterKecamatan = async(req,res) => {
    try {
        const query     = ` SELECT * FROM master_alamat_kecamatan `;
        const result    = await dbSPL.query(query, { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master kabkota",
            data: result
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master alamat",
        });
    }
}

export const getMasterKelurahan = async(req,res) => {
    try {
        const query     = ` SELECT * FROM master_alamat_kelurahan `;
        const result    = await dbSPL.query(query, { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master kelurahan",
            data: result
        });
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master kelurahan",
        });
    }
}


export const getMasterAlamat = async(req,res) => {
    try {
        const queryMasterAlamat = `
        SELECT
            prov.id_prov,
            kabkota.id_kabkota,
            mak.id_kecamatan,
            prov.nama_prov,
            kabkota.nama_kabkota,
            mak.nama_kecamatan 
        FROM
            master_alamat_provinsi prov
        LEFT JOIN master_alamat_kabkota kabkota ON kabkota.id_prov = prov.id_prov  
        LEFT JOIN master_alamat_kecamatan mak ON mak.id_kabkota = kabkota.id_kabkota 
        `;
        const result = await dbSPL.query(queryMasterAlamat, { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master alamat",
            data: result
        });

    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master alamat",
        });
    }
}

export const getLamaranByDate = async(req,res) => {
    try {
        const startDate     = req.params.startDate;
        const endDate       = req.params.endDate;   
        const dataLamaran   = await dbSPL.query(findLamaranByDate, {
            replacements: {
                startDate: startDate,
                endDate: endDate
            }, type: QueryTypes.SELECT 
        });
        res.status(200).json({
            success: true,
            message: "success get data lamaran",
            data: dataLamaran,
            startDate: startDate,
            endDate: endDate
        });

    } catch(err){ 
        res.status(404).json({
            success: false,
            data: err,
            message: "error get lamaran",
        });
    }
}

export const postLamaran = async(req,res) => {
    try {
        const dataLamaran   = req.body.dataLamaran;
        const newLamaran    = await SumbiriPelamar.upsert(dataLamaran);
        if(newLamaran){
            res.status(200).json({
                success: true,
                message: "success post lamaran"
            });
        } else {
            res.status(400).json({
                success: true,
                message: "fail post lamaran"
            });
    
        }
        
    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error post lamaran",
        });
    }
}

export const postApproveLamaran = async(req,res) => {
    try {
        const dataLamaran   = req.body.dataLamaran;
        const newLamaran    = await SumbiriPelamar.upsert({
            NikKTP: dataLamaran.NikKTP,
            PassKey: dataLamaran.PassKey,
            FullName: dataLamaran.FullName,
            Position: dataLamaran.Position,
            BirthPlace: dataLamaran.BirthPlace,
            BirthDate: dataLamaran.BirthDate,
            Phone: dataLamaran.Phone,
            Email: dataLamaran.Email,
            KTPProvinsi: dataLamaran.KTPProvinsi,
            AlamatKTPKabKota: dataLamaran.AlamatKTPKabKota,
            AlamatKTPKecamatan: dataLamaran.AlamatKTPKecamatan,
            AlamatKTPKelurahan: dataLamaran.AlamatKTPKelurahan,
            AlamatKTPRTRW: dataLamaran.AlamatKTPRTRW,
            AddressKTPRT: parseInt(dataLamaran.AddressKTPRT),
            AddressKTPRW: parseInt(dataLamaran.AddressKTPRW),
            AddressKTPProvID: dataLamaran.AddressKTPProvID,
            AddressKTPKabKotaID: dataLamaran.AddressKTPKabKotaID,
            AddressKTPKecamatanID: dataLamaran.AddressKTPKecamatanID,
            AddressKTPKelurahanID: dataLamaran.AddressKTPKelurahanID,
            AlamatKTPDetail: dataLamaran.AlamatKTPDetail,
            AddressDOMRT: parseInt(dataLamaran.AddressDOMRT),
            AddressDOMRW: parseInt(dataLamaran.AddressDOMRW),
            AddressDOMProvID: parseInt(dataLamaran.AddressDOMProvID),
            AddressDOMKabKotaID: parseInt(dataLamaran.AddressDOMKabKotaID),
            AddressDOMKecamatanID: parseInt(dataLamaran.AddressDOMKecamatanID),
            AddressDOMKelurahanID: dataLamaran.AddressDOMKelurahanID,
            AlamatDOMDetail: dataLamaran.AlamatDOMDetail,
            AlamatDomisili: dataLamaran.AlamatDomisili,
            isKTPCurrent: dataLamaran.isKTPCurrent,
            DOMProvinsi: dataLamaran.DOMProvinsi,
            AlamatDOMKabKota: dataLamaran.AlamatDOMKabKota,
            AlamatDOMKecamatan: dataLamaran.AlamatDOMKecamatan,
            AlamatDOMKelurahan: dataLamaran.AlamatDOMKelurahan,
            AlamatDOMRTRW: dataLamaran.AlamatDOMRTRW,
            BloodType: dataLamaran.BloodType,
            FatherName: dataLamaran.FatherName,
            FatherJob: dataLamaran.FatherJob,
            MotherName: dataLamaran.MotherName,
            MotherJob: dataLamaran.MotherJob,
            ParentAddress: dataLamaran.ParentAddress,
            ParentPhone: dataLamaran.ParentPhone,
            EduLastLevel: dataLamaran.EduLastLevel,
            EduLastName: dataLamaran.EduLastName,
            EduLastCity: dataLamaran.EduLastCity,
            EduLastYear: dataLamaran.EduLastYear,
            EduLastType: dataLamaran.EduLastType,
            EduSDName: dataLamaran.EduSDName,
            EduSDCity: dataLamaran.EduSDCity,
            EduSDYear: dataLamaran.EduSDYear,
            EduSDType: dataLamaran.EduSDType,
            EduSMPName: dataLamaran.EduSMPName,
            EduSMPCity: dataLamaran.EduSMPCity,
            EduSMPType: dataLamaran.EduSMPType,
            EduSMPYear: dataLamaran.EduSMPYear,
            EduSMAName: dataLamaran.EduSMAName,
            EduSMACity: dataLamaran.EduSMACity,
            EduSMAType: dataLamaran.EduSMAType,
            EduSMAYear: dataLamaran.EduSMAYear,
            EduD3Name: dataLamaran.EduD3Name,
            EduD3City: dataLamaran.EduD3City,
            EduD3Type: dataLamaran.EduD3Type,
            EduD3Year: dataLamaran.EduD3Year,
            EduS1Name: dataLamaran.EduS1Name,
            EduS1City: dataLamaran.EduS1City,
            EduS1Type: dataLamaran.EduS1Type,
            EduS1Year: dataLamaran.EduS1Year,
            isKursus: dataLamaran.isKursus,
            Kursus1Topic: dataLamaran.Kursus1Topic,
            Kursus1Location: dataLamaran.Kursus1Location,
            Kursus1Periode: dataLamaran.Kursus1Periode,
            Kursus1Place: dataLamaran.Kursus1Place,
            Work1Name: dataLamaran.Work1Name,
            Work1Position: dataLamaran.Work1Position,
            Work1Place: dataLamaran.Work1Place,
            Work1Periode: dataLamaran.Work1Periode,
            Work1Salary: dataLamaran.Work1Salary,
            Work1Reason: dataLamaran.Work1Reason,
            Work2Name: dataLamaran.Work2Name,
            Work2Position: dataLamaran.Work2Position,
            Work2Place: dataLamaran.Work2Place,
            Work2Periode: dataLamaran.Work2Periode,
            Work2Salary: dataLamaran.Work2Salary,
            Work2Reason: dataLamaran.Work2Reason,
            Work3Name: dataLamaran.Work3Name,
            Work3Position: dataLamaran.Work3Position,
            Work3Place: dataLamaran.Work3Place,
            Work3Periode: dataLamaran.Work3Periode,
            Work3Salary: dataLamaran.Work3Salary,
            Work3Reason: dataLamaran.Work3Reason,
            isOrganisation: dataLamaran.isOrganisation,
            Org1Name: dataLamaran.Org1Name,
            Org1Position: dataLamaran.Org1Position,
            Org1Periode: dataLamaran.Org1Periode,
            Org1Place: dataLamaran.Org1Place,
            Org2Name: dataLamaran.Org2Name,
            Org2Position: dataLamaran.Org2Position,
            Org2Periode: dataLamaran.Org2Periode,
            Org2Place: dataLamaran.Org2Place,
            LikeSports: dataLamaran.LikeSports,
            LikeArts: dataLamaran.LikeArts,
            LikeHobby: dataLamaran.LikeHobby,
            LikeVision: dataLamaran.LikeVision,
            SpouseName: dataLamaran.SpouseName,
            Child1Name: dataLamaran.Child1Name,
            Child1Age: dataLamaran.Child1Age,
            Child2Name: dataLamaran.Child2Name,
            Child2Age: dataLamaran.Child2Age,
            Child3Name: dataLamaran.Child3Name,
            Child3Age: dataLamaran.Child3Age,
            Child4Name: dataLamaran.Child4Name,
            Child4Age: dataLamaran.Child4Age,
            CountFamily: parseInt(dataLamaran.CountFamily),
            SeqFamily: parseInt(dataLamaran.SeqFamily),
            isPsikotest: dataLamaran.isPsikotest,
            PsikotestPlace: dataLamaran.PsikotestPlace,
            PsikotestTime: dataLamaran.PsikotestTime,
            isReff: dataLamaran.isReff,
            ReffName: dataLamaran.ReffName,
            ReffDept: dataLamaran.ReffDept,
            ReffRelation: dataLamaran.ReffRelation,
            ExpectedSalary: dataLamaran.ExpectedSalary,
            ExpectedTMB: dataLamaran.ExpectedTMB,
            ReadyContract: dataLamaran.ReadyContract,
            DocValid: dataLamaran.DocValid,
            ReadyPlacement: dataLamaran.ReadyPlacement,
            TanggalLamaran: dataLamaran.TanggalLamaran,
            TanggalLamaranText: dataLamaran.TanggalLamaranText,
            Timestamp: dataLamaran.Timestamp,
            CreateDate: dataLamaran.CreateDate,
            ApprovalStatus: dataLamaran.ApprovalStatus,
            ApprovalTime: dataLamaran.ApprovalTime,
            ApprovalRemark: dataLamaran.ApprovalRemark,
            ApprovalBy: dataLamaran.ApprovalBy,
            btnApprove: dataLamaran.btnApprove
        });
        if(newLamaran){
            res.status(200).json({
                success: true,
                message: "success approve lamaran"
            });
        } else {
            res.status(400).json({
                success: true,
                message: "fail approve lamaran"
            });
        }
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            data: err,
            message: "error approve lamaran",
        });
    }
}