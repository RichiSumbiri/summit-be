import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterServiceGroups = db.define(
  "master_service_group",
  {
    SERVICE_GROUP_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    SERVICE_GROUP_CODE: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    SERVICE_GROUP_DESCRIPTION: {
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

export default MasterServiceGroups;
