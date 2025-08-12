import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import ProductItemModel from "./productItem.mod.js";
import Users from "../setup/users.mod.js";

const ProductItemComponentModel = db.define(
    "product_item_component",
    {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        COMPONENT_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        COMPONENT_NAME: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        PRODUCT_ID: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        CREATED_ID: {
            type: DataTypes.STRING(50),
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
        freezeTableName: true,
        timestamps: false,
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

ProductItemComponentModel.belongsTo(ProductItemModel, {
    foreignKey: "PRODUCT_ID",
    as: "PRODUCT"
})

ProductItemComponentModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

ProductItemComponentModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})

export default ProductItemComponentModel;