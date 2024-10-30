import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const sumbiriKontrakKerja = dbSPL.define('sumbiri_spkk', {
	IDSPKK: {
		type: DataTypes.STRING(100),
		allowNull: false,
		primaryKey: true,
	  },
	  Nik: {
		type: DataTypes.STRING(255),
		allowNull: false,
	  },
	  NikKTP: {
		type: DataTypes.STRING(255),
		allowNull: false,
	  }, 
	  PeriodeKontrak: {
		type: DataTypes.INTEGER,
		allowNull: true,
	  },
	  StartKontrak: {
		type: DataTypes.DATEONLY, // Use DATEONLY for date without time
		allowNull: false,
	  },
	  FinishKontrak: {
		type: DataTypes.DATEONLY,
		allowNull: false,
	  },
	  isActive: {
		type: DataTypes.ENUM('Y', 'N'),
		allowNull: false,
	  },
	  Penanda: {
		type: DataTypes.STRING(100),
		allowNull: true,
	  },
	  CreateBy: {
		type: DataTypes.STRING(100),
		allowNull: true,
	  },
	  CreateTime: {
		type: DataTypes.DATE,
		allowNull: true,
	  },
	}, {
	  modelName: 'SumbiriSpkk',
	  tableName: 'sumbiri_spkk',
	  timestamps: false, // Set to true if you want Sequelize to manage createdAt and updatedAt
	});

export const querySPKK = `SELECT
	ss.IDSPKK,
	ss.Nik,
	ss.NikKTP,
	se.NamaLengkap,
	se.TempatLahir,
	se.TanggalLahir,
	CASE 
		WHEN se.JenisKelamin = 0 THEN 'LAKI-LAKI'
		WHEN se.JenisKelamin = 1 THEN 'PEREMPUAN'
	END AS JenisKelamin,
	se.AlamatKelurahan,
	se.AlamatRT,
	se.AlamatRW,
	mak2.nama_kecamatan AS AlamatKecamatan,
	mak.nama_kabkota AS AlamatKabKota,
	md.NameDept AS NamaDepartemen,
	ms.Name AS NamaSubDepartemen,
	mp.Name AS Posisi,
	ss.PeriodeKontrak,
	ss.StartKontrak,
	ss.FinishKontrak,
	ss.Penanda,
	ss.CreateBy,
	ss.CreateTime,
	ss.UpdateBy,
	ss.UpdateTime
FROM
	sumbiri_spkk ss
LEFT JOIN sumbiri_employee se ON se.Nik = ss.Nik
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv 
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
`;

export const querySPKKbyRange 	= querySPKK + `WHERE DATE(ss.CreateTime) BETWEEN :startDate AND :endDate`;
export const queryLastSPKK 		= querySPKK + `WHERE ss.IDSPKK LIKE :formatSPKK ORDER BY ss.CreateTime, ss.IDSPKK DESC LIMIT 1`;
export const querySPKKbyNIK		= querySPKK + `WHERE ss.Nik = :NikEMP ORDER BY ss.StartKontrak ASC`;