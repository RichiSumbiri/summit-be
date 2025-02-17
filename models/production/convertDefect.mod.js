import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const modelLogConvertDefect = db.define('LogConvertDefect', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ENDLINE_ACT_SCHD_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ENDLINE_PROD_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ENDLINE_TIME: {
      type: DataTypes.TIME,
      allowNull: true
    },
    ENDLINE_PLAN_SIZE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ENDLINE_OUT_TYPE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    UPDATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    UPDATE_TIME: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'log_convert_defect',
    timestamps: false
  });