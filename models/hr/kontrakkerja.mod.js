import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const sumbiriKontrakKerja = dbSPL.define('sumbiri_spkk', {
	IDSPKK: {
		type: DataTypes.STRING(100), // Represents 'varchar(100)'
		allowNull: false,
		primaryKey: true, // Set as primary key
	  },
	  Nik: {
		type: DataTypes.INTEGER, // Represents 'int(10)'
		allowNull: false,
	  },
	  NikKTP: {
		type: DataTypes.STRING(17), // Represents 'varchar(17)'
		allowNull: true, // DEFAULT NULL
	  },
	  PeriodeKontrak: {
		type: DataTypes.INTEGER, // Represents 'int(10)'
		allowNull: true,
		defaultValue: 3, // DEFAULT 3
	  },
	  StartKontrak: {
		type: DataTypes.DATEONLY, // Represents 'date'
		allowNull: false,
	  },
	  FinishKontrak: {
		type: DataTypes.DATEONLY, // Represents 'date'
		allowNull: false,
	  },
	  isActive: {
		type: DataTypes.ENUM('Y', 'N'), // Represents 'enum('Y','N')'
		allowNull: false,
	  },
	  Penanda: {
		type: DataTypes.STRING(100), // Represents 'varchar(100)'
		allowNull: true,
		defaultValue: 'Puji Astuti,S.E', // DEFAULT 'Puji Astuti,S.E'
	  },
	  CreateBy: {
		type: DataTypes.STRING(100), // Represents 'varchar(100)'
		allowNull: true, // DEFAULT NULL
	  },
	  CreateTime: {
		type: DataTypes.DATE, // Represents 'datetime'
		allowNull: true,
		defaultValue: DataTypes.NOW, // DEFAULT current_timestamp()
	  },
	  UpdateBy: {
		type: DataTypes.STRING(100), // Represents 'varchar(100)'
		allowNull: true, // DEFAULT NULL
	  },
	  UpdateTime: {
		type: DataTypes.DATE, // Represents 'datetime'
		allowNull: true, // DEFAULT NULL
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
	se.AlamatDetail,
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
export const queryLastSPKK 		= querySPKK + `WHERE ss.IDSPKK LIKE :formatSPKK ORDER BY ss.CreateTime DESC LIMIT 1`;
export const querySPKKbyNIK		= querySPKK + `WHERE ss.Nik = :NikEMP ORDER BY ss.StartKontrak ASC`;
export const queryExistingSPKK  = querySPKK + `WHERE ss.IDSPKK LIKE :formatSPKK AND ss.Nik = :empNik`;
