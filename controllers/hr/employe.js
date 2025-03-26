import { QueryTypes } from "sequelize";
import { modelMasterDepartment, modelMasterSiteline, modelMasterSubDepartment, modelSumbiriEmployee, qryEmployeAktif, qryEmployeAll, queryEmpBurekol, queryNewEmpAmipay, sqlFindEmpByNIK, sqlFindEmpByNIKActive, sqlFindEmpByNIKKTP, sqlFindEmpKontrak, sqlFindEmpLikeNIK, sqlSummaryEmpByDept } from "../../models/hr/employe.mod.js";
import { dbSPL, redisConn } from "../../config/dbAudit.js";
import moment from "moment";
import { EmpGroup, GroupShift } from "../../models/hr/JadwalDanJam.mod.js";


// get master departement
export const getDeptAll = async(req,res)=> {
  try {
    let dataDepartemen;
    const getDepartemenRedis = await redisConn.get('list-departemen');
    if(getDepartemenRedis){
        dataDepartemen = JSON.parse(getDepartemenRedis);
    } else {
        dataDepartemen = await modelMasterDepartment.findAll();
        redisConn.set('list-departemen', JSON.stringify(dataDepartemen), { EX: 604800 })
    }
    return res.status(200).json({
      success: true,
      message: "success get master department",
      data: dataDepartemen,
    });
  } catch(error){
    res.status(404).json({
      success: false,
      error: error,
      message: "error get list department",
    });
  }
}

// get master subdepartement
export const getSubDeptAll = async(req,res)=> {
  try {
    let dataSubDepartemen;
    const getSubDepartemenRedis = await redisConn.get('list-subdepartemen');
    if(getSubDepartemenRedis){
        dataSubDepartemen = JSON.parse(getSubDepartemenRedis);
    } else {
        dataSubDepartemen = await modelMasterSubDepartment.findAll();
        redisConn.set('list-subdepartemen', JSON.stringify(dataSubDepartemen), { EX: 86400 })
    }
    return res.status(200).json({
      success: true,
      message: "success get master subdepartment",
      data: dataSubDepartemen,
    });
  } catch(error){
    res.status(404).json({
      success: false,
      error: error,
      message: "error get list department",
    });
  }
}

// get master position
export const getPositionAll = async(req,res)=> {
  try {
    let dataPosisi;
    const getPosisiRedis = await redisConn.get('list-posisi');
    if(getPosisiRedis){
        dataPosisi = JSON.parse(getPosisiRedis);
    } else {
        dataPosisi = await dbSPL.query('SELECT * FROM master_position', { type: QueryTypes.SELECT });
        redisConn.set('list-posisi', JSON.stringify(dataPosisi), { EX: 86400 })
    }
    return res.status(200).json({
      success: true,
      message: "success get master position",
      data: dataPosisi,
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
    let dataSection;
    const getSectionRedis = await redisConn.get('list-section');
    if(getSectionRedis){
        dataSection = JSON.parse(getSectionRedis);
    } else {
        dataSection = await dbSPL.query('SELECT * FROM master_section ORDER BY Name', { type: QueryTypes.SELECT });
        redisConn.set('list-section', JSON.stringify(dataSection), { EX: 86400 })
    }
    return res.status(200).json({
      success: true,
      message: "success get master section",
      data: dataSection,
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
      error: err,
      message: "error get list employee",
    });
  }
}

// get employee all
export const getEmployeAll = async (req, res) => {
  try {
    const listKaryawan = await dbSPL.query(qryEmployeAll, {
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
      error: err,
      message: "error get employee with NIK",
    });
  }
}

export const getEmpByNIKActive = async(req,res) => {
  try {
    const nikktp  = parseInt(req.params.empnik);
    const data    = await dbSPL.query(sqlFindEmpByNIKActive, {
      replacements: {
        empnik: nikktp
      }, 
      type: QueryTypes.SELECT,
      raw: true
    });
    return res.status(200).json({
      success: true,
      message: "success get employee by nik active",
      data: data,
    });
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "error get employee with NIK active",
    });
  }
}


export const getEmpLikeNIK = async(req,res) => {
  try {
    // const inputQry  = parseInt(req.params.inputQry);
    const {inputQry} = req.params
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
      error: err,
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
      error: err,
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
      error: err,
      message: "error get employee kontrak",
    });
  }
}


export const updateEmp = async(req,res) => {
  try {
    const data          = req.body.dataEmp;
    
    // check emp siteline
    const checkEmpSiteline = await modelMasterSiteline.findOne({
      where: {
        IDSection: data.IDSection,
        IDDept: data.IDDepartemen,
        IDSubDept: data.IDSubDepartemen
      }
    });

    const EmpIDSiteline = checkEmpSiteline===null ? null : checkEmpSiteline.IDSiteline;

    // update profil karyawan
    const postEmp       = await modelSumbiriEmployee.update(
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
        IDSiteline: EmpIDSiteline,
        IDJenisUpah: data.IDJenisUpah,
        StatusKaryawan: data.StatusKaryawan,
        TanggalMasuk: data.TanggalMasuk,
        StatusAktif: data.StatusAktif,
        UpdateBy: data.UpdateBy,
        UpdateDate: moment().format('YYYY-MM-DD HH:mm:ss')
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

    
    
    // jadwal dan group schedule
    if(data.groupId){
      if(checkEmpGroup.length===0 || checkEmpGroup===null){
        await EmpGroup.create({
          Nik: data.Nik,
          groupId: data.groupId
        });
      } else {
        await EmpGroup.update({
          groupId: data.groupId
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
    console.error(err);
    res.status(404).json({
      success: false,
      data: err,
      message: "error cannot post new employee",
    });
  }
} 

export const updateEmpMass = async(req,res) => {
  try {
    const data = req.body.dataMass;
    for (const emp of data) {
      const checkEmp = await modelSumbiriEmployee.findAll({ where: {Nik: emp.NIK }});
      if(checkEmp && checkEmp.length>0){
        // check departemen & update if correct
        const checkDept = await modelMasterDepartment.findAll({ 
          where: { 
            IdDept: emp.ID_DEPARTEMEN 
          }, raw: true }
        );
        if(checkDept && checkDept.length>0) await modelSumbiriEmployee.update({ IDDepartemen: emp.ID_DEPARTEMEN, UpdateBy: emp.UploadBy }, { where: { Nik: emp.NIK }});

        // check subdepartemen & update
        const checkSubDept = await modelMasterSubDepartment.findAll({ 
          where: { 
            IDDept: emp.ID_DEPARTEMEN, 
            IDSubDept: emp.ID_SUBDEPARTEMEN 
          }, raw: true 
        });
        if(checkSubDept && checkSubDept.length>0) await modelSumbiriEmployee.update({ IDSubDepartemen: emp.ID_SUBDEPARTEMEN, UpdateBy: emp.UploadBy }, { where: { Nik: emp.NIK }});

        // check section & update
        const checkSection = await dbSPL.query(`SELECT * FROM master_section WHERE IDSection = :idSection`,{
          replacements: { 
            idSection:emp.ID_SECTION
          }, type: QueryTypes.SELECT
        });
        if(checkSection && checkSection.length>0) await modelSumbiriEmployee.update({ IDSection: emp.ID_SECTION, UpdateBy: emp.UploadBy }, { where: { Nik: emp.NIK }});

        // check position
        const checkPosition = await dbSPL.query(`SELECT * FROM master_position WHERE IDPosition = :idPosition`,{
          replacements: { 
            idPosition:emp.ID_POSISI
          }, type: QueryTypes.SELECT
        });
        
        //update position
        if(checkPosition && checkPosition.length>0) await modelSumbiriEmployee.update({ IDPosisi: emp.ID_POSISI, UpdateBy: emp.UploadBy }, { where: { Nik: emp.NIK }});

        // check emp group & update
        const checkGroup    = await GroupShift.findAll({ where: { groupId: emp.ID_GROUP }});
        if(checkGroup && checkGroup.length>0){
          const checkEmpGroup = await EmpGroup.findAll({ where: { Nik: emp.NIK }});
          if(checkEmpGroup.length===0||!checkEmpGroup){
            await EmpGroup.create({ Nik: emp.NIK, groupId: emp.ID_GROUP, add_id: emp.UploadBy });
          } else {
            await EmpGroup.update({ groupId: emp.ID_GROUP, mod_id: emp.UploadBy }, { where: { Nik: emp.NIK }});
          }
        }

        // check emp siteline
        const checkEmpSiteline = await modelMasterSiteline.findOne({
          where: {
            IDSection: emp.ID_SECTION,
            IDDept: emp.ID_DEPARTEMEN,
            IDSubDept: emp.ID_SUBDEPARTEMEN
          }
        });

        // update ID Siteline
        if(checkEmpSiteline && checkEmpSiteline.length>0) await modelSumbiriEmployee.update({ IDSiteline: checkEmpSiteline.IDSiteline, UpdateBy: emp.UploadBy }, { where: { Nik: emp.NIK }});

      }
    }
    return res.status(200).json({
      success: true,
      message: `success update employee mass`,
    });
  } catch(err){
    console.error(err);
    res.status(404).json({
      success: false,
      error: err,
      message: "error cannot update employee mass",
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
    res.status(404).json({
      success: false,
      error: err,
      message: "error cannot update employee mass group",
    });
  }
}


export const getEmpBurekol = async(req,res) => {
  try {
    const empNik = req.params.empnik;
    const dataBurekol = await dbSPL.query(queryEmpBurekol, {
      replacements: {
        empNik: empNik
      }, type: QueryTypes.SELECT
    });
    if(dataBurekol){
      return res.status(200).json({
        success: true,
        message: `success get employee burekol`,
        data: dataBurekol
      });
    }
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "error cannot get employee burekol",
    });
  }
}

export const getEmpNewEmpAmipay = async(req,res) => {
  try {
    const empNik = req.params.empnik;
    const dataForAmipay = await dbSPL.query(queryNewEmpAmipay, {
      replacements: {
        empNik: empNik
      }, type: QueryTypes.SELECT
    });
    if(dataForAmipay){
      return res.status(200).json({
        success: true,
        message: `success get employee for amipay`,
        data: dataForAmipay
      });
    }
  } catch(err){
    res.status(404).json({
      success: false,
      error: err,
      message: "error cannot get employee for amipay",
    });
  }
}