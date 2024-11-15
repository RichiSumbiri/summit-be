import { QueryTypes, Op } from "sequelize";
import { modelMasterDepartment, modelMasterSubDepartment, modelSumbiriEmployee, qryEmployeAktif, sqlFindEmpByNIK, sqlFindEmpByNIKKTP, sqlFindEmpKontrak, sqlFindEmpLikeNIK, sqlSummaryEmpByDept } from "../../models/hr/employe.mod.js";
import { dbSPL } from "../../config/dbAudit.js";
import moment from "moment";
import { EmpGroup } from "../../models/hr/JadwalDanJam.mod.js";


// get master departement
export const getDeptAll = async(req,res)=> {
  try {
    const data = await dbSPL.query('SELECT * FROM master_department', { type: QueryTypes.SELECT });
    return res.status(200).json({
      success: true,
      message: "success get master department",
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

// get master subdepartement
export const getSubDeptAll = async(req,res)=> {
  try {
    const data = await dbSPL.query('SELECT * FROM master_subdepartment', { type: QueryTypes.SELECT });
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

// get master position
export const getPositionAll = async(req,res)=> {
  try {
    const data = await dbSPL.query('SELECT * FROM master_position', { type: QueryTypes.SELECT });
    return res.status(200).json({
      success: true,
      message: "success get master position",
      data: data,
    });
  } catch(error){
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list position",
    });
  }
}


// get master salary type
export const getSalaryType = async(req,res)=> {
  try {
    const data = await dbSPL.query('SELECT * FROM master_salary_type', { type: QueryTypes.SELECT });
    return res.status(200).json({
      success: true,
      message: "success get master position",
      data: data,
    });
  } catch(error){
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list position",
    });
  }
}

// get master section type
export const getSection = async(req,res)=> {
  try {
    const data = await dbSPL.query('SELECT * FROM master_section', { type: QueryTypes.SELECT });
    return res.status(200).json({
      success: true,
      message: "success get master section",
      data: data,
    });
  } catch(error){
    res.status(404).json({
      success: false,
      data: error,
      message: "error get list section",
    });
  }
}

export const getEmpSummaryDept = async(req,res) => {
  try {
    const dataSummary = await dbSPL.query(sqlSummaryEmpByDept, { type: QueryTypes.SELECT });
    if(dataSummary){
      return res.status(200).json({
        success: true,
        message: "success get summary emp by dept",
        data: data,
      });
    }
  } catch(err){
    res.status(404).json({
      success: false,
      data: err,
      message: "error get list employee",
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

export const getEmpByNIK = async(req,res) => {
  try {
    const nikktp  = parseInt(req.params.empnik);
    const data    = await dbSPL.query(sqlFindEmpByNIK, {
      replacements: {
        empnik: nikktp
      }, type: QueryTypes.SELECT
    });
    return res.status(200).json({
      success: true,
      message: "success get employee by nik",
      data: data,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      data: err,
      message: "error get employee with NIK",
    });
  }
}

export const getEmpLikeNIK = async(req,res) => {
  try {
    const inputQry  = parseInt(req.params.inputQry);
    const qry       = `%${inputQry}%`;
    const data      = await dbSPL.query(sqlFindEmpLikeNIK, {
      replacements: {
        inputQry: qry
      }, type: QueryTypes.SELECT
    });
    return res.status(200).json({
      success: true,
      message: "success get employee by nik or name",
      data: data,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      data: err,
      message: "error get employee with NIK or name",
    });
  }
}


export const getEmpByNIKKTP = async(req,res) => {
  try {
    const nikktp  = parseInt(req.params.nikktp);
    const dataemp = await dbSPL.query(sqlFindEmpByNIKKTP, {
      replacements: {
        nikKTP: nikktp
      }, type: QueryTypes.SELECT
    });
    return res.status(200).json({
      success: true,
      message: "success get employee by nik ktp",
      data: dataemp,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      data: err,
      message: "error get employee with NIK ktp",
    });
  }
}

export const getEmpKontrak = async(req,res) => {
  try {
    const data    = await dbSPL.query(sqlFindEmpKontrak, { type: QueryTypes.SELECT });
    return res.status(200).json({
      success: true,
      message: "success get employee kontrak",
      data: data,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      data: err,
      message: "error get employee kontrak",
    });
  }
}


export const updateEmp = async(req,res) => {
  try {
    const data          = req.body.dataEmp;
    const postEmp     = await modelSumbiriEmployee.update(
      {
        NamaLengkap: data.NamaLengkap.toUpperCase(),
        NikKTP: data.NikKTP.toString(),
        TempatLahir: data.TempatLahir,
        TanggalLahir: data.TanggalLahir,
        JenisKelamin: data.JenisKelamin,
        NPWP: data.NPWP.toString(),
        BPJSKet: data.BPJSKet,
        BPJSKes: data.BPJSKes,
        Agama: data.Agama,
        StatusPerkawinan: data.StatusPerkawinan,
        JenjangPendidikan: data.JenjangPendidikan,
        AlamatIDProv: parseInt(data.AlamatIDProv),
        AlamatIDKabKota: parseInt(data.AlamatIDKabKota),
        AlamatIDKecamatan: parseInt(data.AlamatIDKecamatan),
        AlamatKelurahan: data.AlamatKelurahan,
        AlamatRT: parseInt(data.AlamatRT),
        AlamatRW: parseInt(data.AlamatRW),
        AlamatDetail: data.AlamatDetail,
        NamaAyah: data.NamaAyah,
        NamaIbu: data.NamaIbu,
        NoTelp1: data.NoTelp1,
        NoTelp2: data.NoTelp2,
        Email: data.Email,
        IDDepartemen: data.IDDepartemen,
        IDSubDepartemen: data.IDSubDepartemen,
        IDPosisi: data.IDPosisi,
        IDSection: data.IDSection,
        JenisUpah: data.JenisUpah,
        StatusKaryawan: data.StatusKaryawan,
        TanggalMasuk: data.TanggalMasuk,
        TanggalKeluar: data.TanggalKeluar==='0000-00-00' ? null: data.TanggalKeluar,
        StatusAktif: data.StatusAktif,
        CreateDate: moment().format('YYYY-MM-DD HH:mm:ss')
    }, {
      where: {
        Nik: parseInt(data.Nik)
      }
    });
    
    const checkEmpGroup = await EmpGroup.findAll({
      where: {
        Nik: data.Nik
      }
    });
    if(data.groupId){
      if(checkEmpGroup.length===0 || checkEmpGroup===null){
        await EmpGroup.create({
          Nik: data.Nik,
          groupId: data.groupId,
          add_id: data.UpdateBy
        });
      } else {
        await EmpGroup.update({
          groupId: data.groupId,
          mod_id: data.UpdateBy
        }, {
          where: {
            Nik: data.Nik
          }
        });
      }  
    }
    
    if(postEmp){
      return res.status(200).json({
        success: true,
        message: `success update employee NIK ${data.Nik}`,
      });
    }
  } catch(err){
    console.log(err);
    res.status(404).json({
      success: false,
      data: err,
      message: "error cannot post new employee",
    });
  }
} 


export const updateEmpMassGroup = async(req,res) => {
  try {
    const data = req.body.dataGroup;
    for (const emp of data.listEmp) {
        const checkEmpGroup = await EmpGroup.findAll({
          where: {
            Nik: emp.Nik
          }
        });
        if(checkEmpGroup.length===0||!checkEmpGroup){
          await EmpGroup.create({
            Nik: emp.Nik,
            groupId: data.groupId,
            add_id: data.UpdateBy
          });
        } else {
          await EmpGroup.update({
            groupId: data.groupId,
            mod_id: data.UpdateBy
          }, {
            where: {
              Nik: emp.Nik
            }
          });
        }    
    }
    
    return res.status(200).json({
      success: true,
      message: `success update employee mass group`,
    });
  } catch(err){
    console.log(err);
    res.status(404).json({
      success: false,
      data: err,
      message: "error cannot update employee mass group",
    });
  }
}