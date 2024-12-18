import { QueryTypes, DataTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";


export const sumbiriUserSummitNIK = dbSPL.define('sumbiri_user_summit_nik', {
    USER_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    Nik: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    UserLevel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CreateDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
}, {
    tableName: 'sumbiri_user_summit_nik',
    timestamps: false,
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
});


export const ModelSPLMain = dbSPL.define('sumbiri_spl_main', {
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
    type: DataTypes.INTEGER(5),
    allowNull: true,
  },
  spl_line: {
    type: DataTypes.STRING(20),
    defaultValue: 'NONE',
    allowNull: true,
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
  tableName: 'sumbiri_spl_main',
  timestamps: false, // Set to true if you want Sequelize to handle createdAt/updatedAt
  underscored: true, // Use snake_case column names
});


export const ModelSPLData = dbSPL.define('sumbiri_spl_data', {
  id_splinsert: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  spl_number: {
    type: DataTypes.CHAR(13),
    allowNull: true,
  },
  spl_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  Nik: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: true,
    get() {
      const value = this.getDataValue('Nik');
      return value ? value.toString().padStart(10, '0') : value;  // Mimicking unsigned zerofill behavior
    },
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  start: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  finish: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  minutes: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1,
  },
  time_insert: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // default to current timestamp
    allowNull: true,
  },
  time_update: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'sumbiri_spl_data', // Specify the table name explicitly
  timestamps: false, // Disable timestamps if you don't need `createdAt`/`updatedAt`
  underscored: true, // Use snake_case for column names, matches `id_splinsert` and `time_insert`
});