import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterAttributeValue = db.define(
    "master_attribute_value",
    {
        ID: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
        },
        MASTER_ATTRIBUTE_ID: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        NAME: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        CODE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        CREATE_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATE_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        DESCRIPTION: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "master_attribute_value",
        timestamps: false,
        paranoid: true,
        deletedAt: "DELETED_AT",
    }
);

export default MasterAttributeValue;