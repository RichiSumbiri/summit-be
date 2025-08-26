import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const ProductItemModel = db.define(
    "product_item",
    {
        PRODUCT_ID: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
        },
        PRODUCT_TYPE_ATTB: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        PRODUCT_TYPE_CODE: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        PRODUCT_CAT_ATTB: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        PRODUCT_CAT_CODE: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        PRODUCT_DESCRIPTION: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        PRODUCT_AVG_SEWING_SMV: {
            type: DataTypes.DECIMAL(100, 2),
            allowNull: true,
        },
        PRODUCT_AVG_SEWING_EFFICIENCY: {
            type: DataTypes.DECIMAL(100, 4),
            allowNull: true,
        },
        PRODUCT_TARGET_SMO: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        PRODUCT_ACTIVE: {
            type: DataTypes.ENUM("Y", "N"),
            allowNull: true,
        },
        PRODUCT_ADD_ID: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        PRODUCT_MOD_ID: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        PRODUCT_ADD_DATE: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        PRODUCT_MOD_DATE: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
    }
);


export default ProductItemModel;