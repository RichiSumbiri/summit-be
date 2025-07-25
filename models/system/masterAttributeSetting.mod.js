import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { MasterItemGroup } from "../setup/ItemGroups.mod.js";
import { MasterItemTypes } from "../setup/ItemTypes.mod.js";
import { MasterItemCategories } from "../setup/ItemCategories.mod.js";

const MasterAttributeSetting = db.define(
    "master_attribute_setting",
    {
        ID: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
        },
        NAME: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        DATA_TYPE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ITEM_GROUP_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: MasterItemGroup,
                key: "ITEM_GROUP_ID",
            },
        },
        ITEM_TYPE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: MasterItemTypes,
                key: "ITEM_TYPE_ID",
            },
        },
        ITEM_CATEGORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: MasterItemCategories,
                key: "ITEM_CATEGORY_ID",
            },
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        IS_ATTRIBUTE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        IS_DISPLAY: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        CREATE_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATE_ID: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
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
        tableName: "master_attribute_setting",
        timestamps: false,
        paranoid: true,
        deletedAt: "DELETED_AT",
    }
);

MasterAttributeSetting.belongsTo(MasterItemGroup, {
    foreignKey: "ITEM_GROUP_ID",
    targetKey: "ITEM_GROUP_ID",
    as: "ITEM_GROUP",
});

MasterAttributeSetting.belongsTo(MasterItemTypes, {
    foreignKey: "ITEM_TYPE_ID",
    targetKey: "ITEM_TYPE_ID",
    as: "ITEM_TYPE",
});

MasterAttributeSetting.belongsTo(MasterItemCategories, {
    foreignKey: "ITEM_CATEGORY_ID",
    targetKey: "ITEM_CATEGORY_ID",
    as: "ITEM_CATEGORY",
});

export default MasterAttributeSetting;