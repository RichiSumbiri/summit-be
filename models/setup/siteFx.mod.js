import { DataTypes } from "sequelize";
import db from "../../config/database.js";


const MasterSiteFxModel = db.define(
    "master_site_fx",
    {
        ID: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        CODE: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        NAME: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        ADDRESS_1: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        ADDRESS_2: {
            type: DataTypes.TEXT,
            defaultValue: "",
        },
        CITY: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        PROVINCE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        POSTAL_CODE: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        COUNTRY_CODE: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        TELEPHONE: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        FAX: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        EMAIL: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        MANUFACTURING_FLAG: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        SEW_TEAM_ALLOCATION: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        COMPANY_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        WS1: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        WS2: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        UNIT_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        IS_DELETED:{
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: "master_site_fx",
        timestamps: false, // Disable Sequelize default timestamps if not needed
    }
);

export default MasterSiteFxModel;