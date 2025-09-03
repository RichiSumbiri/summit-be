import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import BomTemplateListModel from "./bomTemplateList.mod.js";
import {BomTemplateColor, BomTemplateSize} from "./bomTemplate.mod.js";

const BomTemplatePendingDimension = db.define(
    "bom_template_pending_dimension",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        BOM_TEMPLATE_LIST_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BOM_TEMPLATE_SIZE_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BOM_TEMPLATE_COLOR_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        INTERNAL_CUSTOMER_PER_ITEM: {
            type: DataTypes.DECIMAL(65,6),
            defaultValue: 0,
        },
        COSTING_CONSUMER_PER_ITEM: {
            type: DataTypes.DECIMAL(65,6),
            defaultValue: 0,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

BomTemplatePendingDimension.belongsTo(BomTemplateListModel, {
    foreignKey: "BOM_TEMPLATE_LIST_ID",
    as: "LIST_ITEM",
});

BomTemplatePendingDimension.belongsTo(BomTemplateSize, {
    foreignKey: "BOM_TEMPLATE_SIZE_ID",
    as: "SIZE",
});

BomTemplatePendingDimension.belongsTo(BomTemplateColor, {
    foreignKey: "BOM_TEMPLATE_COLOR_ID",
    as: "COLOR",
});

export default BomTemplatePendingDimension;