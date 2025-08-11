import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const MasterEventType = db.define(
  "master_event_type",
  {
    EVENT_TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    EVENT_TYPE_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    IS_ACTIVE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    CREATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    CREATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UPDATED_AT: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    UPDATED_BY: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DELETED_AT: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    DELETED_BY: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "master_event_type",
    timestamps: false,
    paranoid: true,
    deletedAt: "DELETED_AT",
  }
);

export default MasterEventType;
