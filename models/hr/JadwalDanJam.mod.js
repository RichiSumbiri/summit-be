import { Op, QueryTypes, DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const MasterTypeCal = dbSPL.define(
  "master_calendar_type",
  {
    calendar_code: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    calendar_description: {
      type: DataTypes.STRING,
    },
    calendar_color: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "master_calendar_type",
    timestamps: false,
  }
);

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
    jk_scan_in_audit: {
      type: DataTypes.TIME,
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

export const qryGetEmpRef = `SELECT
	se.Nik,
	se.NamaLengkap,
  CONCAT(se.Nik,' - ',se.NamaLengkap) AS labelKaryawan
FROM sumbiri_employee se
WHERE se.StatusAktif = 0 AND (se.Nik LIKE :qry OR se.NamaLengkap LIKE :qry)
ORDER BY se.IDDepartemen, se.NamaLengkap `;

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

export const IndividuJadwal = dbSPL.define(
  "sumbiri_individu_schedule",
  {
    jadwalId_inv: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    Nik: {
      type: DataTypes.INTEGER,
    },
    scheduleDate_inv: {
      type: DataTypes.DATE,
    },
    jk_id: {
      type: DataTypes.INTEGER,
    },
    calendar: {
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
    tableName: "sumbiri_individu_schedule",
    timestamps: true,
  }
);

export const GroupJadwal = dbSPL.define(
  "sumbiri_group_schedule",
  {
    jadwalId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    scheduleDate: {
      type: DataTypes.DATE,
    },
    groupId: {
      type: DataTypes.INTEGER,
    },
    jk_id: {
      type: DataTypes.INTEGER,
    },
    calendar: {
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
    tableName: "sumbiri_group_schedule",
    timestamps: true,
  }
);

export const getGroupSCh = `SELECT 
	a.jadwalId,
	a.scheduleDate,
	a.groupId,
	a.jk_id,
	a.calendar,
	c.calendar_color,
	b.jk_nama,
	b.jk_color
FROM sumbiri_group_schedule a
LEFT JOIN master_jam_kerja b ON b.jk_id = a.jk_id
LEFT JOIN master_calendar_type c ON c.calendar_code = a.calendar
 WHERE a.scheduleDate BETWEEN :startDate AND :endDate AND a.groupId = :groupId `;

export const qrySchIndividu = `SELECT 
	fn.*,
	mjk.jk_nama,
	mjk.jk_in,
	mjk.jk_out,
	mjk.jk_color,
	c.calendar_color
FROM (
	SELECT 
		nx.jadwalId_inv, nx.scheduleDate, nx.Nik, nx.NamaLengkap, nx.groupId,
		CASE WHEN  nx.groupId = 0 THEN nx.calendar_indv ELSE nx.calendar_group END AS calendar,
		CASE WHEN  nx.groupId = 0 THEN nx.jadwal_indv ELSE nx.jadwal_group END AS jk_id
	FROM (
				SELECT 
				 MAX(nm.jadwalId_inv) jadwalId_inv,
				 MAX(nm.jadwalId) jadwalId,
			    nm.scheduleDate, 
			    nm.Nik, 
			    nm.NamaLengkap, 
			    nm.groupId,
			    MAX(nm.calendar_group) AS calendar_group,
			    MAX(nm.calendar_indv) AS calendar_indv, 
			    MAX(nm.jadwal_group) AS jadwal_group,
			    MAX(nm.jadwal_indv) AS jadwal_indv
			FROM (
			    SELECT  
			    	  0 jadwalId_inv,
			 		  sgs.jadwalId,
			        se.Nik, 
			        se.NamaLengkap, 
			        sgs.scheduleDate, 
			        seg.groupId, 
			        sgs.jk_id AS jadwal_group,
			        NULL AS jadwal_indv,
			        sgs.calendar AS calendar_group,
			        NULL AS calendar_indv
			    FROM sumbiri_employee se 
			    LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
			    LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId
			    WHERE se.Nik = :nik 
			      AND sgs.scheduleDate BETWEEN :startDate AND :endDate
			    
			    UNION ALL 
			
				SELECT  
			 		  sis.jadwalId_inv,
			 		  0 jadwalId, 
			        se.Nik, 
			        se.NamaLengkap, 
			        sis.scheduleDate_inv AS scheduleDate, 
			        0 AS groupId, 
			        NULL AS jadwal_group,
			        sis.jk_id AS jadwal_indv,
			        NULL AS calendar_group,
			        sis.calendar AS calendar_indv
			    FROM sumbiri_employee se 
			    LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik 
			    WHERE se.Nik = :nik  
			      AND sis.scheduleDate_inv BETWEEN :startDate AND :endDate
			) nm 
			GROUP BY 
			    nm.scheduleDate, nm.Nik, nm.NamaLengkap, nm.groupId

	) nx
) fn
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = fn.jk_id
LEFT JOIN master_calendar_type c ON c.calendar_code = fn.calendar
GROUP BY fn.scheduleDate`;
