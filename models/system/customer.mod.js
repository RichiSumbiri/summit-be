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
    IS_DELETE: {
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
    }
  }, {
    freezeTableName: true,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  export const CustomerDeliveryLoc = db.define('customer_delivery_loc', {
    CTLOC_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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
    CTLOC_ACTIVE: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CTC_ID: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    IS_DELETE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
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



export const CustomerBillingAddress = db.define(
    "customer_billing_address",
    {
      CTBIL_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      CTBIL_COMPANY: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      CTBIL_TITLE_OF_PERSON: DataTypes.STRING(5),
      CTBIL_NAME_OF_PERSON: DataTypes.STRING(100),
      CTBIL_POSITION_PERSON: DataTypes.STRING(50),
      CTBIL_PHONE1: DataTypes.STRING(20),
      CTBIL_PHONE2: DataTypes.STRING(20),
      CTBIL_FAX: DataTypes.STRING(50),
      CTBIL_EMAIL: DataTypes.STRING(100),
      CTBIL_SITE: DataTypes.STRING(50),
      CTBIL_ADDRESS1: DataTypes.TEXT,
      CTBIL_ADDRESS2: DataTypes.TEXT,
      CTBIL_CITY: DataTypes.STRING(60),
      CTBIL_PROVINCE: DataTypes.STRING(100),
      CTBIL_POS_CODE: DataTypes.STRING(50),
      CTBIL_COUNTRY_ID: DataTypes.STRING(2),
      CTBIL_ACTIVE: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      IS_DELETE: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      CTC_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      ADD_ID: DataTypes.BIGINT,
      MOD_ID: DataTypes.BIGINT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      freezeTableName: true,
      timestamps: true
    }
  );

   export const CustomerProductDivision = db.define(
    "customer_product_division",
    {
      CTPROD_DIVISION_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      CTPROD_DIVISION_CODE: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      CTPROD_DIVISION_NAME: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      CTPROD_DIVISION_STATUS: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      IS_DELETE: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      CTC_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      ADD_ID: DataTypes.BIGINT,
      MOD_ID: DataTypes.BIGINT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: "customer_product_division",
      timestamps: true
    }
  );
  

  export const CustomerProductSeason = db.define(
    "customer_product_season",
    {
      CTPROD_SESION_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      CTPROD_SESION_CODE: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      CTPROD_SESION_NAME: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      CTPROD_SESION_YEAR: {
        type: DataTypes.STRING(4),
        allowNull: false
      },
      CTPROD_SESION_STATUS: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      IS_DELETE: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      CTC_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      ADD_ID: DataTypes.BIGINT,
      MOD_ID: DataTypes.BIGINT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: "customer_product_season",
      timestamps: true
    }
  );


 export const CustomerProgramName = db.define(
    "customer_program_name",
    {
      CTPROG_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      CTPROG_CODE: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      CTPROG_NAME: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      CTPROG_STATUS: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      IS_DELETE: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      CTC_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      ADD_ID: DataTypes.BIGINT,
      MOD_ID: DataTypes.BIGINT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: "customer_program_name",
      timestamps: true
    }
  );



export const CustomerBuyPlan = db.define(
    "customer_buy_plan",
    {
      CTBUYPLAN_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      CTBUYPLAN_CODE: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      CTBUYPLAN_NAME: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      CTBUYPLAN_STATUS: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      IS_DELETE: {
        type: DataTypes.BIGINT,
        defaultValue: 0
      },
      CTC_ID: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      ADD_ID: DataTypes.BIGINT,
      MOD_ID: DataTypes.BIGINT,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      tableName: "customer_buy_plan",
      timestamps: true
    }
  );