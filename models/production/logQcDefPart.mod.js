import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const LogDailyQcDefect = db.define('log_daily_qc_defect', {
    SCHEDULE_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true,
    },
    SITELINE: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      primaryKey: true,
    },
    SITE: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    LINE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    SHIFT: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    DEFECT_CODE: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    DEFECT_NAME: {
      type: DataTypes.STRING(200),
    },
    DEFECT_QTY: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'log_daily_qc_defect',
    timestamps: true,
  });

export const LogDailyQcPart = db.define('log_daily_qc_part', {
    SCHEDULE_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true,
    },
    SITELINE: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      primaryKey: true,
    },
    SITE: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    LINE: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    SHIFT: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    PART_CODE: {
      type: DataTypes.STRING(200),
      primaryKey: true,
    },
    PART_NAME: {
      type: DataTypes.STRING(50),
    },
    DEFECT_QTY: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'log_daily_qc_part',
    timestamps: true,
  });


  export const queryLogQcDefect= ` SELECT  
a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
  a.ENDLINE_ID_SITELINE AS SITELINE,
  c.SITE_NAME AS SITE,
  c.LINE_NAME AS LINE,
  c.SHIFT,
  a.ENDLINE_DEFECT_CODE AS DEFECT_CODE,
  b.DEFECT_NAME AS DEFECT_NAME,
  SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
FROM qc_endline_output a
INNER JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
INNER JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE
WHERE 
    DATE(a.ENDLINE_ADD_TIME) = CURDATE() AND
--  DATE(a.ENDLINE_ADD_TIME) BETWEEN '2024-11-10' AND '2024-11-25' AND
  a.ENDLINE_DEFECT_CODE IS NOT NULL AND 
  a.ENDLINE_OUT_UNDO IS NULL 
GROUP BY a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, a.ENDLINE_DEFECT_CODE`


  export const queryLogQcPart = `SELECT  
a.ENDLINE_SCHD_DATE AS SCHEDULE_DATE,
a.ENDLINE_ID_SITELINE AS SITELINE,
c.SITE_NAME AS SITE,
c.LINE_NAME AS LINE,
c.SHIFT AS SHIFT,
a.ENDLINE_PART_CODE AS PART_CODE,
d.PART_NAME,
SUM(a.ENDLINE_OUT_QTY) AS DEFECT_QTY
FROM qc_endline_output a
INNER JOIN item_defect_internal b ON a.ENDLINE_DEFECT_CODE = b.DEFECT_SEW_CODE
INNER JOIN item_siteline c ON a.ENDLINE_ID_SITELINE = c.ID_SITELINE
INNER JOIN item_part d ON a.ENDLINE_PART_CODE = d.PART_CODE
WHERE 
    DATE(a.ENDLINE_ADD_TIME) = CURDATE() AND
--  DATE(a.ENDLINE_ADD_TIME) BETWEEN '2024-11-10' AND '2024-11-25' AND
  a.ENDLINE_DEFECT_CODE IS NOT NULL AND 
  a.ENDLINE_OUT_UNDO IS NULL 
GROUP BY a.ENDLINE_SCHD_DATE, a.ENDLINE_ID_SITELINE, a.ENDLINE_PART_CODE`