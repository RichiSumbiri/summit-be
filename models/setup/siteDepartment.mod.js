import {DataTypes} from "sequelize";
import MasterSiteFxModel from "./siteFx.mod.js";
import {modelMasterDepartment} from "../hr/employe.mod.js";
import MasterUnitModel from "./unit.mod.js";

import db from "../../config/database.js";


 const SiteDepartmentModel = db.define(
    "site_department",
    {
        ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        UNIT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        SITE_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        DEPT_ID: {
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
    },
    {
        tableName: "site_department",
        timestamps: false,
    }
);

SiteDepartmentModel.belongsTo(MasterUnitModel, {
    foreignKey: "UNIT_ID",
    targetKey: "UNIT_ID",
    as: "unit",
});


SiteDepartmentModel.belongsTo(modelMasterDepartment, {
    foreignKey: "DEPT_ID",
    targetKey: "IdDept",
    as: "department",
});


SiteDepartmentModel.belongsTo(MasterSiteFxModel, {
    foreignKey: "SITE_ID",
    targetKey: "ID",
    as: "site",
});

export default SiteDepartmentModel