import MasterCompanyModel from "../../models/setup/company.mod.js";
export const createCompany = async (req, res) => {
    try {
        const { ID, NAME } = req.body;
        if (!NAME || !ID) {
            return res.status(400).json({
                success: false,
                message: "ID, Company  is required",
            });
        }
        const newCompany = await MasterCompanyModel.create({
            ID,
            NAME,
            CREATED_AT: new Date(),
            UPDATED_AT: new Date(),
        });
        return res.status(201).json({
            success: true,
            message: "Company created successfully",
            newCompany,
        });
    } catch (error) {
        console.error("Error creating company:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create company: ${error.message}`,
        });
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const companies = await MasterCompanyModel.findAll();

        return res.status(200).json({
            success: true,
            message: "Companies retrieved successfully",
            data: companies,
        });
    } catch (error) {
        console.error("Error retrieving companies:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve companies: ${error.message}`,
        });
    }
};
export const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await MasterCompanyModel.findByPk(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company retrieved successfully",
            data: company,
        });
    } catch (error) {
        console.error("Error retrieving company:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve company: ${error.message}`,
        });
    }
};
export const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { NAME } = req.body;

        const company = await MasterCompanyModel.findByPk(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }
        await company.update({
            NAME,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: company,
        });
    } catch (error) {
        console.error("Error updating company:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update company: ${error.message}`,
        });
    }
};
export const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await MasterCompanyModel.findByPk(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }
        await company.destroy();

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting company:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete company: ${error.message}`,
        });
    }
};