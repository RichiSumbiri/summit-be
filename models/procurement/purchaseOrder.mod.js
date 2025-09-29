import {DataTypes} from "sequelize";
import db from "../../config/database.js";
import {ListCountry} from "../list/referensiList.mod.js";
import {ModelWarehouseDetail} from "../setup/WarehouseDetail.mod.js";
import {ModelVendorDetail, ModelVendorShipperLocation} from "../system/VendorDetail.mod.js";
import MasterCompanyModel from "../setup/company.mod.js";
import MasterUnitModel from "../setup/unit.mod.js";
import {MasterPayMethode} from "../system/finance.mod.js";
import Users from "../setup/users.mod.js";
import ColorChartMod from "../system/colorChart.mod.js";
import MasterItemIdModel from "../system/masterItemId.mod.js";
import SizeChartMod from "../system/sizeChart.mod.js";

export const PurchaseOrderRevModel = db.define(
    "purchase_order_rev",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        NAME: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        DESCRIPTION: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        MPO_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        SEQUENCE: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "purchase_order_rev",
        timestamps: false,
    }
);

export const PurchaseOrderModel = db.define(
    "purchase_order",
    {
        MPO_ID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        MPO_DATE: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        VENDOR_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        VENDOR_DETAIL: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        VENDOR_SHIPPER_LOCATION_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        COMPANY_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        INVOICE_DETAIL: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        INVOICE_UNIT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DELIVERY_UNIT_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        CURRENCY_CODE: {
            type: DataTypes.STRING(5),
            allowNull: true,
        },
        MOQ_VALIDATION_STATUS: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        SURCHARGE_AMOUNT: {
            type: DataTypes.DECIMAL(60, 6),
            allowNull: true,
        },
        TAX_PERCENTAGE: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        MOQ_NOTE: {
            type: DataTypes.STRING(255),
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
        RECEIPT_STATUS: {
            type: DataTypes.STRING(200),
            defaultValue: 'Not Completed'
        },
    },
    {
        tableName: "purchase_order",
        timestamps: false,
    }
);

export const PurchaseOrderNotesModel = db.define(
    "purchase_order_notes",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        PURCHASE_ORDER_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        MPO_STATUS: {
            type: DataTypes.ENUM("Open", "Confirmed", "Closed", "Deleted"),
            allowNull: true,
        },
        MPO_ETD: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        MPO_ETA: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        DELIVERY_MODE_CODE: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        DELIVERY_TERM: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        IS_APPROVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        COUNTRY_ID: {
            type: DataTypes.STRING(3),
            allowNull: true,
        },
        PORT_DISCHARGE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        DELIVERY_UNIT_ID: {
            type: DataTypes.STRING(2),
            defaultValue: "1",
            allowNull: true,
        },
        WAREHOUSE_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        PAYMENT_TERM_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        PAYMENT_REFERENCE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "purchase_order_notes",
        timestamps: false,
    }
);

PurchaseOrderModel.belongsTo(PurchaseOrderRevModel, {
    foreignKey: "REV_ID",
    as: "REV"
})




PurchaseOrderModel.belongsTo(ModelVendorShipperLocation, {
    foreignKey: "VENDOR_SHIPPER_LOCATION_ID",
    as: "VENDOR_SHIPPER_LOCATION"
})

PurchaseOrderModel.belongsTo(MasterUnitModel, {
    foreignKey: "INVOICE_UNIT_ID",
    as: "INVOICE_UNIT"
})


PurchaseOrderModel.belongsTo(MasterCompanyModel, {
    foreignKey: "COMPANY_ID",
    as: "COMPANY"
})

PurchaseOrderModel.belongsTo(ModelVendorDetail, {
    foreignKey: "VENDOR_ID",
    as: "VENDOR"
})

PurchaseOrderModel.belongsTo(Users, {
    foreignKey: "CREATE_BY",
    as: "CREATED"
})

PurchaseOrderModel.belongsTo(Users, {
    foreignKey: "UPDATE_BY",
    as: "UPDATED"
})

PurchaseOrderNotesModel.belongsTo(PurchaseOrderRevModel, {
    foreignKey: "REV_ID",
    as: "REV"
})

PurchaseOrderNotesModel.belongsTo(PurchaseOrderModel, {
    foreignKey: "PURCHASE_ORDER_ID",
    as: "PURCHASE_ORDER"
})

PurchaseOrderNotesModel.belongsTo(MasterPayMethode, {
    foreignKey: "PAYMENT_TERM_ID",
    as: "PAYMENT_TERM"
})

PurchaseOrderNotesModel.belongsTo(ModelWarehouseDetail, {
    foreignKey: "WAREHOUSE_ID",
    as: "WAREHOUSE"
})

PurchaseOrderNotesModel.belongsTo(ListCountry, {
    foreignKey: "COUNTRY_ID",
    targetKey: "COUNTRY_CODE",
    as: "COUNTRY"
})

PurchaseOrderNotesModel.belongsTo(MasterUnitModel, {
    foreignKey: "DELIVERY_UNIT_ID",
    as: "DELIVERY_UNIT"
})

PurchaseOrderNotesModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

PurchaseOrderNotesModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})