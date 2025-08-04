// models/setup/ItemCategorySize.mod.js
import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import sizeChart from "./sizeChart.mod.js";
import { MasterItemCategories } from "../setup/ItemCategories.mod.js";
import { MasterItemTypes } from "../setup/ItemTypes.mod.js";
import { MasterItemGroup } from "../setup/ItemGroups.mod.js";

export const sizeItemCategory = db.define(
  "master_item_category_size",
  {
    ITEM_CATEGORY_SIZE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SIZE_ID: {
      type: DataTypes.STRING(25),
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
    indexes: [
      {
        unique: true,
        fields: ["ITEM_GROUP_ID", "ITEM_TYPE_ID", "ITEM_CATEGORY_ID"],
      },
    ],
  }
);

export default sizeItemCategory;

sizeItemCategory.belongsTo(MasterItemCategories, {
    foreignKey: "ITEM_CATEGORY_ID",
    targetKey: "ITEM_CATEGORY_ID",
    as: "item_categories",
});

sizeItemCategory.belongsTo(MasterItemTypes, {
    foreignKey: "ITEM_TYPE_ID",
    targetKey: "ITEM_TYPE_ID",
    as: "item_types",
});

sizeItemCategory.belongsTo(MasterItemGroup, {
    foreignKey: "ITEM_GROUP_ID",
    targetKey: "ITEM_GROUP_ID",
    as: "item_groups",
});

sizeItemCategory.belongsTo(sizeChart, {
    foreignKey: "SIZE_ID",
    targetKey: "SIZE_ID",
    as: "size_chart",
});