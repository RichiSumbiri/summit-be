import { DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const SumbiriPelamar =  dbSPL.define('sumbiri_pelamar', {
  NikKTP: {
    type: DataTypes.STRING(16),
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
  AddressIdProv: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressIdKabKota: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressIdKecamatan: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressIdKelurahan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  AddressKTPRT: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressKTPRW: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressKTPDetail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isKTPCurrent: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  AddressIdProvTgl: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressIdKabKotaTgl: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressIdKecamatanTgl: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressIdKelurahanTgl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  AddressCurrentRT: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressCurrentRW: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  AddressCurrentDetail: {
    type: DataTypes.TEXT,
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
    type: DataTypes.TEXT,
    allowNull: true
  },
  MotherName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  MotherJob: {
    type: DataTypes.TEXT,
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
  EduSDPlace: {
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
  EduSMPPlace: {
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
  EduSMAPlace: {
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
    type: DataTypes.STRING(10),
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
    type: DataTypes.STRING(10),
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
    type: DataTypes.DECIMAL(15, 2),
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
    type: DataTypes.DECIMAL(15, 2),
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
    type: DataTypes.DECIMAL(15, 2),
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
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Child2Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child2Age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Child3Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child3Age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Child4Name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Child4Age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  CountFamily: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  SeqFamily: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.DECIMAL(15, 2),
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
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  isReadyPlacement: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  CreateDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true
  }
  }, {
    tableName: 'sumbiri_pelamar',
    timestamps: false,
  });

export const findLamaranByDate = `
SELECT
	sp.NikKTP,
	sp.PassKey,
	sp.FullName,
	sp.Position,
	sp.BirthPlace,
	sp.BirthDate,
	sp.Phone,
	sp.Email,
	map2.nama_prov AS KTPProvinsi,
	mak.nama_kabkota AS AlamatKTPKabKota,
	mak2.nama_kecamatan AS AlamatKTPKecamatan,
  sp.AddressKTPKelurahan,
	CONCAT(sp.AddressKTPRT,'/',sp.AddressKTPRW) AS AlamatKTPRTRW,
  	sp.AddressKTPDetail AS AlamatKTPDetail,
	CASE
    	WHEN sp.isKTPCurrent = 0 THEN CONCAT(sp.AddressKTPDetail, ', RT', sp.AddressKTPRT ,' RW', sp.AddressKTPRW , ', ' , mak2.nama_kecamatan, ', ', mak.nama_kabkota)
    	WHEN sp.isKTPCurrent = 1 THEN CONCAT(sp.AddressCurrentDetail, ', RT ',sp.AddressCurrentRT,' RW ', sp.AddressCurrentRW,', ',sp.AddressCurrentKelurahan, ', ',mak4.nama_kecamatan,', ',mak3.nama_kabkota)
    	ELSE ''
  END AS AlamatDomisili,
  sp.BloodType,
	sp.FatherName,
	sp.FatherJob,
	sp.MotherName,
	sp.MotherJob,
	sp.ParentAddress,
	sp.ParentPhone,
	sp.EduSDName,
  sp.EduSDCity,
	sp.EduSDYear,
	sp.EduSDType,
	sp.EduSMPName,
  sp.EduSMPCity,
	sp.EduSMPType,
	sp.EduSMPYear,
	sp.EduSMAName,
  sp.EduSMACity,
	sp.EduSMAType,
	sp.EduSMAYear,
	sp.EduD3Name,
  sp.EduD3City,
	sp.EduD3Type,
	sp.EduD3Year,
	sp.EduS1Name,
  sp.EduS1City,
	sp.EduS1Type,
	sp.EduS1Year,
	CASE
    	WHEN sp.Kursus1Topic != '' OR sp.Kursus2Topic != '' THEN 'YA'
    	ELSE 'TIDAK'
  END AS isKursus,
  sp.Kursus1Topic,
	sp.Kursus1Location,
	sp.Kursus1Periode,
  sp.Kursus1Place,
	sp.Kursus2Topic,
	sp.Kursus2Location,
	sp.Kursus2Periode,
  sp.Kursus2Place,
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
  sp.Work3Reason,
	CASE
    	WHEN sp.Org1Name != '' OR sp.Org2Name != '' OR sp.Org3Name != '' THEN 'YA'
    	ELSE 'TIDAK'
  END AS isOrganisation,
  sp.Org1Name,
	sp.Org1Position,
	sp.Org1Periode,
	sp.Org1Place,
	sp.Org2Name,
	sp.Org2Position,
	sp.Org2Periode,
	sp.Org2Place,
	sp.Org3Name,
	sp.Org3Position,
	sp.Org3Periode,
	sp.Org3Place,
	sp.LikeSports,
	sp.LikeArts,
	sp.LikeHobby,
	sp.LikeVision,
	sp.SpouseName,
	sp.Child1Name,
	sp.Child1Age,
	sp.Child2Name,
	sp.Child2Age,
	sp.Child3Name,
	sp.Child3Age,
	sp.Child4Name,
	sp.Child4Age,
	sp.CountFamily,
	sp.SeqFamily,
  CASE
    	WHEN sp.PsikotestPlace != '' THEN 'YA'
    	ELSE 'TIDAK'
  END AS isPsikotest,
	sp.PsikotestPlace,
	sp.PsikotestTime,
	CASE
    	WHEN sp.ReffName != '' THEN 'YA'
    	ELSE 'TIDAK'
  END AS isReff,
  sp.ReffName,
	sp.ReffDept,
	sp.ReffRelation,
	sp.ExpectedSalary,
	sp.ExpectedTMB,
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
  DATE(sp.CreateDate) AS TanggalLamaran,
  sp.CreateDate AS Timestamp,
	DATE_FORMAT(sp.CreateDate, '%Y-%m-%d %H:%i:%s') AS CreateDate
FROM
	sumbiri_pelamar sp
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = sp.AddressIdProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = sp.AddressIdKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = sp.AddressIdKecamatan 
LEFT JOIN master_alamat_provinsi map3 ON map3.id_prov = sp.AddressIdProvTgl
LEFT JOIN master_alamat_kabkota mak3 ON mak3.id_kabkota = sp.AddressIdKabKotaTgl 
LEFT JOIN master_alamat_kecamatan mak4 ON mak4.id_kecamatan = sp.AddressIdKecamatanTgl 
WHERE DATE(sp.CreateDate) = :tglLamaran
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