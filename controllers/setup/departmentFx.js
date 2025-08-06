import {modelMasterDepartmentFx} from "../../models/setup/departmentFx.mod.js";

export const createDepartmentFx = async (req, res) => {
    try {
        const {ID_DEPT, NAME_DEPT, GOL_DEPT, ID_MANAGER, UNIT_ID} = req.body;

        if (!ID_DEPT || !NAME_DEPT) {
            return res.status(400).json({
                success: false,
                message: "ID_DEPT and NAME_DEPT are required",
            });
        }

        const existingDepartment = await modelMasterDepartmentFx.findOne({
            where: {ID_DEPT},
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: "ID_DEPT already exists",
            });
        }

        const newDepartment = await modelMasterDepartmentFx.create({
            ID_DEPT,
            UNIT_ID,
            NAME_DEPT: NAME_DEPT.trim(),
            GOL_DEPT,
            ID_MANAGER,
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

export const getAllDepartmentsFx = async (req, res) => {
    try {
        const departments = await modelMasterDepartmentFx.findAll({where: {
            IS_DELETED: false
            }});

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

export const getDepartmentByFxId = async (req, res) => {
    try {
        const {id} = req.params;

        const department = await modelMasterDepartmentFx.findOne({
            where: {ID_FX_DEPARTMENT: id},
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

export const updateDepartmentFx = async (req, res) => {
    try {
        const {id} = req.params;
        const {NAME_DEPT, GOL_DEPT, ID_MANAGER, UNIT_ID} = req.body;

        if (!NAME_DEPT) {
            return res.status(400).json({
                success: false,
                message: "NAME_DEPT are required",
            });
        }

        const department = await modelMasterDepartmentFx.findByPk(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        await department.update({
            NAME_DEPT: NAME_DEPT.trim(),
            GOL_DEPT,
            UNIT_ID,
            ID_MANAGER,
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

export const deleteDepartmentFx = async (req, res) => {
    try {
        const {id} = req.params;

        const dep = await modelMasterDepartmentFx.findByPk(id);

        if (!dep) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        dep.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        })

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