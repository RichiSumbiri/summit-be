import { QueryTypes, Op } from "sequelize";
import db from "../../config/database.js";
import { modelMasterDepartment, modelMasterSubDepartment, modelSumbiriEmployee, qryEmployeAktif } from "../../models/hr/employe.mod.js";
import { dbSPL } from "../../config/dbAudit.js";
import moment from "moment";

// get master departement
export const getDeptAll = async(req,res)=> {
  try {
    const data = await modelMasterDepartment.findAll();
    return res.status(200).json({
      success: true,
      message: "success get master department",
      data: data,
    });
  } catch(error){
    console.log(error);
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list department",
    });
  }
}

// get master subdepartement
export const getSubDeptAll = async(req,res)=> {
  try {
    const data = await modelMasterSubDepartment.findAll();
    return res.status(200).json({
      success: true,
      message: "success get master subdepartment",
      data: data,
    });
  } catch(error){
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list department",
    });
  }
}


// get employee aktif
export const getEmployeAktif = async (req, res) => {
  try {
    const listKaryawan = await dbSPL.query(qryEmployeAktif, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({
      success: true,
      data: listKaryawan,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list employee",
    });
  }
};


// controller add new employyee
export const postNewEmploye = async(req,res) => {
  try {
    const { dataEmp }     = req.body;
    let prefixNik;
    switch(dataEmp.JenisUpah){
      case 'UMR':
        prefixNik         = "20";
        break;
      case 'NEGO':
        prefixNik         = "10";
        break;
      default:
        prefixNik         = "10";
        break;
    }
    const prefixBulanMasuk  = moment(dataEmp.TanggalMasuk).format("MM");
    const prefixTahunMasuk  = moment(dataEmp.TanggalMasuk).year()  % 100;
    const initNik           = prefixNik + prefixTahunMasuk + prefixBulanMasuk;
    let sequenceNik;
    let newNik;
    const checkLastNik      = await modelSumbiriEmployee.findOne({
      where: {
        Nik: {
          [Op.like]: `${initNik}%`
        } 
      },
      order: [['Nik', 'DESC']]
    });
    
    if(checkLastNik === null) {
      sequenceNik = '001';
      newNik = initNik + sequenceNik;
    } else {
      const lastNik   = String(checkLastNik.dataValues.Nik);
      sequenceNik = parseInt(lastNik.slice(-3)) + 1;
      newNik = initNik + sequenceNik.toString().padStart(3, '0');;
    }
    const postEmp     = modelSumbiriEmployee.create({
      Nik: newNik,
      NamaLengkap: dataEmp.NamaLengkap,
      //KodeDepartemen: dataEmp.KodeDepartemen,
      NamaDepartemen: dataEmp.NamaDepartemen,
      Posisi: dataEmp.Posisi,
      JenisKelamin: dataEmp.JenisKelamin, // assuming 1 = Male, 0 = Female
      TanggalLahir: dataEmp.TanggalLahir,
      TanggalMasuk: dataEmp.TanggalMasuk,
      // TanggalKeluar: dataEmp.TanggalKeluar,
      StatusAktif: dataEmp.StatusAktif,
      StatusKaryawan: dataEmp.StatusKaryawan,
      NoTelp1: dataEmp.NoTelp1,
      // NoTelp2: '098-765-4321',
      // NoTelp3: null,
      Alamat1: dataEmp.Alamat1,
      // Alamat2: 'Apt 456',
      CreateDate: new Date(),
      // UpdateDate: new Date()
    });
    return res.status(200).json({
      success: true,
      message: "success post new employee",
    });
  } catch(err){
    console.log(err);
    res.status(404).json({
      success: false,
      data: err,
      message: "error cannot post new employee",
    });
  }
}