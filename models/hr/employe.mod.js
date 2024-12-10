import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { dbSPL } from "../../config/dbAudit.js";

export const qryEmployeAktif = `
SELECT
	se.Nik,
	se.NikKTP,
	se.NPWP,
	se.BPJSKes,
	se.BPJSKet,
	se.NamaLengkap,
	se.TempatLahir,
	se.TanggalLahir,
	se.TanggalMasuk,
	se.TanggalKeluar,
	se.Agama,
	se.JenjangPendidikan,
	se.JenisUpah,
	se.NoTelp1,
	se.NoTelp2,
	se.Email,
	se.NamaAyah,
	se.NamaIbu,
	CASE 
		WHEN se.StatusPerkawinan = 'BK' THEN 'BELUM KAWIN'
		WHEN se.StatusPerkawinan = 'K' THEN 'KAWIN'
		WHEN se.StatusPerkawinan = 'JDH' THEN 'JANDA / DUDA HIDUP'
		WHEN se.StatusPerkawinan = 'JDM' THEN 'JANDA / DUDA MATI'
	END AS StatusPerkawinan,
	map2.nama_prov AS AlamatNamaProv,
	mak.nama_kabkota AS AlamatNamaKabKota,
	mak2.nama_kecamatan AS AlamatNamaKecamatan,
	se.AlamatKelurahan AS AlamatNamaKelurahan,
	se.AlamatRT,
	se.AlamatRW,
	se.AlamatDetail,
	CASE
		WHEN se.JenisKelamin = 1 THEN 'PEREMPUAN'
		ELSE 'LAKI-LAKI'
	END AS JenisKelamin,
	se.IDDepartemen,
	md.NameDept AS NamaDepartemen,
	se.IDSubDepartemen,
	ms.Name AS NamaSubDepartemen,
	se.IDPosisi,
	mp.Name AS NamaPosisi,
	ms2.Name AS NamaSection,
	se.StatusKaryawan,
	se.StatusAktif,
	seg.groupId,
	CONCAT(sgs.groupCode, " - ", sgs.groupName) AS GroupEmp
FROM sumbiri_employee se
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection = se.IDSection 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik 
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId 
WHERE se.StatusAktif = 0
`;



export const modelMasterDepartment = dbSPL.define('master_department', 
	{
		IdDept: { type: DataTypes.INTEGER(255), allowNull: false, primaryKey: true },
		NameDept: { type: DataTypes.STRING(100), allowNull: false },
		IDManager: { type: DataTypes.STRING(100), allowNull: true }
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
	Nik: {
	  type: DataTypes.INTEGER,
	  allowNull: false,
	  primaryKey: true
	},
	NamaLengkap: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	NikKTP: {
	  type: DataTypes.STRING(255),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	NPWP: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	BPJSKes: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	BPJSKet: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	KodeDepartemen: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
	NamaDepartemen: {
	  type: DataTypes.STRING(100),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	IDDepartemen: {
	  type: DataTypes.INTEGER(50),
	  allowNull: true
	},
	IDSubDepartemen: {
	  type: DataTypes.INTEGER(50),
	  allowNull: true
	},
	IDPosisi: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
	IDSection: {
		type: DataTypes.STRING(20),
		allowNull: true
	  },
	Posisi: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	JenisKelamin: {
	  type: DataTypes.TINYINT,
	  allowNull: true
	},
	TempatLahir: {
	  type: DataTypes.STRING(100),
	  allowNull: true,
	},
	TanggalLahir: {
	  type: DataTypes.DATEONLY,
	  allowNull: true
	},
	StatusPerkawinan: {
	  type: DataTypes.STRING(20),
	  allowNull: true,
	},
	Agama: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	JenjangPendidikan: {
	  type: DataTypes.STRING(100),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	JenisUpah: {
	  type: DataTypes.STRING(100),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	PeriodeKontrak: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
	TanggalMasuk: {
	  type: DataTypes.DATEONLY,
	  allowNull: true
	},
	TanggalKeluar: {
	  type: DataTypes.DATEONLY,
	  allowNull: true
	},
	StatusAktif: {
	  type: DataTypes.TINYINT,
	  allowNull: true
	},
	StatusKaryawan: {
	  type: DataTypes.STRING(10),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	NoTelp1: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	NoTelp2: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	NoTelp3: {
	  type: DataTypes.STRING(50),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	Email: {
		type: DataTypes.STRING(50),
		allowNull: true
	  },  
	NamaAyah: {
		type: DataTypes.STRING(50),
		allowNull: true,
	},
	NamaIbu: {
		type: DataTypes.STRING(50),
		allowNull: true,
	},
	Alamat1: {
	  type: DataTypes.STRING(200),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	Alamat2: {
	  type: DataTypes.STRING(200),
	  allowNull: true,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci'
	},
	AlamatIDProv: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
	AlamatIDKabKota: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
	AlamatIDKecamatan: {
	  type: DataTypes.INTEGER,
	  allowNull: true
	},
	AlamatKelurahan: {
	  type: DataTypes.STRING(100),
	  allowNull: true
	},
	AlamatRT: {
		type: DataTypes.STRING(10),
		allowNull: true
	},
	AlamatRW: {
		type: DataTypes.STRING(10),
		allowNull: true
	},
	AlamatDetail: {
		type: DataTypes.STRING(100),
		allowNull: true
	},
	Photos: {
		type: DataTypes.STRING(100),
		allowNull: true
	},
	CreateDate: {
	  type: DataTypes.DATE,
	  allowNull: true,
	  defaultValue: null
	},
	UpdateDate: {
	  type: DataTypes.DATE,
	  allowNull: true,
	  defaultValue: null
	}
  }, {
	tableName: 'sumbiri_employee',
	timestamps: false, // Set to true if you want to manage `createdAt` and `updatedAt`
	freezeTableName: true // Prevent Sequelize from pluralizing the table name
  });


export const sqlFindEmp = `
SELECT 
	emp.Nik,
	emp.NamaLengkap,
	CONCAT(emp.Nik,' - ', emp.NamaLengkap) AS labelKaryawan,
	IFNULL(emp.NikKTP,"") AS NikKTP,
	IFNULL(emp.TempatLahir,"") AS TempatLahir,
	emp.TanggalLahir,
	emp.JenisKelamin,
	IFNULL(emp.NPWP,"") AS NPWP,
	IFNULL(emp.BPJSKet,"") AS BPJSKet,
	IFNULL(emp.BPJSKes,"") AS BPJSKes,
	IFNULL(emp.Agama, "") AS Agama,
	IFNULL(emp.StatusPerkawinan, "") AS StatusPerkawinan,
	IFNULL(emp.JenjangPendidikan, "") AS JenjangPendidikan,
	IFNULL(emp.AlamatIDProv, "") AS AlamatIDProv,
	IFNULL(emp.AlamatIDKabKota, "") AS AlamatIDKabKota,
	IFNULL(emp.AlamatIDKecamatan, "") AS AlamatIDKecamatan,
	map2.nama_prov AS AlamatNamaProv,
	mak.nama_kabkota AS AlamatNamaKabKota,
	mak2.nama_kecamatan AS AlamatNamaKecamatan,
	IFNULL(emp.AlamatKelurahan,"") AS AlamatKelurahan,
	IFNULL(emp.AlamatRT,"") AS AlamatRT,
	IFNULL(emp.AlamatRW,"") AS AlamatRW,
	IFNULL(emp.AlamatDetail,"") AS AlamatDetail,
	IFNULL(emp.NoTelp1,"") AS NoTelp1,
	IFNULL(emp.NoTelp2,"") AS NoTelp2,
	IFNULL(emp.Email,"") AS Email,
	IFNULL(emp.NamaIbu,"") AS NamaIbu,
	IFNULL(emp.NamaAyah,"") AS NamaAyah,
	IFNULL(emp.IDDepartemen,"") AS IDDepartemen,
	IFNULL(emp.IDSubDepartemen,"") AS IDSubDepartemen,
	IFNULL(emp.IDPosisi,"") AS IDPosisi,
	IFNULL(emp.IDSection,"") AS IDSection,
	md.NameDept AS NamaDepartemen,
	ms.Name AS NamaSubDepartemen,
	mp.Name AS NamaPosisi,
	ms2.Name AS NamaSection,
	IFNULL(TRIM(emp.JenisUpah),"") AS JenisUpah,
	IFNULL(TRIM(emp.StatusKaryawan),"") AS StatusKaryawan,
	emp.TanggalMasuk,
	IFNULL(emp.TanggalKeluar,"") AS TanggalKeluar,
	emp.StatusAktif,
	seg.groupId,
	sgs.groupName ,
	IFNULL(emp.Photos,"") AS Photos,
	ss.id_spk AS IDSPK,
	ss.FlagReason,
	ss.Remark,
	UPPER(sp.Work1Name) AS Work1Name,
	UPPER(sp.Work1Position) AS Work1Position,
	UPPER(sp.Work1Place) AS Work1Place,
	UPPER(sp.Work1Periode) AS Work1Periode,
	UPPER(sp.Work1Salary) AS Work1Salary,
	UPPER(sp.Work1Reason) AS Work1Reason,
	UPPER(sp.Work2Name) AS Work2Name,
	UPPER(sp.Work2Position) AS Work2Position,
	UPPER(sp.Work2Place) AS Work2Place,
	UPPER(sp.Work2Periode) AS Work2Periode,
	UPPER(sp.Work2Salary) AS Work2Salary,
	UPPER(sp.Work2Reason) AS Work2Reason,
	UPPER(sp.Work3Name) AS Work3Name,
	UPPER(sp.Work3Position) AS Work3Position,
	UPPER(sp.Work3Place) AS Work3Place,
	UPPER(sp.Work3Periode) AS Work3Periode,
	UPPER(sp.Work3Salary) AS Work3Salary,
	UPPER(sp.Work3Reason) AS Work3Reason,
	emp.CreateBy,
	emp.CreateDate
FROM sumbiri_employee emp
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = emp.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = emp.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = emp.AlamatIDKecamatan 
LEFT JOIN master_department md ON md.IdDept = emp.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = emp.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = emp.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection  = emp.IDSection 
LEFT JOIN sumbiri_employee_group seg ON seg.Nik = emp.Nik 
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId 
LEFT JOIN sumbiri_spk ss ON ss.Nik = emp.Nik 
LEFT JOIN sumbiri_pelamar sp ON sp.NikKTP = emp.NikKTP 
`;

export const sqlFindEmpByNIK 	= sqlFindEmp + ` WHERE emp.Nik = :empnik`;
export const sqlFindEmpLikeNIK 	= sqlFindEmp + ` WHERE emp.Nik LIKE :inputQry OR emp.NamaLengkap LIKE :inputQry `;
export const sqlFindEmpByNIKKTP = sqlFindEmp +  ` WHERE emp.NikKTP=:nikKTP`;
export const sqlFindEmpKontrak 	= sqlFindEmp +  ` WHERE TRIM(emp.StatusKaryawan)='Kontrak'`;

export const sqlSummaryEmpByDept = `
SELECT
	se.IDDepartemen,
	se.IDSubDepartemen,
	md.GolDept AS Golongan,
	md.NameDept AS NamaDepartemen,
	ms.Name AS NamaSubDepartemen,
	COUNT(*) AS Qty
FROM
	sumbiri_employee se
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
WHERE se.StatusAktif = 0
GROUP BY se.IDSubDepartemen 
`;

modelMasterDepartment.removeAttribute("id");
modelMasterSubDepartment.removeAttribute("id");
modelSumbiriEmployee.removeAttribute("id");