import { DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const SumbiriPelamar =  dbSPL.define('sumbiri_pelamar', {
  NikKTP: {
    type: DataTypes.STRING(20),
    allowNull: false,
    primaryKey: true
  },
  PassKey: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  FullName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Position2: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  BirthPlace: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  BirthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  AddressKTPProvID: {
    type: DataTypes.INTEGER(20),
    allowNull: true
  },
  AddressKTPKabKotaID: {
    type: DataTypes.INTEGER(20),
    allowNull: true
  },
  AddressKTPKecamatanID: {
    type: DataTypes.INTEGER(20),
    allowNull: true
  },
  AddressKTPKelurahanID: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  AddressKTPRT: {
    type: DataTypes.INTEGER(3),
    allowNull: true
  },
  AddressKTPRW: {
    type: DataTypes.INTEGER(3),
    allowNull: true
  },
  AddressKTPDetail: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isKTPCurrent: {
    type: DataTypes.TINYINT(1),
    allowNull: true
  },
  AddressDOMProvID: {
    type: DataTypes.INTEGER(20),
    allowNull: true
  },
  AddressDOMKabKotaID: {
    type: DataTypes.INTEGER(20),
    allowNull: true
  },
  AddressDOMKecamatanID: {
    type: DataTypes.INTEGER(20),
    allowNull: true
  },
  AddressDOMKelurahanID: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  AddressDOMRT: {
    type: DataTypes.INTEGER(3),
    allowNull: true
  },
  AddressDOMRW: {
    type: DataTypes.INTEGER(3),
    allowNull: true
  },
  AddressDOMDetail: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  BloodType: {
    type: DataTypes.STRING(2),
    allowNull: true
  },
  FatherName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  FatherJob: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  MotherName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  MotherJob: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ParentAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ParentPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  EduLastLevel: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduLastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduLastCity: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduLastYear: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  EduLastType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Kursus1Topic: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Kursus1Location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Kursus1Periode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Kursus1Place: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Kursus2Topic: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Kursus2Location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Kursus2Periode: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Kursus2Place: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Work1Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Work1Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Work1Place: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Work1Periode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Work1Salary: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Work1Reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Work2Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Work2Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Work2Place: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Work2Periode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Work2Salary: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Work2Reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Work3Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Work3Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Work3Place: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Work3Periode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Work3Salary: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Work3Reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Org1Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Org1Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Org1Periode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Org1Place: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Org2Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Org2Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Org2Periode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Org2Place: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Org3Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  Org3Position: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  Org3Periode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  Org3Place: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  LikeSports: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  LikeArts: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  LikeHobby: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  LikeVision: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  SpouseName: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child1Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child1Age: {
    type: DataTypes.INTEGER(11),
    allowNull: true
  },
  Child2Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child2Age: {
    type: DataTypes.INTEGER(11),
    allowNull: true
  },
  Child3Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child3Age: {
    type: DataTypes.INTEGER(11),
    allowNull: true
  },
  Child4Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child4Age: {
    type: DataTypes.INTEGER(11),
    allowNull: true
  },
  CountFamily: {
    type: DataTypes.INTEGER(11),
    allowNull: true
  },
  SeqFamily: {
    type: DataTypes.INTEGER(11),
    allowNull: true
  },
  PsikotestPlace: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  PsikotestTime: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  ReffName: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ReffDept: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ReffRelation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ExpectedSalary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ExpectedTMB: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  isReadyContract: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isDocValid: {
    type: DataTypes.TINYINT(4),
    allowNull: true
  },
  isReadyPlacement: {
    type: DataTypes.TINYINT(4),
    allowNull: true
  },
  ApprovalStatus: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  ApprovalTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ApprovalRemark: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ApprovalBy: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  CreateDate: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sumbiri_pelamar',
  timestamps: false
});




export const findLamaranByDate = `
SELECT
	IFNULL(sp.NikKTP, '') AS NikKTP,
	IFNULL(sp.PassKey, '') AS PassKey,
	UPPER(IFNULL(sp.FullName, '')) AS FullName,
	IFNULL(sp.Position, '') AS Position,
	UPPER(sp.BirthPlace) AS BirthPlace,
	IFNULL(sp.BirthDate, '') AS BirthDate,
	IFNULL(sp.Phone, '') AS Phone,
	IFNULL(sp.Email, '') AS Email,
	IFNULL(map2.nama_prov, '') AS KTPProvinsi,
	IFNULL(mak.nama_kabkota, '') AS AlamatKTPKabKota,
	IFNULL(mak2.nama_kecamatan, '') AS AlamatKTPKecamatan,
	IFNULL(sp.AddressKTPKelurahanID, '') AS AlamatKTPKelurahan,
	IFNULL(CONCAT('RT', sp.AddressKTPRT, '/', 'RW', sp.AddressKTPRW), '') AS AlamatKTPRTRW,
	IFNULL(sp.AddressKTPRT, '') AS AddressKTPRT,
  IFNULL(sp.AddressKTPRW, '') AS AddressKTPRW,
  IFNULL(sp.AddressKTPProvID, '') AS AddressKTPProvID,
  IFNULL(sp.AddressKTPKabKotaID, '') AS AddressKTPKabKotaID,
  IFNULL(sp.AddressKTPKecamatanID, '') AS AddressKTPKecamatanID,
  IFNULL(sp.AddressKTPKelurahanID, '') AS AddressKTPKelurahanID,
  IFNULL(sp.AddressKTPDetail, '') AS AlamatKTPDetail,
	IFNULL(sp.AddressDOMRT, '') AS AddressDOMRT,
  IFNULL(sp.AddressDOMRW, '') AS AddressDOMRW,
  IFNULL(sp.AddressDOMProvID, '') AS AddressDOMProvID,
  IFNULL(sp.AddressDOMKabKotaID, '') AS AddressDOMKabKotaID,
  IFNULL(sp.AddressDOMKecamatanID, '') AS AddressDOMKecamatanID,
  IFNULL(sp.AddressDOMKelurahanID, '') AS AddressDOMKelurahanID,
  IFNULL(sp.AddressDOMDetail, '') AS AlamatDOMDetail,
  CASE
    	WHEN sp.isKTPCurrent = 0 THEN CONCAT(IFNULL(sp.AddressKTPDetail, ''), ', RT', IFNULL(sp.AddressKTPRT, ''), ' RW', IFNULL(sp.AddressKTPRW, ''), ', ', IFNULL(sp.AddressKTPKelurahanID, ''), ', ', IFNULL(mak2.nama_kecamatan, ''), ', ', IFNULL(mak.nama_kabkota, ''))
    	WHEN sp.isKTPCurrent = 1 THEN CONCAT(IFNULL(sp.AddressDOMDetail, ''), ', RT ', IFNULL(sp.AddressDOMRT, ''), ' RW ', IFNULL(sp.AddressDOMRW, ''), ', ', IFNULL(sp.AddressDOMKelurahanID, ''), ', ', IFNULL(mak4.nama_kecamatan, ''), ', ', IFNULL(mak3.nama_kabkota, ''))
    	ELSE ''
	END AS AlamatDomisili,
	sp.isKTPCurrent, 
  IFNULL(map3.nama_prov, '') AS DOMProvinsi,
	IFNULL(mak3.nama_kabkota, '') AS AlamatDOMKabKota,
	IFNULL(mak4.nama_kecamatan, '') AS AlamatDOMKecamatan,
	IFNULL(sp.AddressDOMKelurahanID, '') AS AlamatDOMKelurahan,
	IFNULL(CONCAT('RT', sp.AddressDOMRT, '/', 'RW', sp.AddressKTPRW), '') AS AlamatDOMRTRW,
	IFNULL(sp.AddressDOMDetail, '') AS AlamatDOMDetail,
  IFNULL(sp.BloodType, '') AS BloodType,
	UPPER(IFNULL(sp.FatherName, '')) AS FatherName,
	UPPER(IFNULL(sp.FatherJob, '')) AS FatherJob,
	UPPER(IFNULL(sp.MotherName, '')) AS MotherName,
	UPPER(IFNULL(sp.MotherJob, '')) AS MotherJob,
	UPPER(IFNULL(sp.ParentAddress, '')) AS ParentAddress,
	IFNULL(sp.ParentPhone, '') AS ParentPhone,
  CASE
    WHEN sp.EduLastLevel = 'SD' THEN sp.EduLastName
    ELSE ''
  END AS EduSDName,
  CASE
    WHEN sp.EduLastLevel = 'SD' THEN sp.EduLastCity
    ELSE ''
  END AS EduSDCity,
  CASE
    WHEN sp.EduLastLevel = 'SD' THEN sp.EduLastYear
    ELSE ''
  END AS EduSDYear,
  CASE
    WHEN sp.EduLastLevel = 'SD' THEN sp.EduLastType
    ELSE ''
  END AS EduSDType,
  CASE
    WHEN sp.EduLastLevel = 'SMP' THEN sp.EduLastName
    ELSE ''
  END AS EduSMPName,
  CASE
    WHEN sp.EduLastLevel = 'SMP' THEN sp.EduLastCity
    ELSE ''
  END AS EduSMPCity,
  CASE
    WHEN sp.EduLastLevel = 'SMP' THEN sp.EduLastYear
    ELSE ''
  END AS EduSMPYear,
  CASE
    WHEN sp.EduLastLevel = 'SMP' THEN sp.EduLastType
    ELSE ''
  END AS EduSMPType,
  CASE
    WHEN sp.EduLastLevel = 'SMA' THEN sp.EduLastName
    ELSE ''
  END AS EduSMAName,
  CASE
    WHEN sp.EduLastLevel = 'SMA' THEN sp.EduLastCity
    ELSE ''
  END AS EduSMACity,
  CASE
    WHEN sp.EduLastLevel = 'SMA' THEN sp.EduLastYear
    ELSE ''
  END AS EduSMAYear,
  CASE
    WHEN sp.EduLastLevel = 'SMA' THEN sp.EduLastType
    ELSE ''
  END AS EduSMAType,
  CASE
    WHEN sp.EduLastLevel = 'D1' THEN sp.EduLastName
    ELSE ''
  END AS EduD1Name,
  CASE
    WHEN sp.EduLastLevel = 'D1' THEN sp.EduLastCity
    ELSE ''
  END AS EduD1City,
  CASE
    WHEN sp.EduLastLevel = 'D1' THEN sp.EduLastYear
    ELSE ''
  END AS EduD1Year,
  CASE
    WHEN sp.EduLastLevel = 'D1' THEN sp.EduLastType
    ELSE ''
  END AS EduD1Type,
  CASE
    WHEN sp.EduLastLevel = 'D2' THEN sp.EduLastName
    ELSE ''
  END AS EduD2Name,
  CASE
    WHEN sp.EduLastLevel = 'D2' THEN sp.EduLastCity
    ELSE ''
  END AS EduD2City,
  CASE
    WHEN sp.EduLastLevel = 'D2' THEN sp.EduLastYear
    ELSE ''
  END AS EduD2Year,
  CASE
    WHEN sp.EduLastLevel = 'D2' THEN sp.EduLastType
    ELSE ''
  END AS EduD2Type,
  CASE
    WHEN sp.EduLastLevel = 'D3' THEN sp.EduLastName
    ELSE ''
  END AS EduD3Name,
  CASE
    WHEN sp.EduLastLevel = 'D3' THEN sp.EduLastCity
    ELSE ''
  END AS EduD3City,
  CASE
    WHEN sp.EduLastLevel = 'D3' THEN sp.EduLastYear
    ELSE ''
  END AS EduD3Year,
  CASE
    WHEN sp.EduLastLevel = 'D3' THEN sp.EduLastType
    ELSE ''
  END AS EduD3Type,
  CASE
    WHEN sp.EduLastLevel = 'S1' THEN sp.EduLastName
    ELSE ''
  END AS EduS1Name,
  CASE
    WHEN sp.EduLastLevel = 'S1' THEN sp.EduLastCity
    ELSE ''
  END AS EduS1City,
  CASE
    WHEN sp.EduLastLevel = 'S1' THEN sp.EduLastYear
    ELSE ''
  END AS EduS1Year,
  CASE
    WHEN sp.EduLastLevel = 'S1' THEN sp.EduLastType
    ELSE ''
  END AS EduS1Type,
  sp.EduLastLevel,
	UPPER(sp.EduLastName) AS EduLastName,
	UPPER(sp.EduLastCity) AS EduLastCity,
	UPPER(sp.EduLastYear) AS EduLastYear,
	UPPER(sp.EduLastType) AS EduLastType,
	CASE
		WHEN sp.Kursus1Topic != '' OR sp.Kursus2Topic != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isKursus,
	UPPER(IFNULL(sp.Kursus1Topic, '')) AS Kursus1Topic,
	UPPER(IFNULL(sp.Kursus1Location, '')) AS Kursus1Location,
	UPPER(IFNULL(sp.Kursus1Periode, '')) AS Kursus1Periode,
	UPPER(IFNULL(sp.Kursus1Place, '')) AS Kursus1Place,
	UPPER(IFNULL(sp.Kursus2Topic, '')) AS Kursus2Topic,
	UPPER(IFNULL(sp.Kursus2Location, '')) AS Kursus2Location,
	UPPER(IFNULL(sp.Kursus2Periode, '')) AS Kursus2Periode,
	UPPER(IFNULL(sp.Kursus2Place, '')) AS Kursus2Place,
	UPPER(IFNULL(sp.Work1Name, '')) AS Work1Name,
	UPPER(IFNULL(sp.Work1Position, '')) AS Work1Position,
	UPPER(IFNULL(sp.Work1Place, '')) AS Work1Place,
	UPPER(IFNULL(sp.Work1Periode, '')) AS Work1Periode,
	UPPER(IFNULL(sp.Work1Salary, '')) AS Work1Salary,
	UPPER(IFNULL(sp.Work1Reason, '')) AS Work1Reason,
	UPPER(IFNULL(sp.Work2Name, '')) AS Work2Name,
	UPPER(IFNULL(sp.Work2Position, '')) AS Work2Position,
	UPPER(IFNULL(sp.Work2Place, '')) AS Work2Place,
	UPPER(IFNULL(sp.Work2Periode, '')) AS Work2Periode,
	UPPER(IFNULL(sp.Work2Salary, '')) AS Work2Salary,
	UPPER(IFNULL(sp.Work2Reason, '')) AS Work2Reason,
	UPPER(IFNULL(sp.Work3Name, '')) AS Work3Name,
	UPPER(IFNULL(sp.Work3Position, '')) AS Work3Position,
	UPPER(IFNULL(sp.Work3Place, '')) AS Work3Place,
	UPPER(IFNULL(sp.Work3Periode, '')) AS Work3Periode,
	UPPER(IFNULL(sp.Work3Salary, '')) AS Work3Salary,
	UPPER(IFNULL(sp.Work3Reason, '')) AS Work3Reason,
	CASE
		WHEN sp.Org1Name != '' OR sp.Org2Name != '' OR sp.Org3Name != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isOrganisation,
	UPPER(IFNULL(sp.Org1Name, '')) AS Org1Name,
	UPPER(IFNULL(sp.Org1Position, '')) AS Org1Position,
	UPPER(IFNULL(sp.Org1Periode, '')) AS Org1Periode,
	UPPER(IFNULL(sp.Org1Place, '')) AS Org1Place,
	UPPER(IFNULL(sp.Org2Name, '')) AS Org2Name,
	UPPER(IFNULL(sp.Org2Position, '')) AS Org2Position,
	UPPER(IFNULL(sp.Org2Periode, '')) AS Org2Periode,
	UPPER(IFNULL(sp.Org2Place, '')) AS Org2Place,
	UPPER(IFNULL(sp.LikeSports, '')) AS LikeSports,
	UPPER(IFNULL(sp.LikeArts, '')) AS LikeArts,
	UPPER(IFNULL(sp.LikeHobby, '')) AS LikeHobby,
	UPPER(IFNULL(sp.LikeVision, '')) AS LikeVision,
	UPPER(IFNULL(sp.SpouseName, '')) AS SpouseName,
	UPPER(IFNULL(sp.Child1Name, '')) AS Child1Name,
	IFNULL(sp.Child1Age, '') AS Child1Age,
	UPPER(IFNULL(sp.Child2Name, '')) AS Child2Name,
	IFNULL(sp.Child2Age, '') AS Child2Age,
	UPPER(IFNULL(sp.Child3Name, '')) AS Child3Name,
	IFNULL(sp.Child3Age, '') AS Child3Age,
	UPPER(IFNULL(sp.Child4Name, '')) AS Child4Name,
	IFNULL(sp.Child4Age, '') AS Child4Age,
	IFNULL(sp.CountFamily, '') AS CountFamily,
	IFNULL(sp.SeqFamily, '') AS SeqFamily,
	CASE
		WHEN sp.PsikotestPlace != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isPsikotest,
	UPPER(IFNULL(sp.PsikotestPlace, '')) AS PsikotestPlace,
	IFNULL(sp.PsikotestTime, '') AS PsikotestTime,
	CASE
		WHEN sp.ReffName != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isReff,
	UPPER(IFNULL(sp.ReffName, '')) AS ReffName,
	UPPER(IFNULL(sp.ReffDept, '')) AS ReffDept,
	UPPER(IFNULL(sp.ReffRelation, '')) AS ReffRelation,
	IFNULL(sp.ExpectedSalary, '') AS ExpectedSalary,
	IFNULL(sp.ExpectedTMB, '') AS ExpectedTMB,
	CASE
		WHEN sp.isReadyContract = 1 THEN 'YA'
		ELSE 'TIDAK'
	END AS ReadyContract,
	CASE
		WHEN sp.isDocValid = 1 THEN 'YA'
		ELSE 'TIDAK'
	END AS DocValid,
	CASE
		WHEN sp.isReadyPlacement = 1 THEN 'YA'
		ELSE 'TIDAK'
	END AS ReadyPlacement,
	IFNULL(DATE(sp.CreateDate), '') AS TanggalLamaran,
  DATE_FORMAT(sp.CreateDate,'%d %M %Y')  AS TanggalLamaranText,
	IFNULL(sp.CreateDate, '') AS Timestamp,
	IFNULL(DATE_FORMAT(sp.CreateDate, '%Y-%m-%d %H:%i:%s'), '') AS CreateDate,
  sp.ApprovalStatus,
  sp.ApprovalTime,
  sp.ApprovalRemark,
  sp.ApprovalBy,
  vcl.TotalCountLamaran
FROM
	sumbiri_pelamar sp
LEFT JOIN master_alamat_kabkota mak5 ON mak5.id_kabkota = sp.BirthPlace 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = sp.AddressKTPProvID 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = sp.AddressKTPKabKotaID AND mak.id_prov = sp.AddressKTPProvID 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = sp.AddressKTPKecamatanID 
LEFT JOIN master_alamat_provinsi map3 ON map3.id_prov = sp.AddressDOMProvID 
LEFT JOIN master_alamat_kabkota mak3 ON mak3.id_kabkota = sp.AddressDOMKabKotaID 
LEFT JOIN master_alamat_kecamatan mak4 ON mak4.id_kecamatan = sp.AddressDOMKecamatanID 
LEFT JOIN viewCountLamaran vcl ON vcl.NikKTP = sp.NikKTP
WHERE DATE(sp.CreateDate) BETWEEN :startDate AND :endDate ;

`;


export const SumbiriRecruitmentPassKey = dbSPL.define('sumbiri_recruitment_passkey', {
  idPassKey: {
    type: DataTypes.INTEGER(255),
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  PassKey: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  CreateBy: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  CreateDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sumbiri_recruitment_passkey',
  timestamps: false,  // Disables the automatic createdAt/updatedAt fields
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci'
});