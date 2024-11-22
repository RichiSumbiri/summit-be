import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { dbSPL } from "../../config/dbAudit.js";

export const queryEmpResignSPK = `
SELECT
	spk.id_spk,
	spk.Nik,
	se.NamaLengkap,
	se.IDDepartemen,
	md.NameDept AS NamaDepartemen,
	se.IDPosisi,
	mp.Name AS NamaPosisi,
	se.StatusKaryawan,
	se.TanggalMasuk,
	se.TanggalKeluar,
	CONCAT(
    IF(TIMESTAMPDIFF(YEAR, se.TanggalMasuk, se.TanggalKeluar) > 0, 
       CONCAT(TIMESTAMPDIFF(YEAR, se.TanggalMasuk, se.TanggalKeluar), ' TAHUN', 
              IF(TIMESTAMPDIFF(YEAR, se.TanggalMasuk, se.TanggalKeluar) > 1, '', ''), ', '), 
       ''),
    IF(TIMESTAMPDIFF(MONTH, se.TanggalMasuk, se.TanggalKeluar) % 12 > 0, 
       CONCAT(TIMESTAMPDIFF(MONTH, se.TanggalMasuk, se.TanggalKeluar) % 12, ' BULAN', 
              IF(TIMESTAMPDIFF(MONTH, se.TanggalMasuk, se.TanggalKeluar) % 12 > 1, '', ''), ', '), 
       ''),
    IF(DATEDIFF(se.TanggalKeluar, DATE_ADD(se.TanggalMasuk, INTERVAL TIMESTAMPDIFF(MONTH, se.TanggalMasuk, se.TanggalKeluar) MONTH)) > 0, 
       CONCAT(DATEDIFF(se.TanggalKeluar, DATE_ADD(se.TanggalMasuk, INTERVAL TIMESTAMPDIFF(MONTH, se.TanggalMasuk, se.TanggalKeluar) MONTH)), ' HARI', 
              IF(DATEDIFF(se.TanggalKeluar, DATE_ADD(se.TanggalMasuk, INTERVAL TIMESTAMPDIFF(MONTH, se.TanggalMasuk, se.TanggalKeluar) MONTH)) > 1, '', ''), ''), 
       '')
  ) AS MasaKerja,
	DATE(spk.CreateDate) AS TanggalDokumen,
	spk.FlagReason,
	spk.CreateBy,
	spk.CreateDate,
	spk.Remark
FROM
	sumbiri_spk spk
LEFT JOIN sumbiri_employee se ON
	se.Nik = spk.Nik
LEFT JOIN master_department md ON
	md.IdDept = se.IDDepartemen
LEFT JOIN master_position mp ON
	mp.IDPosition = se.IDPosisi
WHERE
	DATE(spk.CreateDate) BETWEEN :startDate AND :endDate
ORDER BY
	spk.CreateDate DESC
`;

export const queryLastEmpResignSPK = `SELECT * FROM sumbiri_spk WHERE id_spk LIKE :formatSPK ORDER BY CreateDate DESC LIMIT 1  `;


export const sumbiriSPK = dbSPL.define('sumbiri_spk', {
	id_spk: {
	  type: DataTypes.STRING(255),
	  allowNull: false,
	  primaryKey: true,
	},
	Nik: {
	  type: DataTypes.INTEGER(200),
	  allowNull: false,
	},
	FlagReason: {
	  type: DataTypes.STRING(200),
	  allowNull: true,
	  defaultValue: null,
	},
	Remark: {
		type: DataTypes.STRING(100),
		allowNull: true,
		defaultValue: null,
	  },
	CreateBy: {
	  type: DataTypes.STRING(200),
	  allowNull: true,
	  defaultValue: null,
	},
	CreateDate: {
	  type: DataTypes.DATE,
	  allowNull: true,
	  defaultValue: null,
	},
  }, {
	tableName: 'sumbiri_spk',
	timestamps: false,
	freezeTableName: true,
	charset: 'utf8mb4',
	collate: 'utf8mb4_general_ci',
  });