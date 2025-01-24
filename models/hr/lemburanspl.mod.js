import { DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";

export const queryLemburan = `
SELECT
	ssm.spl_number AS SPLID,
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
ssm.spl_approve_foreman = 1 AND 
( ssm.spl_approve_head IS NULL OR ssm.spl_approve_manager IS NULL OR ssm.spl_approve_hrd IS NULL )
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
	}, {
		tableName: "sumbiri_spl_main",
		timestamps: false, // Disable Sequelize's default timestamps if not used
});