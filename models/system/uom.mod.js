import db from "../../config/database.js";
import { DataTypes } from "sequelize";


export const ModelMasterUOM = db.define('master_uom', {
    UOM_ID: {
      type: DataTypes.CHAR(5),
      primaryKey: true,
      allowNull: false
    },
    UOM_CODE: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    UOM_DESCRIPTION: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'master_uom',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });


  export const ModelUOMConversion = db.define('uom_conversion', {
    ID_CONVERSION: {
      type: DataTypes.INTEGER(200),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    UOM_ID_SOURCE: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    UOM_ID_DESTINATION: {
      type: DataTypes.CHAR(5),
      allowNull: true
    },
    CONVERSION_FACTOR: {
      type: DataTypes.DECIMAL(60, 6),
      allowNull: true
    },
    ACTIVE_FLAG: {
      type: DataTypes.INTEGER(1),
      allowNull: true   
    }
  }, {
    tableName: 'uom_conversion',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci'
  });


export const UomCategories = db.define("uom_categories", {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ITEM_CATEGORY_ID: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  ITEM_CATEGORY_CODE: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  UOM: {
    type: DataTypes.STRING(5)
  }
}, {
  freezeTableName: true,
  timestamps: false
})


  export const queryGetUOMConversion = `
  SELECT
	uc.ID_CONVERSION,
	uc.UOM_ID_SOURCE,
	mu.UOM_CODE AS UOM_CODE_SOURCE,
	mu.UOM_DESCRIPTION AS UOM_DESCRIPTION_SOURCE,
	uc.UOM_ID_DESTINATION,
	mu2.UOM_CODE AS UOM_CODE_DESTINATION,
	mu2.UOM_DESCRIPTION AS UOM_DESCRIPTION_DESTINATION,
	uc.CONVERSION_FACTOR,
	uc.ACTIVE_FLAG
FROM
	uom_conversion uc
LEFT JOIN master_uom mu ON mu.UOM_ID = uc.UOM_ID_SOURCE 
LEFT JOIN master_uom mu2 ON mu2.UOM_ID = uc.UOM_ID_DESTINATION 
  
  `;