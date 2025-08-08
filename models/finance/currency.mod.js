import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const queryGetListValuta = `SELECT
 mv.ID,
 mv.VALUTA_CODE,
 mv.VALUTA_DESC,
 cd.CURRENCY_ID
FROM master_valuta mv 
LEFT JOIN currency_default cd ON cd.CURRENCY_CODE = mv.VALUTA_CODE`



export const qryListCurrency = `SELECT
 cd.CURRENCY_CODE,
 mv.VALUTA_DESC AS CURRENCY_DESC,
 cd.CURRENCY_ID,
 xuw.USER_INISIAL USER_ADD,
 xuw1.USER_INISIAL USER_MOD,
 cd.IS_ACTIVE,
 cd.IS_PRIMARY,
 cd.createdAt,
 cd.updatedAt
FROM currency_default cd 
JOIN master_valuta mv ON cd.CURRENCY_CODE = mv.VALUTA_CODE
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = cd.ADD_ID
LEFT JOIN xref_user_web xuw1 ON xuw1.USER_ID = cd.MOD_ID 
WHERE cd.deletedAt IS NULL`

export const CurrencyDefault = db.define('currency_default', {
  CURRENCY_ID: {
    type: DataTypes.BIGINT,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true
  },
  CURRENCY_CODE: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  IS_PRIMARY: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  IS_ACTIVE: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ADD_ID: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  MOD_ID: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  freezeTableName: 'currency_default',
  timestamps: true,        // aktifkan agar Sequelize mengelola createdAt & updatedAt
  paranoid: true           // aktifkan soft delete (menggunakan deletedAt)
});



//exchange rate

export const CurrencyExcRateHeader = db.define('currency_exc_rate_header', {
  CERH_ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  CERH_EFECTIVE_DATE: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  ADD_ID: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  MOD_ID: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  IS_ACTIVE: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'currency_exc_rate_header',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});


export const CurrencyExcRateDetail = db.define('currency_exc_rate_detail', {
  CER_ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  CERH_ID: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  CER_FROM_CODE: {
    type: DataTypes.STRING(3),
    allowNull: true,
  },
  CER_TO_CODE: {
    type: DataTypes.STRING(3),
    allowNull: true,
  },
  CER_FROM_DESC: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  CER_TO_DESC: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  CER_RATE: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  IS_ACTIVE: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  ADD_ID: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  MOD_ID: {
    type: DataTypes.BIGINT,
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
}, {
  tableName: 'currency_exc_rate_detail',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});


export const qryGetCurrencyExchange = `SELECT 
 cerh.*,
 xuw.USER_INISIAL AS USER_INISIAL_ADD,
 xuw1.USER_INISIAL AS USER_INISIAL_MOD
FROM currency_exc_rate_header cerh 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = cerh.ADD_ID
LEFT JOIN xref_user_web xuw1 ON xuw1.USER_ID = cerh.MOD_ID
ORDER BY cerh.CERH_EFECTIVE_DATE DESC
`

export const qryGetDetaulCurExch = `SELECT 
 cerd.*,
 cerh.CERH_EFECTIVE_DATE,
 xuw.USER_INISIAL AS USER_INISIAL_ADD,
 xuw1.USER_INISIAL AS USER_INISIAL_MOD
FROM currency_exc_rate_detail cerd  
LEFT JOIN currency_exc_rate_header cerh ON cerh.CERH_ID = cerd.CER_ID 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = cerd.ADD_ID
LEFT JOIN xref_user_web xuw1 ON xuw1.USER_ID = cerd.MOD_ID
ORDER BY cerh.CERH_EFECTIVE_DATE DESC`