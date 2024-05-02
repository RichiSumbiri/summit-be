import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const MecListMachine = db.define(
  "mec_item_master",
  {
    MACHINE_ID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    MACHINE_TYPE: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
    MACHINE_DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_SERIAL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_UOM: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_SECTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_BRAND: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_MODEL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_CATEGORY: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_KODE_DOC: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_NO_BC: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_DOK_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MACHINE_STATUS: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_ADD_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
    MACHINE_MOD_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

// Define any associations or hooks here if needed

export const qryGetAllMachine = `SELECT a.MACHINE_ID,
a.MACHINE_TYPE, 
b.TYPE_DESCRIPTION,
a.MACHINE_DESCRIPTION,
a.MACHINE_SERIAL,
a.MACHINE_UOM,
a.MACHINE_SECTION,
c.SECTION_NAME,
c.SECTION_CATEGORY,
a.MACHINE_BRAND,
a.MACHINE_MODEL,
a.MACHINE_STATUS
-- a.MACHINE_NO_BC,
-- a.MACHINE_KODE_DOC,
-- a.MACHINE_DOK_DATE
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
ORDER BY a.updatedAt DESC`;

export const qryGetlistType = `SELECT a.TYPE_ID, a.TYPE_DESCRIPTION, CONCAT(a.TYPE_ID, ' - ',a.TYPE_DESCRIPTION) AS NAME_MEC  FROM mec_type_of_machine a `;
export const qryGetlistSection = `SELECT * FROM item_section a `;

export const qryGetOneItem = `SELECT a.MACHINE_ID,
a.MACHINE_TYPE, 
b.TYPE_DESCRIPTION,
a.MACHINE_DESCRIPTION,
a.MACHINE_SERIAL,
a.MACHINE_UOM,
a.MACHINE_SECTION,
c.SECTION_NAME,
c.SECTION_CATEGORY,
a.MACHINE_BRAND,
a.MACHINE_MODEL,
a.MACHINE_STATUS
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
WHERE a.MACHINE_ID = :macId`;

export const MacItemIn = db.define(
  "mec_item_in",
  {
    MACHINE_ID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    MACHINE_KODE_DOC: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_NO_BC: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MACHINE_DOK_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    MACHINE_QTY: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    MACHINE_ADD_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
    MACHINE_MOD_ID: {
      type: DataTypes.BIGINT(20),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export const qryListInbyDate = `SELECT a.LOG_ID,
a.MACHINE_ID, b.MACHINE_TYPE, c.TYPE_DESCRIPTION, b.MACHINE_DESCRIPTION, b.MACHINE_MODEL, ROUND(a.MACHINE_QTY,2) MACHINE_QTY, DATE(a.createdAt) INPUT_DATE
FROM  mec_item_in a 
LEFT JOIN mec_item_master b ON b.MACHINE_ID = a.MACHINE_ID
LEFT JOIN mec_type_of_machine c ON c.TYPE_ID = b.MACHINE_TYPE
WHERE DATE(a.createdAt) = :date`;
