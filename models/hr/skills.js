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
    skill_level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    certified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_used_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }
  }, {
    tableName: 'sumbiri_employee_skills',
    timestamps: false
  });