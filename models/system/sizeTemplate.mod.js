import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const SizeChartTemplateModel = db.define(
    "size_chart_template",
    {
        ID: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
        },
        DESCRIPTION: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        CUSTOMER_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        ITEM_CATEGORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        LIST: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

export default SizeChartTemplateModel;