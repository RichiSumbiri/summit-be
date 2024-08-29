import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { dbSPL } from "../../config/dbAudit.js";

export const qryEmployeAktif = `SELECT a.Nik, a.NamaLengkap, a.NamaDepartemen, a.TanggalMasuk, 
		CASE WHEN  a.JenisKelamin = 1 THEN 'PEREMPUAN' ELSE 'LAKI-LAKI' END AS JenisKelamin,
		a.Posisi
FROM sumbiri_employee a 
WHERE a.StatusAktif = 0`;



export const modelMasterDepartment = dbSPL.define('master_department', 
	{
		id_dept: { type: DataTypes.INTEGER(255), allowNull: false, primaryKey: true },
		name_dept: { type: DataTypes.STRING(100), allowNull: false },
	}, {
		tableName: 'master_department',
		timestamps: false,
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	}
);

export const modelMasterSubDepartment = dbSPL.define('master_subdepartment', 
{
	id_sub_dept: {
		type: DataTypes.INTEGER(255),
		allowNull: false,
		primaryKey: true,
	},
	id_dept: {
		type: DataTypes.INTEGER(255),
		allowNull: false,
	},
	name_subdept: {
		type: DataTypes.STRING(255),
		allowNull: true,
	}
}, {
	tableName: 'master_subdepartment',
	timestamps: false,
	charset: 'utf8mb4',
	collate: 'utf8mb4_general_ci',
});


export const modelSumbiriEmployee = dbSPL.define('sumbiri_employee', {
	Nik: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
	NamaLengkap: { type: DataTypes.STRING(150), allowNull: true, defaultValue: null },
	KodeDepartemen: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
	NamaDepartemen: { type: DataTypes.STRING(100), allowNull: true, defaultValue: null },
	Posisi: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
	JenisKelamin: { type: DataTypes.TINYINT, allowNull: true, defaultValue: null },
	TanggalLahir: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
	TanggalMasuk: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
	TanggalKeluar: { type: DataTypes.DATEONLY, allowNull: true, defaultValue: null },
	StatusAktif: { type: DataTypes.TINYINT(1), allowNull: true, defaultValue: null },
	StatusKaryawan: { type: DataTypes.STRING(10), allowNull: true, defaultValue: null },
	NoTelp1: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
	NoTelp2: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
	NoTelp3: { type: DataTypes.STRING(50), allowNull: true, defaultValue: null },
	Alamat1: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
	Alamat2: { type: DataTypes.STRING(200), allowNull: true, defaultValue: null },
	CreateDate: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
	UpdateDate: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
  }, {
	tableName: 'sumbiri_employee',
	timestamps: false,
	charset: 'utf8mb4',
	collate: 'utf8mb4_general_ci'
  });


modelMasterDepartment.removeAttribute("id");
modelMasterSubDepartment.removeAttribute("id");
modelSumbiriEmployee.removeAttribute("id");