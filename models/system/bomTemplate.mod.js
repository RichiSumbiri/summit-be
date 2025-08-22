import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import MasterItemIdModel from "./masterItemId.mod.js";
import {CustomerDetail, CustomerProductDivision, CustomerProductSeason} from "./customer.mod.js";
import {MasterOrderType} from "../setup/orderType.mod.js";
import Users from "../setup/users.mod.js";
import ColorChartMod from "./colorChart.mod.js";
import SizeChartMod from "./sizeChart.mod.js";

const BomTemplateModel = db.define(
    "bom_template",
    {
        ID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        NAME: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        LAST_REV_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        CUSTOMER_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ORDER_TYPE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CUSTOMER_DIVISION_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CUSTOMER_SESSION_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        CREATED_ID: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        UPDATED_ID: {
            type: DataTypes.STRING(200),
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

BomTemplateModel.belongsTo(MasterItemIdModel, {
    foreignKey: "MASTER_ITEM_ID",
    as: "MASTER_ITEM"
})

BomTemplateModel.belongsTo(CustomerDetail, {
    foreignKey: "CUSTOMER_ID",
    as: "CUSTOMER"
})

BomTemplateModel.belongsTo(CustomerProductDivision, {
    foreignKey: "CUSTOMER_DIVISION_ID",
    as: "CUSTOMER_DIVISION"
})

BomTemplateModel.belongsTo(CustomerProductSeason, {
    foreignKey: "CUSTOMER_SESSION_ID",
    as: "CUSTOMER_SESSION"
})

BomTemplateModel.belongsTo(MasterOrderType, {
    foreignKey: "ORDER_TYPE_ID",
    as: "ORDER_TYPE"
})

export const BomTemplateNote = db.define(
    "bom_template_notes", {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        freezeTableName: true,
        timestamps: false,
    }
)

export const BomTemplateRevModel = db.define(
    "bom_template_rev",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        TITLE: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        DESCRIPTION: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        SEQUENCE: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

BomTemplateModel.belongsTo(BomTemplateRevModel, {
    foreignKey: "LAST_REV_ID",
    as: "LAST_REV"
})

export const BomTemplateColor = db.define(
    "bom_template_color",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        COLOR_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: "bom_template_color",
        timestamps: false,
        paranoid: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
    }
);

export const BomTemplateSize = db.define(
    "bom_template_size",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        SIZE_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        tableName: "bom_template_size",
        timestamps: false,
        paranoid: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
    }
);

BomTemplateColor.belongsTo(ColorChartMod, {
    foreignKey: "COLOR_ID",
    as: "COLOR"
})

BomTemplateSize.belongsTo(SizeChartMod, {
    foreignKey: "SIZE_ID",
    as: "SIZE"
})

BomTemplateSize.belongsTo(BomTemplateRevModel, {
    foreignKey: "REV_ID",
    as: "REV"
})

export default BomTemplateModel;