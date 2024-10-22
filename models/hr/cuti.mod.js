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