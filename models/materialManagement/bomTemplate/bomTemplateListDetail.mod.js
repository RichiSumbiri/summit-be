import { DataTypes } from "sequelize";
import db from "../../../config/database.js";
import MasterItemDimensionModel from "../../system/masterItemDimention.mod.js";
import BomTemplateListModel from "./bomTemplateList.mod.js";
import ColorChartMod from "../../system/colorChart.mod.js";
import SizeChartMod from "../../system/sizeChart.mod.js";

const BomTemplateListDetail = db.define(
    "bom_template_list_detail",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        BOM_TEMPLATE_LIST_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ITEM_SPLIT_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ITEM_DIMENSION_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        SIZE_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        COLOR_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        INTERNAL_CUSTOMER_PER_ITEM: {
            type: DataTypes.DECIMAL(65,6),
            defaultValue: 0,
        },
        COSTING_CONSUMER_PER_ITEM: {
            type: DataTypes.DECIMAL(65,6),
            defaultValue: 0,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        DELETED_AT: {
            type: DataTypes.DATE,
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);

BomTemplateListDetail.belongsTo(BomTemplateListModel, {
    foreignKey: "BOM_TEMPLATE_LIST_ID",
    as: "ITEM_LIST"
})

BomTemplateListDetail.belongsTo(MasterItemDimensionModel, {
    foreignKey: "ITEM_DIMENSION_ID",
    as: "ITEM_DIMENSION"
})

BomTemplateListDetail.belongsTo(ColorChartMod, {
    foreignKey: "COLOR_ID",
    as: "COLOR"
})

BomTemplateListDetail.belongsTo(SizeChartMod, {
    foreignKey: "SIZE_ID",
    as: "SIZE"
})

export default BomTemplateListDetail;