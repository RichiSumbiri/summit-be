import { DataTypes } from "sequelize";
import db from "../../../config/database.js";

export const RMLabDipStrikeOffSubmission = db.define(
  "rm_lab_dip_strike_off_submission",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    RM_LAB_STRIKE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    SUBMIT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SUBMIT_CODE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    COMMENT_STATUS: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    OBTAIN_COMMENT: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    COMMENT_NOTE: {
      type: DataTypes.STRING(255),
      allowNull: true,
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

// EventDiaryHeader.belongsTo(Users, {
//   foreignKey: "COMPLETED_BY",
//   targetKey: "USER_ID",
//   as: "completed_by",
// });
