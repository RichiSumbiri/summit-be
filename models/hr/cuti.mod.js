import { DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";


export const SumbiriCutiMain =  dbSPL.define('sumbiri_cuti_main', {
    cuti_id: {
      type: DataTypes.CHAR(12),
      allowNull: false,
      primaryKey: true
    },
    cuti_createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    cuti_createby: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_date_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cuti_date_end: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    cuti_length: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    cuti_daymonth: {
      type: DataTypes.STRING(10),
      defaultValue: 'Hari'
    },
    cuti_purpose: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_absen: {
      type: DataTypes.INTEGER(20),
      allowNull: false
    },
    cuti_emp_nik: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    cuti_emp_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_emp_dept: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_emp_tmb: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    cuti_emp_position: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuti_spv: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cuti_manager: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    cuti_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cuti_active: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    
  }, {
    tableName: 'sumbiri_cuti_main',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });
  

export const queryGetCutiDate = `
SELECT
	scm.*,
	se.TanggalMasuk
FROM
	sumbiri_cuti_main scm
LEFT JOIN sumbiri_employee se ON se.Nik = scm.cuti_emp_nik 
WHERE
	cuti_active = "Y"
	AND DATE(cuti_createdate) BETWEEN :startDate AND :endDate
ORDER BY
	cuti_createdate DESC
`;


export const querySummaryCuti = `
SELECT
	se.NamaLengkap AS EmpName,	
	scm.cuti_emp_nik AS EmpNIK,
	md.NameDept AS EmpDept,
	scm.cuti_emp_tmb AS EmpTMB,
	scm.cuti_length AS CutiCountTahunan,
	scm.cuti_daymonth AS CutiDayMonth,
	scm.cuti_date_start AS CutiDateStart,
	scm.cuti_date_end AS CutiDateEnd,
	scm.cuti_purpose AS CutiPurpose,
	DATE(scm.cuti_createdate) AS CutiCreateDate,
	scm.cuti_createby AS CutiCreateBy,
	scm.cuti_id AS CutiID
FROM
	sumbiri_cuti_main scm
LEFT JOIN sumbiri_employee se ON se.Nik = scm.cuti_emp_nik
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen 
WHERE scm.cuti_active = "Y"
ORDER BY
	scm.cuti_date_start DESC
`;


export const queryMasterCuti = `
SELECT
	id_absen,
	code_absen,
	name_absen,
	type_absen,
	length_absen,
	daymonth_absen,
	create_date
FROM
	master_absentee
WHERE type_absen !='ABSEN'
`;

export const queryGetQuotaCuti = `
SELECT 
    e.Nik AS employee_id,
    e.NamaLengkap AS employee_name,
    e.TanggalMasuk,
    YEAR(CURDATE()) AS current_year,
    CASE
        WHEN MONTH(e.TanggalMasuk) > MONTH(CURDATE()) THEN YEAR(CURDATE()) - 1
        ELSE YEAR(CURDATE())
    END AS leave_reset_year,
    MONTH(e.TanggalMasuk) AS leave_reset_month,
    12 AS yearly_quota,
    IFNULL(SUM(
        CASE 
            WHEN 
                (YEAR(l.cuti_date_start) > CASE 
                    WHEN MONTH(e.TanggalMasuk) > MONTH(CURDATE()) THEN YEAR(CURDATE()) - 1
                    ELSE YEAR(CURDATE())
                END OR
                (YEAR(l.cuti_date_start) = CASE 
                    WHEN MONTH(e.TanggalMasuk) > MONTH(CURDATE()) THEN YEAR(CURDATE()) - 1
                    ELSE YEAR(CURDATE())
                END AND MONTH(l.cuti_date_start) >= MONTH(e.TanggalMasuk)))
            THEN l.cuti_length
            ELSE 0
        END
    ), 0) AS used_leaves,
    (12 - IFNULL(SUM(
        CASE 
            WHEN 
                (YEAR(l.cuti_date_start) > CASE 
                    WHEN MONTH(e.TanggalMasuk) > MONTH(CURDATE()) THEN YEAR(CURDATE()) - 1
                    ELSE YEAR(CURDATE())
                END OR
                (YEAR(l.cuti_date_start) = CASE 
                    WHEN MONTH(e.TanggalMasuk) > MONTH(CURDATE()) THEN YEAR(CURDATE()) - 1
                    ELSE YEAR(CURDATE())
                END AND MONTH(l.cuti_date_start) >= MONTH(e.TanggalMasuk)))
            THEN l.cuti_length
            ELSE 0
        END
    ), 0)) AS remaining_leaves
FROM 
    sumbiri_employee e
LEFT JOIN 
    sumbiri_cuti_main l ON e.Nik = l.cuti_emp_nik 
WHERE l.cuti_purpose ='CUTI TAHUNAN' AND l.cuti_active='Y' AND l.cuti_emp_nik = :empNik
GROUP BY 
    e.Nik, e.NamaLengkap, YEAR(CURDATE()), MONTH(e.TanggalMasuk);

`;


export const queryMasterAbsentee = `SELECT 
	a.id_absen,
	a.code_absen,
	a.name_absen,
	CONCAT(a.code_absen, ' - ', a.name_absen) AS label
FROM master_absentee a `