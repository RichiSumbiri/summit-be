import MasterSitesModel from "../../models/setup/site.mod.js";

export const createSite = async (req, res) => {
    try {
        const { IDSECTION, IDDEPT, SITE_NAME, CUS_NAME } = req.body;

        if (!IDSECTION || !IDDEPT || !SITE_NAME) {
            return res.status(400).json({
                success: false,
                message: "IDSECTION and IDDEPT are required",
            });
        }

        const existingSite = await MasterSitesModel.findOne({
            where: { IDSECTION },
        });

        if (existingSite) {
            return res.status(400).json({
                success: false,
                message: "IDSECTION already exists",
            });
        }

        const newSite = await MasterSitesModel.create({
            IDSECTION,
            IDDEPT,
            SITE_NAME: SITE_NAME.trim(),
            CUS_NAME,
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

export const getAllSites = async (req, res) => {
    try {
        const sites = await MasterSitesModel.findAll();

        if (!sites || sites.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No sites found",
            });
        }

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

export const getSiteByIdSection = async (req, res) => {
    try {
        const { idsection } = req.params;

        const site = await MasterSitesModel.findOne({
            where: { IDSECTION: idsection },
        });

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

export const updateSite = async (req, res) => {
    try {
        const { idsection } = req.params;
        const { IDDEPT, SITE_NAME, CUS_NAME } = req.body;

        if (!IDDEPT || !SITE_NAME) {
            return res.status(400).json({
                message: "IDDEPT | SITE_NAME are required"
            })
        }

        const site = await MasterSitesModel.findOne({
            where: { IDSECTION: idsection },
        });

        if (!site) {
            return res.status(404).json({
                success: false,
                message: "Site not found",
            });
        }

        await site.update({
            IDDEPT,
            SITE_NAME: SITE_NAME.trim(),
            CUS_NAME,
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

export const deleteSite = async (req, res) => {
    try {
        const { idsection } = req.params;

        const site = await MasterSitesModel.findOne({
            where: { IDSECTION: idsection },
        });

        if (!site) {
            return res.status(404).json({
                success: false,
                message: "Site not found",
            });
        }

        await site.destroy();

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