import BuildingModel from "../../models/list/buildings.mod.js";
import BuildingRoomModel from "../../models/list/buildingRoom.mod.js";
import StorageInventoryModel from "../../models/storage/storageInventory.mod.js"
import {MacTypeOfMachine, MecListMachine} from "../../models/mechanics/machines.mod.js";

export const createStorageInventory = async (req, res) => {
  try {
    const { UNIT_ID, BUILDING_ID, BUILDING_ROOM_ID, RAK_NUMBER, CATEGORY, LEVEL, POSITION, DESCRIPTION } = req.body;


    if (!UNIT_ID || !BUILDING_ID || !BUILDING_ROOM_ID || !RAK_NUMBER || !CATEGORY || !LEVEL || !POSITION) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    const building = await BuildingModel.findByPk(BUILDING_ID);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }


    const room = await BuildingRoomModel.findByPk(BUILDING_ROOM_ID);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const SERIAL_NUMBER =`${building.CODE}-${room.CODE}-${RAK_NUMBER}-${LEVEL}-${POSITION}`


    const newInventory = await StorageInventoryModel.create({
      UNIT_ID,
      BUILDING_ID,
      BUILDING_ROOM_ID,
      RAK_NUMBER,
      CATEGORY,
      LEVEL,
      POSITION,
      DESCRIPTION,
      SERIAL_NUMBER,
    });

    return res.status(201).json({
      success: true,
      message: "Storage inventory created successfully",
      data: newInventory,
    });
  } catch (error) {
    console.error("Error creating storage inventory:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to create storage inventory: ${error.message}`,
    });
  }
};

export const getAllStorageInventory = async (req, res) => {
  try {
    const { UNIT_ID, BUILDING_ID, BUILDING_ROOM_ID, CATEGORY, SHOW_MACHINE } = req.query;

    const whereCondition = {};
    if (UNIT_ID) whereCondition.UNIT_ID = UNIT_ID;
    if (BUILDING_ID) whereCondition.BUILDING_ID = BUILDING_ID;
    if (BUILDING_ROOM_ID) whereCondition.BUILDING_ROOM_ID = BUILDING_ROOM_ID;
    if (CATEGORY) whereCondition.CATEGORY = CATEGORY;


    const listStorage = []

    const inventories = await StorageInventoryModel.findAll({
      where: {
        IS_DELETE: false,
        ...whereCondition
      },
      include: [
        {
          model: BuildingModel,
          as: "Building",
          attributes: ["ID", "NAME", "CODE", "DESCRIPTION"],
        },
        {
          model: BuildingRoomModel,
          as: "Room",
          attributes: ["ID", "NAME", "CODE", "FLOOR_LEVEL", "DESCRIPTION"],
        },
      ],
    });

    for (let i = 0; i < inventories.length; i++) {
      const data = inventories[i]

      const valid = await MecListMachine.findAll(
          {
            where: {STORAGE_INVENTORY_ID: data.ID},
            include: [
              {
                model: MacTypeOfMachine,
                as: "MEC_TYPE_OF_MACHINE",
                attributes: ['TYPE_ID', 'TYPE_DESCRIPTION', 'COLOR', 'CATEGORY'],
              }
            ],
            order: [['SEQ_NO', 'ASC']]
          })

      let machineList = {...data.dataValues, MACHINE_AVAILABLE: !!valid.length}
      if (SHOW_MACHINE) {
        machineList = {...machineList, MACHINE_LIST: valid}
      }
      listStorage.push(machineList)
    }

    return res.status(200).json({
      success: true,
      message: "Storage inventory records retrieved successfully",
      data: listStorage,
    });
  } catch (error) {
    console.error("Error retrieving storage inventory:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve storage inventory: ${error.message}`,
    });
  }
};

export  const getStorageInventoryBySitelineId = async  (req, res) => {
  try {
    const {idSiteline} = req.params
    const inventory = await StorageInventoryModel.findOne({where: {RAK_NUMBER: idSiteline, CATEGORY: 'LINE' }});

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Storage inventory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Storage inventory retrieved successfully",
      data: inventory,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve storage inventory: ${err.message}`,
    });
  }
}


export const getStorageInventoryById = async (req, res) => {
  try {
    const { id } = req.params;


    const inventory = await StorageInventoryModel.findByPk(id, {
      include: [
        {
          model: BuildingModel,
          as: "Building",
          attributes: ["ID", "NAME", "CODE", "DESCRIPTION"],
        },
        {
          model: BuildingRoomModel,
          as: "Room",
          attributes: ["ID", "NAME", "CODE", "FLOOR_LEVEL", "DESCRIPTION"],
        },
      ],
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Storage inventory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Storage inventory retrieved successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Error retrieving storage inventory:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve storage inventory: ${error.message}`,
    });
  }
};

export const getStorageInventoryBySerialNumber = async (req, res) => {
  try {
    const { serialNumber } = req.params;

    const inventory = await StorageInventoryModel.findOne({
      where: { SERIAL_NUMBER: serialNumber },
      include: [
        {
          model: BuildingModel,
          as: "Building",
          attributes: ["ID", "NAME", "CODE", "DESCRIPTION"],
        },
        {
          model: BuildingRoomModel,
          as: "Room",
          attributes: ["ID", "NAME", "CODE", "FLOOR_LEVEL", "DESCRIPTION"],
        },
      ],
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Storage inventory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Storage inventory retrieved successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Error retrieving storage inventory:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve storage inventory: ${error.message}`,
    });
  }
};


export const updateStorageInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { UNIT_ID, BUILDING_ID, BUILDING_ROOM_ID, RAK_NUMBER, CATEGORY, LEVEL, POSITION, DESCRIPTION } = req.body;


    const inventory = await StorageInventoryModel.findByPk(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Storage inventory not found",
      });
    }


    let building = null;
    if (BUILDING_ID) {
      building = await BuildingModel.findByPk(BUILDING_ID);
      if (!building) {
        return res.status(404).json({
          success: false,
          message: "Building not found",
        });
      }
    }


    let room = null;
    if (BUILDING_ROOM_ID) {
      room = await BuildingRoomModel.findByPk(BUILDING_ROOM_ID);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }
    }
    const SERIAL_NUMBER =`${building?.CODE || inventory.Building.CODE}-${room?.CODE || inventory.Room.CODE}-${RAK_NUMBER || inventory.RAK_NUMBER}-${LEVEL || inventory.LEVEL}-${POSITION || inventory.POSITION}`
    await inventory.update({
      UNIT_ID,
      BUILDING_ID,
      BUILDING_ROOM_ID,
      RAK_NUMBER,
      CATEGORY,
      LEVEL,
      POSITION,
      DESCRIPTION,
      SERIAL_NUMBER,
    });

    return res.status(200).json({
      success: true,
      message: "Storage inventory updated successfully",
      data: inventory,
    });
  } catch (error) {
    console.error("Error updating storage inventory:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to update storage inventory: ${error.message}`,
    });
  }
};

export const deleteStorageInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await StorageInventoryModel.findByPk(id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Storage inventory not found",
      });
    }

    inventory.update({
      IS_DELETE: true
    })

    return res.status(200).json({
      success: true,
      message: "Storage inventory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting storage inventory:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete storage inventory: ${error.message}`,
    });
  }
};

