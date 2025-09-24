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
        MPO_STATUS: {
            type: DataTypes.ENUM("Open", "Confirmed", "Cancel", "Deleted"),
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
        COUNTRY_ID: {
            type: DataTypes.STRING(3),
            allowNull: true,
        },
        PORT_DISCHARGE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        WAREHOUSE_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        VENDOR_ID: {
            type: DataTypes.STRING(10),
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
        SURCHARGE_AMOUNT: {
            type: DataTypes.DECIMAL(60, 6),
            allowNull: true,
        },
        TAX_PERCENTAGE: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        ACCEPT_MOQ: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        MOQ_REMAKE: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
    },
    {
        tableName: "purchase_order",
        timestamps: false,
    }
);

export  const PurchaseOrderMoqModel = db.define(
    "purchase_order_moq",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        CATEGORY: {
            type: DataTypes.ENUM("ORDER", "COLOR", "SIZE"),
            allowNull: false,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        COLOR_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        PO_QTY: {
            type: DataTypes.DECIMAL(65, 2),
            defaultValue: 0,
            allowNull: false,
        },
        MIN_QTY: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        NOTE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "purchase_order_moq",
        timestamps: false,
    }
);


PurchaseOrderModel.belongsTo(PurchaseOrderRevModel, {
    foreignKey: "REV_ID",
    as: "REV"
})

PurchaseOrderModel.belongsTo(ListCountry, {
    foreignKey: "COUNTRY_ID",
    as: "COUNTRY"
})

PurchaseOrderModel.belongsTo(ModelWarehouseDetail, {
    foreignKey: "WAREHOUSE_ID",
    as: "WAREHOUSE"
})

PurchaseOrderModel.belongsTo(ModelVendorDetail, {
    foreignKey: "VENDOR_ID",
    as: "VENDOR"
})

PurchaseOrderModel.belongsTo(ModelVendorShipperLocation, {
    foreignKey: "VENDOR_SHIPPER_LOCATION_ID",
    as: "VENDOR_SHIPPER_LOCATION"
})

PurchaseOrderModel.belongsTo(MasterUnitModel, {
    foreignKey: "INVOICE_UNIT_ID",
    as: "INVOICE_UNIT"
})

PurchaseOrderModel.belongsTo(MasterUnitModel, {
    foreignKey: "DELIVERY_UNIT_ID",
    as: "DELIVERY_UNIT"
})

PurchaseOrderModel.belongsTo(MasterCompanyModel, {
    foreignKey: "COMPANY_ID",
    as: "COMPANY"
})

PurchaseOrderModel.belongsTo(MasterPayMethode, {
    foreignKey: "PAYMENT_TERM_ID",
    as: "PAYMENT_TERM"
})

PurchaseOrderModel.belongsTo(Users, {
    foreignKey: "CREATE_BY",
    as: "CREATED"
})

PurchaseOrderModel.belongsTo(Users, {
    foreignKey: "UPDATE_BY",
    as: "UPDATED"
})

PurchaseOrderMoqModel.belongsTo(ColorChartMod, {
    foreignKey: "COLOR_ID",
    as: "COLOR"
})

PurchaseOrderMoqModel.belongsTo(MasterItemIdModel, {
    foreignKey: "MASTER_ITEM_ID",
    as: "MASTER_ITEM"
})