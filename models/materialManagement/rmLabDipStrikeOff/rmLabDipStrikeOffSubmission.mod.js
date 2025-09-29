import { DataTypes } from "sequelize";
import db from "../../../config/database.js";
import masterStatus from "../../system/masterStatus.js";

export const RMLabDipStrikeOffSubmission = db.define(
  "rm_lab_dip_strike_off_submission",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    RM_LAB_STRIKE__APPROVAL_ID: {
      type: DataTypes.STRING(25),
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

RMLabDipStrikeOffSubmission.belongsTo(masterStatus, {
  foreignKey: "COMMENT_STATUS",
  targetKey: "STATUS_ID",
  as: "status",
});