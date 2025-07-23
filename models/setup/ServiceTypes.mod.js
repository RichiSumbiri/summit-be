import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterServiceTypes = db.define(
  "master_service_type",
  {
    SERVICE_TYPE_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SERVICE_TYPE_CODE: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    SERVICE_TYPE_DESCRIPTION: {
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

export default MasterServiceTypes;
