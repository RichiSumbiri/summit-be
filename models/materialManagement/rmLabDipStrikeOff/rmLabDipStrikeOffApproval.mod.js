import { DataTypes } from "sequelize";
import db from "../../../config/database.js";
import Users from "../../setup/users.mod.js";

export const RMLabDipStrikeOffApproval = db.define(
  "rm_lab_dip_strike_off_approval",
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

    SERIES_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    SERIES_NOTE: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SUBMISSION_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    COMMENT_EXCPECT_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    COMMENT_RECIEVED_DATE: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    COMPLETED_AT: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    COMPLETED_BY: {
      type: DataTypes.INTEGER,
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

RMLabDipStrikeOffApproval.belongsTo(Users, {
  foreignKey: "COMPLETED_BY",
  targetKey: "USER_ID",
  as: "completed_by",
});
