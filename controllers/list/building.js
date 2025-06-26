import BuildingModel from "../../models/list/buildings.mod.js";


export const createBuilding = async (req, res) => {
    try {
        const { NAME, DESCRIPTION, CODE, UNIT_ID } = req.body;


        if (!NAME) {
            return res.status(400).json({
                success: false,
                message: "Building name is required",
            });
        }

        const newBuilding = await BuildingModel.create({
            NAME,
            DESCRIPTION, CODE,
            UNIT_ID
        });

        return res.status(201).json({
            success: true,
            message: "Building created successfully",
            data: newBuilding,
        });
    } catch (error) {
        console.error("Error creating building:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create building: ${error.message}`,
        });
    }
};


export const getAllBuildings = async (req, res) => {
    const { UNIT_ID } = req.query

    try {
        const buildings = await BuildingModel.findAll({ where: { UNIT_ID } });


        return res.status(200).json({
            success: true,
            message: "Buildings retrieved successfully",
            data: buildings,
        });
    } catch (error) {
        console.error("Error retrieving buildings:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve buildings: ${error.message}`,
        });
    }
};


export const getBuildingById = async (req, res) => {
    
    try {
        const { id } = req.params;

        const building = await BuildingModel.findByPk(id);

        if (!building) {
            return res.status(404).json({
                success: false,
                message: "Building not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Building retrieved successfully",
            data: building,
        });
    } catch (error) {
        console.error("Error retrieving building:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve building: ${error.message}`,
        });
    }
};


export const updateBuilding = async (req, res) => {
    try {
        const { id } = req.params;
        const { NAME, DESCRIPTION, CODE, UNIT_ID } = req.body;

        const building = await BuildingModel.findByPk(id);

        if (!building) {
            return res.status(404).json({
                success: false,
                message: "Building not found",
            });
        }

        await building.update({
            NAME,
            DESCRIPTION, CODE,
            UNIT_ID
        });

        return res.status(200).json({
            success: true,
            message: "Building updated successfully",
            data: building,
        });
    } catch (error) {
        console.error("Error updating building:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update building: ${error.message}`,
        });
    }
};


export const deleteBuilding = async (req, res) => {
    try {
        const { id } = req.params;

        const building = await BuildingModel.findByPk(id);

        if (!building) {
            return res.status(404).json({
                success: false,
                message: "Building not found",
            });
        }

        await building.destroy();

        return res.status(200).json({
            success: true,
            message: "Building deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting building:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete building: ${error.message}`,
        });
    }
};