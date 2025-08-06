import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import MasterItemIdModel from "./masterItemId.mod.js";
import {CustomerDetail, CustomerProductDivision, CustomerProductSeason} from "./customer.mod.js";

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
        REVISION_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        CUSTOMER_ID: {
            type: DataTypes.STRING(15),
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
        NOTE: {
            type: DataTypes.TEXT,
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

export default BomTemplateModel;