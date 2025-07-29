import { DataTypes } from "sequelize";
import db from "../../config/database.js";

 export const CustomerDetail = db.define('customer_detail', {
    CTC_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    CTC_CODE: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    CTC_NAME: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    CTC_COMPANY_NAME: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    CTC_CREDIT_LIMIT: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CTC_TITLE_OF_PERSON: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    CTC_NAME_OF_PERSON: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTC_POSITION_PERSON: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTC_PHONE1: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CTC_PHONE2: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CTC_FAX: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTC_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTC_SITE: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTC_ADDRESS1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CTC_ADDRESS2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CTC_CITY: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    CTC_PROVINCE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTC_POS_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTC_COUNTRY_ID: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    CTC_CLASS: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTC_ACTIVE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    CTC_SHIP_TERM_CODE: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: 'Shipping Term Code'
    },
    CTC_SHIP_VIA: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: 'Shipping Via'
    },
    CTC_FOB_POINT_CODE: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    CTC_CURRENCY: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    CTC_PAY_LEADTIME: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTC_PAY_METHODE: {
      type: DataTypes.STRING(100),
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
    }
  }, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  export const CustomerDeliveryLoc = db.define('customer_delivery_loc', {
    CTLOC_ID: {
      type: DataTypes.STRING(10),
      allowNull: false,
      primaryKey: true
    },
    CTLOC_CODE: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CTLOC_NAME: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    CTLOC_TITLE_OF_PERSON: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    CTLOC_NAME_OF_PERSON: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTLOC_POSITION_PERSON: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTLOC_PHONE1: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CTLOC_PHONE2: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    CTLOC_FAX: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTLOC_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTLOC_SITE: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTLOC_ADDRESS1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CTLOC_ADDRESS2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CTLOC_CITY: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    CTLOC_PROVINCE: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    CTLOC_POS_CODE: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CTLOC_COUNTRY_ID: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    CTC_ID: {
      type: DataTypes.STRING(10),
      allowNull: false
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
    }
  }, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
