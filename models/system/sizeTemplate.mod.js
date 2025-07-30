import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import {CustomerDetail} from "./customer.mod.js";
import {MasterItemCategories} from "../setup/ItemCategories.mod.js";
import ColorChartMod from "./colorChart.mod.js";
import SizeChartMod from "./sizeChart.mod.js";
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
            type: DataTypes.JSON, // Array of size IDs
            allowNull: false,
            defaultValue: [],
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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

SizeChartTemplateModel.belongsTo(CustomerDetail, {
    foreignKey: "CUSTOMER_ID",
    as: "CUSTOMER",
});

SizeChartTemplateModel.belongsTo(MasterItemCategories, {
    foreignKey: "ITEM_CATEGORY_ID",
    as: "ITEM_CATEGORY",
});

export default SizeChartTemplateModel;