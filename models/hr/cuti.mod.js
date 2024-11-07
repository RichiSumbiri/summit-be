import { DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";


export const SumbiriCutiMain =  dbSPL.define('sumbiri_cuti_main', {
    cuti_id: {
      type: DataTypes.CHAR(12),
      allowNull: false,
      primaryKey: true
    },
    cuti_createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    cuti_createby: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_date_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cuti_date_end: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cuti_length: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    cuti_daymonth: {
      type: DataTypes.STRING(10),
      defaultValue: 'Hari'
    },
    cuti_purpose: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cuti_emp_nik: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    cuti_emp_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_emp_dept: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_emp_tmb: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    cuti_emp_position: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_spv: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cuti_manager: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cuti_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cuti_active: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    
  }, {
    tableName: 'sumbiri_cuti_main',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });
  

export const queryGetCutiDate = `SELECT * FROM sumbiri_cuti_main WHERE cuti_active="Y" AND DATE(cuti_createdate) BETWEEN :startDate AND :endDate ORDER BY cuti_createdate DESC`;


export const querySummaryCuti = `
SELECT
	se.NamaLengkap AS EmpName,	
	scm.cuti_emp_nik AS EmpNIK,
	md.NameDept AS EmpDept,
	scm.cuti_emp_tmb AS EmpTMB,
	scm.cuti_length AS CutiCountTahunan,
	scm.cuti_daymonth AS CutiDayMonth,
	scm.cuti_date_start AS CutiDateStart,
	scm.cuti_date_end AS CutiDateEnd,
	scm.cuti_purpose AS CutiPurpose,
	scm.cuti_createdate AS CutiCreateDate,
	scm.cuti_createby AS CutiCreateBy,
	scm.cuti_id AS CutiID
FROM
	sumbiri_cuti_main scm
LEFT JOIN sumbiri_employee se ON se.Nik = scm.cuti_emp_nik
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
WHERE scm.cuti_active = "Y"
ORDER BY
	scm.cuti_date_start DESC
`;