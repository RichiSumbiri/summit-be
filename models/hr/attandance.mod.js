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
`
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
	mjk.jk_out_day, 
	d.id, 
	d.keterangan,
	d.scan_in,
	d.scan_out,
	d.ket_in,
	d.ket_out
FROM (
	SELECT 
		nx.jadwalId_inv, nx.scheduleDate, nx.Nik, nx.groupId,
		CASE WHEN  nx.groupId = 0 THEN nx.calendar_indv ELSE nx.calendar_group END AS calendar,
		CASE WHEN  nx.groupId = 0 THEN nx.jadwal_indv ELSE nx.jadwal_group END AS jk_id
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
			    nm.scheduleDate, nm.Nik,  nm.groupId

	) nx
) fn
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = fn.jk_id
LEFT JOIN master_calendar_type c ON c.calendar_code = fn.calendar
LEFT JOIN sumbiri_absens d ON d.Nik = fn.Nik 
	AND d.tanggal_in = fn.scheduleDate 
`;

//query get log untuk punch attd
export const qryLogForPunch =`SELECT 
a.*, DATE(a.log_date) logDate, TIME(a.log_date) logTime
FROM sumbiri_log_attd a 
WHERE date(a.log_date) BETWEEN :startDate AND :endDate
AND log_punch = 0
GROUP BY date(a.log_date), a.Nik, a.log_status`

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
    ket_in: {
      type: DataTypes.STRING,
    },
    ket_out: {
      type: DataTypes.STRING,
    },
    add_id: {
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
    tableName: "sumbiri_absens",
    timestamps: true,
  }
);



export const MasterAbsentee = dbSPL.define('master_absentee', {
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
}, {
  tableName: 'master_absentee',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
});


export const qrySplData = `SELECT ssm.spl_number, ssm.spl_date, ssm.spl_type, ssd.Nik, ssd.minutes/60 spl_jam
			FROM sumbiri_spl_main ssm
			LEFT JOIN sumbiri_spl_data ssd ON ssd.spl_number = ssm.spl_number
			WHERE  ssm.spl_date BETWEEN :startDate AND  :endDate  
`


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
 b.log_punch_description
FROM sumbiri_log_attd a 
LEFT JOIN sumbiri_employee se ON se.Nik = a.Nik
LEFT JOIN master_log_punch b ON a.log_punch = b.log_punch_id
WHERE a.log_date  BETWEEN :startDateTime AND  :endDateTime  
ORDER BY a.log_machine_id,  a.log_date `


export const SchedulePunchAttd = dbSPL.define('sumbiri_schedule_punch', {
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
}, {
  tableName: 'sumbiri_schedule_punch',
  timestamps: false,
});



export const qryDailyAbsensi = `WITH base_absen AS (
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
	    CASE WHEN sis.jk_id THEN sis.jk_id ELSE sgs.jk_id END AS jk_id,
	    CASE WHEN sis.calendar THEN sis.calendar  ELSE sgs.calendar END AS calendar
	FROM sumbiri_employee se
	LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
	LEFT JOIN master_subdepartment msd ON msd.IDSubDept = se.IDSubDepartemen
	LEFT JOIN sumbiri_employee_group seg ON seg.Nik = se.Nik
	LEFT JOIN sumbiri_group_schedule sgs ON sgs.groupId = seg.groupId AND sgs.scheduleDate = :date
	LEFT JOIN sumbiri_individu_schedule sis ON sis.Nik = se.Nik AND sis.scheduleDate_inv = :date
	WHERE se.StatusAktif = 0 -- Karyawan saat ini tidak aktif
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
sgs.groupName,
ba.jk_id,
mjk.jk_nama,
ba.calendar,
sa.jk_id jk_id_absen,
sa.id, 
sa.tanggal_in,
sa.tanggal_out,
sa.scan_in,
sa.scan_out,
sa.ket_in,
sa.ket_out,
sa.keterangan
FROM base_absen ba
LEFT JOIN sumbiri_absens sa ON sa.Nik = ba.Nik AND sa.tanggal_in= :date
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = ba.jk_id
LEFT JOIN sumbiri_group_shift sgs ON ba.groupId = sgs.groupId 
`

export const getLemburForAbsen = `
  SELECT 
ssm.spl_number, ssm.spl_type, spl.Nik, spl.minutes/60 jam, spl.start
FROM sumbiri_spl_main ssm
JOIN sumbiri_spl_data spl ON spl.spl_number = ssm.spl_number
WHERE ssm.spl_date = :date AND ssm.spl_approve_hrd = 1
GROUP BY ssm.spl_date, spl.Nik
`
export const karyawanOut = `SELECT COUNT(*) AS karyawanOut FROM sumbiri_employee se WHERE se.TanggalKeluar = :date`