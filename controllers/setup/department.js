import {modelMasterDepartment} from "../../models/hr/employe.mod.js";

export const createDepartment = async (req, res) => {
    try {
        const {IdDept, NameDept, GolDept, IDManager} = req.body;

        if (!IdDept || !NameDept) {
            return res.status(400).json({
                success: false,
                message: "IdDept and NameDept are required",
            });
        }

        const existingDepartment = await modelMasterDepartment.findOne({
            where: {IdDept},
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: "IdDept already exists",
            });
        }

        const newDepartment = await modelMasterDepartment.create({
            IdDept,
            NameDept,
            GolDept,
            IDManager,
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            newDepartment,
        });
    } catch (error) {
        console.error("Error creating department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create department: ${error.message}`,
        });
    }
};

export const getAllDepartments = async (req, res) => {
    try {
        const departments = await modelMasterDepartment.findAll();

        return res.status(200).json({
            success: true,
            message: "Departments retrieved successfully",
            data: departments,
        });
    } catch (error) {
        console.error("Error retrieving departments:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve departments: ${error.message}`,
        });
    }
};

export const getDepartmentByIdDept = async (req, res) => {
    try {
        const {iddept} = req.params;

        const department = await modelMasterDepartment.findOne({
            where: {IdDept: iddept},
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department retrieved successfully",
            data: department,
        });
    } catch (error) {
        console.error("Error retrieving department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve department: ${error.message}`,
        });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const {iddept} = req.params;
        const {NameDept, GolDept, IDManager} = req.body;

        const department = await modelMasterDepartment.findOne({
            where: {IdDept: iddept},
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        await department.update({
            NameDept,
            GolDept,
            IDManager,
        });

        return res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department,
        });
    } catch (error) {
        console.error("Error updating department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update department: ${error.message}`,
        });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const {iddept} = req.params;

        const department = await modelMasterDepartment.findOne({
            where: {IdDept: iddept},
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        await department.destroy();

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete department: ${error.message}`,
        });
    }
};