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




  export const ModelVendorShipperLocation = db.define('vendor_shipper_location', {
    VSL_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    VENDOR_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    VSL_NAME: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true
    },
    VSL_CONTACT_TITLE: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    VSL_CONTACT_NAME: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_CONTACT_POSITION: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_ADDRESS_1: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_ADDRESS_2: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_ADDRESS_CITY: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_ADDRESS_PROVINCE: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_ADDRESS_POSTAL_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    VSL_ADDRESS_COUNTRY_CODE: {
      type: DataTypes.CHAR(2),
      allowNull: true,
    },
    VSL_PHONE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    VSL_FAX: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    VSL_EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    VSL_SHIPPING_TERMS_CODE: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    VSL_PORT_LOADING: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    VSL_DEFAULT: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    VSL_ACTIVE: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
  }, {
    tableName: 'vendor_shipper_location',
    timestamps: false,
  });

  export const ModelVendorPurchaseDetail = db.define('vendor_purchase_detail', {
    VPD_ID: {
      type: DataTypes.INTEGER(200),
      autoIncrement: true,
      primaryKey: true,
    },
    VENDOR_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    CUSTOMER_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ITEM_GROUP_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ITEM_TYPE_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    ITEM_CATEGORY_ID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    MANUFACTURE_LEAD_TIME: {
      type: DataTypes.INTEGER(200),
      allowNull: true,
    },
    DELIVERY_MODE_CODE: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    DELIVERY_LEAD_TIME: {
      type: DataTypes.INTEGER(200),
      allowNull: true,
    },
    MIN_ORDER_QTY: {
      type: DataTypes.DECIMAL(60, 4),
      allowNull: true,
    },
    UOM_CODE: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    MIN_ORDER_QTY_COLOR_VALIDATION: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
    },
    MIN_ORDER_QTY_COLOR_QTY: {
      type: DataTypes.DECIMAL(60, 2),
      allowNull: true,
    },
    MIN_ORDER_QTY_SIZE_VALIDATION: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
    },
    MIN_ORDER_QTY_SIZE_QTY: {
      type: DataTypes.DECIMAL(60, 2),
      allowNull: true,
    },
    MIN_UNDER_RECEIPT: {
      type: DataTypes.DECIMAL(60, 2),
      allowNull: true,
    },
    MIN_OVER_RECEIPT: {
      type: DataTypes.DECIMAL(60, 2),
      allowNull: true,
    },
    NOTE_REMARKS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    VPD_ACTIVE: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
    },
    CREATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    CREATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    UPDATE_BY: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    UPDATE_DATE: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'vendor_purchase_detail',
    timestamps: false,
    freezeTableName: true,
  });
ModelVendorPurchaseDetail.belongsTo(ModelVendorDetail, {
    foreignKey: "VENDOR_ID",
    as: "VENDOR_DETAIL"
})



export const queryGetVendorPurchaseDetailByVDC = `
SELECT
	vpd.VPD_ID,
	vpd.VENDOR_ID,
	vpd.CUSTOMER_ID,
	cd.CTC_NAME AS CUSTOMER_NAME,
	vpd.ITEM_GROUP_ID,
	mig.ITEM_GROUP_CODE,
	mig.ITEM_GROUP_DESCRIPTION,
	vpd.ITEM_TYPE_ID,
	mit.ITEM_TYPE_CODE,
	mit.ITEM_TYPE_DESCRIPTION,
	vpd.ITEM_CATEGORY_ID,
	mic.ITEM_CATEGORY_CODE,
	mic.ITEM_CATEGORY_DESCRIPTION,
	vpd.MANUFACTURE_LEAD_TIME,
	vpd.DELIVERY_MODE_CODE,
	mdm.DELIVERY_MODE_DESC,
	vpd.DELIVERY_LEAD_TIME,
	vpd.MIN_ORDER_QTY,
	vpd.UOM_CODE,
	vpd.MIN_ORDER_QTY_COLOR_VALIDATION,
	vpd.MIN_ORDER_QTY_COLOR_QTY,
	vpd.MIN_ORDER_QTY_SIZE_VALIDATION,
	vpd.MIN_ORDER_QTY_SIZE_QTY,
	vpd.MIN_UNDER_RECEIPT,
	vpd.MIN_OVER_RECEIPT,
	vpd.NOTE_REMARKS,
	vpd.VPD_ACTIVE,
	vpd.CREATE_BY,
	vpd.CREATE_DATE,
	vpd.UPDATE_BY,
	vpd.UPDATE_DATE
FROM
	vendor_purchase_detail vpd
LEFT JOIN customer_detail cd ON cd.CTC_ID = vpd.CUSTOMER_ID 
LEFT JOIN master_item_group mig ON mig.ITEM_GROUP_ID = vpd.ITEM_GROUP_ID 
LEFT JOIN master_item_type mit ON mit.ITEM_TYPE_ID = vpd.ITEM_TYPE_ID 
LEFT JOIN master_item_category mic ON mic.ITEM_CATEGORY_ID = vpd.ITEM_CATEGORY_ID 
LEFT JOIN master_delivery_mode mdm ON mdm.DELIVERY_MODE_CODE = vpd.DELIVERY_MODE_CODE 
WHERE vpd.VENDOR_ID = :vendorID
`