import { DataTypes } from "sequelize";
import db from "../../config/database.js";




export const ModelVendorDetail = db.define('vendor_detail', {
    VENDOR_ID: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    VENDOR_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_NAME: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    VENDOR_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    VENDOR_COMPANY_NAME: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    VENDOR_PHONE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_FAX: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_WEB: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ADDRESS_1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VENDOR_ADDRESS_2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VENDOR_CITY: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VENDOR_PROVINCE: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VENDOR_POSTAL_CODE: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VENDOR_CONTACT_NAME: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    VENDOR_CONTACT_PHONE_1: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_CONTACT_PHONE_2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_CONTACT_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_CLASS: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_PAYMENT_CURRENCY: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    VENDOR_PAYMENT_TERM_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    VENDOR_PAYMENT_REF: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_BANK_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_BANK_BRANCH: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_BANK_COUNTRY_ID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_NO: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_SWIFT_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_ACCOUNT_INSTRUCTION: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    VENDOR_REMITTANCE_NAME: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_REMITTANCE_PHONE_1: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_REMITTANCE_PHONE_2: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    VENDOR_REMITTANCE_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CREATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UPDATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'vendor_detail',
    timestamps: false
  });
