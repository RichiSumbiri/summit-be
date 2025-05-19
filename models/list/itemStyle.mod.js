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
    FRONT_IMG: { type: DataTypes.STRING },
    BACK_IMG: { type: DataTypes.STRING },
    USER_ADD_ID: { type: DataTypes.INTEGER },
    USER_MOD_ID: { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);

export const qryListstyleWithUser = `SELECT 
	ils.*,
	xuw.USER_INISIAL AS USER_ADD,
	xux.USER_INISIAL AS USER_MOD
FROM item_list_style ils 
LEFT JOIN xref_user_web xuw ON xuw.USER_ID = ils.USER_ADD_ID
LEFT JOIN xref_user_web xux ON xux.USER_ID = ils.USER_MOD_ID 
WHERE ils.CUSTOMER_NAME = :buyer`


export const qryGetItemCode = `SELECT DISTINCT
	pi.PRODUCT_ID, 
	pi.PRODUCT_TYPE_CODE  AS PRODUCT_TYPE,
	pi.PRODUCT_CAT_CODE  AS PRODUCT_CATEGORY
FROM product_item pi `