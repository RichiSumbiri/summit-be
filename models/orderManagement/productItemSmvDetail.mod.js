import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import masterProductionProcess from "../system/masterProductionProcess.mod.js";

const productItemSmvDetail = db.define(
  "product_item_smv_detail",
  {
    ITEM_SMV_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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

export default productItemSmvDetail;


// productItemSmvDetail.belongsTo(masterProductionProcess, {
//     foreignKey: "PRODUCTION_PROCESS_ID",
//     targetKey: "PRODUCTION_PROCESS_ID",
//     as: "master_production_process",
// });