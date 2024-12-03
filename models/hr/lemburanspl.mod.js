export const queryLemburan = `
SELECT
	ssm.spl_number AS SPL_ID,
	ssm.spl_date AS SPL_DATE,
	ssm.spl_dept AS SPL_DEPT_ID,
	md.NameDept AS SPL_DEPT_NAME,
	ssm.spl_section AS SPL_SECTION,
	ssm.spl_line AS SPL_LINE,
	ms.Name AS SPL_LINE_NAME,
	ssm.spl_foremanspv AS SPL_FOREMANSPV_NIK,
	se.NamaLengkap AS SPL_FOREMANSPV_NAME,
	ssm.spl_approve_foreman AS SPL_FOREMANSPV_APPROVE,
	ssm.spl_foreman_ts AS SPL_FOREMANSPV_TS,
	ssm.spl_head AS SPL_HEAD_NIK,
	se2.NamaLengkap AS SPL_HEAD_NAME,
	ssm.spl_approve_head AS SPL_HEAD_APPROVE,
	ssm.spl_head_ts AS SPL_HEAD_TS,
	ssm.spl_manager AS SPL_MANAGER_NIK,
	se3.NamaLengkap AS SPL_MANAGER_NAME,
	ssm.spl_approve_manager AS SPL_MANAGER_APPROVE,
	ssm.spl_manager_ts AS SPL_MANAGER_TS,
	ssm.spl_hrd AS SPL_HRD_NIK,
	se4.NamaLengkap AS SPL_HRD_NAME,
	ssm.spl_approve_hrd AS SPL_HRD_APPROVE,
	ssm.spl_hrd_ts AS SPL_HRD_TS,
	ssm.spl_type AS SPL_TYPE,
	ssm.spl_release AS SPL_RELEASE,
	ssm.spl_createdby AS SPL_CREATEDBY,
	ssm.spl_createddate AS SPL_CREATEDDATE,
	ssm.spl_updatedby AS SPL_UPDATEDBY,
	ssm.spl_updateddate AS SPL_UPDATEDDATE,
	ssm.spl_active AS SPL_ACTIVE
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
ssm.spl_head = :empNik
AND ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head = 1
AND ssm.spl_approve_manager IS NULL
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;

export const queryLemburanPendingHRD = queryLemburan + `
WHERE
ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head = 1
AND ssm.spl_approve_manager = 1
AND ssm.spl_approve_hrd IS NULL
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;


export const queryLemburanComplete = queryLemburan + `
WHERE
ssm.spl_date BETWEEN :startDate AND :endDate
AND ssm.spl_approve_foreman = 1
AND ssm.spl_approve_head = 1
AND ssm.spl_approve_manager = 1
AND ssm.spl_approve_hrd = 1
AND ssm.spl_active = 1
AND ssm.spl_version = 1
`;