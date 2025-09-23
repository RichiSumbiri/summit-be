import db from "../../config/database.js";
import { DataTypes } from "sequelize";


export const ModelWarehouseDetail = db.define('warehouse_detail', {
    WHI_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true,
    },
    WHI_CODE: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    WHI_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHC_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    WHI_STOCKHOLDING_COMPANY_ID: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    WHI_OPERATING_COMPANY_ID: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    WHI_SITE_ID: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    WHI_UNIT_ID: {
      type: DataTypes.INTEGER(20),
      allowNull: false,
      defaultValue:'1',
    },
    WHI_DEPT_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_OID_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_LTC_ID: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    WHI_CP_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_POSITION: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_ADDRESS_LINE_1: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_ADDRESS_LINE_2: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_ADDRESS_CITY: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_ADDRESS_PROVINCE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_ADDRESS_POSTAL_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_ADDRESS_COUNTRY: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_PHONE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_FAX: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    WHI_CP_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    tableName: 'warehouse_detail',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });



  export const qryGetMasterWarehouseDetail = `
  SELECT
	wd.WHI_ID,
	wd.WHI_CODE,
	wd.WHI_NAME,
	wd.WHC_ID,
	m.WHC_REF_CODE,
	m.WHC_DESCRIPTION,
	m.WHC_ITEM_CATEGORY_ID,
	m3.ITEM_CATEGORY_CODE,
	m3.ITEM_CATEGORY_DESCRIPTION,
	wd.WHI_STOCKHOLDING_COMPANY_ID,
	m1.NAME AS WHI_STOCKHOLDING_COMPANY_NAME,
	wd.WHI_OPERATING_COMPANY_ID,
	m2.NAME AS WHI_OPERATING_COMPANY_NAME,
	wd.WHI_OID_ID,
	m5.OID_NAME,
	wd.WHI_LTC_ID,
	m4.LTC_NAME,
	wd.WHI_SITE_ID,
	wd.WHI_DEPT_ID,
	wd.WHI_ACTIVE,
	wd.WHI_CP_NAME,
	wd.WHI_CP_POSITION,
	wd.WHI_CP_ADDRESS_LINE_1,
	wd.WHI_CP_ADDRESS_LINE_2,
	wd.WHI_CP_ADDRESS_CITY,
	wd.WHI_CP_ADDRESS_PROVINCE,
	wd.WHI_CP_ADDRESS_POSTAL_CODE,
	wd.WHI_CP_ADDRESS_COUNTRY,
	wd.WHI_CP_PHONE,
	wd.WHI_CP_FAX,
	wd.WHI_CP_EMAIL
FROM
	warehouse_detail wd
LEFT JOIN master_company m1 ON m1.ID = wd.WHI_STOCKHOLDING_COMPANY_ID
LEFT JOIN master_company m2 ON m2.ID = wd.WHI_OPERATING_COMPANY_ID
LEFT JOIN master_warehouse_class m ON m.WHC_ID = wd.WHC_ID
LEFT JOIN master_item_category m3 ON m3.ITEM_CATEGORY_ID = m.WHC_ITEM_CATEGORY_ID
LEFT JOIN master_location_type m4 ON m4.LTC_ID = wd.WHI_LTC_ID
LEFT JOIN master_operation_type m5 ON m5.OID_ID = wd.WHI_OID_ID
`;


export const ModelWarehouseDetailQuality = db.define('warehouse_detail_quality', {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    WHI_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ITEM_QUALITY_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    ENABLE_FLAG: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    tableName: 'warehouse_detail_quality',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });


  export const ModelWarehouseDetailStatus = db.define('warehouse_detail_status', {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    WHI_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ITEM_STATUS_CODE: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    ENABLE_FLAG: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    tableName: 'warehouse_detail_status',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });