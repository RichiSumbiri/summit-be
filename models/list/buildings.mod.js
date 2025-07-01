import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const BuildingModel = db.define(
  "buildings",
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    NAME: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    UNIT_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CREATED_AT: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    CODE: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    UPDATED_AT: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "buildings",
    timestamps: false, // Disable Sequelize default timestamps if not needed
  }
);

export default BuildingModel;