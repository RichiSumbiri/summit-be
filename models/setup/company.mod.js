import { DataTypes } from "sequelize";
import {dbSPL} from "../../config/dbAudit.js";

const MasterCompanyModel = dbSPL.define(
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
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "master_company",
        timestamps: false, // Disable Sequelize default timestamps if not needed
    }
);

export default MasterCompanyModel;