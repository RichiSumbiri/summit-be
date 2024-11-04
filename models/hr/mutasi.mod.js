import { dbSPL } from "../../config/dbAudit.js";
import { DataTypes } from "sequelize";

export const sumbiriMutasiEmp = dbSPL.define('sumbiri_mutasiemp', {
    id_mutasi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    number_mutasi: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null
    },  
    Nik: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date_mutasi: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason_mutasi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    source_dept: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    source_subdept: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    source_section: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    source_position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    destination_dept: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    destination_subdept: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },
    destination_section: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    destination_position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    create_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },
    update_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    update_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'sumbiri_mutasiemp',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });


export const queryGetMutasi = `
SELECT
	sm.Nik AS NIK,
	se.NamaLengkap,
	sm.number_mutasi AS NoMutasi,
	sm.date_mutasi AS TanggalMutasi,
	sm.source_dept AS ID_Source_Dept,
	md.NameDept AS Name_Source_Dept,
	sm.source_subdept AS ID_Source_SubDept,
	ms.Name AS Name_Source_SubDept,
	sm.source_position AS ID_Source_Position,
	mp.Name AS Name_Source_Position,
	sm.source_section AS Source_Section,
	sm.destination_dept AS ID_Destination_Dept,
	md2.NameDept AS Name_Destination_Dept,
	sm.destination_subdept AS ID_Destination_SubDept,
	ms2.Name AS Name_Destination_SubDept,
	sm.destination_position AS ID_Destination_Position,
	mp2.Name AS Name_Destination_Position,
	sm.destination_section AS Destination_Section,
    sm.create_by AS CreateBy,
    sm.create_time AS CreateTime
FROM
	sumbiri_mutasiemp sm
LEFT JOIN master_department md ON md.IdDept = sm.source_dept 
LEFT JOIN master_subdepartment ms ON ms.IDSubDept = sm.source_subdept 
LEFT JOIN master_position mp ON mp.IDPosition = sm.source_position 
LEFT JOIN master_department md2 ON md2.IdDept = sm.destination_dept 
LEFT JOIN master_subdepartment ms2 ON ms2.IDSubDept = sm.destination_subdept 
LEFT JOIN master_position mp2 ON mp2.IDPosition = sm.destination_position
LEFT JOIN sumbiri_employee se ON se.Nik = sm.Nik 
`;

export const queryGetMutasiByMutDate = queryGetMutasi + ` WHERE sm.date_mutasi BETWEEN :startDate AND :endDate`;
export const queryGetLastMutasi = queryGetMutasi + `WHERE sm.number_mutasi LIKE :formatMutasi ORDER BY sm.create_time DESC LIMIT 1`;