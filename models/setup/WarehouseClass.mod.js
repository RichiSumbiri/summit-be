import db from "../../config/database.js";
import { DataTypes } from "sequelize";



  
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


export const ModelMasterLocationType = db.define('master_location_type', {
    LTC_ID: {
      type: DataTypes.STRING(6),
      primaryKey: true,
      allowNull: false,
    },
    LTC_NAME: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }, {
    tableName: 'master_location_type',
    timestamps: false, // Assuming no timestamps (createdAt/updatedAt)
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    indexes: [
      {
        unique: true,
        fields: ['LTC_ID']
      }
    ]
  });


export const ModelMasterOperationType = db.define('master_operation_type', {
  OID_ID: {
    type: DataTypes.STRING(6),
    allowNull: false,
    primaryKey: true
  },
  OID_NAME: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'master_operation_type',
  timestamps: false, // If the table doesn't include `createdAt` and `updatedAt`
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci'
});