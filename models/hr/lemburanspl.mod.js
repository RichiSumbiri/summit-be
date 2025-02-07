import { DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const queryCheckEmpLemburan    = `
        SELECT
	        sd.*
        FROM
	        sumbiri_spl_data sd
        LEFT JOIN sumbiri_spl_main ssm ON ssm.spl_number = sd.spl_number 
        WHERE sd.spl_date=:splDate AND sd.Nik=:empNik AND ssm.spl_active = '1'
		`;
        

export const queryLemburan = `
SELECT
	ssm.spl_number AS SPLID,
	ssm.spl_printed AS SPLPrinted,
	ssm.spl_date AS SPLDate,
	ssm.spl_dept AS SPLDept,
	md.NameDept AS SPLDeptName,
	ssm.spl_section AS SPLSection,
	ssm.spl_line AS SPLLine,
	ms.Name AS SPLLineName,
	ssm.spl_foremanspv AS SPLForemanSPV,
	se.NamaLengkap AS SPLForemanSPVName,
	ssm.spl_approve_foreman AS SPLApproveForemanSPV,
	ssm.spl_foreman_ts AS SPLTSForemanSPV,
	ssm.spl_head AS SPLHead,
	se2.NamaLengkap AS SPLHeadName,
	ssm.spl_approve_head AS SPLApproveHead,
	ssm.spl_head_ts AS SPLTSHead,
	ssm.spl_manager AS SPLManager,
	se3.NamaLengkap AS SPLManagerName,
	ssm.spl_approve_manager AS SPLApproveManager,
	ssm.spl_manager_ts AS SPLTSManager,
	ssm.spl_hrd AS SPLHRD,
	se4.NamaLengkap AS SPLHRDName,
	ssm.spl_approve_hrd AS SPLApproveHRD,
	ssm.spl_hrd_ts AS SPLTSHRD,
	ssm.spl_type AS SPLType,
	ssm.spl_release AS SPLRelease,
	ssm.spl_createdby AS SPLCreatedBy,
	ssm.spl_createddate AS SPLCreatedDate,
	ssm.spl_updatedby AS SPLUpdatedBy,
	ssm.spl_updateddate AS SPLUpdatedDate,
	ssm.spl_active AS SPLActive
FROM
	sumbiri_spl_main ssm
LEFT JOIN master_department md ON md.IdDept = ssm.spl_dept 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = ssm.spl_line 
LEFT JOIN sumbiri_employee se ON se.Nik = ssm.spl_foremanspv 
LEFT JOIN sumbiri_employee se2 ON se2.Nik = ssm.spl_head
LEFT JOIN sumbiri_employee se3 ON se3.Nik = ssm.spl_manager 
LEFT JOIN sumbiri_employee se4 ON se4.Nik = ssm.spl_hrd 
`;


export const queryLemburanCreated = queryLemburan + `
WHERE
ssm.spl_createdby = :userId
AND ssm.spl_active = 1
AND ssm.spl_version = 1
AND ssm.spl_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 30 DAY) AND CURDATE()
`;



export const queryLemburanPending = queryLemburan + `
WHERE
ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head IS NULL
AND ssm.spl_approve_manager IS NULL
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;


export const queryLemburanPendingAll = queryLemburan + `
WHERE
ssm.spl_approve_foreman = 1 
AND ( ssm.spl_approve_head IS NULL OR ssm.spl_approve_manager IS NULL OR ssm.spl_approve_hrd IS NULL )
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;



export const queryLemburanPendingSPV = queryLemburan + `
WHERE
ssm.spl_foremanspv = :empNik
AND ssm.spl_approve_foreman IS NULL
AND ssm.spl_approve_head IS NULL
AND ssm.spl_approve_manager IS NULL
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;


export const queryLemburanPendingHead = queryLemburan + `
WHERE
ssm.spl_head = :empNik
AND ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head IS NULL
AND ssm.spl_approve_manager IS NULL
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;

export const queryLemburanPendingManager = queryLemburan + `
WHERE
ssm.spl_manager = :empNik
AND ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head = 1
AND ssm.spl_approve_manager IS NULL
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;

export const queryLemburanPendingHRD = queryLemburan + `
WHERE
ssm.spl_hrd = :empNik
AND ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head = 1
AND ssm.spl_approve_manager = 1
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;

export const queryLemburanPendingReject = queryLemburan + `
WHERE
ssm.spl_approve_foreman = 1 
AND ( ssm.spl_approve_head ='0' OR ssm.spl_approve_manager ='0' OR ssm.spl_approve_hrd ='0' )
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;



export const queryLemburanComplete = queryLemburan + `
WHERE
ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head = 1
AND ssm.spl_approve_manager = 1
AND ssm.spl_approve_hrd = 1
AND ssm.spl_active = 1
AND ssm.spl_version = 1
AND ssm.spl_date BETWEEN :startTgl AND :endTgl
`;




export const queryLemburanDetail      = `
SELECT
	spl_number AS SPLNumber,
	Nik AS Nik,
	nama AS NamaLengkap,
	start AS StartTime,
	finish AS FinishTime,
	minutes AS Minutes
FROM
	sumbiri_spl_data
WHERE spl_number = :splnumber
`;
        

export const modelSPLMain = dbSPL.define('sumbiri_spl_main',
	{
		spl_number: {
		  type: DataTypes.CHAR(13),
		  allowNull: false,
		  primaryKey: true,
		},
		spl_date: {
		  type: DataTypes.DATEONLY,
		  allowNull: true,
		},
		spl_dept: {
		  type: DataTypes.CHAR(7),
		  allowNull: true,
		},
		spl_section: {
		  type: DataTypes.STRING(15),
		  allowNull: true,
		},
		spl_line: {
		  type: DataTypes.STRING(20),
		  allowNull: false,
		  defaultValue: "NONE",
		},
		spl_foremanspv: {
		  type: DataTypes.INTEGER(10),
		  allowNull: true,
		},
		spl_head: {
		  type: DataTypes.INTEGER(10),
		  allowNull: true,
		},
		spl_manager: {
		  type: DataTypes.INTEGER(10),
		  allowNull: true,
		},
		spl_hrd: {
		  type: DataTypes.INTEGER(10),
		  allowNull: true,
		},
		spl_approve_foreman: {
		  type: DataTypes.TINYINT(1),
		  allowNull: true,
		},
		spl_approve_head: {
		  type: DataTypes.TINYINT(1),
		  allowNull: true,
		},
		spl_approve_manager: {
		  type: DataTypes.TINYINT(1),
		  allowNull: true,
		},
		spl_approve_hrd: {
		  type: DataTypes.TINYINT(1),
		  allowNull: true,
		},
		spl_foreman_ts: {
		  type: DataTypes.DATE,
		  allowNull: true,
		},
		spl_head_ts: {
		  type: DataTypes.DATE,
		  allowNull: true,
		},
		spl_manager_ts: {
		  type: DataTypes.DATE,
		  allowNull: true,
		},
		spl_hrd_ts: {
		  type: DataTypes.DATE,
		  allowNull: true,
		},
		spl_type: {
		  type: DataTypes.CHAR(2),
		  allowNull: true,
		},
		spl_release: {
		  type: DataTypes.TINYINT(1),
		  allowNull: false,
		  defaultValue: 0,
		},
		spl_createdby: {
		  type: DataTypes.STRING(100),
		  allowNull: true,
		},
		spl_createddate: {
		  type: DataTypes.DATE,
		  allowNull: true,
		},
		spl_updatedby: {
		  type: DataTypes.STRING(100),
		  allowNull: true,
		},
		spl_updateddate: {
		  type: DataTypes.DATE,
		  allowNull: true,
		},
		spl_active: {
		  type: DataTypes.TINYINT(1),
		  allowNull: false,
		  defaultValue: 1,
		},
		spl_version: {
		  type: DataTypes.INTEGER(2),
		  allowNull: true,
		  defaultValue: 0,
		},
		spl_printed: {
			type: DataTypes.ENUM("Y", "N"),
			allowNull: true,
		  },
	}, {
		tableName: "sumbiri_spl_main",
		timestamps: false, // Disable Sequelize's default timestamps if not used
});


export const queryOvertimeReport = `
WITH base_absen AS (
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
	    CASE
		WHEN sis.jk_id THEN sis.jk_id
		ELSE sgs.jk_id
	END AS jk_id,
	    CASE
		WHEN sis.calendar THEN sis.calendar
		ELSE sgs.calendar
	END AS calendar
FROM
	sumbiri_employee se
LEFT JOIN master_department md ON
	md.IdDept = se.IDDepartemen
LEFT JOIN master_subdepartment msd ON
	msd.IDSubDept = se.IDSubDepartemen
LEFT JOIN sumbiri_employee_group seg ON
	seg.Nik = se.Nik
LEFT JOIN sumbiri_group_schedule sgs ON
	sgs.groupId = seg.groupId
	AND sgs.scheduleDate BETWEEN :startDate AND :endDate
LEFT JOIN sumbiri_individu_schedule sis ON
	sis.Nik = se.Nik
	AND sis.scheduleDate_inv BETWEEN :startDate AND :endDate
WHERE
	se.StatusAktif = 0
	AND se.CancelMasuk = 'N'
)

SELECT
	*
FROM
	(
	SELECT
		*
	FROM
		(
		SELECT
			ba.IDSection,
			ba.IDDepartemen,
			ba.NameDept,
			ba.Nik,
			ba.NamaLengkap,
			ba.calendar,
			sa.tanggal_in,
			sa.tanggal_out,
			mjk2.jk_in,
			sa.scan_in,
			mjk2.jk_out,
			sa.scan_out,
			TblSPL.start AS StartSPL,
			TblSPL.finish AS FinishSPL,
			TblSPL.spl_type AS TypeSPL,
			( TblSPL.minutes / 60 ) AS JamSPL,
			TblSPL.spl_number AS SPLNumber,
			sa.keterangan
		FROM
			base_absen ba
		LEFT JOIN sumbiri_absens sa ON
			sa.Nik = ba.Nik
			AND sa.tanggal_in BETWEEN :startDate AND :endDate
		LEFT JOIN master_jam_kerja mjk ON
			mjk.jk_id = ba.jk_id
		LEFT JOIN master_jam_kerja mjk2 ON
			mjk2.jk_id = sa.jk_id
		LEFT JOIN sumbiri_group_shift sgs ON
			ba.groupId = sgs.groupId
		LEFT JOIN master_section msts ON
			msts.IDSection = ba.IDSection
		LEFT JOIN master_position mp ON
			mp.IDPosition = ba.IDPosisi
		LEFT JOIN (
			SELECT
				ssm.spl_type,
				ssm.spl_number,
				ssd.Nik,
				ssd.spl_date,
				ssd.start,
				ssd.finish,
				ssd.minutes
			FROM
				sumbiri_spl_data ssd
			LEFT JOIN sumbiri_spl_main ssm ON
				ssm.spl_number = ssd.spl_number
			WHERE
				ssm.spl_active = '1'
				AND ssm.spl_date BETWEEN :startDate AND :endDate
) AS TblSPL ON
			TblSPL.Nik = ba.Nik
) AS TblOvertime
	WHERE
		(TIME_TO_SEC(TIMEDIFF(scan_out, jk_out)) / 60) > 30
			OR (TIME_TO_SEC(TIMEDIFF(jk_in, scan_in)) / 60) > 30
				OR (TIME_TO_SEC(TIMEDIFF(scan_in, StartSPL)) / 60) < 30
					OR (TIME_TO_SEC(TIMEDIFF(scan_out, FinishSPL)) / 60) < 30
				ORDER BY
					tanggal_in,
					IDSection,
					IDDepartemen,
					Nik ASC
) AS RekapLemburan
GROUP BY IDSection, IDDepartemen, NameDept, Nik, NamaLengkap, calendar, tanggal_in
ORDER BY tanggal_in, IDSection, IDDepartemen  ASC
`;



export const queryOvertimeSummaryReport = `
SELECT
	ssm.spl_section AS SPLSection,
	md.NameDept AS SPLNameDepartment,
	ms.Name AS SPLNameSubDepartment,
	DAYNAME(ssm.spl_date) AS SPLDayName, 
	ssm.spl_date AS SPLDate,
	IF(ssm.spl_type='HH',"HL","WD") AS SPLWDType,
	ssm.spl_type AS SPLType,
	ssd.start AS SPLStart,
	ssd.finish AS SPLFinish,
	( ssd.minutes / 60 ) AS SPLHour,
	COUNT(*) AS SPLCount
FROM
	sumbiri_spl_data ssd
LEFT JOIN sumbiri_spl_main ssm ON ssm.spl_number = ssd.spl_number
LEFT JOIN master_department md ON md.IdDept = ssm.spl_dept
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = ssm.spl_line
WHERE
	ssm.spl_active = '1'
	AND ssm.spl_version = '1'
	AND ssm.spl_date BETWEEN :startDate AND :endDate
GROUP BY 
	md.IdDept, ms.IDSubDept, ssm.spl_section, ssm.spl_date, ssm.spl_type, ssd.start, ssd.finish
ORDER BY
	ssm.spl_section,
	md.IdDept,
	ms.IDSubDept ASC
`;

export const queryOvertimeDeptCountReport = `
SELECT
	ssm.spl_date AS SPLDate,	
	md.NameDept AS SPLNameDepartment,
	COUNT(*) AS SPLCount
FROM
	sumbiri_spl_data ssd
LEFT JOIN sumbiri_spl_main ssm ON ssm.spl_number = ssd.spl_number
LEFT JOIN master_department md ON md.IdDept = ssm.spl_dept
WHERE
	ssm.spl_active = '1'
	AND ssm.spl_version = '1'
	AND ssm.spl_date BETWEEN :startDate AND :endDate
GROUP BY 
	md.IdDept, ssm.spl_date
ORDER BY
	md.IdDept ASC
`;