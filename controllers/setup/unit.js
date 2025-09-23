import MasterUnitModel from "../../models/setup/unit.mod.js";

export const createUnit = async (req, res) => {
    try {
        const { UNIT_CODE, UNIT_NAME, UNIT_LOCATION, UNIT_PHONE, UNIT_FAX, UNIT_EMAIL, COMPANY_ID } = req.body;

        if (!UNIT_CODE || !UNIT_NAME || !COMPANY_ID) {
            return res.status(400).json({
                success: false,
                message: "UNIT_CODE, UNIT_NAME, and COMPANY_ID are required",
            });
        }

        const existingUnit = await MasterUnitModel.findOne({
            where: { UNIT_CODE },
        });

        if (existingUnit) {
            return res.status(400).json({
                success: false,
                message: "UNIT_CODE already exists",
            });
        }

        const newUnit = await MasterUnitModel.create({
            UNIT_CODE,
            UNIT_NAME,
            UNIT_LOCATION,
            UNIT_PHONE, UNIT_FAX, UNIT_EMAIL,
            COMPANY_ID,
            UNIT_CREATE_DATE: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Unit created successfully",
            newUnit,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create unit: ${error.message}`,
        });
    }
};

export const getAllUnits = async (req, res) => {
    try {
        const {companyId} = req.query

        const whereCondition = {}
        if (companyId) {
            whereCondition.COMPANY_ID = companyId
        }

        const units = await MasterUnitModel.findAll({
            where: whereCondition
        });

        return res.status(200).json({
            success: true,
            message: "Units retrieved successfully",
            data: units,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve units: ${error.message}`,
        });
    }
};

export const getUnitById = async (req, res) => {
    try {
        const { id } = req.params;

        const unit = await MasterUnitModel.findByPk(id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Unit retrieved successfully",
            data: unit,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve unit: ${error.message}`,
        });
    }
};

export const updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { UNIT_CODE, UNIT_NAME, UNIT_LOCATION, UNIT_PHONE, UNIT_FAX, UNIT_EMAIL, COMPANY_ID } = req.body;

        const unit = await MasterUnitModel.findByPk(id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found",
            });
        }

        if (UNIT_CODE && UNIT_CODE !== unit.UNIT_CODE) {
            const existingUnit = await MasterUnitModel.findOne({
                where: { UNIT_CODE },
            });

            if (existingUnit) {
                return res.status(400).json({
                    success: false,
                    message: "UNIT_CODE already exists",
                });
            }
        }

        await unit.update({
            UNIT_CODE,
            UNIT_NAME,
            COMPANY_ID,
            UNIT_LOCATION,
            UNIT_PHONE, UNIT_FAX, UNIT_EMAIL,
            UNIT_CREATE_DATE: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Unit updated successfully",
            data: unit,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update unit: ${error.message}`,
        });
    }
};

export const deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;

        const unit = await MasterUnitModel.findByPk(id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: "Unit not found",
            });
        }

        await unit.destroy();

        return res.status(200).json({
            success: true,
            message: "Unit deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete unit: ${error.message}`,
        });
    }
};