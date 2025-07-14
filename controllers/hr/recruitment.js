import { QueryTypes, Op, fn, col, Sequelize } from "sequelize";
import { dbSPL, redisConn } from "../../config/dbAudit.js";
import { findLamaranByDate, SumbiriPelamar, SumbiriRecruitmentPassKey } from "../../models/hr/recruitment.mod.js";
// import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

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
          
          await SumbiriRecruitmentPassKey.create({
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
        let dataProv;
        const getProvRedis = await redisConn.get('listProv');
        if(getProvRedis){
            dataProv = JSON.parse(getProvRedis);
        } else {
            dataProv = await dbSPL.query("SELECT * FROM master_alamat_provinsi", { type: QueryTypes.SELECT});
            redisConn.set('listProv', JSON.stringify(dataProv), { EX: 604800 })
        }
        res.status(200).json({
            success: true,
            message: "success get master provinsi",
            data: dataProv
        });
    } catch(err){
        console.error(err);
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master alamat",
        });
    }
}

export const getMasterKabkota = async(req,res) => {
    try {
        const { idProvince } = req.query
        let query     = ` SELECT * FROM master_alamat_kabkota `;

        if (idProvince) {
            query += ` WHERE id_prov = '${idProvince}'`
        }

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


export const getMasterAgama = async(req,res) => {
    try {
        const result = await dbSPL.query("SELECT id_agama, name_agama FROM master_agama", { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master agama",
            data: result
        });

    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master agama",
        });
    }
}

export const getMasterEducation = async(req,res) => {
    try {
        const result = await dbSPL.query("SELECT id_edu, name_edu, title_edu FROM master_education ORDER BY id_edu ASC", { type: QueryTypes.SELECT });
        res.status(200).json({
            success: true,
            message: "success get master education",
            data: result
        });

    } catch(err){
        res.status(404).json({
            success: false,
            data: err,
            message: "error get master education",
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
        const newLamaran    = await SumbiriPelamar.update({
            ApprovalStatus: dataLamaran.ApprovalStatus,
            ApprovalTime: dataLamaran.ApprovalTime,
            ApprovalRemark: dataLamaran.ApprovalRemark,
            ApprovalBy: dataLamaran.ApprovalBy
        }, { where: {
            NikKTP: dataLamaran.NikKTP,
        }});
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