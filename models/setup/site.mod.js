import { DataTypes } from "sequelize";
import {dbSPL} from "../../config/dbAudit.js";

const MasterSitesModel = dbSPL.define(
    "master_sites",
    {
        IDSECTION: {
            type: DataTypes.STRING(200),
            primaryKey: true,
            allowNull: false,
        },
        IDDEPT: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        SITE_NAME: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        CUS_NAME: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    },
    {
        tableName: "master_sites",
        timestamps: false,
    }
);

export default MasterSitesModel;