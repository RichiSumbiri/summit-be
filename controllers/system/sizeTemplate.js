import SizeChartTemplateModel from "../../models/system/sizeTemplate.mod.js";
import {CustomerDetail} from "../../models/system/customer.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import {Op} from "sequelize";


export const createSizeChartTemplate = async (req, res) => {
    try {
        const {DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, LIST} = req.body;

        if (!DESCRIPTION || !CUSTOMER_ID || !ITEM_CATEGORY_ID || !Array.isArray(LIST)) {
            return res.status(400).json({
                success: false,
                message: "Description, Customer, Item Category, and LIST (array) are required",
            });
        }

        const getLastID = await SizeChartTemplateModel.findOne({
            order: [['ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001': Number(getLastID.ID.slice(-7)) + 1;
        const ID = 'CSC' + newIncrement.toString().padStart(7, '0');

        const uniqueList = [...new Set(LIST)];

        await SizeChartTemplateModel.create({
            ID,
            DESCRIPTION: DESCRIPTION.trim(),
            CUSTOMER_ID,
            ITEM_CATEGORY_ID,
            LIST: uniqueList,
        });

        return res.status(201).json({
            success: true,
            message: "Size chart template created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create size chart template: ${error.message}`,
        });
    }
};

export const getAllSizeChartTemplates = async (req, res) => {
    const {ITEM_CATEGORY_ID} = req.query;
    const where = {IS_DELETED: false};

    if (ITEM_CATEGORY_ID) {
        where.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID;
    }

    try {
        const templates = await SizeChartTemplateModel.findAll({
            where,
            include: [
                {
                    model: CustomerDetail,
                    as: "CUSTOMER",
                    attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"],
                },
                {
                    model: MasterItemCategories,
                    as: "ITEM_CATEGORY",
                    attributes: [
                        "ITEM_CATEGORY_ID",
                        "ITEM_CATEGORY_CODE",
                        "ITEM_CATEGORY_BASE_UOM",
                        "ITEM_CATEGORY_BASE_UOM_DESCRIPTION",
                        "ITEM_CATEGORY_DESCRIPTION",
                    ],
                },
            ],
        });

        const transformedTemplates = []
        for (let i = 0; i < templates.length; i++) {
            const template = templates[i]
            const sizes = await SizeChartMod.findAll({
                where: {SIZE_ID: {[Op.in]: JSON.parse(template.dataValues.LIST)}},
                attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
            });
            transformedTemplates.push({
                ...template.dataValues,
                LIST: sizes,
            })
        }

        return res.status(200).json({
            success: true,
            message: "Size chart templates retrieved successfully",
            data: transformedTemplates,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve size chart templates: ${error.message}`,
        });
    }
};


export const getSizeChartTemplateById = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await SizeChartTemplateModel.findOne({
            where: { ID: id },
            raw: true
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }

        // Ensure LIST is an array
        let listArray = [];
        if (typeof template.LIST === "string") {
            try {
                listArray = JSON.parse(template.LIST);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid LIST format in template",
                });
            }
        } else if (Array.isArray(template.LIST)) {
            listArray = template.LIST;
        }

        const sizes = await SizeChartMod.findAll({
            where: { SIZE_ID: { [Op.in]: listArray } },
            attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
            raw: true
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template retrieved successfully",
            data: {
                ...template,
                LIST: sizes,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve size chart template: ${error.message}`,
        });
    }
};



export const updateSizeChartTemplate = async (req, res) => {
    try {
        const {id} = req.params;
        const {DESCRIPTION, CUSTOMER_ID, ITEM_CATEGORY_ID, LIST} = req.body;

        if (!DESCRIPTION || !CUSTOMER_ID || !ITEM_CATEGORY_ID || !Array.isArray(LIST)) {
            return res.status(400).json({
                success: false,
                message: "Description, Customer, Item Category, and LIST (array) are required",
            });
        }

        const template = await SizeChartTemplateModel.findByPk(id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }


        const uniqueList = [...new Set(LIST)];

        await template.update({
            DESCRIPTION: DESCRIPTION.trim(),
            CUSTOMER_ID,
            ITEM_CATEGORY_ID,
            LIST: uniqueList,
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update size chart template: ${error.message}`,
        });
    }
};

export const deleteSizeChartTemplate = async (req, res) => {
    try {
        const {id} = req.params;

        const template = await SizeChartTemplateModel.findOne({where: {ID: id}});

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Size chart template not found",
            });
        }

        await template.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Size chart template deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete size chart template: ${error.message}`,
        });
    }
};


export const getSizeTemplateByCustomerID = async(req,res) => {
    try {
        const { CustomerID } = req.params;
        
        // get list header template
        let HeaderTemplate = await SizeChartTemplateModel.findAll({
            where: {
                CUSTOMER_ID: CustomerID
            }, raw: true
        });

        // get list detail size per template
        for (const hdr of HeaderTemplate) {
            hdr.LIST_SIZE = [];
            for (const size of JSON.parse(hdr.LIST)) {
                const sizeDetail = await SizeChartMod.findOne({
                    where: {
                        SIZE_ID: size
                    }, raw: true
                });
                hdr.LIST_SIZE.push(sizeDetail);
            }
        }
       
        return res.status(200).json({
            success: true,
            message: `Size chart template get for customer ${CustomerID} successfully`,
            data: HeaderTemplate
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            message: `Failed to get size chart template`,
            error: err
        });
    }
}