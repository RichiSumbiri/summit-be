import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const masterStatus = db.define(
  "master_status",
  {
    STATUS_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    STATUS_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    
    
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
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

export default masterStatus;