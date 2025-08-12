import db from "../../config/database.js";
import { DataTypes } from "sequelize";
export const MasterOrderType = db.define('master_order_type', {
    TYPE_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    TYPE_CODE: {
        type: DataTypes.STRING(3),
        allowNull: false
    },
    TYPE_DESC: {
        type: DataTypes.STRING(200),
        allowNull: true
    }
}, {
    tableName: 'master_order_type',
    timestamps: false,
    freezeTableName: true
});
