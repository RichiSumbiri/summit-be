import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterCompanyModel = db.define(
    "master_company",
    {
        ID: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        NAME: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        CODE: {
            type: DataTypes.STRING(3),
            allowNull: false,
        },
        ADDRESS: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        NO_TEL: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        FAX: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        EMAIL: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        tableName: "master_company",
        timestamps: false,
    }
);

export default MasterCompanyModel;