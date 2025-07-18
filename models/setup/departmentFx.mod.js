import {dbSPL} from "../../config/dbAudit.js";
import {DataTypes} from "sequelize";
import db from "../../config/database.js";


export const modelMasterDepartmentFx = db.define('master_department',
    {
        ID_DEPT: {
            type: DataTypes.INTEGER(6),
            allowNull: false,
            primaryKey: true,
        },
        NAME_DEPT: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        GOL_DEPT: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
        },
        ID_MANAGER: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: null,
        },
        UNIT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'master_department',
        timestamps: false,
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
    }
);