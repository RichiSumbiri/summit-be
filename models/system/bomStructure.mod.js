import {DataTypes} from "sequelize";
import db from "../../config/database.js";
import BomTemplateModel from "./bomTemplate.mod.js";
import {OrderDetailHeader} from "../production/order.mod.js";
import {ModelOrderPOHeader} from "../orderManagement/orderManagement.mod.js";
import Users from "../setup/users.mod.js";
import MasterItemIdModel from "./masterItemId.mod.js";
import {ModelVendorDetail} from "./VendorDetail.mod.js";
import BomTemplateListModel from "./bomTemplateList.mod.js";

const BomStructureModel = db.define(
    "bom_structure",
    {
        ID: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
        },
        NO_REVISION: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        ACTIVE_STATUS: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        STATUS_STRUCTURE: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ORDER_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        COMPANY_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "bom_structure",
        timestamps: false,
    }
)

BomStructureModel.belongsTo(BomTemplateModel, {
    foreignKey: "BOM_TEMPLATE_ID",
    as: "BOM_TEMPLATE"
})

BomStructureModel.belongsTo(ModelOrderPOHeader, {
    foreignKey: "ORDER_ID",
    as: "ORDER"
})

BomStructureModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

BomStructureModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})

export const BomStructureListModel = db.define(
    'bom_structure_list',
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        BOM_LINE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM('Confirmed', 'Canceled', 'Deleted', 'Open'),
            allowNull: true,
        },
        BOM_STRUCTURE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        STANDARD_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        INTERNAL_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        BOOKING_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        PRODUCTION_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        EXTRA_BOOKS: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        IS_SPLIT_COLOR: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        IS_SPLIT_SIZE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        IS_SPLIT_NO_PO: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        VENDOR_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_POSITION: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        IS_SPLIT_STATUS: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
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
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'bom_structure_list',
        timestamps: false,
    }
);

BomStructureListModel.belongsTo(BomStructureModel, {
    foreignKey: "BOM_STRUCTURE_ID",
    as: "BOM_STRUCTURE"
})

BomStructureListModel.belongsTo(MasterItemIdModel, {
    foreignKey: "MASTER_ITEM_ID",
    as: "MASTER_ITEM"
})

BomStructureListModel.belongsTo(ModelVendorDetail, {
    foreignKey: "VENDOR_ID",
    as: "VENDOR"
})

BomStructureListModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

BomStructureListModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})


export default BomStructureModel;