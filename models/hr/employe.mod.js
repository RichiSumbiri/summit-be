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
	CONCAT(sgs.groupCode, " - ", sgs.groupName) AS GroupEmp,
	sp.Work1Name,
	sp.Work1Position,
	sp.Work1Place,
	sp.Work1Periode,
	sp.Work1Salary,
	sp.Work1Reason,
	sp.Work2Name,
	sp.Work2Position,
	sp.Work2Place,
	sp.Work2Periode,
	sp.Work2Salary,
	sp.Work2Reason,
	sp.Work3Name,
	sp.Work3Position,
	sp.Work3Place,
	sp.Work3Periode,
	sp.Work3Salary,
	sp.Work3Reason
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
LEFT JOIN sumbiri_pelamar sp ON sp.NikKTP = se.NikKTP 
WHERE se.StatusAktif = 0
`;



export const modelMasterDepartment = dbSPL.define('master_department', 
	{
		IdDept: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			primaryKey: true,
		  },
		  NameDept: {
			type: DataTypes.STRING(100),
			allowNull: false,
		  },
		  GolDept: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: null,
		  },
		  IDManager: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: null,
		  },
	}, {
		tableName: 'master_department',
		timestamps: false,
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	}
);

export const modelMasterSubDepartment = dbSPL.define('master_subdepartment', 
{
	IDDept: {
		type: DataTypes.INTEGER(6),
		allowNull: false,
	  },
	  IDSubDept: {
		type: DataTypes.INTEGER(9),
		allowNull: false,
		primaryKey: true,
	  },
	  Name: {
		type: DataTypes.STRING(255),
		allowNull: true,
		defaultValue: null,
	  },
}, {
	tableName: 'master_subdepartment',
	timestamps: false,
	charset: 'utf8mb4',
	collate: 'utf8mb4_general_ci',
});

export const modelMasterSiteline = dbSPL.define('master_siteline', {
	IDSiteline: {
		type: DataTypes.CHAR(10),
		allowNull: false,
		primaryKey: true,
	  },
	  IDSection: {
		type: DataTypes.STRING(200),
		allowNull: false,
	  },
	  IDDept: {
		type: DataTypes.STRING(200),
		allowNull: false,
	  },
	  IDSubDept: {
		type: DataTypes.STRING(200),
		allowNull: true,
	  },
	  Shift: {
		type: DataTypes.STRING(100),
		allowNull: true,
	  },
	}, {
	  tableName: 'master_siteline',
	  timestamps: false,
	  charset: 'utf8mb4',
	  collate: 'utf8mb4_general_ci',
	});

export const modelSumbiriEmployee = dbSPL.define('sumbiri_employee', {
	Nik: {
		type: DataTypes.INTEGER(10),
		allowNull: false,
		primaryKey: true,
	  },
	  NamaLengkap: {
		type: DataTypes.STRING(150),
		allowNull: true,
		defaultValue: null,
	  },
	  NikKTP: {
		type: DataTypes.CHAR(17),
		allowNull: true,
		defaultValue: null,
	  },
	  NPWP: {
		type: DataTypes.STRING(255),
		allowNull: true,
		defaultValue: '0',
	  },
	  BPJSKes: {
		type: DataTypes.STRING(255),
		allowNull: true,
		defaultValue: '0',
	  },
	  BPJSKet: {
		type: DataTypes.STRING(255),
		allowNull: true,
		defaultValue: '0',
	  },
	  KodeDepartemen: {
		type: DataTypes.INTEGER(50),
		allowNull: true,
		defaultValue: null,
	  },
	  NamaDepartemen: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  IDDepartemen: {
		type: DataTypes.INTEGER(6),
		allowNull: true,
		defaultValue: null,
	  },
	  IDSubDepartemen: {
		type: DataTypes.INTEGER(9),
		allowNull: true,
		defaultValue: null,
	  },
	  IDPosisi: {
		type: DataTypes.INTEGER(10),
		allowNull: true,
		defaultValue: null,
	  },
	  IDSection: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: null,
	  },
	  IDSiteline: {
		type: DataTypes.CHAR(10),
		allowNull: true,
		defaultValue: null,
	  },
	  Posisi: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: null,
	  },
	  JenisKelamin: {
		type: DataTypes.TINYINT(2),
		allowNull: true,
		defaultValue: null,
	  },
	  TempatLahir: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  TanggalLahir: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		defaultValue: null,
	  },
	  StatusPerkawinan: {
		type: DataTypes.STRING(20),
		allowNull: true,
		defaultValue: null,
	  },
	  Agama: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: null,
	  },
	  JenjangPendidikan: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  JenisUpah: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  PeriodeKontrak: {
		type: DataTypes.INTEGER(10),
		allowNull: true,
		defaultValue: null,
	  },
	  TanggalMasuk: {
		type: DataTypes.DATEONLY,
		allowNull: true,
		defaultValue: null,
	  },
	  TanggalKeluar: {
		type: DataTypes.DATEONLY,
		allowNull: true,
	  },
	  StatusAktif: {
		type: DataTypes.TINYINT(1),
		allowNull: true,
		defaultValue: null,
	  },
	  StatusKaryawan: {
		type: DataTypes.STRING(10),
		allowNull: true,
		defaultValue: null,
	  },
	  GolonganDarah: {
		type: DataTypes.STRING(10),
		allowNull: true,
		defaultValue: null,
	  },
	  NamaIbu: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  NamaAyah: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  NoTelp1: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: null,
	  },
	  NoTelp2: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: null,
	  },
	  NoTelp3: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: null,
	  },
	  Email: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  Alamat1: {
		type: DataTypes.STRING(200),
		allowNull: true,
		defaultValue: null,
	  },
	  Alamat2: {
		type: DataTypes.STRING(200),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatIDProv: {
		type: DataTypes.INTEGER(2),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatIDKabKota: {
		type: DataTypes.INTEGER(4),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatIDKecamatan: {
		type: DataTypes.INTEGER(7),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatKelurahan: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatRT: {
		type: DataTypes.INTEGER(10),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatRW: {
		type: DataTypes.INTEGER(10),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatDetail: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  Photos: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  CreateBy: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	  CreateDate: {
		type: DataTypes.DATE,
		allowNull: true,
		defaultValue: null,
	  },
	  UpdateDate: {
		type: DataTypes.DATE,
		allowNull: true,
		defaultValue: null,
	  },
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