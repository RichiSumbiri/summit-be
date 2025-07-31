import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import { MasterItemCategories } from "../setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../setup/ItemGroups.mod.js";

const sizeChart = db.define(
  "master_size_chart",
  {
    SIZE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    SIZE_CODE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SIZE_DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ITEM_GROUP_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ITEM_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ITEM_CATEGORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DELETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
    deletedAt: "DELETED_AT",
    paranoid: true,
  }
);

sizeChart.belongsTo(MasterItemCategories, {
    foreignKey: "ITEM_CATEGORY_ID",
    targetKey: "ITEM_CATEGORY_ID",
    as: "item_categories",
});

sizeChart.belongsTo(MasterItemTypes, {
    foreignKey: "ITEM_TYPE_ID",
    targetKey: "ITEM_TYPE_ID",
    as: "item_types",
});

sizeChart.belongsTo(MasterItemGroup, {
    foreignKey: "ITEM_GROUP_ID",
    targetKey: "ITEM_GROUP_ID",
    as: "item_groups",
});


export default sizeChart;


export const FGSizeChartModel = db.define(
    "fg_size_chart",
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
        SIZE_ID: {
            type: DataTypes.STRING(20),
            allowNull: false,
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
        timestamps: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
        deletedAt: "DELETED_AT",
        paranoid: true,
    }
);

FGSizeChartModel.belongsTo(sizeChart, {
    foreignKey: "SIZE_ID",
    as: "SIZE",
});
