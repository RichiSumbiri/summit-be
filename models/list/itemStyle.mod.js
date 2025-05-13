import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ItemListStyle = db.define(
  "item_list_style",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    PRODUCT_ID: { type: DataTypes.STRING },
    CUSTOMER_NAME: { type: DataTypes.STRING },
    PRODUCT_ITEM_ID: { type: DataTypes.STRING },
    PRODUCT_ITEM_CODE: { type: DataTypes.STRING },
    PRODUCT_TYPE: { type: DataTypes.STRING },
    PRODUCT_CATEGORY: { type: DataTypes.STRING },
    PRODUCT_ITEM_DESCRIPTION: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);
