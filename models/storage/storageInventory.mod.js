import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import BuildingModel from "../list/buildings.mod.js";
import BuildingRoomModel from "../list/buildingRoom.mod.js";

const StorageInventoryModel = db.define(
  "storage_inventory",
  {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UNIT_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    BUILDING_ID: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    BUILDING_ROOM_ID: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    RAK_NUMBER: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    LEVEL: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    POSITION: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    DESCRIPTION: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CATEGORY: {
      type: DataTypes.ENUM('ROOM', 'LINE', 'STORAGE'),
      allowNull: true,
      defaultValue: 'ROOM'
    },
    SERIAL_NUMBER: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
      IS_DELETE: {
        type: DataTypes.BOOLEAN,
          defaultValue: false
      }
  },
  {
    tableName: "storage_inventory",
    timestamps: false, 
  }
);

export const StorageInventoryNodeModel = db.define(
    "storage_inventory_node",
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        POSITION: {
            type: DataTypes.ENUM('LEFT', 'RIGHT'),
            defaultValue: 'LEFT',
            allowNull: false,
        },
        STORAGE_INVENTORY_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        SEQUENCE: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    },
    {
        tableName: 'storage_inventory_node',
        timestamps: false,
    }
);



StorageInventoryModel.belongsTo(BuildingModel, {
  foreignKey: "BUILDING_ID",
  as: "Building",
});


StorageInventoryModel.belongsTo(BuildingRoomModel, {
  foreignKey: "BUILDING_ROOM_ID",
  as: "Room",
});

export default StorageInventoryModel;