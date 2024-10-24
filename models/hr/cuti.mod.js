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
    }
  }, {
    tableName: 'sumbiri_cuti_main',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });
  

export const queryGetCutiDate = `SELECT * FROM sumbiri_cuti_main WHERE DATE(cuti_createdate) BETWEEN :startDate AND :endDate ORDER BY cuti_createdate DESC`;


export const querySummaryCuti = `
SELECT
	scm.cuti_emp_nik AS EmpNIK,
	se.NamaLengkap AS EmpName,
	scm.cuti_emp_tmb AS EmpTMB,
	scm.cuti_date_start AS CutiDate,
	scm.cuti_id AS CutiID,
	SUM(scm.cuti_length) AS CutiCountTahunan,
	scm.cuti_daymonth AS CutiDayMonth,
	scm.cuti_purpose AS CutiPurpose
FROM
	sumbiri_cuti_main scm
LEFT JOIN sumbiri_employee se ON se.Nik = scm.cuti_emp_nik
GROUP BY
	scm.cuti_emp_nik,
	DATE_FORMAT(scm.cuti_date_start , '%m-%d')
ORDER BY
	scm.cuti_emp_nik,
	scm.cuti_date_start ASC
`;