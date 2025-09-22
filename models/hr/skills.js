import { dbSPL } from "../../config/dbAudit.js"
import { DataTypes } from "sequelize";

export const ModelCategorySkills = dbSPL.define('master_skills_category', {
    skill_category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    skill_category_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'master_skills_category',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });


  export const ModelMasterSkill = dbSPL.define('master_skills', {
    skill_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    skill_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skill_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skill_certification: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    skill_category_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skill_add_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skill_add_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    skill_update_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skill_update_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'master_skills',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });

  // Relasi didefinisikan di bagian asosiasi (association) terpisah
  ModelMasterSkill.associate = (models) => {
    ModelMasterSkill.belongsTo(ModelCategorySkills, {
      foreignKey: 'category_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  };

  export const SumbiriEmployeeSkills = dbSPL.define('sumbiri_employee_skills', {
    Nik: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    sub_skill_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    skill_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    certified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_update_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    createdAt : {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt : {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'sumbiri_employee_skills',
    timestamps: true
  });


  export const ModelMasterSubSkill = dbSPL.define('master_sub_skills', {
    sub_skill_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sub_skill_name: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    sub_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sub_add_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sub_add_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    sub_update_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sub_update_by: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'master_skills_sub',
    timestamps: false
  });



  export const queryGetEmpSkillDataByCategory = `
  SELECT
	se.Nik,
	se.NamaLengkap,
	md.NameDept AS Departemen,
	ms2.Name AS SubDepartemen,
	ms3.Name AS Section,
  mp2.Name AS NamePosisi,
	msc.skill_category_id,
	msc.skill_category_name,
	ses.skill_id,
	ms.skill_name,
  ses.sub_skill_id,
	mss.sub_skill_name,
	ses.skill_level
FROM
	sumbiri_employee se
LEFT JOIN sumbiri_employee_skills ses ON ses.Nik = se.Nik
LEFT JOIN master_skills ms ON ms.skill_id = ses.skill_id
LEFT JOIN master_skills_sub mss ON mss.sub_skill_id = ses.sub_skill_id
LEFT JOIN master_skills_category msc ON msc.skill_category_id = ms.skill_category_id
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
LEFT JOIN master_subdepartment ms2 ON ms2.IDSubDept = se.IDSubDepartemen
LEFT JOIN master_section ms3 ON ms3.IDSection = se.IDSection
LEFT JOIN master_position mp2 ON mp2.IDPosition = se.IDPosisi
WHERE se.StatusAktif ='0' AND ses.skill_id = :skillID
ORDER BY se.Nik, ms.skill_id ASC
`;

export const queryGetEmpSkillDataAll = `
SELECT
	se.Nik,
	se.NamaLengkap,
	md.NameDept AS Departemen,
	ms2.Name AS SubDepartemen,
	ms3.Name AS Section,
	msc.skill_category_id,
	msc.skill_category_name,
	ses.skill_id,
	ms.skill_name,
	ses.sub_skill_id,
	mss.sub_skill_name,
	ses.skill_level,
  mp2.Name AS NamePosisi
FROM
	sumbiri_employee se
LEFT JOIN sumbiri_employee_skills ses ON ses.Nik = se.Nik
LEFT JOIN master_skills_sub mss ON mss.sub_skill_id = ses.sub_skill_id 
LEFT JOIN master_skills ms ON ms.skill_id = ses.skill_id
LEFT JOIN master_skills_category msc ON msc.skill_category_id = ms.skill_category_id
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
LEFT JOIN master_subdepartment ms2 ON ms2.IDSubDept = se.IDSubDepartemen
LEFT JOIN master_section ms3 ON ms3.IDSection = se.IDSection
LEFT JOIN master_position mp2 ON mp2.IDPosition = se.IDPosisi
WHERE se.StatusAktif ='0' 
AND msc.skill_category_name IS NOT NULL
AND ( 
	se.Nik LIKE :searchParameter OR
	se.NamaLengkap LIKE :searchParameter OR
	md.NameDept  LIKE :searchParameter OR
	ms2.Name  LIKE :searchParameter OR
	ms3.Name  LIKE :searchParameter OR
	msc.skill_category_name LIKE :searchParameter OR
	ms.skill_name LIKE :searchParameter OR
	mss.sub_skill_name LIKE :searchParameter
)

`;


export const queryGetEmpSkillDataPaginated = queryGetEmpSkillDataAll + `
  ORDER BY msc.skill_category_id, ms.skill_id, md.NameDept, se.Nik  ASC
  LIMIT :limitPage OFFSET :offsetPage`;


export const queryGetEmpSkillByNIK = `
SELECT
	se.Nik,
	se.NamaLengkap,
	md.NameDept AS Departemen,
	ms2.Name AS SubDepartemen,
	ms3.Name AS Section,
	msc.skill_category_id,
	msc.skill_category_name,
	ses.skill_id,
	ms.skill_name,
	ses.sub_skill_id,
	mss.sub_skill_name,
	ses.skill_level
FROM
	sumbiri_employee se
LEFT JOIN sumbiri_employee_skills ses ON ses.Nik = se.Nik
LEFT JOIN master_skills_sub mss ON mss.sub_skill_id = ses.sub_skill_id 
LEFT JOIN master_skills ms ON ms.skill_id = ses.skill_id
LEFT JOIN master_skills_category msc ON msc.skill_category_id = ms.skill_category_id
LEFT JOIN master_department md ON md.IdDept = se.IDDepartemen
LEFT JOIN master_subdepartment ms2 ON ms2.IDSubDept = se.IDSubDepartemen
LEFT JOIN master_section ms3 ON ms3.IDSection = se.IDSection
WHERE se.Nik=:empNik

`;


export const ModelLogRecapMatrixSkill = dbSPL.define('sumbiri_log_matrix_skill', {
    log_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    skill_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    skill_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    skill_category_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    skill_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sub_skill_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sub_skill_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sub_skill_max: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sub_skill_min: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sub_skill_average: {
      type: DataTypes.DECIMAL(20, 4),
      allowNull: true
    },
    log_create_time: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'sumbiri_log_matrix_skill',
    timestamps: false
  });