import { Op, QueryTypes, DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const MasterJamKerja = dbSPL.define(
  "master_jam_kerja",
  {
    jk_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jk_nama: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: true,
      defaultValue: null,
    },
    jk_in: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_out: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_in_day: {
      type: DataTypes.ENUM("C", "N"),
      allowNull: true,
      defaultValue: null,
      comment: "C for current N for Next day",
    },
    jk_out_day: {
      type: DataTypes.ENUM("C", "N"),
      allowNull: true,
      defaultValue: null,
      comment: "C for current N for Next day",
    },
    jk_toleransi_in: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_toleransi_out: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_in_start: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_in_end: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_out_start: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_scan_out_end: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_duration_day: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "hitungan satuan hari",
    },
    jk_duration_minute: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: "hitungan satuan menit",
    },
    jk_duration_hour: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_start_rest: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_end_rest: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_start_rest_ot: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_end_rest_ot: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: null,
    },
    jk_rest_ot_type: {
      type: DataTypes.ENUM("BH", "AH"),
      allowNull: true,
      defaultValue: null,
    },
    jk_rest_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_rest_ot_duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    jk_tunjangan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    jk_percent_tunjangan: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
    },
    add_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    mod_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "master_jam_kerja",
    timestamps: true,
  }
);

export const GroupShift = dbSPL.define(
  "sumbiri_group_shift",
  {
    groupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    groupCode: {
      type: DataTypes.STRING,
    },
    groupName: {
      type: DataTypes.STRING,
    },
    groupDescription: {
      type: DataTypes.STRING,
    },
    groupColor: {
      type: DataTypes.STRING,
    },
    add_id: {
      type: DataTypes.INTEGER,
    },
    mod_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "sumbiri_group_shift",
    timestamps: true,
  }
);

export const qryListEmpActv = `SELECT
	se.Nik,
	se.NikKTP,
	se.NPWP,
	se.NamaLengkap,
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
	seg.groupId,
	sgs.groupName
FROM sumbiri_employee se
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection = se.IDSection 
LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId
WHERE se.StatusAktif = 0 
ORDER BY se.IDDepartemen, se.NamaLengkap`;

export const qryGetMemberGroup = `SELECT
	se.Nik,
	se.NikKTP,
	se.NPWP,
	se.NamaLengkap,
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
	seg.groupId,
	sgs.groupName
FROM sumbiri_employee se
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = se.IDSubDepartemen 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi 
LEFT JOIN master_section ms2 ON ms2.IDSection = se.IDSection 
JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
LEFT JOIN sumbiri_group_shift sgs ON sgs.groupId = seg.groupId
WHERE se.StatusAktif = 0 AND seg.groupId = :groupId
ORDER BY se.IDDepartemen, se.NamaLengkap`;

export const EmpGroup = dbSPL.define(
  "sumbiri_employee_group",
  {
    Nik: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
    },
    add_id: {
      type: DataTypes.INTEGER,
    },
    mod_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "sumbiri_employee_group",
    timestamps: true,
  }
);
