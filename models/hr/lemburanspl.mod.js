export const queryLemburanPending = `
SELECT
	ssm.*
FROM
	sumbiri_spl_main ssm
WHERE
	ssm.spl_approve_foreman !='1' OR
	ssm.spl_approve_head !='1' OR
	ssm.spl_approve_manager != '1' OR
	ssm.spl_approve_hrd != '1'
`;

export const queryLemburanComplete = `
SELECT
	splm.spl_number AS SPLNumber,
	splm.spl_date AS SPLDate,
	splm.spl_dept AS SPLDept,
	splm.spl_section AS SPLSection,
	splm.spl_line AS SPLLine,
	splm.spl_foremanspv AS NikForemanSPV,
	se.NamaLengkap AS NamaForemanSPV,
	splm.spl_approve_foreman AS StatusApproveForemanSPV,
	splm.spl_foreman_ts AS TimestampApproveForemenSPV,
	splm.spl_head AS NikHead,
	splm.spl_approve_head AS StatusApproveHead,
	splm.spl_head_ts AS TimestampApproveHead,
	se2.NamaLengkap AS NamaHead,
	splm.spl_manager AS NikManager,
	se3.NamaLengkap AS NamaManager,
	splm.spl_approve_manager AS StatusApproveManager,
	splm.spl_manager_ts AS TimestampApproveManager,
	splm.spl_hrd AS NikHRD,
	se4.NamaLengkap AS NamaHRD,
	splm.spl_approve_hrd AS StatusApproveHRD,
	splm.spl_hrd_ts AS TimestampApproveHRD
FROM
	sumbiri_spl_main splm
LEFT JOIN sumbiri_employee se ON se.Nik = splm.spl_foremanspv 
LEFT JOIN sumbiri_employee se2 ON se2.Nik = splm.spl_head 
LEFT JOIN sumbiri_employee se3 ON se3.Nik = splm.spl_manager 
LEFT JOIN sumbiri_employee se4 ON se4.Nik = splm.spl_hrd 
WHERE
	splm.spl_foreman_ts IS NOT NULL
	AND splm.spl_head_ts IS NOT NULL
	AND splm.spl_manager_ts IS NOT NULL
	AND splm.spl_hrd_ts IS NOT NULL
	AND splm.spl_release = '1'
	AND YEAR(splm.spl_date)= YEAR(CURRENT_DATE())
	AND MONTH(splm.spl_date)= MONTH(CURRENT_DATE())
	AND WEEK(splm.spl_date)= WEEK(CURRENT_DATE())
`;