import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterItemComponent = db.define(
    "master_item_component",
    {
        ID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        NAME: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);


export default MasterItemComponent;