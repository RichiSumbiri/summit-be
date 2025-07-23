import MasterSiteFxModel from "../../models/setup/siteFx.mod.js";
import MasterUnitModel from "../../models/setup/unit.mod.js";
import SiteDepartmentModel from "../../models/setup/siteDepartment.mod.js";
import {modelMasterDepartmentFx} from "../../models/setup/departmentFx.mod.js";

export const createSiteDepartment = async (req, res) => {
    try {
        const { UNIT_ID, SITE_ID, DEPT_ID } = req.body;


        if (!UNIT_ID || !SITE_ID || !DEPT_ID) {
            return res.status(400).json({
                success: false,
                message: "UNIT_ID, SITE_ID, and DEPT_ID are required",
            });
        }

        const site = await MasterSiteFxModel.findOne({ where: { ID: SITE_ID } });
        if (!site) {
            return res.status(404).json({
                success: false,
                message: "SITE_ID not found",
            });
        }


        const unit = await MasterUnitModel.findOne({ where: { UNIT_ID } });
        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "UNIT_ID not found",
            });
        }

        const department = await modelMasterDepartmentFx.findOne({
            where: { ID_DEPT: DEPT_ID },
        });
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "DEPT_ID not found",
            });
        }


        const existDepartment = await SiteDepartmentModel.findOne({
            where: {
                SITE_ID: SITE_ID,
                DEPT_ID: DEPT_ID,
                IS_DELETED: false,
            }
        })

        if (existDepartment) {
            return res.status(500).json({
                success: false,
                message: `Department Already Exists`,
            });
        }


        const total = await SiteDepartmentModel.count()

        const ID =  `DEP${('0' + (total + 1)).slice(-2)}`


        const newSiteDepartment = await SiteDepartmentModel.create({
            ID,
            UNIT_ID,
            SITE_ID,
            DEPT_ID,
        });

        return res.status(201).json({
            success: true,
            message: "Site Department created successfully",
            newSiteDepartment,
        });
    } catch (error) {
        console.error("Error creating site_department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create site_department: ${error.message}`,
        });
    }
};


export const getAllSiteDepartments = async (req, res) => {
    try {
        const {unitId, siteId} = req.query

        const where = {}
        if (unitId) {
            where.UNIT_ID = unitId
        }

        if (siteId) {
            where.SITE_ID = siteId
        }


        const siteDepartments = await SiteDepartmentModel.findAll({
            where: {
                ...where,
                IS_DELETED: false,
            },
            include: [
                { model: modelMasterDepartmentFx, as: "department"},
            ],
        });
        return res.status(200).json({
            success: true,
            message: "Site Departments retrieved successfully",
            siteDepartments,
        });
    } catch (error) {
        console.error("Error retrieving site_departments:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve site_departments: ${error.message}`,
        });
    }
};


export const getSiteDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const siteDepartment = await SiteDepartmentModel.findOne({
            where: { ID: id },
            include: [
                { model: MasterUnitModel, as: "unit" },
                { model: modelMasterDepartmentFx, as: "department" },
                { model: MasterSiteFxModel, as: "site" },
            ],
        });

        if (!siteDepartment) {
            return res.status(404).json({
                success: false,
                message: "Site Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Site Department retrieved successfully",
            siteDepartment,
        });
    } catch (error) {
        console.error("Error retrieving site_department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve site_department: ${error.message}`,
        });
    }
};


export const updateSiteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { UNIT_ID, SITE_ID, DEPT_ID } = req.body;

        const siteDepartment = await SiteDepartmentModel.findByPk(id);

        if (!siteDepartment) {
            return res.status(404).json({
                success: false,
                message: "Site Department not found",
            });
        }


        if (SITE_ID) {
            const site = await MasterSiteFxModel.findOne({ where: { ID: SITE_ID } });
            if (!site) {
                return res.status(404).json({
                    success: false,
                    message: "SITE_ID not found",
                });
            }
        }


        if (UNIT_ID) {
            const unit = await MasterUnitModel.findOne({ where: { UNIT_ID } });
            if (!unit) {
                return res.status(404).json({
                    success: false,
                    message: "UNIT_ID not found",
                });
            }
        }


        if (DEPT_ID) {
            const department = await modelMasterDepartmentFx.findOne({
                where: { ID_DEPT: DEPT_ID },
            });
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "DEPT_ID not found",
                });
            }
        }


        const existDepartment = await SiteDepartmentModel.findOne({
            where: {
                SITE_ID: SITE_ID,
                DEPT_ID: DEPT_ID,
                IS_DELETED: false,
            }
        })

        if (existDepartment) {
            return res.status(500).json({
                success: false,
                message: `Department Already Exists`,
            });
        }


        await siteDepartment.update({
            UNIT_ID,
            SITE_ID,
            DEPT_ID,
        });

        return res.status(200).json({
            success: true,
            message: "Site Department updated successfully",
            siteDepartment,
        });
    } catch (error) {
        console.error("Error updating site_department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update site_department: ${error.message}`,
        });
    }
};


export const deleteSiteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const siteDepartment = await SiteDepartmentModel.findByPk(id);

        if (!siteDepartment) {
            return res.status(404).json({
                success: false,
                message: "Site Department not found",
            });
        }


        await siteDepartment.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Site Department deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting site_department:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete site_department: ${error.message}`,
        });
    }
};