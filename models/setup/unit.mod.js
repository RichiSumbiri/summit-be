import { DataTypes } from "sequelize";

import db from "../../config/database.js";


const MasterUnitModel = db.define(
    "master_unit",
    {
        UNIT_ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        UNIT_CODE: {
            type: DataTypes.STRING(5),
            allowNull: false,
        },
        UNIT_NAME: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        UNIT_LOCATION: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        UNIT_CREATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UNIT_PHONE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        UNIT_FAX: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        UNIT_EMAIL: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        COMPANY_ID: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        tableName: "master_unit",
        timestamps: false, // Disable Sequelize default timestamps if not needed
    }
);

export default MasterUnitModel;