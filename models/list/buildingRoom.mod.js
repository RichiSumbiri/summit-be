import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const BuildingRoomModel = db.define(
  "building_room",
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    BUILDING_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NAME: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    FLOOR_LEVEL: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    CODE: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    CREATED_AT: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UPDATED_AT: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "building_room",
    timestamps: false, 
  }
);

export default BuildingRoomModel;