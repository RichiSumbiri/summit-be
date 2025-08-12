import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import MasterItemIdModel from "./masterItemId.mod.js";
import {ModelVendorDetail} from "./VendorDetail.mod.js";
import Users from "../setup/users.mod.js";

const BomTemplateListModel = db.define(
    "bom_template_list",
    {
        ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            primaryKey: true,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        BOM_TEMPLATE_LINE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM("Confirmed", "Canceled", "Deleted", "Open"),
            allowNull: true,
        },
        COSTING_CONSUMER_PER_ITEM: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        INTERNAL_CUSTOMER_PER_ITEM: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        IS_SPLIT_COLOR: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        IS_SPLIT_SIZE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        VENDOR_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ITEM_POSITION: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        IS_SPLIT_STATUS: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        CREATED_ID: {
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
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        APPROVE_BY: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        APPROVE_DATE: {
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
    },
    {
        freezeTableName: true,
        timestamps: false,
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

BomTemplateListModel.belongsTo(MasterItemIdModel, {
    foreignKey: "MASTER_ITEM_ID",
    as: "MASTER_ITEM"
})

BomTemplateListModel.belongsTo(ModelVendorDetail, {
    foreignKey: "VENDOR_ID",
    as: "VENDOR"
})

BomTemplateListModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

BomTemplateListModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})



export default BomTemplateListModel;