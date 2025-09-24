
import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import {PurchaseOrderModel} from "./purchaseOrder.mod.js";
import {BomStructureListModel} from "../system/bomStructure.mod.js";
import MasterItemDimensionModel from "../system/masterItemDimention.mod.js";

const PurchaseOrderDetailModel = db.define(
    "purchase_order_detail",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        MPO_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        BOM_STRUCTURE_LINE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ITEM_DIMENSION_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ORDER_NO: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        PURCHASE_ORDER_QTY: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        UNIT_COST: {
            type: DataTypes.DECIMAL(60, 6),
            allowNull: true,
        },
        FINANCE_COST: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        FREIGHT_COST: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        OTHER_COST: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        TOTAL_UNIT_COST: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        TOTAL_PURCHASE_COST: {
            type: DataTypes.DECIMAL(60, 2),
            allowNull: true,
        },
        CREATE_BY: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        CREATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UPDATE_BY: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        UPDATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "purchase_order_detail",
        timestamps: false,
    }
);

PurchaseOrderDetailModel.belongsTo(PurchaseOrderModel, {
    foreignKey: "MPO_ID",
    as: "MPO"
})

PurchaseOrderDetailModel.belongsTo(MasterItemDimensionModel, {
    foreignKey: "ITEM_DIMENSION_ID",
    as: "ITEM_DIMENSION"
})


PurchaseOrderDetailModel.belongsTo(BomStructureListModel, {
    foreignKey: "BOM_STRUCTURE_LINE_ID",
    as: "BOM_STRUCTURE_LIST"
})

export default PurchaseOrderDetailModel;