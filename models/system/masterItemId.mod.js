import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import {MasterItemGroup} from "../setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../setup/ItemCategories.mod.js";
import MasterAttributeSetting from "./masterAttributeSetting.mod.js";
import MasterAttributeValue from "./masterAttributeValue.mod.js";
import ServiceAttributesMod from "./serviceAttributes.mod.js";
import ServiceAttributeValuesMod from "./serviceAttributeValues.mod.js";

const MasterItemIdModel = db.define(
    "master_item_id",
    {
        ITEM_ID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        ITEM_CODE: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        ITEM_DESCRIPTION: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        ITEM_ACTIVE: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: true,
        },
        ITEM_GROUP_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_TYPE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_CATEGORY_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_UOM_BASE: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ITEM_UOM_BASE_DESC: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ITEM_UOM_DEFAULT: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ITEM_UOM_DEFAULT_DESC: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ITEM_UOM_PURCHASE: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        ITEM_UOM_PURCHASE_DESC: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        MAX_OVER_DELIVERY: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        MIN_UNDER_DELIVERY: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        ITEM_LOT_TRACKING: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_NONSTOCK: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_CAPITALIZATION: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_INSPECTION: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        ITEM_IMAGE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        CREATE_BY: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        CREATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UPDATE_BY: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        UPDATE_DATE: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        tableName: "master_item_id",
        timestamps: false,
    }
);

MasterItemIdModel.belongsTo(MasterItemGroup, {
    foreignKey: 'ITEM_GROUP_ID',
    as: "ITEM_GROUP"
})

MasterItemIdModel.belongsTo(MasterItemTypes, {
    foreignKey: 'ITEM_TYPE_ID',
    as: "ITEM_TYPE"
})
MasterItemIdModel.belongsTo(MasterItemCategories, {
    foreignKey: 'ITEM_CATEGORY_ID',
    as: "ITEM_CATEGORY"
})

export const MasterItemIdAttributesModel = db.define(
    "master_item_id_attributes",
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
        MASTER_ATTRIBUTE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        MASTER_ATTRIBUTE_VALUE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
        },
        NOTE: {
            type: DataTypes.TEXT,
        },
        DELETED_AT: {
            type: DataTypes.DATE
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },

    {
        tableName: "master_item_id_attributes",
        timestamps: false,
    }
);

MasterItemIdAttributesModel.belongsTo(MasterAttributeSetting, {
    foreignKey: "MASTER_ATTRIBUTE_ID",
    as: "MASTER_ATTRIBUTE"
})

MasterItemIdAttributesModel.belongsTo(MasterAttributeValue, {
    foreignKey: "MASTER_ATTRIBUTE_VALUE_ID",
    as: "MASTER_ATTRIBUTE_VALUE"
})

export const MasterItemIdService = db.define(
    "master_item_id_service",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        MASTER_SERVICE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        MASTER_SERVICE_VALUE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
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
            defaultValue: false,
            allowNull: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
    }
);

// Define belongTo relationships
MasterItemIdService.belongsTo(MasterItemIdModel, {
    foreignKey: "MASTER_ITEM_ID",
    as: "MASTER_ITEM",
});

MasterItemIdService.belongsTo(ServiceAttributesMod, {
    foreignKey: "MASTER_SERVICE_ID",
    as: "MASTER_SERVICE",
});

MasterItemIdService.belongsTo(ServiceAttributeValuesMod, {
    foreignKey: "MASTER_SERVICE_VALUE_ID",
    as: "MASTER_SERVICE_VALUE",
});


export default MasterItemIdModel;