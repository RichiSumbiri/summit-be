import MasterSiteFxModel from "../../models/setup/siteFx.mod.js";
import {Op} from "sequelize";

export const createSiteFx = async (req, res) => {
    try {
        const {
            CODE,
            NAME,
            ADDRESS_1,
            ADDRESS_2,
            CITY,
            PROVINCE,
            POSTAL_CODE,
            COUNTRY_CODE,
            TELEPHONE,
            FAX,
            EMAIL,
            MANUFACTURING_FLAG,
            SEW_TEAM_ALLOCATION,
            COMPANY_ID,
            WS1,
            WS2,
            UNIT_ID
        } = req.body;

        if ( !CODE || !NAME) {
            return res.status(400).json({
                success: false,
                message: " CODE, and NAME are required",
            });
        }

        const existCode = await MasterSiteFxModel.findOne({
            where: {
                CODE,
                IS_DELETED: false
            }
        })


        if (existCode) {
            return res.status(500).json({
                success: false,
                message: `CODE already exist`,
            });
        }

        const total = await MasterSiteFxModel.count()
        const ID = `Site${total+1}`
        const newSite = await MasterSiteFxModel.create({
            ID,
            CODE,
            NAME,
            ADDRESS_1,
            ADDRESS_2,
            CITY,
            PROVINCE,
            POSTAL_CODE,
            COUNTRY_CODE,
            TELEPHONE,
            FAX,
            EMAIL,
            MANUFACTURING_FLAG,
            SEW_TEAM_ALLOCATION,
            COMPANY_ID,
            WS1,
            WS2,
            UNIT_ID,
            IS_DELETED: false,
            DELETED_AT: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Site created successfully",
            newSite,
        });
    } catch (error) {
        console.error("Error creating site:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create site: ${error.message}`,
        });
    }
};

export const getAllSitesFx = async (req, res) => {
    try {
        const {companyId, unitId} = req.query
        const whereCondition = {}
        if (companyId) {
            whereCondition.COMPANY_ID = companyId
        }
        if (unitId) {
            whereCondition.UNIT_ID = unitId
        }

        const sites = await MasterSiteFxModel.findAll({
            where: {...whereCondition, IS_DELETED: false},
            distinct: true
        });

        return res.status(200).json({
            success: true,
            message: "Sites retrieved successfully",
            data: sites,
        });
    } catch (error) {
        console.error("Error retrieving sites:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve sites: ${error.message}`,
        });
    }
};

export const getSiteFxById = async (req, res) => {
    try {
        const { id } = req.params;

        const site = await MasterSiteFxModel.findOne({ where: { ID: id } });

        if (!site) {
            return res.status(404).json({
                success: false,
                message: "Site not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Site retrieved successfully",
            data: site,
        });
    } catch (error) {
        console.error("Error retrieving site:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve site: ${error.message}`,
        });
    }
};

export const updateSiteFx = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            CODE,
            NAME,
            ADDRESS_1,
            ADDRESS_2,
            CITY,
            PROVINCE,
            POSTAL_CODE,
            COUNTRY_CODE,
            TELEPHONE,
            FAX,
            EMAIL,
            MANUFACTURING_FLAG,
            SEW_TEAM_ALLOCATION,
            COMPANY_ID,
            WS1,
            WS2,
            UNIT_ID
        } = req.body;

        const site = await MasterSiteFxModel.findOne({ where: { ID: id } });

        if (!site) {
            return res.status(404).json({
                success: false,
                message: "Site not found",
            });
        }



        const existCode = await MasterSiteFxModel.findOne({
            where: {
                CODE,
                IS_DELETED: false,
                ID: {
                    [Op.ne]: id
                }
            }
        })

        if (existCode) {
            return res.status(500).json({
                success: false,
                message: `CODE already exist`,
            });
        }

        await site.update({
            CODE,
            NAME,
            ADDRESS_1,
            ADDRESS_2,
            CITY,
            PROVINCE,
            POSTAL_CODE,
            COUNTRY_CODE,
            TELEPHONE,
            FAX,
            EMAIL,
            MANUFACTURING_FLAG,
            SEW_TEAM_ALLOCATION,
            COMPANY_ID,
            WS1,
            WS2,
            UNIT_ID
        });

        return res.status(200).json({
            success: true,
            message: "Site updated successfully",
            data: site,
        });
    } catch (error) {
        console.error("Error updating site:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update site: ${error.message}`,
        });
    }
};

export const deleteSiteFx = async (req, res) => {
    try {
        const { id } = req.params;

        const site = await MasterSiteFxModel.findByPk(id);
        if (!site) {
            return res.status(404).json({
                success: false,
                message: "Site not found",
            });
        }

        await site.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        })

        return res.status(200).json({
            success: true,
            message: "Site deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting site:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete site: ${error.message}`,
        });
    }
};