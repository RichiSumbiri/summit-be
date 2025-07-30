import { DataTypes } from "sequelize";
import db from "../../config/database.js";




export const ModelVendorDetail = db.define('vendor_detail', {
     VENDOR_ID: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false
    },
    VENDOR_CODE: DataTypes.STRING(100),
    VENDOR_NAME: DataTypes.STRING(255),
    VENDOR_ACTIVE: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    VENDOR_COMPANY_NAME: DataTypes.STRING(200),
    VENDOR_PHONE: DataTypes.STRING(100),
    VENDOR_FAX: DataTypes.STRING(100),
    VENDOR_WEB: DataTypes.STRING(100),
    VENDOR_ADDRESS_1: DataTypes.TEXT,
    VENDOR_ADDRESS_2: DataTypes.TEXT,
    VENDOR_CITY: DataTypes.TEXT,
    VENDOR_PROVINCE: DataTypes.TEXT,
    VENDOR_POSTAL_CODE: DataTypes.TEXT,
    VENDOR_COUNTRY_CODE: DataTypes.CHAR(2),
    VENDOR_CONTACT_TITLE: {
      type: DataTypes.STRING(10),
      defaultValue: 'Mr. '
    },
    VENDOR_CONTACT_NAME: DataTypes.STRING(200),
    VENDOR_CONTACT_POSITION: DataTypes.STRING(100),
    VENDOR_CONTACT_PHONE_1: DataTypes.STRING(100),
    VENDOR_CONTACT_PHONE_2: DataTypes.STRING(100),
    VENDOR_CONTACT_EMAIL: DataTypes.STRING(100),
    VENDOR_CLASS: DataTypes.STRING(100),
    VENDOR_PAYMENT_CURRENCY: DataTypes.STRING(3),
    VENDOR_PAYMENT_TERM_CODE: DataTypes.STRING(100),
    VENDOR_PAYMENT_REF: DataTypes.STRING(100),
    VENDOR_ACCOUNT_BANK_NAME: DataTypes.STRING(100),
    VENDOR_ACCOUNT_BANK_BRANCH: DataTypes.STRING(100),
    VENDOR_ACCOUNT_BANK_CURRENCY_CODE: DataTypes.STRING(3),
    VENDOR_ACCOUNT_BANK_COUNTRY_CODE: DataTypes.STRING(100),
    VENDOR_ACCOUNT_NAME: DataTypes.STRING(100),
    VENDOR_ACCOUNT_NO: DataTypes.STRING(100),
    VENDOR_ACCOUNT_SWIFT_CODE: DataTypes.STRING(100),
    VENDOR_ACCOUNT_INSTRUCTION: DataTypes.TEXT,
    VENDOR_REMITTANCE_TITLE: {
      type: DataTypes.STRING(10),
      defaultValue: 'Mr. '
    },
    VENDOR_REMITTANCE_NAME: DataTypes.STRING(100),
    VENDOR_REMITTANCE_POSITION: DataTypes.STRING(100),
    VENDOR_REMITTANCE_PHONE_1: DataTypes.STRING(100),
    VENDOR_REMITTANCE_PHONE_2: DataTypes.STRING(100),
    VENDOR_REMITTANCE_EMAIL: DataTypes.STRING(100),
    VENDOR_SHIPPING_TERMS_CODE: DataTypes.CHAR(3),
    VENDOR_DELIVERY_MODE_CODE: DataTypes.CHAR(3),
    VENDOR_FOB_POINT_CODE: DataTypes.CHAR(3),
    CREATE_BY: DataTypes.STRING(100),
    CREATE_DATE: DataTypes.DATE,
    UPDATE_BY: DataTypes.STRING(100),
    UPDATE_DATE: DataTypes.DATE
  }, {
    tableName: 'vendor_detail',
    timestamps: false
  });
