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
	se.NamaLengkap,
	se.TempatLahir,
	se.TanggalLahir,
	se.AlamatDetail,
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
	ss.CreateBy,
	ss.CreateDate 
FROM
	sumbiri_spkt ss
LEFT JOIN sumbiri_employee se ON se.Nik = ss.Nik 
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_alamat_provinsi map2 ON map2.id_prov = se.AlamatIDProv
LEFT JOIN master_alamat_kabkota mak ON mak.id_kabkota = se.AlamatIDKabKota 
LEFT JOIN master_alamat_kecamatan mak2 ON mak2.id_kecamatan = se.AlamatIDKecamatan 
`;


export const queryGetLastSPKT = queryListSPKT + ` WHERE ss.IDSPKT LIKE :formatSPKT ORDER BY ss.CreateDate DESC LIMIT 1`;