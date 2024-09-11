import { QueryTypes, Op, fn, col, Sequelize } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { findLamaranByDate, SumbiriPelamar, SumbiriRecruitmentPassKey } from "../../models/hr/recruitment.mod.js";

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
        const tglLamaran    = req.params.tanggal;
        const dataLamaran   = await dbSPL.query(findLamaranByDate, {
            replacements: {
                tglLamaran: tglLamaran
            }, type: QueryTypes.SELECT 
        });
        res.status(200).json({
            success: true,
            message: "success get data lamaran",
            data: dataLamaran
        });

    } catch(err){ 
        console.error(err);
        res.status(404).json({
            success: false,
            data: err,
            message: "error get lamaran",
        });
    }
}

export const postLamaran = async(req,res) => {
    try {
        const dataLamaran = req.body.dataLamaran;
        
        const newLamaran = SumbiriPelamar.upsert(dataLamaran);
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