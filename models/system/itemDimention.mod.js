import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import SizeChartMod from "./sizeChart.mod.js";
import ColorChartMod from "./colorChart.mod.js";

const ItemDimensionModel = db.define(
    "item_dimension",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        COLOR_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        SIZE_ID: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        SERIAL_NO: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: true,
            defaultValue: "N",
        },
        LATEST_PURCHASE_1: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        LATEST_PURCHASE_2: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        LATEST_PURCHASE_3: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        LATEST_PURCHASE_4: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        LATEST_PURCHASE_5: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        CREATE_BY: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        UPDATE_BY: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IS_DELETE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "item_dimension",
        timestamps: false,
    }
);

ItemDimensionModel.belongsTo(SizeChartMod, {
    foreignKey: "SIZE_ID",
    as: "MASTER_SIZE"
})

ItemDimensionModel.belongsTo(ColorChartMod, {
    foreignKey: "COLOR_ID",
    as: "MASTER_COLOR"
})

export default ItemDimensionModel;