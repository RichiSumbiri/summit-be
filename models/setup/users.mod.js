import { DataTypes } from "sequelize";
import db from "../../config/database.js";

// import { DataTypes } from 'Sequelize';

const Users = db.define(
  "xref_user_web",
  {
    USER_ID: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    USER_INISIAL: {
      type: DataTypes.STRING(18),
      allowNull: true
    },
    USER_PASS: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    USER_NAME: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    USER_TEL: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    USER_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    USER_DEP: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    USER_JAB: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    USER_DESC: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    USER_LEVEL: {
      type: DataTypes.TEXT('medium'),
      allowNull: true
    },
    UNIT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ID_DEPT: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    NIK: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    USER_PASS_WEB: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    USER_REF_TOKEN: {
      type: DataTypes.STRING(350),
      allowNull: true
    },
    USER_UNIT: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    USER_ACCES: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    USER_FLAG: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'D'
    },
    USER_PATH: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'D'
    },
    USER_AKTIF_STATUS: {
      type: DataTypes.INTEGER(2),
      allowNull: false,
      defaultValue: 0
    },
    USER_DELETE_STATUS: {
      type: DataTypes.INTEGER(2),
      allowNull: true
    },
    USER_DARK_MODE: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true
    },
    USER_ADD_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    USER_MOD_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    USER_ADD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    USER_MOD_ID: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  },
  {
    freezeTableName: true,
    createdAt: "USER_ADD_DATE",
    updatedAt: "USER_MOD_DATE",
  }
);

export default Users;
