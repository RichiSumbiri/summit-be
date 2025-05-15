import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { dbSPL } from "../../config/dbAudit.js";

export const qryEmploye = `
SELECT
	se.Nik,
	se.NikKTP,
	se.NPWP,
	se.BPJSKes,
	se.BPJSKet,
	UPPER(se.NamaLengkap) AS NamaLengkap,
	se.TempatLahir,
	se.TanggalLahir,
	se.TanggalMasuk,
	se.TanggalKeluar,
	EndSPKK.FinishKontrak,
	se.Agama,
	se.JenjangPendidikan,
	se.IDJenisUpah,
	msto.NameSalType AS NamaJenisUpah,
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
	se.IDSection,
	ms2.Name AS NamaSection,
	se.StatusKaryawan,
	se.StatusAktif,
	seg.groupId,
	CONCAT(sgs.groupCode, " - ", sgs.groupName) AS GroupEmp,
	UPPER(sp.Work1Name) AS Work1Name,
	UPPER(sp.Work1Position) AS Work1Position,
	UPPER(sp.Work1Place) AS WOrk1Place,
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
	se.Photos,
	se.CreateBy,
	se.CreateDate,
	se.UpdateBy,
	se.UpdateDate
FROM sumbiri_employee se
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection = se.IDSection 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
LEFT JOIN master_salary_type msto ON msto.IDSalType = se.IDJenisUpah
LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik 
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId 
LEFT JOIN sumbiri_pelamar sp ON sp.NikKTP = se.NikKTP 
LEFT JOIN (
SELECT 
	Nik,
	MAX(FinishKontrak) AS FinishKontrak
FROM sumbiri_spkk ss 
GROUP BY Nik
) EndSPKK ON EndSPKK.Nik = se.Nik
`;

export const qryEmployeAll = qryEmploye + `WHERE se.StatusAktif = 0 AND se.CancelMasuk='N'`;
export const qryEmployeAktif = qryEmploye + `WHERE se.StatusAktif = 0  AND ( se.TanggalKeluar >= CURDATE() OR se.TanggalKeluar IS NULL ) AND se.TanggalMasuk <= CURDATE() AND se.CancelMasuk='N'`;
export const qryEmployeCuti = qryEmploye + `
WHERE 
se.StatusAktif = 0 
AND ( se.TanggalKeluar > :tglCuti  OR se.TanggalKeluar IS NULL ) 
AND se.TanggalMasuk < :tglCuti  
AND se.CancelMasuk = 'N'
ORDER BY se.Nik ASC `;

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
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: '0',
	  },
	  BPJSKes: {
		type: DataTypes.STRING(50),
		allowNull: true,
		defaultValue: '0',
	  },
	  BPJSKet: {
		type: DataTypes.STRING(50),
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
	  IDJenisUpah: {
		type: DataTypes.INTEGER(100),
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
		type: DataTypes.INTEGER(3),
		allowNull: true,
		defaultValue: null,
	  },
	  AlamatRW: {
		type: DataTypes.INTEGER(3),
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
	  CancelMasuk: {
		type: DataTypes.ENUM('Y', 'N'),
		allowNull: true
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
	  UpdateBy: {
		type: DataTypes.STRING(100),
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
	mst.NameSalType AS NamaJenisUpah,
	emp.IDJenisUpah,
	IFNULL(TRIM(emp.StatusKaryawan),"") AS StatusKaryawan,
	emp.TanggalMasuk,
	EndSPKK.FinishKontrak,
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
	emp.CreateDate,
	emp.UpdateBy,
	emp.UpdateDate
FROM sumbiri_employee emp
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = emp.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = emp.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = emp.AlamatIDKecamatan 
LEFT JOIN master_department md ON md.IdDept = emp.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = emp.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = emp.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection  = emp.IDSection 
LEFT JOIN master_salary_type mst ON mst.IDSalType = emp.IDJenisUpah
LEFT JOIN sumbiri_employee_group seg ON seg.Nik = emp.Nik 
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId 
LEFT JOIN sumbiri_spk ss ON ss.Nik = emp.Nik 
LEFT JOIN sumbiri_pelamar sp ON sp.NikKTP = emp.NikKTP 
LEFT JOIN (
SELECT 
	Nik,
	MAX(FinishKontrak) AS FinishKontrak
FROM sumbiri_spkk ss 
GROUP BY Nik
) EndSPKK ON EndSPKK.Nik = emp.Nik

`;

export const sqlFindEmpByNIK 		= sqlFindEmp + ` WHERE emp.Nik = :empnik AND emp.CancelMasuk='N' `;
export const sqlFindEmpByNIKActive 	= sqlFindEmp + ` WHERE emp.Nik = :empnik AND emp.StatusAktif='0' AND emp.CancelMasuk='N' `;
export const sqlFindEmpLikeNIK 	= sqlFindEmp + ` WHERE emp.Nik LIKE :inputQry OR emp.NamaLengkap LIKE :inputQry `;
export const sqlFindEmpByNIKKTP = sqlFindEmp +  ` WHERE emp.NikKTP=:nikKTP AND emp.StatusAktif='0' AND emp.CancelMasuk='N' LIMIT 1 `;
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
WHERE se.StatusAktif = 0 AND se.CancelMasuk='N'
GROUP BY se.IDSubDepartemen 
`;

export const queryEmpBurekol = `
SELECT 
    "PT SUMBER BINTANG REJEKI" AS NAMA_INSTITUSI,
    CONCAT("KRJ/", se.Nik, "/SUMBIRI") AS NO_INDUK,
    "04" AS LINE,
	SUBSTRING_INDEX(TRIM(se.NamaLengkap), ' ', 1) AS NAMA_DEPAN,
    CASE 
        WHEN LENGTH(TRIM(se.NamaLengkap)) - LENGTH(REPLACE(TRIM(se.NamaLengkap), ' ', '')) >= 2 
        THEN SUBSTRING_INDEX(SUBSTRING_INDEX(TRIM(se.NamaLengkap), ' ', -2), ' ', 1) 
        ELSE ''
    END AS NAMA_TENGAH,
    CASE 
        WHEN LENGTH(TRIM(se.NamaLengkap)) - LENGTH(REPLACE(TRIM(se.NamaLengkap), ' ', '')) >= 1 
        THEN SUBSTRING_INDEX(TRIM(se.NamaLengkap), ' ', -1) 
        ELSE ''
    END AS NAMA_BELAKANG,
    "01" AS JENIS_NASABAH,
    IF(se.NPWP IS NULL, "N", "Y") AS MEMILIKI_NPWP,
    se.NPWP NO_NPWP,
    "ID" AS WARGA_NEGARA,
    "4" AS BAHASA,
    "ID" AS DOMISILI,
    IF(se.Agama="ISLAM","1","2") AS KODE_AGAMA,
    DATE_FORMAT(se.TanggalLahir, '%d-%m-%Y') AS TANGGAL_LAHIR,
    se.TempatLahir AS TEMPAT_LAHIR,
    IF(se.JenisKelamin="0" ,"M","F") AS JENIS_KELAMIN,
    "L" AS STATUS_PERKAWINAN,
    se.NamaIbu AS NAMA_GADIS,
    "02" AS JENIS_PEKERJAAN,
    "3" AS JENIS_PENDIDIKAN,
    "1" AS JENIS_IDENTITAS,
    se.NikKTP AS NO_IDENTITAS,
    mak.nama_kabkota AS LOKASI_PENERBITAN_ID,
    "2099-12-31" AS TANGGAL_EXPIRE_ID,
    se.AlamatDetail AS ALAMAT_JALAN,
    CONCAT(LPAD(se.AlamatRT, 3, '0'), "/", LPAD(se.AlamatRW, 3, '0')) AS ALAMAT_RT_PERUM,
    se.AlamatKelurahan AS ALAMAT_KELURAHAN,
    mak2.nama_kecamatan AS ALAMAT_KECAMATAN,
    "50552" AS KODE_POS,
    "99999999" AS NO_TLP_RMH,
    "0298525530" AS NO_TLP_KNTR,
    se.NoTelp1 AS NO_TLP_HP,
    "0298525530" AS NO_FAX,
    IF(se.Email IS NULL, "TIDAK MEMILIKI", se.Email) ALAMAT_EMAIL,
    se.AlamatDetail AS ALAMAT_JALAN_TERKINI,
    CONCAT(LPAD(se.AlamatRT, 3, '0'), "/", LPAD(se.AlamatRW, 3, '0')) AS ALAMAT_RT_PERUM_TERKINI,
    se.AlamatKelurahan AS ALAMAT_KELURAHAN_TERKINI,
    mak2.nama_kecamatan AS ALAMAT_KECAMATAN_TERKINI,
    "50552" AS KODE_POS_TERKINI,
    "99999999" NO_TLPN_RMH_TERKINI,
    se.NoTelp1 AS NO_TLPN_HP_TERKINI,
    "0901" AS LOKASI_BI_TERKINI,
    "" AS TANGGAL_BERLAKU,
    "2099-12-31" AS TANGGAL_JATUH_TEMPO,
    "2" AS ALASAN,
    "1" AS SUMBER_DANA,
    "" AS NAMA_ALIAS,
    "JL RAYA TEGALPANAS JIMBARAN KM 1 RT001 RW 001 KANDANGAN SEMARANG" AS ALMT_PEMBERI_KERJA_1,
    "JL RAYA TEGALPANAS JIMBARAN KM 1 RT001 RW 001 KANDANGAN SEMARANG" AS ALMT_PEMBERI_KERJA_2,
    CONCAT(mp.Name, " ", md.NameDept) AS DESKRIPSI_PEKERJAAN,
    "1" AS PENGHASILAN,
    "M" AS FREK_PENGHASILAN,
    "" AS CIF
FROM sumbiri_employee se 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
WHERE se.Nik = :empNik
`;

export const queryNewEmpAmipay = `
SELECT
	se.Nik,
	"" AS CPIN,
	se.NamaLengkap,
	DATE_FORMAT(se.TanggalMasuk, '%d-%m-%Y') AS TanggalMasuk,
	DATE_FORMAT(se.TanggalLahir, '%d-%m-%Y') AS TanggalLahir,
	se.TempatLahir,
	CASE 
    	WHEN se.JenisKelamin='0' THEN '1'
   	 	WHEN se.JenisKelamin='1' THEN '2'
   	 	ELSE '1'
    END AS JenisKelamin,
    se.AlamatDetail,
    mak.nama_kabkota AS AlamatKabKota,
    map2.nama_prov AS AlamatProvinsi,
    "" AS AlamatKodePos,
    se.NoTelp1 AS Phone,
    se.NoTelp1 AS HP,
    CASE 
    	WHEN se.StatusPerkawinan='K' THEN '1'
   	 	ELSE '2'
    END AS StatusMenikah,
    '0' AS JumlahAnak,
    '0' AS JumlahTanggungan,
    se.NamaIbu,
    '2' AS MetodePajak,
    CASE 
    	WHEN se.StatusPerkawinan ='K' THEN 'K0'
   	 	ELSE 'T0'
    END AS StatusPajak,
    se.NPWP,
    "" AS TanggalNPWP,
    se.NikKTP,
    "" AS TanggalKTP,
    IF(se.BPJSKet!="", "TRUE", "FALSE") AS BPJSTK,
    se.BPJSKet AS NoBPJSTK,
    IF(se.BPJSKes!="", "TRUE", "FALSE") AS BPJSKes,
    se.BPJSKes AS NoBPJSKes,
    '1' AS MetodeBayarGaji,
    LEFT(se.IDDepartemen, 3) AS KodeCabang,
    md.GolDept AS NamaCabang,
    se.IDDepartemen,
    md.NameDept AS NamaDepartemen,
    se.IDSection,
    ms.Name AS NamaSection,
    CONCAT(se.IDDepartemen, se.IDSection) AS GabunganKodeCabang,
    se.IDPosisi,
    mp.Name AS NamePosisi,
    CASE 
    	WHEN se.StatusKaryawan ='TETAP' THEN '01'
   	 	ELSE '02'
    END AS KodeStatusKaryawan,
    se.StatusKaryawan,
    DATE_FORMAT(spkk.FinishKontrak, '%d-%m-%Y') AS FinishKontrak,
    CASE 
        WHEN se.JenjangPendidikan = 'S3' THEN '01'
        WHEN se.JenjangPendidikan = 'S2' THEN '02'
        WHEN se.JenjangPendidikan = 'S1' THEN '03'
        WHEN se.JenjangPendidikan = 'D3' THEN '04'
        WHEN se.JenjangPendidikan = 'D2' THEN '05'
        WHEN se.JenjangPendidikan = 'D1' THEN '06'
        WHEN se.JenjangPendidikan = 'SMA' THEN '07'
        WHEN se.JenjangPendidikan = 'SMK' THEN '08'
        WHEN se.JenjangPendidikan = 'STM' THEN '09'
        WHEN se.JenjangPendidikan = 'MAN' THEN '10'
        WHEN se.JenjangPendidikan = 'SMP' THEN '11'
        WHEN se.JenjangPendidikan = 'SD' THEN '12'
        ELSE 'UNKNOWN'
    END AS KodePendidikan,
    se.JenjangPendidikan,
    CASE 
        WHEN se.Agama = 'ISLAM' THEN '01'
        WHEN se.Agama = 'KATHOLIK' THEN '02'
        WHEN se.Agama = 'KRISTEN' THEN '03'
        WHEN se.Agama = 'HINDU' THEN '04'
        WHEN se.Agama = 'BUDHA' THEN '05'
        ELSE '06'
    END AS KodeAgama,
    se.Agama AS NamaAgama,
    '' AS KodeGolonganDarah,
    '' AS NamaGolonganDarah,
    '1' AS Kewarganegaraan,
    '01' AS KodeBank,
    'BNI' AS NamaBank,
    'KARANGJATI' AS CabangBank,
    se.NamaLengkap AS AtasNama,
    '01' AS KodeCur,
    'IDR' AS NamaCur,
    '01' AS KodeRep,
    'IDR' AS NamaRep,
	'' AS BasicSalary,
    '' AS BasicSalaryOld,
    '' AS FilePhoto,
    'TRUE' AS JenisPembayaran,
    '' AS StatusSerikat,
    '' AS StatusKoperasi,
    '' AS TanggalBergabungKoperasi,
    '' AS TanggalKeluarKoperasi,
    DATE_FORMAT(se.TanggalKeluar, '%d-%m-%Y') AS ResignDate,
    IF(se.StatusAktif='0',"TRUE","FALSE") AS StatusAktif,
    ' ' AS AlasanResign,
    se.IDSection AS KodeGedung,
    CONCAT('GM/',se.IDSection) AS KodeEmp,
    se.Email ,
    "2000" AS Makan,
    "20000" AS Kehadiran
FROM
	sumbiri_employee se
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv 
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_section ms ON ms.IDSection = se.IDSection 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN (
	SELECT * FROM sumbiri_spkk ss WHERE ss.Nik=:empNik ORDER BY ss.FinishKontrak DESC
) spkk ON spkk.Nik = se.Nik
WHERE se.Nik=:empNik
`;


modelMasterDepartment.removeAttribute("id");
modelMasterSubDepartment.removeAttribute("id");
modelSumbiriEmployee.removeAttribute("id");

export const qryGetEmpDetail = `
SELECT 
	se.*,
	map2.nama_prov,
	mak.nama_kabkota,
	mak2.nama_kecamatan,
	md.NameDept AS Departemen,
	ms.Name SubDepartemen,
	msc.Name AS SectionName,
	mp.Name AS Position,
	sgs.groupName,
	mst.NameSalType AS NameJenisUpah,
	ss.Remark,
	ss.FlagReason
FROM sumbiri_employee se
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov  = se.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen
LEFT JOIN master_section msc ON msc.IDSection  = se.IDSection
left JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId
LEFT JOIN master_salary_type mst ON mst.IDSalType = se.IDJenisUpah 
LEFT JOIN sumbiri_spk ss ON ss.Nik = se.Nik 
WHERE se.Nik = :empNik


`;