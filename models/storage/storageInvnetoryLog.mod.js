import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const StorageInventoryLogModel = db.define(
  "storage_inventory_log",
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    STORAGE_INVENTORY_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MACHINE_ID: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    USER_ADD_ID: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CREATED_AT: {
        type: DataTypes.DATE,
        allowNull: true,
    },
      DESCRIPTION: {
          type: DataTypes.STRING(255),
          allowNull: true,
      },
  },
  {
    tableName: "storage_inventory_log",
    timestamps: false, 
  }
);


export default StorageInventoryLogModel;