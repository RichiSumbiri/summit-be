import { DataTypes } from "sequelize";
import db from "../../config/database.js";

export const ListCountry = db.define(
  "item_country",
  {
    COUNTRY_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BUYER_CODE: { type: DataTypes.STRING },
    COUNTRY_CODE: { type: DataTypes.STRING },
    COUNTRY_NAME: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
  },
  {
    freezeTableName: true,
  }
);


export const qryRefIntCountry = `SELECT a.COUNTRY_ID id, CONCAT(a.COUNTRY_CODE, ' - ',a.COUNTRY_NAME) AS name, a.COUNTRY_CODE , a.COUNTRY_NAME FROM master_country a WHERE a.COUNTRY_CODE LIKE :qry OR a.COUNTRY_NAME LIKE :qry`
