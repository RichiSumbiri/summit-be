import db from "../../config/database.js";
import { DataTypes } from "sequelize";
import Users from "../setup/users.mod.js";
import masterProductionProcess from "../system/masterProductionProcess.mod.js";

export const orderitemSMV = db.define(
  "order_item_smv",
  {
    ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    ORDER_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    FG_ITEM_ID: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    PRODUCTION_PROCESS_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    DEFAULT_SMV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
    },
    COSTING_SMV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
    },
    PLAN_SMV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
    },
    ACTUAL_SMV: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
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

orderitemSMV.belongsTo(Users, {
    foreignKey: "CREATED_BY",
    as: "created_by"
})

orderitemSMV.belongsTo(masterProductionProcess, {
    foreignKey: "PRODUCTION_PROCESS_ID",
    as: "PRODUCTION_PROCESS"
})