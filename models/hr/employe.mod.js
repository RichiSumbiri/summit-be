import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { dbSPL } from "../../config/dbAudit.js";

export const qryEmployeAktif = `SELECT
	se.Nik,
	se.NikKTP,
	se.NPWP,
	se.BPJSKes,
	se.BPJSKet,
	se.NamaLengkap,
	se.TempatLahir,
	se.TanggalLahir,
	se.TanggalMasuk,
	se.Agama,
	se.JenjangPendidikan,
	se.JenisUpah,
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
	CASE 
		WHEN se.StatusAktif = 0 THEN 'AKTIF'
		ELSE 'NON AKTIF'
	END AS StatusAktif
FROM sumbiri_employee se
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection = se.IDSection 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
WHERE se.StatusAktif = 0`;



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
	emp.NamaLengkap AS FullName,
	emp.NikKTP,
	emp.TempatLahir AS BirthPlace,
	emp.TanggalLahir AS BirthDate,
	emp.JenisKelamin,
	emp.NPWP,
	emp.BPJSKet,
	emp.BPJSKes,
	emp.Agama,
	emp.StatusPerkawinan,
	emp.JenjangPendidikan AS EduLastLevel,
	emp.JenisKelamin,
	emp.AlamatIDProv AS AddressKTPProvID,
	map2.nama_prov AS AlamatNamaProv,
	emp.AlamatIDKabKota AS AddressKTPKabKotaID,
	mak.nama_kabkota AS AlamatNamaKabKota,
	emp.AlamatIDKecamatan AS AddressKTPKecamatanID,
	mak2.nama_kecamatan AS AlamatNamaKecamatan,
	emp.AlamatKelurahan AS AddressKTPKelurahanID,
	emp.AlamatRT AS AddressKTPRT,
	emp.AlamatRW AS AddressKTPRW,
	emp.AlamatDetail AS AlamatKTPDetail,
	emp.NoTelp1 AS Phone,
	emp.Email,
	emp.IDDepartemen,
	md.NameDept AS NamaDepartemen,
	emp.IDSubDepartemen,
	ms.Name AS NamaSubDepartemen,
	emp.IDPosisi,
	mp.Name AS NamaPosisi,
	emp.IDSection,
	ms2.Name AS NamaSection,
	emp.JenisUpah,
	emp.StatusKaryawan,
	emp.PeriodeKontrak,
	emp.TanggalMasuk,
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
`;

export const sqlFindEmpByNIK 	= sqlFindEmp + `WHERE emp.Nik = :empnik`;
export const sqlFindEmpByNIKKTP = sqlFindEmp +  `WHERE emp.NikKTP=:nikKTP`;

modelMasterDepartment.removeAttribute("id");
modelMasterSubDepartment.removeAttribute("id");
modelSumbiriEmployee.removeAttribute("id");