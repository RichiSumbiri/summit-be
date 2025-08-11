import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const eventMasterComment = db.define(
  "event_master_comments",
  {
    EVENT_COMMENT_ID: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    COMMENT_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    COMMENT_NAME: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    EVENT_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    IS_COMPULSORY: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

export default eventMasterComment;
