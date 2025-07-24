import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterItemIdModel = db.define(
    "master_item_id",
    {
        ITEM_ID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        ITEM_CODE: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        ITEM_DESCRIPTION: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ITEM_ACTIVE: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
        ITEM_GROUP_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_TYPE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_CATEGORY_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_UOM_BASE: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ITEM_UOM_BASE_DESC: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ITEM_UOM_DEFAULT: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ITEM_UOM_DEFAULT_DESC: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ITEM_UOM_PURCHASE: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ITEM_UOM_PURCHASE_DESC: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        MAX_OVER_DELIVERY: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        MIN_UNDER_DELIVERY: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        ITEM_LOT_TRACKING: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_NONSTOCK: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_CAPITALIZATION: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_INSPECTION: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_IMAGE: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        CREATE_BY: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        CREATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UPDATE_BY: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        UNIT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "master_item_id",
        timestamps: false, // Disable Sequelize default timestamps if not needed
    }
);

export default MasterItemIdModel;