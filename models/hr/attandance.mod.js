import { DataTypes } from "sequelize";
import { dbSPL, dbWdms } from "../../config/dbAudit.js";

export const LogAttandance = dbSPL.define(
  "sumbiri_log_attd",
  {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    Nik: {
      type: DataTypes.INTEGER,
    },
    log_date: {
      type: DataTypes.DATE,
    },
    // log_time: {
    //   type: DataTypes.TIME,
    // },
    log_status: {
      type: DataTypes.STRING,
    },
    log_machine_id: {
      type: DataTypes.STRING,
    },
    log_machine_name: {
      type: DataTypes.STRING,
    },
    log_by: {
      type: DataTypes.STRING,
    },
    log_punch: {
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
    tableName: "sumbiri_log_attd",
    timestamps: true,
  }
);

export const LogFromWdms = `SELECT a.emp_code, a.punch_time, a.punch_state, a.terminal_id, a.terminal_alias,  b.first_name
FROM   iclock_transaction a 
LEFT JOIN personnel_employee b ON a.emp_id = b.id
WHERE a.punch_time BETWEEN :startDateTime AND :endDateTime
-- GROUP BY a.emp_code,  a.punch_state
ORDER BY  a.terminal_id, a.punch_time
`;
// export const LogFromWdms = `SELECT a.emp_code, a.punch_time, a.punch_state, a.terminal_id
// FROM   iclock_transaction a
// WHERE a.terminal_sn IN ('SYZ8240300054') AND DATE(a.punch_time) = '2024-11-20'
// GROUP BY a.emp_code,  a.punch_state
// ORDER BY a.punch_time`

export const qrySchAttdComp = `SELECT 
	fn.*,
	CASE WHEN mjk.jk_out_day = 'N' THEN DATE_ADD(fn.scheduleDate, INTERVAL 1 DAY) 
	ELSE fn.scheduleDate END AS scanOutDate,
	mjk.jk_nama,
	mjk.jk_in,
	mjk.jk_out,
	mjk.jk_scan_in_audit,
	mjk.jk_scan_in_start,
	mjk.jk_scan_in_end,
	mjk.jk_scan_out_start,
	mjk.jk_scan_out_end,
	mjk.jk_scan_out_audit,
	mjk.jk_out_day, 
	mjk.jk_ot_1,
	mjk.jk_ot_2,
	mjk.jk_ot_3,
	d.id, 
	d.keterangan,
	d.scan_in,
	d.scan_out,
	d.ket_in,
	d.ket_out
FROM (
	SELECT 
		nx.jadwalId_inv, nx.scheduleDate, nx.Nik, nx.groupId,
		COALESCE(nx.calendar_indv, nx.calendar_group) AS calendar,
		COALESCE(nx.jadwal_indv, nx.jadwal_group) AS jk_id
	FROM (
				SELECT 
				 MAX(nm.jadwalId_inv) jadwalId_inv,
				 MAX(nm.jadwalId) jadwalId,
			    nm.scheduleDate, 
			    nm.Nik, 
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
			        sgs.scheduleDate, 
			        seg.groupId, 
			        sgs.jk_id AS jadwal_group,
			        NULL AS jadwal_indv,
			        sgs.calendar AS calendar_group,
			        NULL AS calendar_indv
			    FROM sumbiri_employee se 
			    LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
			    LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId
			    WHERE  sgs.scheduleDate BETWEEN  :startDate AND  :endDate  
			    
			    UNION ALL 
			
				SELECT  
			 		  sis.jadwalId_inv,
			 		  0 jadwalId, 
			        se.Nik, 
			        sis.scheduleDate_inv AS scheduleDate, 
			        0 AS groupId, 
			        NULL AS jadwal_group,
			        sis.jk_id AS jadwal_indv,
			        NULL AS calendar_group,
			        sis.calendar AS calendar_indv
			    FROM sumbiri_employee se 
			    LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik 
			    WHERE sis.scheduleDate_inv BETWEEN :startDate AND  :endDate 
			) nm 
			GROUP BY 
			    nm.scheduleDate, nm.Nik -- ,  nm.groupId dihapus karena untuk skip jadwal individu yang kosong

	) nx
) fn
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = fn.jk_id
LEFT JOIN master_calendar_type c ON c.calendar_code = fn.calendar
LEFT JOIN sumbiri_absens d ON d.Nik = fn.Nik 
	AND d.tanggal_in = fn.scheduleDate 
`;

//query get log untuk punch attd
export const qryLogForPunch = `SELECT 
a.*, DATE(a.log_date) logDate, TIME(a.log_date) logTime
FROM sumbiri_log_attd a 
WHERE date(a.log_date) BETWEEN :startDate AND :endDate --  AND a.Nik = '101608503'
AND log_punch IN (0, 4, 5)
-- GROUP BY date(a.log_date), a.Nik , a.log_status`;

export const Attandance = dbSPL.define(
  "sumbiri_absens",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Nik: {
      type: DataTypes.INTEGER,
    },
    groupId: {
      type: DataTypes.INTEGER,
    },
    jk_id: {
      type: DataTypes.INTEGER,
    },
    tanggal_in: {
      type: DataTypes.DATE,
    },
    tanggal_out: {
      type: DataTypes.DATE,
    },
    scan_in: {
      type: DataTypes.TIME,
    },
    scan_out: {
      type: DataTypes.TIME,
    },
    keterangan: {
      type: DataTypes.STRING,
    },
    calendar: {
      type: DataTypes.STRING,
    },
    ket_in: {
      type: DataTypes.STRING,
    },
    ket_out: {
      type: DataTypes.STRING,
    },
    ot: {
      type: DataTypes.INTEGER,
    },
    add_id: {
      type: DataTypes.INTEGER,
    },
    mod_id: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "sumbiri_absens",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export const MasterAbsentee = dbSPL.define(
  "master_absentee",
  {
    id_absen: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    code_absen: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name_absen: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type_absen: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    length_absen: {
      type: DataTypes.INTEGER(20),
      allowNull: true,
      defaultValue: null,
    },
    daymonth_absen: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    create_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "master_absentee",
    timestamps: false,
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  }
);

export const qrySplData = `SELECT ssm.spl_number, ssm.spl_date, ssm.spl_type, ssd.Nik, ssd.minutes/60 spl_jam
			FROM sumbiri_spl_main ssm
			LEFT JOIN sumbiri_spl_data ssd ON ssd.spl_number = ssm.spl_number
			WHERE  ssm.spl_date BETWEEN :startDate AND  :endDate  
`;

export const qrySbrLogAttd = `-- query untuk view log
SELECT 
 a.log_id,
 a.Nik,
 se.NamaLengkap,
 a.log_date,
 a.log_time,
 a.log_status,
 a.log_machine_id,
 a.log_machine_name,
 a.log_punch,
 b.log_punch_description,
 md.NameDept
FROM sumbiri_log_attd a 
LEFT JOIN sumbiri_employee se ON se.Nik = a.Nik
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
LEFT JOIN master_log_punch b ON a.log_punch = b.log_punch_id
WHERE a.log_date  BETWEEN :startDateTime AND  :endDateTime  
ORDER BY a.log_machine_id,  a.log_date `;

export const SchedulePunchAttd = dbSPL.define(
  "sumbiri_schedule_punch",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      // allowNull: false,
    },
    punch_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    execute_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    day_start: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    start_time_log: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    until_time_log: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    tableName: "sumbiri_schedule_punch",
    timestamps: false,
  }
);

export const qryDailyAbsensi = `WITH base_absen AS (
	SELECT 
	    se.Nik, 
		  se.NamaLengkap,
		  se.IDDepartemen,
		  se.IDSubDepartemen,
		  se.IDSection,
		  se.IDPosisi,
		  se.TanggalMasuk,
		  se.TanggalKeluar,
		  se.JenisKelamin,
		  se.StatusKaryawan,
      msd.Name subDeptName,
	    md.NameDept,
	    sgs.groupId,
      sis.jadwalId_inv,
	    COALESCE(sis.scheduleDate_inv, sgs.scheduleDate) AS scheduleDate,
	    COALESCE(sis.jk_id, sgs.jk_id) AS jk_id,
	    COALESCE(sis.calendar, sgs.calendar) AS calendar
	FROM sumbiri_employee se
	LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
	LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
	LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
	LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId AND sgs.scheduleDate = :date
	LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik AND sis.scheduleDate_inv = :date
	WHERE se.StatusAktif = 0 AND se.CancelMasuk = 'N' -- Karyawan saat ini tidak aktif
	  AND (se.TanggalKeluar IS NULL OR se.TanggalKeluar >= :date ) -- Belum keluar pada tanggal tertentu
	  AND se.TanggalMasuk <= :date
)
SELECT 
ba.Nik, 
ba.NamaLengkap,
ba.NameDept,
ba.IDDepartemen,
ba.IDSubDepartemen,
ba.subDeptName,
ba.IDSection,
ba.groupId,
ba.TanggalMasuk,
ba.TanggalKeluar,
ba.JenisKelamin,
ba.StatusKaryawan,
mp.Name AS jabatan,
ba.jadwalId_inv,
ba.scheduleDate,
sgs.groupName,
ba.jk_id,
mjk.jk_nama,
-- mjk2.jk_nama jk_aktual,
mjk.jk_in,
mjk.jk_out,
mjk.jk_out_day,
ba.calendar,
sa.jk_id jk_id_absen,
sa.id, 
sa.tanggal_in,
sa.tanggal_out,
sa.scan_in,
sa.scan_out,
sa.ot,
sa.ket_in,
sa.ket_out,
sa.keterangan,
sa.createdAt,
sa.mod_id,
sa.updatedAt,
msts.Name AS NamaSection
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN master_jam_kerja mjk2 ON mjk2.jk_id = sa.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
`;

export const getLemburForAbsen = `
  SELECT 
ssm.spl_number, ssm.spl_type, spl.Nik, spl.minutes/60 jam, spl.start, spl.finish
FROM sumbiri_spl_main ssm
JOIN sumbiri_spl_data spl ON spl.spl_number = ssm.spl_number
WHERE ssm.spl_date = :date AND ssm.spl_approve_hrd = 1 AND ssm.spl_active = 1
GROUP BY ssm.spl_date, spl.Nik
`;
export function getLemburForAbsNik(date, arrNik) {
  const stringNik = arrNik.map((st) => `'${st}'`).join(",");
  return `
  SELECT 
ssm.spl_number, ssm.spl_type, spl.Nik, spl.minutes/60 jam, spl.start, spl.finish
FROM sumbiri_spl_main ssm
JOIN sumbiri_spl_data spl ON spl.spl_number = ssm.spl_number
WHERE ssm.spl_date = '${date}' AND spl.Nik IN (${stringNik})
AND ssm.spl_approve_hrd = 1 AND ssm.spl_active = 1
GROUP BY ssm.spl_date, spl.Nik
`;
}
export const getLemburForEmpOne = `
  SELECT 
ssm.spl_number, ssm.spl_date, ssm.spl_type, spl.Nik, spl.minutes/60 jam, spl.start, spl.finish
FROM sumbiri_spl_main ssm
JOIN sumbiri_spl_data spl ON spl.spl_number = ssm.spl_number
WHERE spl.Nik = :nik AND ssm.spl_date BETWEEN :startDate AND :endDate AND ssm.spl_approve_hrd = 1 AND ssm.spl_active = 1
GROUP BY ssm.spl_date, spl.Nik
`;
export const karyawanOut = `SELECT COUNT(*) AS karyawanOut FROM sumbiri_employee se WHERE se.TanggalKeluar = :date`;

export const baseMpSewing = `WITH base_absen AS (
	SELECT 
	    se.Nik, 
		  se.NamaLengkap,
		  se.IDDepartemen,
		  se.IDSubDepartemen,
		  se.IDSection,
		  se.TanggalMasuk,
		  se.TanggalKeluar,
		  se.JenisKelamin,
		  se.StatusKaryawan,
      msd.Name subDeptName,
      md.NameDept,
      sgs.groupId,
      sis.jadwalId_inv,
      se.IDSiteline,
      se.IDPosisi,
	    CASE WHEN sis.jk_id THEN sis.jk_id ELSE sgs.jk_id END AS jk_id,
	    CASE WHEN sis.calendar THEN sis.calendar  ELSE sgs.calendar END AS calendar
	FROM sumbiri_employee se
	LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
	LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
	LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
	LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId AND sgs.scheduleDate = :date
	LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik AND sis.scheduleDate_inv = :date
	WHERE se.StatusAktif = 0  AND se.CancelMasuk = 'N' AND se.IDDepartemen = '100103'
	  AND (se.TanggalKeluar IS NULL OR se.TanggalKeluar >= :date ) -- Belum keluar pada tanggal tertentu
	  AND se.TanggalMasuk <= :date
    AND se.IDPosisi = 6
)
-- msts AS (
-- 	SELECT DISTINCT ms.IDSection, ms.SITE_NAME, ms.LINE_NAME, ms.CUS_NAME FROM master_siteline ms
-- 	GROUP BY ms.IDSection
-- )
SELECT 
ba.Nik, 
ba.NamaLengkap,
ba.NameDept,
ba.IDDepartemen,
ba.IDSubDepartemen,
ba.subDeptName,
ba.IDSection,
ba.groupId,
ba.TanggalMasuk,
ba.TanggalKeluar,
ba.JenisKelamin,
ba.StatusKaryawan,
ba.jadwalId_inv,
ba.IDSiteline,
msts.SiteName SITE_NAME,
msts.CusName CUS_NAME,
mst.LINE_NAME,
sgs.groupName,
ba.jk_id,
mjk.jk_nama,
mjk.jk_in,
ba.calendar,
sa.jk_id jk_id_absen,
sa.id, 
sa.tanggal_in,
sa.tanggal_out,
sa.scan_in,
sa.ot,
sa.scan_out,
sa.ket_in,
sa.ket_out,
sa.keterangan,
mp.Name
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
LEFT JOIN master_siteline mst ON mst.IDSiteline = ba.IDSiteline
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
WHERE mjk.jk_in < CURTIME()
`;

export const karyawanOutSewing = `SELECT 
    se.IDSection, ms.SiteName, ms.CusName,
    COUNT(se.TanggalKeluar) AS karyawanOut -- ,
    -- COUNT(CASE WHEN se.TanggalMasuk = :date THEN 1 END) AS karyawanIn
FROM sumbiri_employee se
LEFT JOIN master_section ms ON ms.IDSection = se.IDSection
WHERE se.TanggalKeluar = :date AND se.IDDepartemen = '100103' AND se.IDPosisi = 6
GROUP BY se.IDSection`;

export const allDeptTtl = `
  SELECT COUNT(se.Nik) AS ttlemp
  FROM sumbiri_employee se
  WHERE se.StatusAktif = 0   AND se.CancelMasuk = 'N'
	  AND (se.TanggalKeluar IS NULL OR se.TanggalKeluar >= :date ) -- Belum keluar pada tanggal tertentu
	  AND se.TanggalMasuk <= :date`;

export const SewingLineHR = `SELECT DISTINCT a.SITE, a.SITE_NAME,  a.CUS_NAME, a.LINE_NAME, a.ID_SITELINE FROM item_siteline a`;

export const qryAbsVerif = `WITH base_absen AS (
	SELECT 
	    se.Nik, 
		  se.NamaLengkap,
		  se.IDDepartemen,
		  se.IDSubDepartemen,
		  se.IDSection,
		  se.IDPosisi,
        msd.Name subDeptName,
	     md.NameDept,
	    sgs.groupId,
       sis.jadwalId_inv,
	    CASE WHEN sis.jk_id THEN sis.jk_id ELSE sgs.jk_id END AS jk_id,
	    CASE WHEN sis.calendar THEN sis.calendar  ELSE sgs.calendar END AS calendar
	FROM sumbiri_employee se
	LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
	LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
	LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
	LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId AND sgs.scheduleDate = :date
	LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik AND sis.scheduleDate_inv = :date
	WHERE se.StatusAktif = 0  AND se.CancelMasuk = 'N' -- Karyawan saat ini tidak aktif
	  AND (se.TanggalKeluar IS NULL OR se.TanggalKeluar >= :date) -- Belum keluar pada tlocalanggal tertentu
	  AND se.TanggalMasuk <= :date
),
absente AS (
	SELECT 
		sa.id, 
		sa.Nik,
		sa.tanggal_in,
		sa.tanggal_out,
		sa.scan_in,
		sa.scan_out,
		sa.ket_in,
		sa.ket_out,
		sa.ot,
		sa.keterangan
	FROM sumbiri_absens sa 
	WHERE  sa.tanggal_in= :date
--	AND (sa.scan_in IS NULL OR sa.scan_out IS NULL)
  -- AND sa.keterangan IS NULL
)
SELECT 
ba.Nik, 
ba.NamaLengkap,
ba.NameDept,
ba.IDDepartemen,
ba.IDSubDepartemen,
ba.subDeptName,
ba.IDSection,
msts.Name AS NamaSection,
ba.groupId,
mp.Name AS jabatan,
ba.jadwalId_inv,
sgs.groupName,
ba.jk_id,
mjk.idGroup,
mjk.jk_nama,
ba.calendar,
sa.tanggal_in,
sa.tanggal_out,
sa.id AS id_absen,
sa.scan_in,
sa.scan_out,
sa.ket_in,
sa.ket_out,
sa.keterangan,
sav.scan_in AS scan_in_ver,
sav.scan_out AS scan_out_ver,
sav.keterangan AS keterangan_ver,
sav.ket_in AS ket_in_ver,
sav.ket_out AS ket_out_ver,
sav.id id_verif,
sav.verifikasi -- ,
-- sav.add_id,
-- sav.mod_id,
-- sav.createdAt,
-- sav.updatedAt
FROM base_absen ba
LEFT JOIN absente AS sa ON sa.Nik = ba.Nik 
LEFT JOIN sumbiri_absen_verif sav ON sav.Nik = ba.Nik AND sav.tanggal_in = :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
-- LEFT JOIN master_jam_kerja mjk2 ON mjk2.jk_id = sa.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
WHERE ba.calendar <> 'HL'
`;

export const queryPureVerifAbs = `SELECT 
sav.id id_verif,
sa.id AS id_absen,
se.Nik,
se.NamaLengkap,
sav.jk_id,
sav.tanggal_in,
sav.scan_in,
sav.tanggal_out,
sav.scan_out,
sav.keterangan,
sav.ket_in,
sav.ket_out,
sav.remark,
sav.verifikasi,
mjk.jk_nama,
mjk.idGroup,
ms.Name AS NamaSection,
msd.Name AS subDeptName,
ms.IDSection,
mp.Name AS jabatan
FROM 
sumbiri_absen_verif sav
LEFT JOIN sumbiri_employee se ON se.Nik = sav.Nik
LEFT JOIN sumbiri_absens sa ON sa.Nik = sav.Nik AND sa.tanggal_in = :date
LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
LEFT JOIN master_section ms ON ms.IDSection = se.IDSection
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = sav.jk_id 
LEFT JOIN master_position mp ON mp.IDPosition = se.IDPosisi
WHERE sav.tanggal_in = :date`;

export const VerifAbsen = dbSPL.define(
  "sumbiri_absen_verif",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Nik: {
      type: DataTypes.INTEGER,
    },
    jk_id: {
      type: DataTypes.INTEGER,
    },
    tanggal_in: {
      type: DataTypes.DATE,
    },
    tanggal_out: {
      type: DataTypes.DATE,
    },
    scan_in: {
      type: DataTypes.TIME,
    },
    scan_out: {
      type: DataTypes.TIME,
    },
    keterangan: {
      type: DataTypes.STRING,
    },
    ket_in: {
      type: DataTypes.STRING,
    },
    ket_out: {
      type: DataTypes.STRING,
    },
    remark: {
      type: DataTypes.STRING,
    },
    verifikasi: {
      type: DataTypes.INTEGER,
    },
    add_id: {
      type: DataTypes.INTEGER,
    },
    mod_id: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "sumbiri_absen_verif",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  },
  {
    uniqueKeys: {
      unique_absen: {
        fields: ["Nik", "tanggal_in"],
      },
    },
  }
);

export const qryGetEmpInExpand = `SELECT 
    se.IDSection, ms.CusName, se.Nik, se.NamaLengkap, se.IDSubDepartemen, msd.Name AS subDept
FROM sumbiri_employee se
LEFT JOIN master_section ms ON ms.IDSection = se.IDSection
LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
WHERE se.TanggalMasuk = :date AND se.CancelMasuk = 'N' AND se.IDDepartemen = '100103'  AND se.IDPosisi = 6`;
export const qryGetEmpOutExpand = `SELECT 
    se.IDSection, ms.CusName, se.Nik, se.NamaLengkap, se.IDSubDepartemen, msd.Name AS subDept
FROM sumbiri_employee se
LEFT JOIN master_section ms ON ms.IDSection = se.IDSection
LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
WHERE se.TanggalKeluar = :date AND se.IDDepartemen = '100103' AND se.IDPosisi = 6`;

export const qryDtlMpByLineToday = (strings, aditional) => {
  return `WITH base_absen AS (
	SELECT 
	    se.Nik, 
		  se.NamaLengkap,
		  se.IDDepartemen,
		  se.IDSubDepartemen,
		  se.IDSection,
		  se.TanggalMasuk,
		  se.TanggalKeluar,
		  se.JenisKelamin,
		  se.StatusKaryawan,
        msd.Name subDeptName,
	     md.NameDept,
	     sgs.groupId,
        sis.jadwalId_inv,
        se.IDSiteline,
        se.IDPosisi,
	    CASE WHEN sis.jk_id THEN sis.jk_id ELSE sgs.jk_id END AS jk_id,
	    CASE WHEN sis.calendar THEN sis.calendar  ELSE sgs.calendar END AS calendar
	FROM sumbiri_employee se
	JOIN master_section msts ON msts.IDSection = se.IDSection
	LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
	LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
	LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
	LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId AND sgs.scheduleDate = :date
	LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik AND sis.scheduleDate_inv = :date
	WHERE se.StatusAktif = 0  AND se.CancelMasuk = 'N' AND se.IDDepartemen = '100103'
    AND se.IDPosisi = 6
	  AND (se.TanggalKeluar IS NULL OR se.TanggalKeluar >= :date ) -- Belum keluar pada tanggal tertentu
	  AND se.TanggalMasuk <= :date
    ${strings}
)
${aditional}
`;
};

export const additonalToday = `SELECT 
msts.SiteName SITE_NAME,
msts.CusName CUS_NAME,	
ba.IDSubDepartemen,
ba.subDeptName,	
COUNT(ba.Nik) total_emp,
COUNT(sa.scan_in) total_hadir
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
WHERE mjk.jk_in < CURTIME()
GROUP BY msts.SiteName ,
msts.CusName, ba.subDeptName`;

export const additonalPast = `
SELECT 
msts.SiteName SITE_NAME,
msts.CusName CUS_NAME,	
ba.IDSubDepartemen,
ba.subDeptName,	
COUNT(ba.Nik) total_emp,
COUNT(sa.scan_in) total_hadir
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
GROUP BY msts.SiteName ,
msts.CusName, ba.subDeptName`;

export const additonalLineNoCountTod = `SELECT 
ba.IDSubDepartemen,
ba.subDeptName,	
ba.Nik,
ba.NamaLengkap,
sa.scan_in, 
sa.scan_out,
sa.keterangan
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
WHERE mjk.jk_in < CURTIME()
`;

export const additonalLineNoCountPast = `SELECT 
ba.IDSubDepartemen,
ba.subDeptName,	
ba.Nik,
ba.NamaLengkap,
sa.scan_in, 
sa.scan_out,
sa.keterangan
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
`;

export const qryAbsenIndividu = `SELECT 
  fn.jadwalId_inv,
  fn.scheduleDate,
  fn.Nik,
  fn.NamaLengkap,
  fn.groupId,
  COALESCE(sa.calendar, fn.calendar) AS calendar,
  COALESCE(sa.jk_id, fn.jk_id) AS jk_id,
  mjk.jk_nama,
  mjk.jk_in,
  mjk.jk_out,
  sa.keterangan,
  sa.scan_in,
  sa.scan_out,
  sa.id,
  sa.ot,
	mjk.jk_color,
	c.calendar_color
FROM (
	SELECT 
		nx.jadwalId_inv, nx.scheduleDate, nx.Nik, nx.NamaLengkap, nx.groupId,
        COALESCE(nx.calendar_indv, nx.calendar_group) AS calendar,
		    COALESCE(nx.jadwal_indv, nx.jadwal_group) AS jk_id
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
			    nm.scheduleDate, nm.Nik, nm.NamaLengkap 

	) nx
) fn
LEFT JOIN sumbiri_absens sa ON sa.Nik = fn.Nik AND sa.tanggal_in = fn.scheduleDate
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = COALESCE(sa.jk_id, fn.jk_id)
LEFT JOIN master_calendar_type c ON c.calendar_code =  COALESCE(sa.calendar, fn.calendar)
GROUP BY fn.scheduleDate`;

export function qryGetVerifByNik(date, arrNik) {
  const stringNik = arrNik.map((st) => `'${st}'`).join(",");
  return `WITH base_absen AS (
	SELECT 
	    se.Nik, 
		  se.NamaLengkap,
		  se.IDDepartemen,
		  se.IDSubDepartemen,
		  se.IDSection,
		  se.IDPosisi,
        msd.Name subDeptName,
	     md.NameDept,
	    sgs.groupId,
       sis.jadwalId_inv,
	    CASE WHEN sis.jk_id THEN sis.jk_id ELSE sgs.jk_id END AS jk_id,
	    CASE WHEN sis.calendar THEN sis.calendar  ELSE sgs.calendar END AS calendar
	FROM sumbiri_employee se
	LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
	LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
	LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
	LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId AND sgs.scheduleDate = '${date}'
	LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik AND sis.scheduleDate_inv = '${date}'
	WHERE se.Nik IN (${stringNik})
),
absente AS (
	SELECT 
		sa.id, 
		sa.Nik,
		sa.tanggal_in,
		sa.tanggal_out,
		sa.scan_in,
		sa.scan_out,
		sa.ket_in,
		sa.ket_out,
		sa.keterangan
	FROM sumbiri_absens sa 
	WHERE  sa.tanggal_in= '${date}' AND sa.Nik IN (${stringNik})
--	AND (sa.scan_in IS NULL OR sa.scan_out IS NULL)
  -- AND sa.keterangan IS NULL
)
SELECT 
ba.Nik, 
ba.NamaLengkap,
ba.NameDept,
ba.IDDepartemen,
ba.IDSubDepartemen,
ba.subDeptName,
ba.IDSection,
msts.Name AS NamaSection,
ba.groupId,
mp.Name AS jabatan,
ba.jadwalId_inv,
sgs.groupName,
ba.jk_id,
mjk.idGroup,
mjk.jk_nama,
ba.calendar,
sa.tanggal_in,
sa.tanggal_out,
sa.id AS id_absen,
sa.scan_in,
sa.scan_out,
sa.ket_in,
sa.ket_out,
sa.keterangan,
sav.scan_in AS scan_in_ver,
sav.scan_out AS scan_out_ver,
sav.keterangan AS keterangan_ver,
sav.ket_in AS ket_in_ver,
sav.ket_out AS ket_out_ver,
sav.id id_verif,
sav.verifikasi -- ,
-- sav.add_id,
-- sav.mod_id,
-- sav.createdAt,
-- sav.updatedAt
FROM base_absen ba
LEFT JOIN absente AS sa ON sa.Nik = ba.Nik 
LEFT JOIN sumbiri_absen_verif sav ON sav.Nik = ba.Nik AND sav.tanggal_in = '${date}'
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
-- LEFT JOIN master_jam_kerja mjk2 ON mjk2.jk_id = sa.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
LEFT JOIN master_section msts ON msts.IDSection = ba.IDSection
LEFT JOIN master_position mp ON mp.IDPosition = ba.IDPosisi

`;
}

export const queryGetDtlLog = `select sla.*, mlp.log_punch_description  
from sumbiri_log_attd sla 
left join master_log_punch mlp on sla.log_punch = mlp.log_punch_id 
where sla.Nik = :Nik and DATE(sla.log_date) BETWEEN :startDate AND :endDate`;

/// query absen month
export const getListSecAndSubDeptByAbsen = `
WITH aktiveSection AS (
	SELECT 
    se.IDSection,
    se.IDDepartemen,
    se.IDSubDepartemen
	FROM sumbiri_absens sa
	JOIN sumbiri_employee se ON se.Nik = sa.Nik
	WHERE MONTH(sa.tanggal_in) = :monthNum
	AND YEAR(sa.tanggal_in) = :yearNum
	GROUP BY se.IDSection,
    se.IDSubDepartemen
) SELECT 
	sec.IDSection,
	sec.IDDepartemen,
    sec.IDSubDepartemen,
    ms.Name as sectionName,
    md.NameDept as deptName,
    ms2.Name as subDeptName
FROM aktiveSection AS sec 
JOIN master_section ms ON ms.IDSection = sec.IDSection
JOIN master_department md ON md.IdDept  = sec.IDDepartemen
JOIN master_subdepartment ms2 ON ms2.IDSubDept = sec.IDSubDepartemen

`

export const getBaseAbsMonth = `SELECT 
	sa.tanggal_in,
    sa.Nik,
    se.NamaLengkap,
  	sa.keterangan,
    sa.calendar,
    sa.jk_id,
    sa.ket_in,
    sa.ket_out,
  	DATE_FORMAT(sa.scan_in, '%H:%i') AS scan_in,
  	DATE_FORMAT(sa.scan_out, '%H:%i') AS scan_out,
  	sa.ot,
    sa.id
FROM sumbiri_absens sa
JOIN sumbiri_employee se ON se.Nik = sa.Nik
WHERE MONTH(sa.tanggal_in) = :monthNum 
AND YEAR(sa.tanggal_in) = :yearNum
AND se.IDSection = :idSection
AND se.IDSubDepartemen = :idSubDept;`