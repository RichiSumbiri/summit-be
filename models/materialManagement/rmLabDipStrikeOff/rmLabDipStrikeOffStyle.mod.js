import { DataTypes } from "sequelize";
import db from "../../../config/database.js";
import MasterItemIdModel from "../../system/masterItemId.mod.js";
import colorChart from "../../system/colorChart.mod.js";

export const RMLabDipStrikeOffStyle = db.define(
  "rm_lab_dip_strike_off_style",
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
    FG_ITEM_ID: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    FG_COLOR_ID: {
      type: DataTypes.STRING(30),
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

RMLabDipStrikeOffStyle.belongsTo(MasterItemIdModel, {
  foreignKey: "FG_ITEM_ID",
  targetKey: "ITEM_ID",
  as: "item",
});
RMLabDipStrikeOffStyle.belongsTo(colorChart, {
  foreignKey: "FG_COLOR_ID",
  targetKey: "COLOR_ID",
  as: "color",
});
