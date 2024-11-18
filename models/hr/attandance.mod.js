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
    log_time: {
      type: DataTypes.TIME,
    },
    log_status: {
      type: DataTypes.STRING,
    },
    log_machine_id: {
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

export const LogFromWdms = `SELECT a.emp_code, a.punch_time, a.punch_state
FROM   iclock_transaction a 
WHERE a.punch_time BETWEEN :startDateTime AND :endDateTime
GROUP BY a.emp_code,  a.punch_state
`

export const qrySchAttdComp = (params) => {
  return `SELECT 
	fn.*,
	CASE WHEN mjk.jk_out_day = 'N' THEN DATE_ADD(fn.scheduleDate, INTERVAL 1 DAY) 
	ELSE fn.scheduleDate END AS scanOutDate,
	mjk.jk_nama,
	mjk.jk_in,
	mjk.jk_out,
	mjk.jk_scan_in_start,
	mjk.jk_scan_in_end,
	mjk.jk_scan_out_start,
	mjk.jk_scan_out_end,
	mjk.jk_out_day
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
			    WHERE  sgs.scheduleDate IN ( ${params} )
			    
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
			    WHERE sis.scheduleDate_inv IN ( ${params} )
			) nm 
			GROUP BY 
			    nm.scheduleDate, nm.Nik,  nm.groupId

	) nx
) fn
LEFT JOIN master_jam_kerja mjk ON mjk.jk_id = fn.jk_id
LEFT JOIN master_calendar_type c ON c.calendar_code = fn.calendar
`;
};

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