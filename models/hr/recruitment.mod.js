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
  EduSDName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduSDCity: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  EduSDYear: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  EduSDType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EduSMPName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduSMPCity: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  EduSMPType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EduSMPYear: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  EduSMAName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduSMACity: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  EduSMAType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EduSMAYear: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  EduD3Name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EduD3City: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  EduD3Type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EduD3Year: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  EduS1Name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduS1City: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  EduS1Type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  EduS1Year: {
    type: DataTypes.STRING(4),
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
	IFNULL(sp.FullName, '') AS FullName,
	IFNULL(sp.Position, '') AS Position,
	sp.BirthPlace,
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
	IFNULL(sp.FatherName, '') AS FatherName,
	IFNULL(sp.FatherJob, '') AS FatherJob,
	IFNULL(sp.MotherName, '') AS MotherName,
	IFNULL(sp.MotherJob, '') AS MotherJob,
	IFNULL(sp.ParentAddress, '') AS ParentAddress,
	IFNULL(sp.ParentPhone, '') AS ParentPhone,
	CASE 
		WHEN sp.EduSDName != '' THEN 'SD'
		WHEN sp.EduSMPName != '' THEN 'SMP'
		WHEN sp.EduSMAName != '' THEN 'SMA'
		WHEN sp.EduD3Name != '' THEN 'D3'
		WHEN sp.EduS1Name != '' THEN 'S1'
		ELSE ''
	END AS EduLastLevel,
	CASE 
		WHEN sp.EduSDName != '' THEN sp.EduSDName
		WHEN sp.EduSMPName != '' THEN sp.EduSMPName
		WHEN sp.EduSMAName != '' THEN sp.EduSMAName
		WHEN sp.EduD3Name != '' THEN sp.EduD3Name
		WHEN sp.EduS1Name != '' THEN sp.EduS1Name
		ELSE ''
	END AS EduLastName,
	CASE 
		WHEN sp.EduSDCity != '' THEN sp.EduSDCity
		WHEN sp.EduSMPCity != '' THEN sp.EduSMPCity
		WHEN sp.EduSMACity != '' THEN sp.EduSMACity
		WHEN sp.EduD3City != '' THEN sp.EduD3City
		WHEN sp.EduS1City != '' THEN sp.EduS1City
		ELSE ''
	END AS EduLastCity,
	CASE 
		WHEN sp.EduSDYear != '' THEN sp.EduSDYear
		WHEN sp.EduSMPYear != '' THEN sp.EduSMPYear
		WHEN sp.EduSMAYear != '' THEN sp.EduSMAYear
		WHEN sp.EduD3Year != '' THEN sp.EduD3Year
		WHEN sp.EduS1Year != '' THEN sp.EduS1Year
		ELSE ''
	END AS EduLastYear,
	CASE 
		WHEN sp.EduSDType != '' THEN sp.EduSDType
		WHEN sp.EduSMPType != '' THEN sp.EduSMPType
		WHEN sp.EduSMAType != '' THEN sp.EduSMAType
		WHEN sp.EduD3Type != '' THEN sp.EduD3Type
		WHEN sp.EduS1Type != '' THEN sp.EduS1Type
		ELSE ''
	END AS EduLastType,
	IFNULL(sp.EduSDName, '') AS EduSDName,
	IFNULL(sp.EduSDCity, '') AS EduSDCity,
	IFNULL(sp.EduSDYear, '') AS EduSDYear,
	IFNULL(sp.EduSDType, '') AS EduSDType,
	IFNULL(sp.EduSMPName, '') AS EduSMPName,
	IFNULL(sp.EduSMPCity, '') AS EduSMPCity,
	IFNULL(sp.EduSMPType, '') AS EduSMPType,
	IFNULL(sp.EduSMPYear, '') AS EduSMPYear,
	IFNULL(sp.EduSMAName, '') AS EduSMAName,
	IFNULL(sp.EduSMACity, '') AS EduSMACity,
	IFNULL(sp.EduSMAType, '') AS EduSMAType,
	IFNULL(sp.EduSMAYear, '') AS EduSMAYear,
	IFNULL(sp.EduD3Name, '') AS EduD3Name,
	IFNULL(sp.EduD3City, '') AS EduD3City,
	IFNULL(sp.EduD3Type, '') AS EduD3Type,
	IFNULL(sp.EduD3Year, '') AS EduD3Year,
	IFNULL(sp.EduS1Name, '') AS EduS1Name,
	IFNULL(sp.EduS1City, '') AS EduS1City,
	IFNULL(sp.EduS1Type, '') AS EduS1Type,
	IFNULL(sp.EduS1Year, '') AS EduS1Year,
	CASE
		WHEN sp.Kursus1Topic != '' OR sp.Kursus2Topic != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isKursus,
	IFNULL(sp.Kursus1Topic, '') AS Kursus1Topic,
	IFNULL(sp.Kursus1Location, '') AS Kursus1Location,
	IFNULL(sp.Kursus1Periode, '') AS Kursus1Periode,
	IFNULL(sp.Kursus1Place, '') AS Kursus1Place,
	IFNULL(sp.Kursus2Topic, '') AS Kursus2Topic,
	IFNULL(sp.Kursus2Location, '') AS Kursus2Location,
	IFNULL(sp.Kursus2Periode, '') AS Kursus2Periode,
	IFNULL(sp.Kursus2Place, '') AS Kursus2Place,
	IFNULL(sp.Work1Name, '') AS Work1Name,
	IFNULL(sp.Work1Position, '') AS Work1Position,
	IFNULL(sp.Work1Place, '') AS Work1Place,
	IFNULL(sp.Work1Periode, '') AS Work1Periode,
	IFNULL(sp.Work1Salary, '') AS Work1Salary,
	IFNULL(sp.Work1Reason, '') AS Work1Reason,
	IFNULL(sp.Work2Name, '') AS Work2Name,
	IFNULL(sp.Work2Position, '') AS Work2Position,
	IFNULL(sp.Work2Place, '') AS Work2Place,
	IFNULL(sp.Work2Periode, '') AS Work2Periode,
	IFNULL(sp.Work2Salary, '') AS Work2Salary,
	IFNULL(sp.Work2Reason, '') AS Work2Reason,
	IFNULL(sp.Work3Name, '') AS Work3Name,
	IFNULL(sp.Work3Position, '') AS Work3Position,
	IFNULL(sp.Work3Place, '') AS Work3Place,
	IFNULL(sp.Work3Periode, '') AS Work3Periode,
	IFNULL(sp.Work3Salary, '') AS Work3Salary,
	IFNULL(sp.Work3Reason, '') AS Work3Reason,
	CASE
		WHEN sp.Org1Name != '' OR sp.Org2Name != '' OR sp.Org3Name != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isOrganisation,
	IFNULL(sp.Org1Name, '') AS Org1Name,
	IFNULL(sp.Org1Position, '') AS Org1Position,
	IFNULL(sp.Org1Periode, '') AS Org1Periode,
	IFNULL(sp.Org1Place, '') AS Org1Place,
	IFNULL(sp.Org2Name, '') AS Org2Name,
	IFNULL(sp.Org2Position, '') AS Org2Position,
	IFNULL(sp.Org2Periode, '') AS Org2Periode,
	IFNULL(sp.Org2Place, '') AS Org2Place,
	IFNULL(sp.LikeSports, '') AS LikeSports,
	IFNULL(sp.LikeArts, '') AS LikeArts,
	IFNULL(sp.LikeHobby, '') AS LikeHobby,
	IFNULL(sp.LikeVision, '') AS LikeVision,
	IFNULL(sp.SpouseName, '') AS SpouseName,
	IFNULL(sp.Child1Name, '') AS Child1Name,
	IFNULL(sp.Child1Age, '') AS Child1Age,
	IFNULL(sp.Child2Name, '') AS Child2Name,
	IFNULL(sp.Child2Age, '') AS Child2Age,
	IFNULL(sp.Child3Name, '') AS Child3Name,
	IFNULL(sp.Child3Age, '') AS Child3Age,
	IFNULL(sp.Child4Name, '') AS Child4Name,
	IFNULL(sp.Child4Age, '') AS Child4Age,
	IFNULL(sp.CountFamily, '') AS CountFamily,
	IFNULL(sp.SeqFamily, '') AS SeqFamily,
	CASE
		WHEN sp.PsikotestPlace != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isPsikotest,
	IFNULL(sp.PsikotestPlace, '') AS PsikotestPlace,
	IFNULL(sp.PsikotestTime, '') AS PsikotestTime,
	CASE
		WHEN sp.ReffName != '' THEN 'YA'
		ELSE 'TIDAK'
	END AS isReff,
	IFNULL(sp.ReffName, '') AS ReffName,
	IFNULL(sp.ReffDept, '') AS ReffDept,
	IFNULL(sp.ReffRelation, '') AS ReffRelation,
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
  sp.ApprovalBy
FROM
	sumbiri_pelamar sp
LEFT JOIN master_alamat_kabkota mak5 ON mak5.id_kabkota = sp.BirthPlace 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = sp.AddressKTPProvID 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = sp.AddressKTPKabKotaID AND mak.id_prov = sp.AddressKTPProvID 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = sp.AddressKTPKecamatanID 
LEFT JOIN master_alamat_provinsi map3 ON map3.id_prov = sp.AddressDOMProvID 
LEFT JOIN master_alamat_kabkota mak3 ON mak3.id_kabkota = sp.AddressDOMKabKotaID 
LEFT JOIN master_alamat_kecamatan mak4 ON mak4.id_kecamatan = sp.AddressDOMKecamatanID 
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