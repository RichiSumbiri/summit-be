import {DataTypes} from "sequelize";
import db from "../../config/database.js";
import {StorageInventoryNodeModel} from "../storage/storageInventory.mod.js";

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
        STORAGE_INVENTORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STORAGE_INVENTORY_NODE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DEPARTMENT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        SEQ_NO: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM('NORMAL', 'BROKEN', 'ON_FIX'),
            defaultValue: 'NORMAL'
        },
        IS_REPLACE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        freezeTableName: true,
    }
);

export const MacTypeOfMachine = db.define(
    "mec_type_of_machine",
    {
        TYPE_ID: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            primaryKey: true,
        },
        TYPE_DESCRIPTION: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        COLOR: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        CATEGORY: {
            type: DataTypes.ENUM('PRODUCTION', 'SPERPART', 'MACHINE'),
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: false, // Disable timestamps if you don't need `createdAt`/`updatedAt`
    }
);

MecListMachine.belongsTo(MacTypeOfMachine, {
    foreignKey: "MACHINE_TYPE",
    as: "MEC_TYPE_OF_MACHINE"
})

export const MecDownTimeModel = db.define(
    "mec_down_time",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        START_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        RESPONSE_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        END_TIME: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        DESCRIPTION: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        MACHINE_ID: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        STORAGE_INVENTORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        STORAGE_INVENTORY_NODE_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        MECHANIC_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM('DONE', 'BROKEN', 'ON_FIX', 'REPLACE'),
            defaultValue: 'BROKEN'
        },
        IS_COMPLETE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        CREATED_AT: {
            type: DataTypes.DATE
        },
        UPDATED_AT: {
            type: DataTypes.DATE
        },
        ID_SITELINE: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        SCHD_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "mec_down_time",
        timestamps: false,
    }
);

MecListMachine.belongsTo(StorageInventoryNodeModel, {
    foreignKey: 'STORAGE_INVENTORY_NODE_ID',
    as: 'NODE'
});

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
a.STORAGE_INVENTORY_NODE_ID,
a.IS_REPLACE,
a.MACHINE_STATUS,
a.STATUS
-- a.MACHINE_NO_BC,
-- a.MACHINE_KODE_DOC,
-- a.MACHINE_DOK_DATE
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
ORDER BY a.updatedAt DESC`;

export const qryGetAllMachineByDepartment = `SELECT a.MACHINE_ID,
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
a.STORAGE_INVENTORY_ID,
a.STORAGE_INVENTORY_NODE_ID,
a.IS_REPLACE,
a.MACHINE_STATUS,
a.STATUS,
s.DESCRIPTION AS 'STORAGE_DESCRIPTION',
bb.CODE AS 'BUILDING_CODE'
-- a.MACHINE_NO_BC,
-- a.MACHINE_KODE_DOC,
-- a.MACHINE_DOK_DATE
FROM mec_item_master a
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
LEFT JOIN storage_inventory s ON s.ID = a.STORAGE_INVENTORY_ID
LEFT JOIN buildings bb ON s.BUILDING_ID = bb.ID
WHERE a.DEPARTMENT_ID = :departmentId
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
a.STORAGE_INVENTORY_NODE_ID,
a.MACHINE_STATUS,
a.STATUS,
ROUND(d.BALANCE,2) BALANCE
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
LEFT JOIN (
		SELECT 
		n.MACHINE_ID,
		SUM(n.PART_IN) PART_IN,
		SUM(n.PART_OUT) PART_OUT,
		SUM(n.PART_IN) - SUM(n.PART_OUT) AS BALANCE
		FROM (
			SELECT a.MACHINE_ID, SUM(a.MACHINE_QTY) PART_IN, 0 PART_OUT
			FROM mec_item_in a WHERE a.MACHINE_ID = :macId
      GROUP BY a.MACHINE_ID
			UNION ALL 
			SELECT b.PART_ID MACHINE_ID, 0 PART_IN, SUM(b.PART_QTY) PART_OUT
			FROM mec_part_used b WHERE b.PART_ID = :macId
      GROUP BY b.PART_ID
		) n GROUP BY n.MACHINE_ID
) d ON d.MACHINE_ID = a.MACHINE_ID
WHERE  a.MACHINE_ID = :macId`;

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

export const qryListOut = `SELECT a.LOG_ID,
a.PART_ID, a.MACHINE_ID, a.NIK, a.NAME, a.DEPARTEMEN, a.REASON, a.SCRAP, c.TYPE_DESCRIPTION, b.MACHINE_DESCRIPTION, c.TYPE_ID, ROUND(a.PART_QTY,2) PART_QTY, time(a.createdAt) ADD_TIME
FROM mec_part_used a 
LEFT JOIN mec_item_master b ON b.MACHINE_ID = a.PART_ID
LEFT JOIN mec_type_of_machine c ON c.TYPE_ID = b.MACHINE_TYPE
WHERE DATE(a.createdAt) = :date`;

export const findEmploye = `SELECT a.Nik, a.NamaLengkap, a.NamaDepartemen FROM sumbiri_employee a WHERE a.Nik = :nik`;

//get machine no without sparepart and needle
export const qryGetOneMachine = `SELECT a.MACHINE_ID,
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
a.STORAGE_INVENTORY_NODE_ID,
a.MACHINE_STATUS,
a.STATUS
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
WHERE a.MACHINE_TYPE NOT IN (50, 62) AND a.MACHINE_ID = :macId`;

export const MacPartOut = db.define(
    "mec_part_used",
    {
        LOG_ID: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        PART_ID: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        MACHINE_ID: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        NIK: {
            type: DataTypes.STRING(255),
        },
        NAME: {
            type: DataTypes.STRING(255),
        },
        DEPARTEMEN: {
            type: DataTypes.STRING(255),
        },
        REASON: {
            type: DataTypes.STRING(255),
        },
        SCRAP: {
            type: DataTypes.STRING(255),
        },
        SITELINE: {
            type: DataTypes.STRING(255),
        },
        SCH_ID: {
            type: DataTypes.STRING(255),
        },
        PART_QTY: {
            type: DataTypes.DECIMAL,
        },
        ADD_ID: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
        MOD_ID: {
            type: DataTypes.BIGINT(20),
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
    }
);

export const qryGetSPartNeedle = `SELECT a.MACHINE_ID,
a.MACHINE_TYPE, 
b.TYPE_DESCRIPTION,
a.MACHINE_DESCRIPTION,
a.MACHINE_SERIAL,
a.MACHINE_UOM,
a.MACHINE_SECTION,
c.SECTION_NAME,
c.SECTION_CATEGORY,
a.MACHINE_BRAND,
a.STORAGE_INVENTORY_NODE_ID,
a.MACHINE_MODEL,
a.MACHINE_STATUS,
a.STATUS
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
WHERE a.MACHINE_TYPE IN (50, 62)
ORDER BY a.updatedAt DESC`;

// report mechanic stock
export const qryMecStockMain = `
SELECT a.MACHINE_ID,
a.MACHINE_TYPE, 
b.TYPE_DESCRIPTION,
a.MACHINE_DESCRIPTION,
a.MACHINE_SERIAL,
a.MACHINE_UOM,
a.MACHINE_SECTION,
c.SECTION_NAME,
c.SECTION_CATEGORY,
a.MACHINE_BRAND,
a.STORAGE_INVENTORY_NODE_ID,
a.MACHINE_MODEL,
a.MACHINE_STATUS,
a.STATUS,
ROUND(d.BALANCE,2) BALANCE,
ROUND(e.PART_IN,2) TOTAL_IN,
ROUND(e.PART_OUT,2) TOTAL_OUT,
ROUND(((d.BALANCE+IFNULL(e.PART_IN,0))-IFNULL(e.PART_OUT,0)),2) BALANCE_AKHIR
FROM mec_item_master a 
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
LEFT JOIN (
		SELECT 
		n.MACHINE_ID,
		SUM(n.PART_IN) PART_IN,
		SUM(n.PART_OUT) PART_OUT,
		SUM(n.PART_IN) - SUM(n.PART_OUT) AS BALANCE
		FROM (
			SELECT a.MACHINE_ID, SUM(a.MACHINE_QTY) PART_IN, 0 PART_OUT
			FROM mec_item_in a WHERE DATE(a.createdAt) <=  :lastDate
			GROUP BY a.MACHINE_ID
			UNION ALL 
			SELECT b.PART_ID MACHINE_ID, 0 PART_IN, SUM(b.PART_QTY) PART_OUT
			FROM mec_part_used b WHERE DATE(b.createdAt) <=  :lastDate
			GROUP BY b.MACHINE_ID
		) n GROUP BY n.MACHINE_ID
) d ON d.MACHINE_ID = a.MACHINE_ID
LEFT JOIN (
		SELECT 
		n.MACHINE_ID,
		SUM(n.PART_IN) PART_IN,
		SUM(n.PART_OUT) PART_OUT,
		SUM(n.PART_IN) - SUM(n.PART_OUT) AS BALANCE
		FROM (
			SELECT a.MACHINE_ID, SUM(a.MACHINE_QTY) PART_IN, 0 PART_OUT
			FROM mec_item_in a WHERE DATE(a.createdAt) BETWEEN :startDate AND :endDate
			GROUP BY a.MACHINE_ID
			UNION ALL 
			SELECT b.PART_ID MACHINE_ID, 0 PART_IN, SUM(b.PART_QTY) PART_OUT
			FROM mec_part_used b WHERE DATE(b.createdAt) BETWEEN :startDate AND :endDate
			GROUP BY b.MACHINE_ID
		) n GROUP BY n.MACHINE_ID
) e ON e.MACHINE_ID = a.MACHINE_ID
WHERE  a.MACHINE_TYPE IN (50, 62)
GROUP BY a.MACHINE_TYPE, a.MACHINE_ID
`;

export const qryGetDtlTransPart = `SELECT 
a.MACHINE_TYPE, 
b.TYPE_DESCRIPTION,
a.MACHINE_DESCRIPTION,
a.MACHINE_SERIAL,
a.MACHINE_SECTION,
c.SECTION_NAME,
c.SECTION_CATEGORY,
a.MACHINE_BRAND,
a.MACHINE_MODEL,
n.MACHINE_ID,
n.TRANSACTION_DATE,
SUM(n.PART_IN) PART_IN,
SUM(n.PART_OUT) PART_OUT
FROM (
	SELECT a.MACHINE_ID, DATE(a.createdAt) TRANSACTION_DATE, SUM(a.MACHINE_QTY) PART_IN, 0 PART_OUT
	FROM mec_item_in a WHERE DATE(a.createdAt) BETWEEN :startDate AND :endDate
	GROUP BY a.MACHINE_ID,  DATE(a.createdAt) 
	UNION ALL 
	SELECT b.PART_ID MACHINE_ID,  DATE(b.createdAt) TRANSACTION_DATE, 0 PART_IN, SUM(b.PART_QTY) PART_OUT
	FROM mec_part_used b WHERE DATE(b.createdAt) BETWEEN :startDate AND :endDate
	GROUP BY b.MACHINE_ID,  DATE(b.createdAt) 
) n
LEFT JOIN mec_item_master a ON a.MACHINE_ID = n.MACHINE_ID
LEFT JOIN mec_type_of_machine b ON b.TYPE_ID = a.MACHINE_TYPE
LEFT JOIN item_section c ON c.SECTION_ID = a.MACHINE_SECTION
GROUP BY n.MACHINE_ID, n.TRANSACTION_DATE`;



export const ListLamp = db.define(
  "list_lamp",
  {
    MAC: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    IP_ADDRESS: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ID_SITELINE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: true, // Sequelize otomatis handle createdAt & updatedAt
  }
);