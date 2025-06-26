import { where } from "sequelize";
import BuildingRoomModel from "../../models/list/buildingRoom.mod.js";


export const createRoom = async (req, res) => {
    try {
        const { BUILDING_ID, NAME, DESCRIPTION, CODE, FLOOR_LEVEL } = req.body;


        if (!BUILDING_ID || !NAME) {
            return res.status(400).json({
                success: false,
                message: "BUILDING_ID and room name are required",
            });
        }

        const newRoom = await BuildingRoomModel.create({
            BUILDING_ID,
            NAME,
            DESCRIPTION, CODE,
            FLOOR_LEVEL,
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            data: newRoom,
        });
    } catch (error) {
        console.error("Error creating room:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create room: ${error.message}`,
        });
    }
};


export const getAllRooms = async (req, res) => {
    try {
        const { BUILDING_ID } = req.query
        const whereCondition = {}
        if (BUILDING_ID) {
            whereCondition.BUILDING_ID = BUILDING_ID;
        }
        const rooms = await BuildingRoomModel.findAll({ where: whereCondition });

        return res.status(200).json({
            success: true,
            message: "Rooms retrieved successfully",
            data: rooms,
        });
    } catch (error) {
        console.error("Error retrieving rooms:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve rooms: ${error.message}`,
        });
    }
};


export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await BuildingRoomModel.findByPk(id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room retrieved successfully",
            data: room,
        });
    } catch (error) {
        console.error("Error retrieving room:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve room: ${error.message}`,
        });
    }
};


export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { BUILDING_ID, NAME, DESCRIPTION, CODE, FLOOR_LEVEL } = req.body;

        const room = await BuildingRoomModel.findByPk(id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        await room.update({
            BUILDING_ID,
            NAME,
            DESCRIPTION, CODE,
            FLOOR_LEVEL,
        });

        return res.status(200).json({
            success: true,
            message: "Room updated successfully",
            data: room,
        });
    } catch (error) {
        console.error("Error updating room:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update room: ${error.message}`,
        });
    }
};


export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await BuildingRoomModel.findByPk(id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found",
            });
        }

        await room.destroy();

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting room:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete room: ${error.message}`,
        });
    }
};