import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import SizeChartMod from "./sizeChart.mod.js";
import ColorChartMod from "./colorChart.mod.js";

const MasterItemDimensionModel = db.define(
    "master_item_dimension",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        DIMENSION_ID: {
            type: DataTypes.INTEGER,
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
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
        LATEST_PURCHASE_PRICE: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        LATEST_PURCHASE_CURRENCY: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        LATEST_PURCHASE_VENDOR: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        LATEST_PURCHASE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        AVERAGE_PURCHASE_PRICE: {
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
        tableName: "master_item_dimension",
        timestamps: false,
    }
);

MasterItemDimensionModel.belongsTo(SizeChartMod, {
    foreignKey: "SIZE_ID",
    as: "MASTER_SIZE"
})

MasterItemDimensionModel.belongsTo(ColorChartMod, {
    foreignKey: "COLOR_ID",
    as: "MASTER_COLOR"
})

export default MasterItemDimensionModel;