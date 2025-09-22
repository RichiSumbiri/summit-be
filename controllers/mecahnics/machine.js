import moment from "moment";
import db from "../../config/database.js";
import {
    MacItemIn,
    MacPartOut,
    MacTypeOfMachine,
    MecListMachine,
    findEmploye,
    qryGetAllMachine,
    qryGetAllMachineByDepartment,
    qryGetDtlTransPart,
    qryGetOneItem,
    qryGetOneMachine,
    qryGetSPartNeedle,
    qryGetlistSection,
    qryGetlistType,
    qryListInbyDate,
    qryListOut,
    qryMecStockMain, MecDownTimeModel,
    ListLamp,
} from "../../models/mechanics/machines.mod.js";
import {QueryTypes, Op} from "sequelize";
import {dbSPL} from "../../config/dbAudit.js";
import StorageInventoryModel, {StorageInventoryNodeModel} from "../../models/storage/storageInventory.mod.js";
import StorageInventoryLogModel from "../../models/storage/storageInvnetoryLog.mod.js";
import {LogDailyOutput} from "../../models/planning/dailyPlan.mod.js";
import Users from "../../models/setup/users.mod.js";
import {modelSumbiriEmployee} from "../../models/hr/employe.mod.js";
import BuildingModel from "../../models/list/buildings.mod.js";

export const getOneMachine = async (req, res) => {
    try {
        const findOneMech = await MecListMachine.findOne({
            where: {
                MACHINE_ID: req.params.code,
            },
        });

        return res.status(200).json({
            success: true,
            data: findOneMech,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get one machine",
        });
    }
};

export const assignMachineToStorage = async (req, res) => {
    try {
        const {storageInventoryId, machines} = req.body;

        if (!storageInventoryId) {
            return res.status(400).json({
                success: false,
                message: "Storage Inventory ID is required",
            });
        }

        if (!Array.isArray(machines) || machines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Valid machines array is required",
            });
        }

        const targetStorage = await StorageInventoryModel.findByPk(storageInventoryId);

        if (!targetStorage) {
            return res.status(404).json({
                success: false,
                message: "Target storage not found",
            });
        }

        let nodeMap = new Map();
        if (targetStorage.CATEGORY === "LINE") {
            const nodes = await StorageInventoryNodeModel.findAll({
                where: {STORAGE_INVENTORY_ID: storageInventoryId},
                order: [['SEQUENCE', 'ASC']],
                include: [
                    {
                        model: MecListMachine,
                        as: 'MACHINE',
                        attributes: ['MACHINE_ID'],
                        required: false,
                        where: {
                            MACHINE_ID: {[Op.notIn]: machines.map(m => m.machineId)}
                        }
                    }
                ]
            });

            const availableNodes = nodes.filter(node => !node.MACHINE);

            if (availableNodes.length < machines.length) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough slots in ${targetStorage.DESCRIPTION}. Required: ${machines.length}, Available: ${availableNodes.length}`,
                });
            }

            nodeMap = new Map(
                machines.map((machine, index) => [
                    machine.machineId,
                    {
                        nodeId: availableNodes[index].ID,
                        seqNo: availableNodes[index].SEQUENCE + 1
                    }
                ])
            );
        }


        for (const machineData of machines) {
            const machineId = machineData.machineId;

            const machine = await MecListMachine.findOne({
                where: {MACHINE_ID: machineId}
            });

            if (!machine) {
                console.warn(`Machine ${machineId} not found`);
                continue;
            }

            if (machine.IS_REPLACE) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot move the machine because it is currently under repair`,
                });
            }

            const activeDowntime = await MecDownTimeModel.findOne({
                where: {
                    MACHINE_ID: machineId,
                    IS_COMPLETE: false
                }
            });

            if (activeDowntime) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot move machine ${machineId}: it is in downtime mode`,
                });
            }

            const updateData = {
                STORAGE_INVENTORY_ID: targetStorage.ID,
            };

            if (targetStorage.CATEGORY === "LINE" && nodeMap.has(machineId)) {
                updateData.STORAGE_INVENTORY_NODE_ID = nodeMap.get(machineId).nodeId;
                updateData.SEQ_NO = nodeMap.get(machineId).seqNo;
            } else {
                updateData.STORAGE_INVENTORY_NODE_ID = null;
            }

            if (machine.STORAGE_INVENTORY_ID && machine.STORAGE_INVENTORY_ID !== targetStorage.ID) {
                await StorageInventoryLogModel.create({
                    STORAGE_INVENTORY_ID: machine.STORAGE_INVENTORY_ID,
                    MACHINE_ID: machineId,
                    DESCRIPTION: 'REMOVED FROM STORAGE',
                    USER_ADD_ID: req.body.userId || null
                });
            }

            await machine.update(updateData);

            await StorageInventoryLogModel.create({
                STORAGE_INVENTORY_ID: targetStorage.ID,
                STORAGE_INVENTORY_NODE_ID: updateData.STORAGE_INVENTORY_NODE_ID || null,
                MACHINE_ID: machineId,
                DESCRIPTION: 'ASSIGNED TO STORAGE',
                USER_ADD_ID: req.body.userId || null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Machines assigned to storage successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to assign machines: ${error.message}`,
        });
    }
};

export const getListMachine = async (req, res) => {
    const {departmentId} = req.query;

    try {
        var listMach = []
        if (Number(departmentId)) {
            listMach = await db.query(qryGetAllMachineByDepartment, {
                replacements: {departmentId},
                type: QueryTypes.SELECT
            });
        } else {
            listMach = await db.query(qryGetAllMachine, {
                type: QueryTypes.SELECT,
            });
        }
        const listType = await db.query(qryGetlistType, {
            type: QueryTypes.SELECT,
        });

        const listSection = await db.query(qryGetlistSection, {
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            data: listMach,
            listType: listType,
            listSection: listSection,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get list machine",
        });
    }
};

//untuk post machine
export const postMachine = async (req, res) => {
    try {
        const data = req.body;
        if (!data)
            return res.status(404).json({
                success: false,
                message: "error No Data For Post machine",
            });

        if (data?.STATUS && !["NORMAL", "BROKEN", "ON_FIX"].includes(data.STATUS)) {
            data.STATUS = "NORMAL"
        }

        await MecListMachine.create(data);

        return res.status(200).json({
            success: true,
            message: "Data Create Success",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request post list machine",
        });
    }
};


export const updateMachine = async (req, res) => {
    try {
        const data = req.body;
        if (!data || !data.MACHINE_ID) {
            return res.status(400).json({
                success: false,
                message: "No data or MACHINE_ID provided",
            });
        }

        const machine = await MecListMachine.findOne({
            where: {MACHINE_ID: data.MACHINE_ID},
        });

        if (!machine) {
            return res.status(404).json({
                success: false,
                message: "Machine not found",
            });
        }

        let storageInventoryId = data.STORAGE_INVENTORY_ID || machine.STORAGE_INVENTORY_ID;

        if (!storageInventoryId) {
            await machine.update(data);
            return res.status(200).json({
                success: true,
                message: "Machine updated successfully (no storage assignment)",
            });
        }

        const storage = await StorageInventoryModel.findByPk(storageInventoryId);
        if (!storage) {
            return res.status(404).json({
                success: false,
                message: "Storage not found",
            });
        }

        if (storage.CATEGORY === "LINE") {
            const storageNodeId = data.STORAGE_INVENTORY_NODE_ID;

            if (!storageNodeId) {
                const availableNode = await StorageInventoryNodeModel.findOne({
                    where: {STORAGE_INVENTORY_ID: storageInventoryId},
                    include: [
                        {
                            model: MecListMachine,
                            as: 'MACHINE',
                            required: false,
                            where: {MACHINE_ID: {[Op.not]: data.MACHINE_ID}}
                        }
                    ],
                    order: [['SEQUENCE', 'ASC']],
                });

                if (!availableNode) {
                    return res.status(400).json({
                        success: false,
                        message: "Cannot assign machine: all nodes are occupied",
                    });
                }

                data.STORAGE_INVENTORY_NODE_ID = availableNode.ID;
                data.SEQ_NO = availableNode.SEQUENCE + 1;
            } else {
                const validNode = await StorageInventoryNodeModel.findOne({
                    where: {
                        ID: storageNodeId,
                        STORAGE_INVENTORY_ID: storageInventoryId
                    }
                });

                if (!validNode) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid node ID or does not belong to this storage",
                    });
                }
            }
        }

        await machine.update(data);

        return res.status(200).json({
            success: true,
            message: "Machine updated and assigned to node successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update machine: ${error.message}`,
        });
    }
};


export const updateMachineAndStorage = async (req, res) => {
    try {
        const {serialNumberInventory} = req.params;
        const {machineNos, userId} = req.body;

        if (!serialNumberInventory) {
            return res.status(400).json({
                success: false,
                message: "Serial number inventory is required",
            });
        }

        if (!Array.isArray(machineNos) || machineNos.length === 0) {
            return res.status(400).json({
                success: false,
                message: "machineNos must be a non-empty array",
            });
        }

        const storageInventory = await StorageInventoryModel.findOne({
            where: {SERIAL_NUMBER: serialNumberInventory},
        });

        if (!storageInventory) {
            return res.status(404).json({
                success: false,
                message: "Storage inventory not found",
            });
        }

        if (storageInventory.CATEGORY === "LINE") {
            const requestedCount = machineNos.length;

            const allNodes = await StorageInventoryNodeModel.findAll({
                where: {STORAGE_INVENTORY_ID: storageInventory.ID},
                order: [['SEQUENCE', 'ASC']],
                include: [
                    {
                        model: MecListMachine,
                        as: 'MACHINE',
                        attributes: ['MACHINE_ID'],
                        required: false
                    }
                ]
            });

            const availableLeftNodes = allNodes
                .filter(node => node.POSITION === 'LEFT' && !node.MACHINE)
                .sort((a, b) => a.SEQUENCE - b.SEQUENCE);

            const availableRightNodes = allNodes
                .filter(node => node.POSITION === 'RIGHT' && !node.MACHINE)
                .sort((a, b) => a.SEQUENCE - b.SEQUENCE);

            if (requestedCount > allNodes.length) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough slots. Total capacity: ${allNodes.length}, Requested: ${requestedCount}`,
                });
            }

            const assignments = [];
            const usedNodeIds = new Set();

            for (const item of machineNos) {
                const {MACHINE_ID, POSITION: requestedPosition} = item;

                const activeDowntime = await MecDownTimeModel.findOne({
                    where: {
                        MACHINE_ID,
                        IS_COMPLETE: false
                    }
                });

                if (activeDowntime) {
                    return res.status(400).json({
                        success: false,
                        message: `Machine ${MACHINE_ID} cannot be moved because it is in downtime mode`,
                    });
                }

                let targetNodes = requestedPosition === 'RIGHT'
                    ? [...availableRightNodes, ...availableLeftNodes]
                    : [...availableLeftNodes, ...availableRightNodes];

                const availableTarget = targetNodes.find(node => !usedNodeIds.has(node.ID));

                if (!availableTarget) {
                    return res.status(400).json({
                        success: false,
                        message: `No available node found for machine ${MACHINE_ID}. All slots may be occupied.`,
                    });
                }

                usedNodeIds.add(availableTarget.ID);

                assignments.push({
                    machineId: MACHINE_ID,
                    nodeId: availableTarget.ID,
                    sequence: availableTarget.SEQUENCE,
                    position: availableTarget.POSITION
                });
            }

            const updatedMachines = [];

            for (const assignment of assignments) {
                const machine = await MecListMachine.findOne({
                    where: {MACHINE_ID: assignment.machineId}
                });

                if (!machine) {
                    console.warn(`Machine ${assignment.machineId} not found`);
                    continue;
                }


                if (machine.IS_REPLACE) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot move the machine because it is currently under repair`,
                    });
                }


                await machine.update({
                    STORAGE_INVENTORY_ID: storageInventory.ID,
                    STORAGE_INVENTORY_NODE_ID: assignment?.nodeId,
                    SEQ_NO: assignment.sequence + 1
                });

                await StorageInventoryLogModel.create({
                    STORAGE_INVENTORY_ID: storageInventory.ID,
                    MACHINE_ID: assignment.machineId,
                    USER_ADD_ID: userId,
                    DESCRIPTION: 'ASSIGNED TO NODE',
                    STORAGE_INVENTORY_NODE_ID: assignment?.nodeId
                });

                updatedMachines.push({
                    MACHINE_ID: machine.MACHINE_ID,
                    STORAGE_INVENTORY_ID: storageInventory.ID,
                    STORAGE_INVENTORY_NODE_ID: assignment.nodeId,
                    SEQ_NO: assignment.sequence + 1,
                    POSITION: assignment.position
                });
            }

            return res.status(200).json({
                success: true,
                message: "Machines assigned to storage nodes successfully",
                data: updatedMachines
            });
        } else {
            const updatedMachines = [];
            for (const item of machineNos) {
                const {MACHINE_ID} = item;

                const activeDowntime = await MecDownTimeModel.findOne({
                    where: {
                        MACHINE_ID,
                        IS_COMPLETE: false
                    }
                });

                if (activeDowntime) {
                    return res.status(400).json({
                        success: false,
                        message: `Machine ${MACHINE_ID} cannot be moved because it is in downtime mode`,
                    });
                }

                const machine = await MecListMachine.findOne({
                    where: {MACHINE_ID}
                });

                if (!machine) {
                    console.warn(`Machine ${MACHINE_ID} not found`);
                    continue;
                }


                await machine.update({
                    STORAGE_INVENTORY_ID: storageInventory.ID,
                    STORAGE_INVENTORY_NODE_ID: null,
                    SEQ_NO: null
                });

                await StorageInventoryLogModel.create({
                    STORAGE_INVENTORY_ID: storageInventory.ID,
                    MACHINE_ID: MACHINE_ID,
                    USER_ADD_ID: userId,
                    DESCRIPTION: 'ASSIGNED TO STORAGE (NON-LINE)',
                    STORAGE_INVENTORY_NODE_ID: null
                });

                updatedMachines.push({
                    MACHINE_ID: machine.MACHINE_ID,
                    STORAGE_INVENTORY_ID: storageInventory.ID,
                    STORAGE_INVENTORY_NODE_ID: null,
                    SEQ_NO: null,
                    POSITION: null
                });
            }


            return res.status(200).json({
                success: true,
                message: "Machines assigned to storage nodes successfully",
                data: updatedMachines
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update machines and storage: ${error.message}`,
        });
    }
};

export const updateSequenceByStorageAndMachine = async (req, res) => {
    try {
        const {storageInventoryId} = req.params;
        const {machineId, newSeqNo} = req.body;


        if (!storageInventoryId || !machineId || !newSeqNo) {
            return res.status(400).json({
                success: false,
                message: "Storage inventory ID, machine ID, and new sequence number must be provided",
            });
        }


        const machinesInStorage = await MecListMachine.findAll({
            where: {STORAGE_INVENTORY_ID: storageInventoryId},
            order: [["SEQ_NO", "ASC"]],
        });


        const targetMachine = machinesInStorage.find((machine) => machine.MACHINE_ID === machineId);

        if (!targetMachine) {
            return res.status(404).json({
                success: false,
                message: "Machine not found in the specified storage inventory",
            });
        }


        if (newSeqNo < 1 || newSeqNo > machinesInStorage.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid sequence number. It must be between 1 and the total number of machines in the storage.",
            });
        }


        machinesInStorage.forEach((machine) => {
            if (machine.SEQ_NO === newSeqNo && machine.MACHINE_ID !== machineId) {
                machine.SEQ_NO = targetMachine.SEQ_NO;
                machine.save();
            }
        });


        targetMachine.SEQ_NO = newSeqNo;
        await targetMachine.save();

        return res.status(200).json({
            success: true,
            message: "Sequence updated successfully",
            data: {
                MACHINE_ID: targetMachine.MACHINE_ID,
                STORAGE_INVENTORY_ID: storageInventoryId,
                NEW_SEQ_NO: newSeqNo,
            },
        });
    } catch (error) {
        console.error("Error updating sequence:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update sequence: ${error.message}`,
        });
    }
};

export const updateSequenceByStorageAndMachineBulk = async (req, res) => {
    const {storageInventoryId} = req.params;
    const {reorderData} = req.body;

    if (!storageInventoryId) {
        return res.status(400).json({
            success: false,
            message: "Storage inventory ID is required",
        });
    }

    if (!Array.isArray(reorderData)) {
        return res.status(400).json({
            success: false,
            message: "reorderData must be an array",
        });
    }

    if (reorderData.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No changes to apply",
        });
    }

    try {
        const allNodes = await StorageInventoryNodeModel.findAll({
            where: {STORAGE_INVENTORY_ID: storageInventoryId},
            order: [['SEQUENCE', 'ASC']],
            attributes: ['ID', 'SEQUENCE']
        });

        const nodeMap = new Map(allNodes.map(n => [n.ID, n.SEQUENCE]));

        if (allNodes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No nodes found for this storage inventory",
            });
        }

        const currentMachines = await MecListMachine.findAll({
            where: {STORAGE_INVENTORY_ID: storageInventoryId}
        });

        const machineMap = new Map(currentMachines.map(m => [m.MACHINE_ID, m]));

        const validNodeIds = new Set(nodeMap.keys());
        for (const item of reorderData) {
            if (!item.nodeId) {
                return res.status(400).json({
                    success: false,
                    message: "Each item must have a nodeId"
                });
            }
            if (!validNodeIds.has(item.nodeId)) {
                return res.status(400).json({
                    success: false,
                    message: `Node ${item.nodeId} does not belong to storage ${storageInventoryId}`
                });
            }
        }


        await MecListMachine.sequelize.transaction(async (t) => {
            const updates = [];

            for (const {nodeId, machineId} of reorderData) {
                const nodeSequence = nodeMap.get(nodeId);

                if (machineId) {
                    updates.push({
                        MACHINE_ID: machineId,
                        STORAGE_INVENTORY_NODE_ID: nodeId,
                        SEQ_NO: nodeSequence + 1
                    });
                }
            }

            for (const update of updates) {
                await MecListMachine.update(
                    {
                        STORAGE_INVENTORY_NODE_ID: update.STORAGE_INVENTORY_NODE_ID,
                        SEQ_NO: update.SEQ_NO
                    },
                    {
                        where: {MACHINE_ID: update.MACHINE_ID},
                        transaction: t
                    }
                );
            }

            for (const {nodeId, machineId} of reorderData) {
                if (machineId) {
                    await StorageInventoryLogModel.create({
                        STORAGE_INVENTORY_ID: storageInventoryId,
                        STORAGE_INVENTORY_NODE_ID: nodeId,
                        MACHINE_ID: machineId,
                        USER_ADD_ID: req.body.userId || null,
                        DESCRIPTION: machineId ? 'REASSIGN TO NODE' : 'UNASSIGN FROM NODE'
                    }, {transaction: t});
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Machine assignments updated successfully",
            data: reorderData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update assignments: ${error.message}`,
        });
    }
};

export const deleteMachine = async (req, res) => {
    try {
        const {macId} = req.params;
        if (!macId)
            return res.status(404).json({
                success: false,
                message: "Tidak Terdapat NO Mesin",
            });

        const checkMac = await MecListMachine.findAll({
            where: {
                MACHINE_ID: macId,
            },
            raw: true,
        });

        if (checkMac.length === 0)
            return res.status(404).json({
                success: false,
                message: "No Mesin tidak Ditemukan",
            });

        const checkTransactionIn = await MacItemIn.findAll({
            where: {
                MACHINE_ID: macId,
            },
            raw: true,
        });

        if (checkTransactionIn.length !== 0)
            return res.status(404).json({
                success: false,
                message: "Tidak Dapat Di Hapus sudah terdapat Transaksi IN",
            });

        const deleteMac = await MecListMachine.destroy({
            where: {
                MACHINE_ID: macId,
            },
        });

        if (deleteMac)
            return res.status(200).json({
                success: true,
                message: "Data Delete Success",
            });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request delete list machine",
        });
    }
};

export const getListTypeMec = async (req, res) => {
    try {
        const listType = await db.query(qryGetlistType, {
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            listType: listType,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get list type",
        });
    }
};

export const getOneMachForIN = async (req, res) => {
    try {
        const {macId} = req.params;
        if (!macId) return res.status(404).json({message});
        const oneMach = await db.query(qryGetOneItem, {
            replacements: {macId},
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            data: oneMach,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get list type",
        });
    }
};

//untuk post machine
export const postMachItemIn = async (req, res) => {
    try {
        const data = req.body;
        if (!data)
            return res.status(404).json({
                success: false,
                message: "error No Data For Post IN",
            });

        await MacItemIn.create(data);

        return res.status(200).json({
            success: true,
            message: "Data Post In Success",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request post itemIN",
        });
    }
};

//untuk delt machine
export const delMachItemIn = async (req, res) => {
    try {
        const {LOG_ID, inputDate} = req.params;
        if (!LOG_ID)
            return res.status(404).json({
                success: false,
                message: "error No Data For Delete",
            });

        const dateInput = moment(inputDate, "YYYY-MM-DD").add(1, "hours");
        const dateNow = moment().set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
        });

        if (dateInput.isBefore(dateNow)) {
            return res.status(202).json({
                success: false,
                message: "Tidak Bisa Delete Input Hari Sebelumnya",
            });
        }

        await MacItemIn.destroy({
            where: {
                LOG_ID,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Success Delete",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request Delete itemIN",
        });
    }
};

export const getMacItemIn = async (req, res) => {
    try {
        const date = req.params.date;

        const listData = await db.query(qryListInbyDate, {
            replacements: {date},
            type: QueryTypes.SELECT,
        });

        return res.json({
            success: true,
            data: listData,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request get itemIN",
        });
    }
};

export const getMacItemOut = async (req, res) => {
    try {
        const date = req.params.date;

        const listData = await db.query(qryListOut, {
            replacements: {date},
            type: QueryTypes.SELECT,
        });

        return res.json({
            success: true,
            data: listData,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request get out",
        });
    }
};

export const getEmploye = async (req, res) => {
    try {
        const {nik} = req.params;

        const listData = await dbSPL.query(findEmploye, {
            replacements: {nik},
            type: QueryTypes.SELECT,
        });

        return res.json({
            success: true,
            data: listData,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request get employe ",
        });
    }
};

export const getMachineNo = async (req, res) => {
    try {
        const {macId} = req.params;

        const listData = await db.query(qryGetOneMachine, {
            replacements: {macId},
            type: QueryTypes.SELECT,
        });

        return res.json({
            success: true,
            data: listData,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request get machine no",
        });
    }
};

//untuk post sparePart out
export const postMacPartOut = async (req, res) => {
    try {
        const data = req.body;
        if (!data)
            return res.status(404).json({
                success: false,
                message: "error No Data For Post OUT",
            });

        await MacPartOut.create(data);

        return res.status(200).json({
            success: true,
            message: "Data Post In Success",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request post OUT",
        });
    }
};

//untuk delt machine
export const delMachItemOut = async (req, res) => {
    try {
        const {LOG_ID, inputDate} = req.params;
        if (!LOG_ID)
            return res.status(404).json({
                success: false,
                message: "error No Data For Delete",
            });

        const dateInput = moment(inputDate, "YYYY-MM-DD").add(1, "hours");
        const dateNow = moment().set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
        });

        if (dateInput.isBefore(dateNow)) {
            return res.status(202).json({
                success: false,
                message: "Tidak Bisa Delete Input Hari Sebelumnya",
            });
        }

        await MacPartOut.destroy({
            where: {
                LOG_ID,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Success Delete",
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request Delete itemIN",
        });
    }
};

export const getPartNNeedle = async (req, res) => {
    try {
        const listMach = await db.query(qryGetSPartNeedle, {
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            data: listMach,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get list machine",
        });
    }
};

//get report saldo awal mec report
export const getMecRepSaldoAwl = async (req, res) => {
    try {
        const {lastDate, startDate, endDate} = req.params;

        const listMach = await db.query(qryMecStockMain, {
            replacements: {lastDate, startDate, endDate},
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            data: listMach,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get list saldo awal",
        });
    }
};

//get report saldo awal mec report
export const getDtlMecTrans = async (req, res) => {
    try {
        const {startDate, endDate} = req.params;

        const listMach = await db.query(qryGetDtlTransPart, {
            replacements: {startDate, endDate},
            type: QueryTypes.SELECT,
        });

        return res.status(200).json({
            success: true,
            data: listMach,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            data: error,
            message: "error processing request get list detail",
        });
    }
};


export const getMachinesByStorageInventoryId = async (req, res) => {
    try {
        const {storageInventoryId} = req.params;

        if (!storageInventoryId) {
            return res.status(400).json({
                success: false,
                message: "Storage inventory ID is required",
            });
        }

        const inventoryStorage = await StorageInventoryModel.findByPk(storageInventoryId)
        if (!inventoryStorage) return res.status(404).json({status: false, message: "Storage inventory not found"})

        let nodeLeft = []
        let nodeRight = []
        let listMachine = []

        if (inventoryStorage.CATEGORY === "STORAGE")  {
            listMachine = await MecListMachine.findAll({
                where: {
                    STORAGE_INVENTORY_ID: storageInventoryId
                },
                include: [
                    {
                        model: MacTypeOfMachine,
                        as: 'MEC_TYPE_OF_MACHINE',
                        attributes: ['TYPE_ID', 'TYPE_DESCRIPTION', 'COLOR', 'CATEGORY'],
                    }
                ]
            })
        } else {
            nodeLeft = await StorageInventoryNodeModel.findAll(
                {
                    where: {STORAGE_INVENTORY_ID: storageInventoryId, POSITION: 'LEFT'},
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

            nodeRight = await StorageInventoryNodeModel.findAll(
                {
                    where: {STORAGE_INVENTORY_ID: storageInventoryId, POSITION: 'RIGHT'},
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
        }




        return res.status(200).json({
            success: true,
            message: "Machines and node structure retrieved successfully",
            data: {
                NODE_LEFT: nodeLeft,
                NODE_RIGHT: nodeRight,
                LIST_MACHINE: listMachine
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve machines: ${error.message}`,
        });
    }
};

export const ListTypeMachine = async (req, res) => {
    try {
        const {category} = req.query

        const where = {}
        if (category) {
            where.CATEGORY = category
        }

        const resp = await MacTypeOfMachine.findAll({
            where
        })
        return res.status(200).json({
            success: true,
            message: "Machines retrieved successfully",
            data: resp,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve machines: ${err.message}`,
        });
    }
}

export const getTypeMachineByCategory = async (req, res) => {
    try {

        const productionTypes = await MacTypeOfMachine.findAll({
            where: {
                CATEGORY: "PRODUCTION"
            }
        })

        if (!productionTypes || productionTypes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No type machines found for category 'PRODUCTION'.",
            });
        }
        const response = []

        for (let i = 0; i < productionTypes.length; i++) {
            const typeId = productionTypes[i].dataValues.TYPE_ID
            const totalMachines = await MecListMachine.count({
                where: {
                    MACHINE_TYPE: typeId,
                },
            });


            const machinesInUse = await MecListMachine.count({
                where: {
                    MACHINE_TYPE: typeId,
                    STORAGE_INVENTORY_ID: {
                        [Op.ne]: null,
                    },
                },
            });


            const availableMachines = await MecListMachine.count({
                where: {
                    MACHINE_TYPE: typeId,
                    STATUS: "NORMAL",
                    STORAGE_INVENTORY_ID: null,
                },
            });
            const brokenMachines = await MecListMachine.count({
                where: {
                    MACHINE_TYPE: typeId,
                    STATUS: {
                        [Op.ne]: "NORMAL"
                    },
                },
            });

            response.push({
                ...productionTypes[i].dataValues,
                TOTAL_MACHINE: totalMachines,
                MACHINE_IN_USE: machinesInUse,
                MACHINE_BROKEN: brokenMachines,
                MACHINE_AVAILABLE: availableMachines,
            })
        }

        let totalData = 0

        response.forEach((item) => {
            totalData += Number(item.TOTAL_MACHINE)
        })

        response.push({
            TYPE_DESCRIPTION: "Total Machine",
            TOTAL_MACHINE: totalData,
            COLOR: "",
            CATEGORY: "PRODUCTION",
            MACHINE_IN_USE: 0,
            MACHINE_BROKEN: 0,
            MACHINE_AVAILABLE: 0,
        })

        return res.status(200).json({
            success: true,
            message: "Data retrieved successfully.",
            data: response,
        });
    } catch (error) {
        console.error("Error fetching type machines by category:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch data.",
            error: error.message,
        });
    }
};

export const getMecDownTimeValidation = async (req, res) => {
    try {
        const {status, machineId} = req.query
        const downtimeValid = await MecDownTimeModel.findOne({
            where: {
                MACHINE_ID: machineId,
                IS_COMPLETE: false
            }
        })
        if (downtimeValid) {
            const validData = downtimeValid.STATUS !== status;
            res.status(200).json({
                success: true,
                message: "Get Down Time Validation success",
                data: validData
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Get Down Time Validation success",
                data: false
            })
        }
    } catch (err) {
        console.error("Error retrieving downtime records:", err);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve downtime records: ${err.message}`,
        });
    }
}

export const getAllDownTimeWithOutput = async (req, res) => {
    try {
        const {startDate, endDate, idSiteLine, idDashboard} = req.query;

        const whereCondition = {}
        if (idSiteLine) {
            whereCondition.ID_SITELINE = idSiteLine
        }

        if (idDashboard) {
            whereCondition.STATUS = {
                [Op.in]: ["BROKEN", "ON_FIX"]
            }
        }

        if (startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            parsedStartDate.setHours(0, 0, 0, 0);
            const parsedEndDate = new Date(endDate);
            parsedEndDate.setHours(23, 59, 59, 999);

            if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Please use YYYY-MM-DD.",
                });
            }
            whereCondition.START_TIME = {
                [Op.between]: [parsedStartDate, parsedEndDate],
            }
        }

        const downTimes = await MecDownTimeModel.findAll({
            where: {
                ...whereCondition,
            }
        });

        const result = await Promise.all(
            downTimes.map(async (downTime) => {
                const dailyOutput = await LogDailyOutput.findOne({
                    where: {
                        ID_SITELINE: downTime.ID_SITELINE,
                        SCHD_ID: downTime.SCHD_ID,
                    },
                    attributes: ['TOTAL_OUTPUT', 'ORDER_STYLE_DESCRIPTION', 'ITEM_COLOR_NAME', 'LINE_NAME', 'SHIFT', 'ORDER_NO', 'ORDER_REFERENCE_PO_NO']
                });

                const dtD = dailyOutput.dataValues
                const dl = downTime.dataValues

                const mechanic = await modelSumbiriEmployee.findOne({
                    where: {Nik: dl.MECHANIC_ID}
                })
                const machine = await MecListMachine.findOne({
                    where: {MACHINE_ID: dl.MACHINE_ID}, include: [
                        {
                            model: MacTypeOfMachine,
                            as: "MEC_TYPE_OF_MACHINE",
                            attributes: ['COLOR']
                        }
                    ]
                })
                const storage = await StorageInventoryModel.findOne({
                    where: {
                        ID: dl.STORAGE_INVENTORY_ID
                    },
                    include: [
                        {
                            model: BuildingModel,
                            as: "Building",
                            attributes: ['NAME']
                        }
                    ]
                })
                return {
                    ...dtD,
                    TOTAL_OUTPUT: dtD.TOTAL_OUTPUT || 0,
                    STYLE: dtD.ORDER_STYLE_DESCRIPTION,
                    COLOR: dtD.ITEM_COLOR_NAME,
                    LINE_NAME: dtD.LINE_NAME,
                    SHIFT: dtD.SHIFT,
                    ORDER_NO: dtD.ORDER_NO,
                    ORDER_REFERENCE_PO_NO: dtD.ORDER_REFERENCE_PO_NO,
                    BUILDING: storage?.Building?.NAME,
                    START_DATE: dl.START_TIME,
                    RESPONSE_DATE: dl.RESPONSE_TIME,
                    DESCRIPTION: dl.DESCRIPTION,
                    END_DATE: dl.END_TIME,
                    STATUS: dl.STATUS,
                    MECHANIC_NAME: mechanic?.NamaLengkap,
                    MACHINE_ID: machine?.MACHINE_ID,
                    MACHINE_COLOR: machine?.MEC_TYPE_OF_MACHINE?.COLOR || '#f3f3f3'
                };
            })
        );
        return res.status(200).json({
            success: true,
            message: "Downtime records retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error retrieving downtime records:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve downtime records: ${error.message}`,
        });
    }
};


export const postListLampu = async (req, res) => {
    try {
        const {mac, ip_address, id_siteline} = req.body;

        if (!mac || !ip_address || !id_siteline) {
            return res.status(400).json({
                success: false,
                message: "MAC, IP Address, dan ID Siteline harus diisi",
            });
        }

        const existMac = await ListLamp.findOne({where: {MAC: mac}});
        if (existMac) {
            return res.status(400).json({
                success: false,
                message: `MAC ${mac} sudah digunakan`,
            });
        }

        const existIP = await ListLamp.findOne({where: {IP_ADDRESS: ip_address}});
        if (existIP) {
            return res.status(400).json({
                success: false,
                message: `IP Address ${ip_address} sudah digunakan`,
            });
        }

        const existSiteline = await ListLamp.findOne({where: {ID_SITELINE: id_siteline}});
        if (existSiteline) {
            return res.status(400).json({
                success: false,
                message: `ID Siteline ${id_siteline} sudah digunakan`,
            });
        }

        const newLamp = await ListLamp.create({
            MAC: mac,
            IP_ADDRESS: ip_address,
            ID_SITELINE: id_siteline,
        });

        return res.status(201).json({
            success: true,
            message: "Data lampu berhasil ditambahkan",
            data: newLamp,
        });
    } catch (error) {
        console.error("Error creating list lamp record:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create list lamp record: ${error.message}`,
        });
    }
};


export const getListLampu = async (req, res) => {
    try {
        const getAllLampu = await ListLamp.findAll({})

        res.json({data: getAllLampu})
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to get lampu: ${error.message}`,
        });
    }
}