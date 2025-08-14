import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const masterOrderType = db.define(
  "master_order_type",
  {
    TYPE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    TYPE_CODE: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    TYPE_DESC: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default masterOrderType;
