import BuildingModel from "../../models/list/buildings.mod.js";
import BuildingRoomModel from "../../models/list/buildingRoom.mod.js";
import StorageInventoryModel, {StorageInventoryNodeModel} from "../../models/storage/storageInventory.mod.js"
import {MacTypeOfMachine, MecListMachine} from "../../models/mechanics/machines.mod.js";
import {DataTypes, Op} from "sequelize";

export const createStorageInventory = async (req, res) => {
    try {
        let {
            UNIT_ID,
            BUILDING_ID,
            BUILDING_ROOM_ID,
            RAK_NUMBER,
            CATEGORY,
            LEVEL,
            POSITION,
            DESCRIPTION,
            USER_ID
        } = req.body;


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


        if (CATEGORY === "LINE") {
            POSITION = 2
        }

        const SERIAL_NUMBER = `${building.CODE}-${room.CODE}-${RAK_NUMBER}-${LEVEL}-${POSITION}`

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
        const countLocation = Number(newInventory.LEVEL) * Number(newInventory.POSITION)

        if (CATEGORY === "LINE") {
            for (let i = 0; i < countLocation; i++) {
                if (i % 2 === 0) {
                    await StorageInventoryNodeModel.create({
                        POSITION: 'RIGHT',
                        STORAGE_INVENTORY_ID: newInventory.ID,
                        SEQUENCE: i,
                        CREATED_ID: USER_ID
                    })
                } else {
                    await StorageInventoryNodeModel.create({
                        POSITION: 'LEFT',
                        STORAGE_INVENTORY_ID: newInventory.ID,
                        SEQUENCE: i,
                        CREATED_ID: USER_ID
                    })
                }
            }
        }

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
        const {UNIT_ID, BUILDING_ID, BUILDING_ROOM_ID, CATEGORY, SHOW_MACHINE} = req.query;

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

            const nodeLeft = await StorageInventoryNodeModel.findAll(
                {
                    where: {STORAGE_INVENTORY_ID: data.ID, POSITION: 'LEFT'},
                    order: [['SEQUENCE', 'ASC']],
                    include: [
                        {
                            model: MecListMachine,
                            as: 'MACHINE',
                            attributes: ['MACHINE_ID', 'MACHINE_DESCRIPTION', 'MACHINE_SERIAL', 'STATUS'],
                            required: false,
                            include: [
                                {
                                    model: MacTypeOfMachine,
                                    as: 'MEC_TYPE_OF_MACHINE',
                                    attributes: ['TYPE_ID', 'TYPE_DESCRIPTION', 'COLOR', 'CATEGORY'],
                                }
                            ]
                        }
                    ]
                })

            const nodeRight = await StorageInventoryNodeModel.findAll(
                {
                    where: {STORAGE_INVENTORY_ID: data.ID, POSITION: 'RIGHT'},
                    order: [['SEQUENCE', 'ASC']],
                    include: [
                        {
                            model: MecListMachine,
                            as: 'MACHINE',
                            attributes: ['MACHINE_ID', 'MACHINE_DESCRIPTION', 'MACHINE_SERIAL', 'STATUS'],
                            required: false,
                            include: [
                                {
                                    model: MacTypeOfMachine,
                                    as: 'MEC_TYPE_OF_MACHINE',
                                    attributes: ['TYPE_ID', 'TYPE_DESCRIPTION', 'COLOR', 'CATEGORY'],
                                }
                            ]
                        }
                    ]
                })

            const left = nodeLeft ?? []
            const right = nodeRight ?? []



            listStorage.push({...data.dataValues, NODE_LEFT: left, NODE_RIGHT: right, MACHINE_AVAILABLE: (!!(left.find((item) => item.MACHINE !== null) || right.find((item) => item.MACHINE !== null))) })
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

export const getStorageInventoryBySitelineId = async (req, res) => {
    try {
        const {idSiteline} = req.params
        const inventory = await StorageInventoryModel.findOne({where: {RAK_NUMBER: idSiteline, CATEGORY: 'LINE'}});

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
        const {id} = req.params;


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


export const getStorageInventoryByIdCountMachine = async (req, res) => {
    try {
        const {id} = req.params;
        const inventory = await StorageInventoryModel.findByPk(id);
        if (!inventory) return res.status(404).json({
            success: false,
            message: "Storage inventory not found",
        });

        const machineCount = await MecListMachine.count({
            where: {
                STORAGE_INVENTORY_ID: id
            }
        })


        return res.status(200).json({
            success: true,
            message: "Storage inventory count machinr",
            data: machineCount,
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
        const {serialNumber} = req.params;

        const inventory = await StorageInventoryModel.findOne({
            where: {SERIAL_NUMBER: serialNumber},
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

        let newLevel = LEVEL ? parseInt(LEVEL) : parseInt(inventory.LEVEL);
        let newPosition = POSITION ? parseInt(POSITION) : parseInt(inventory.POSITION);

        if (CATEGORY === "LINE") {
            newPosition = 2;
        }

        const newCount = newLevel * newPosition;
        const existingNodes = await StorageInventoryNodeModel.findAll({
            where: { STORAGE_INVENTORY_ID: inventory.ID },
            attributes: ['ID', 'SEQUENCE']
        });

        const usedNodeIds = existingNodes.map(n => n.ID);
        const usedNodeCount = await MecListMachine.count({
            where: {
                STORAGE_INVENTORY_NODE_ID: usedNodeIds
            }
        });

        if (newCount < usedNodeCount) {
            return res.status(400).json({
                success: false,
                message: `Cannot reduce size: ${usedNodeCount} node(s) are currently in use by machines. Minimum required nodes is ${usedNodeCount}.`,
            });
        }


        await inventory.update({
            UNIT_ID: UNIT_ID !== undefined ? UNIT_ID : inventory.UNIT_ID,
            BUILDING_ID: BUILDING_ID !== undefined ? BUILDING_ID : inventory.BUILDING_ID,
            BUILDING_ROOM_ID: BUILDING_ROOM_ID !== undefined ? BUILDING_ROOM_ID : inventory.BUILDING_ROOM_ID,
            RAK_NUMBER: RAK_NUMBER !== undefined ? RAK_NUMBER : inventory.RAK_NUMBER,
            CATEGORY: CATEGORY !== undefined ? CATEGORY : inventory.CATEGORY,
            LEVEL: newLevel,
            POSITION: newPosition,
            DESCRIPTION: DESCRIPTION !== undefined ? DESCRIPTION : inventory.DESCRIPTION,
        });

        if (CATEGORY === "LINE" || inventory.CATEGORY === "LINE") {
            if (newCount > existingNodes.length) {
                const newNodes = [];
                for (let i = existingNodes.length; i < newCount; i++) {
                    newNodes.push({
                        POSITION: i % 2 === 0 ? 'RIGHT' : 'LEFT',
                        STORAGE_INVENTORY_ID: inventory.ID,
                        SEQUENCE: i,
                        CREATED_ID: req.body.USER_ID || null
                    });
                }

                if (newNodes.length > 0) {
                    await StorageInventoryNodeModel.bulkCreate(newNodes);
                }
            } else if (newCount < existingNodes.length) {
                const nodesToDelete = await StorageInventoryNodeModel.findAll({
                    where: {
                        STORAGE_INVENTORY_ID: inventory.ID,
                        SEQUENCE: { [Op.gte]: newCount }
                    },
                    order: [['SEQUENCE', 'DESC']]
                });

                const nodeIdsToDelete = nodesToDelete.map(n => n.ID);
                const machineCountOnDeleteNodes = await MecListMachine.count({
                    where: {
                        STORAGE_INVENTORY_NODE_ID: nodeIdsToDelete
                    }
                });

                if (machineCountOnDeleteNodes > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot remove ${nodesToDelete.length} node(s): ${machineCountOnDeleteNodes} machine(s) are still assigned to these nodes.`,
                    });
                }

                await StorageInventoryNodeModel.destroy({
                    where: {
                        ID: nodeIdsToDelete
                    }
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Storage inventory updated successfully",
            data: inventory.reload()
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
        const {id} = req.params;

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

export const createStorageInventoryNode = async (req, res) => {
    const {POSITION, STORAGE_INVENTORY_ID, SEQUENCE, CREATED_ID} = req.body;

    try {
        if (!STORAGE_INVENTORY_ID || CREATED_ID === undefined) {
            return res.status(400).json({
                success: false,
                message: "STORAGE_INVENTORY_ID and CREATED_ID are required",
            });
        }

        if (POSITION && !['LEFT', 'RIGHT'].includes(POSITION)) {
            return res.status(400).json({
                success: false,
                message: "POSITION must be 'LEFT' or 'RIGHT'",
            });
        }

        const newNode = await StorageInventoryNodeModel.create({
            POSITION: POSITION || 'LEFT',
            STORAGE_INVENTORY_ID,
            SEQUENCE: SEQUENCE || 1,
            CREATED_ID
        });

        return res.status(201).json({
            success: true,
            message: "Storage inventory node created successfully",
            newNode
        });
    } catch (error) {
        console.error("Error creating storage inventory node:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create node: ${error.message}`,
        });
    }
};

export const getAllStorageInventoryNodes = async (req, res) => {
    const {STORAGE_INVENTORY_ID} = req.query;
    const where = {};

    if (STORAGE_INVENTORY_ID) {
        where.STORAGE_INVENTORY_ID = STORAGE_INVENTORY_ID;
    }

    try {
        const nodes = await StorageInventoryNodeModel.findAll({
            where,
            order: [['SEQUENCE', 'ASC'], ['ID', 'ASC']],
        });

        return res.status(200).json({
            success: true,
            message: "Storage inventory nodes retrieved successfully",
            nodes
        });
    } catch (error) {
        console.error("Error retrieving storage inventory nodes:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve nodes: ${error.message}`,
        });
    }
};

export const getStorageInventoryNodeById = async (req, res) => {
    const {id} = req.params;

    try {
        const node = await StorageInventoryNodeModel.findByPk(id);

        if (!node) {
            return res.status(404).json({
                success: false,
                message: "Storage inventory node not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Node retrieved successfully",
            node
        });
    } catch (error) {
        console.error("Error retrieving node:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve node: ${error.message}`,
        });
    }
};

export const updateStorageInventoryNode = async (req, res) => {
    const {id} = req.params;
    const {POSITION, STORAGE_INVENTORY_ID, SEQUENCE, CREATED_ID} = req.body;

    try {
        const node = await StorageInventoryNodeModel.findByPk(id);

        if (!node) {
            return res.status(404).json({
                success: false,
                message: "Node not found",
            });
        }

        await node.update({
            POSITION: POSITION !== undefined ? POSITION : node.POSITION,
            STORAGE_INVENTORY_ID: STORAGE_INVENTORY_ID !== undefined ? STORAGE_INVENTORY_ID : node.STORAGE_INVENTORY_ID,
            SEQUENCE: SEQUENCE !== undefined ? SEQUENCE : node.SEQUENCE,
            CREATED_ID: CREATED_ID !== undefined ? CREATED_ID : node.CREATED_ID,
        });

        return res.status(200).json({
            success: true,
            message: "Node updated successfully",
        });
    } catch (error) {
        console.error("Error updating node:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update node: ${error.message}`,
        });
    }
};

export const deleteStorageInventoryNode = async (req, res) => {
    const {id} = req.params;

    try {
        const node = await StorageInventoryNodeModel.findByPk(id);

        if (!node) {
            return res.status(404).json({
                success: false,
                message: "Node not found",
            });
        }

        await node.destroy();

        return res.status(200).json({
            success: true,
            message: "Node deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting node:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete node: ${error.message}`,
        });
    }
};