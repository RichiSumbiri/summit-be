import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const sumbiriSPKT = dbSPL.define('sumbiri_spkt', {
    IDSPKT: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    DateSPKT: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    Nik: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CreateBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'sumbiri_spkt',
    timestamps: false,  // Set this to true if you have createdAt and updatedAt columns
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });


export const queryListSPKT = `
SELECT
	ss.IDSPKT,
	ss.DateSPKT,
  ss.Nik,
  se.NikKTP,
  se.TanggalMasuk,
	se.NamaLengkap,
	se.TempatLahir,
	se.TanggalLahir,
	se.AlamatDetail,
	CONCAT(se.AlamatKelurahan, " RT.", LPAD(se.AlamatRT,3,"0"), "/ RW.", LPAD(se.AlamatRW,3,"0"), ", ", mak2.nama_kecamatan, ", ", mak.nama_kabkota, ", ", map2.nama_prov) AS ConcatAlamatDetail,
  se.AlamatKelurahan,
	se.AlamatRT,
	se.AlamatRW,
	mak2.nama_kecamatan AS AlamatKecamatan,
	mak.nama_kabkota AS AlamatKabKota,
	map2.nama_prov AS AlamatProvinsi,
	se.IDDepartemen AS IDDepartment,
	md.NameDept AS NamaDepartment,
	se.IDSubDepartemen AS IDSubDept,
	ms.Name AS NameSubDept,
	se.IDPosisi AS IDPosition,
	mp.Name AS NamaPosition,
	kks.StartKK1,
	kks.FinishKK1,
	kks.StartKK2,
	kks.FinishKK2,
	kks.StartKK3,
	kks.FinishKK3,
	kks.StartKK4,
	kks.FinishKK4,
	kks.StartKK5,
	kks.FinishKK5,
	kks.StartKK6,
	kks.FinishKK6,
  ss.CreateBy,
	ss.CreateDate,
  DAYNAME(ss.CreateDate) AS CreateDay,
  CASE MONTH(ss.CreateDate)
      WHEN 1 THEN 'I'
      WHEN 2 THEN 'II'
      WHEN 3 THEN 'III'
      WHEN 4 THEN 'IV'
      WHEN 5 THEN 'V'
      WHEN 6 THEN 'VI'
      WHEN 7 THEN 'VII'
      WHEN 8 THEN 'VIII'
      WHEN 9 THEN 'IX'
      WHEN 10 THEN 'X'
      WHEN 11 THEN 'XI'
      WHEN 12 THEN 'XII'
  END AS RomanCreateMonth,
  DATE_FORMAT(ss.CreateDate, '%d %M %Y') AS CreateDateFormatted,
  YEAR(ss.CreateDate) AS CreateYear
FROM
	sumbiri_spkt ss
LEFT JOIN sumbiri_employee se ON se.Nik = ss.Nik 
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
LEFT JOIN (
	SELECT
		Nik,
		MAX(StartKK1) AS StartKK1,
		MAX(FinishKK1) AS FinishKK1,
		MAX(StartKK2) AS StartKK2,
		MAX(FinishKK2) AS FinishKK2,
		MAX(StartKK3) AS StartKK3,
		MAX(FinishKK3) AS FinishKK3,
		MAX(StartKK4) AS StartKK4,
		MAX(FinishKK4) AS FinishKK4,
		MAX(StartKK5) AS StartKK5,
		MAX(FinishKK5) AS FinishKK5,
		MAX(StartKK6) AS StartKK6,
		MAX(FinishKK6) AS FinishKK6
	FROM (
		SELECT
			ss.Nik,
			CASE WHEN ss.IDSPKK LIKE 'KKI-%' THEN ss.StartKontrak ELSE NULL END AS StartKK1,
			CASE WHEN ss.IDSPKK LIKE 'KKI-%' THEN ss.FinishKontrak ELSE NULL END AS FinishKK1,
			CASE WHEN ss.IDSPKK LIKE 'KKII-%' THEN ss.StartKontrak ELSE NULL END AS StartKK2,
			CASE WHEN ss.IDSPKK LIKE 'KKII-%' THEN ss.FinishKontrak ELSE NULL END AS FinishKK2,
			CASE WHEN ss.IDSPKK LIKE 'KKIII-%' THEN ss.StartKontrak ELSE NULL END AS StartKK3,
			CASE WHEN ss.IDSPKK LIKE 'KKIII-%' THEN ss.FinishKontrak ELSE NULL END AS FinishKK3,
			CASE WHEN ss.IDSPKK LIKE 'KKIV-%' THEN ss.StartKontrak ELSE NULL END AS StartKK4,
			CASE WHEN ss.IDSPKK LIKE 'KKIV-%' THEN ss.FinishKontrak ELSE NULL END AS FinishKK4,
			CASE WHEN ss.IDSPKK LIKE 'KKV-%' THEN ss.StartKontrak ELSE NULL END AS StartKK5,
			CASE WHEN ss.IDSPKK LIKE 'KKV-%' THEN ss.FinishKontrak ELSE NULL END AS FinishKK5,
			CASE WHEN ss.IDSPKK LIKE 'KKVI-%' THEN ss.StartKontrak ELSE NULL END AS StartKK6,
			CASE WHEN ss.IDSPKK LIKE 'KKVI-%' THEN ss.FinishKontrak ELSE NULL END AS FinishKK6
		FROM
			sumbiri_spkk ss
	) AS CombinedData
	GROUP BY Nik
) kks ON kks.Nik = ss.Nik 
`;

export const queryGetSPKTByRange  	= queryListSPKT + ` WHERE DATE(ss.CreateDate) BETWEEN :startDate AND :endDate ORDER BY ss.CreateDate DESC`;
export const queryGetLastSPKT     	= queryListSPKT + ` WHERE ss.IDSPKT LIKE :formatSPKT ORDER BY ss.CreateDate DESC LIMIT 1`;
export const queryGetSPKTByNIK		= queryListSPKT + ` WHERE ss.Nik = :empNik`;