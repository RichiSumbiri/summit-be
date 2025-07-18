import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterServiceCategories = db.define(
  "master_service_category",
  {
    SERVICE_CATEGORY_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SERVICE_CATEGORY_CODE: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    SERVICE_CATEGORY_DESCRIPTION: {
      type: DataTypes.STRING(255),
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
  },
  {
    freezeTableName: true,
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  }
);

export default MasterServiceCategories;
