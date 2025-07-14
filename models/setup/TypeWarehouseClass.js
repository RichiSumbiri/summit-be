import db from "../../config/database.js";
import { DataTypes } from "sequelize";

export const MasterItemGroup = db.define('master_item_group', {
    ITEM_GROUP_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ITEM_GROUP_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: 'master_item_group_unique',
    },
    ITEM_GROUP_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ITEM_GROUP_ACTIVE: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'Y',
    },
    CREATE_BY: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'master_item_group',
    timestamps: false, // since you don't have createdAt/updatedAt fields
  });


export const MasterItemTypes = db.define('master_item_type', {
    ITEM_TYPE_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ITEM_TYPE_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    ITEM_TYPE_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ITEM_GROUP_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ITEM_TYPE_STOCK: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true
    },
    ITEM_TYPE_ACTIVE: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true
    }
  }, {
    tableName: 'master_item_type',
    timestamps: false,
    freezeTableName: true
  });


  export const MasterItemCategories = db.define('master_item_category', {
    ITEM_CATEGORY_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ITEM_CATEGORY_CODE: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: 'master_item_category_unique'
    },
    ITEM_CATEGORY_BASE_UOM: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    ITEM_CATEGORY_BASE_UOM_DESCRIPTION: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    ITEM_CATEGORY_DESCRIPTION: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ITEM_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ITEM_CATEGORY_INSPECTION_FLAG: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'N'
    },
    ITEM_CATEGORY_LOTSERIAL_FLAG: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'N'
    },
    ITEM_CATEGORY_LABDIPS_AVAILABILITY: {
      type: DataTypes.ENUM('Y', 'N'),
      defaultValue: 'N'
    },
    ITEM_CATEGORY_LOTBATCH_UOM_CODE: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'master_item_category',
    timestamps: false
  });


  export const MasterWarehouseClass = db.define('master_warehouse_class', {
    WHC_ID: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false
    },
    WHC_REF_CODE: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: 'master_warehouse_class_unique'
    },
    WHC_DESCRIPTION: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    WHC_ACTIVE: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true
    },
    WHC_ITEM_CATEGORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'master_warehouse_class',
    timestamps: false
  });


  export const queryGetAllMasterWarehouseClass = `
  SELECT
	m.WHC_ID,
	m.WHC_REF_CODE,
	m.WHC_DESCRIPTION,
	m.WHC_ACTIVE,
	m.WHC_ITEM_CATEGORY_ID,
	m2.ITEM_CATEGORY_CODE,
	m2.ITEM_CATEGORY_DESCRIPTION,
	m3.ITEM_TYPE_ID,
	m3.ITEM_TYPE_CODE,
	m3.ITEM_TYPE_DESCRIPTION,
	m4.ITEM_GROUP_ID,
	m4.ITEM_GROUP_CODE,
	m4.ITEM_GROUP_DESCRIPTION
FROM
	master_warehouse_class m
LEFT JOIN master_item_category m2 ON m2.ITEM_CATEGORY_ID = m.WHC_ITEM_CATEGORY_ID
LEFT JOIN master_item_type m3 ON m3.ITEM_TYPE_ID = m2.ITEM_TYPE_ID
LEFT JOIN master_item_group m4 ON m4.ITEM_GROUP_ID = m3.ITEM_GROUP_ID 
  `;