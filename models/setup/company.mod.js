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
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        DELETED_AT: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: "master_company",
        timestamps: false, // Disable Sequelize default timestamps if not needed
    }
);

export default MasterCompanyModel;