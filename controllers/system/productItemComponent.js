import ProductItemComponentModel from "../../models/system/productItemComponent.mod.js";
import ProductItemModel from "../../models/system/productItem.mod.js";
import Users from "../../models/setup/users.mod.js";

export const createProductItemComponent = async (req, res) => {
    try {
        const { COMPONENT_NAME, PRODUCT_ID, IS_ACTIVE, USER_ID } = req.body;

        if (!COMPONENT_NAME || !PRODUCT_ID) {
            return res.status(400).json({
                success: false,
                message: "Component Name, and Product are required",
            });
        }

        const valid = await ProductItemModel.findOne({
            where: {
                PRODUCT_ID
            }
        })

        if (!valid) {
            return res.status(400).json({
                status: false,
                message: "Product Item not found",
            })
        }

        const getLastID = await ProductItemComponentModel.findOne({
            where: { PRODUCT_ID },
            order: [['COMPONENT_ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001': Number(getLastID.COMPONENT_ID.slice(-7)) + 1;
        const newID = 'CID' + newIncrement.toString().padStart(7, '0');

        await ProductItemComponentModel.create({
            COMPONENT_ID: newID,
            COMPONENT_NAME,
            PRODUCT_ID,
            IS_ACTIVE,
            CREATED_ID: USER_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Product item component created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create product item component: ${error.message}`,
        });
    }
};

export const getAllProductItemComponents = async (req, res) => {
    const { PRODUCT_ID } = req.query


    const where = { IS_DELETED: false }
    if (PRODUCT_ID) {
        where.PRODUCT_ID = PRODUCT_ID
    }

    try {
        const components = await ProductItemComponentModel.findAll({
            where,
            include: [
                {
                    model: ProductItemModel,
                    as: "PRODUCT",
                    attributes: ['PRODUCT_ID', 'PRODUCT_CAT_CODE', 'PRODUCT_DESCRIPTION']
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ['USER_NAME']
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ['USER_NAME']
                },
            ]
        });
        return res.status(200).json({
            success: true,
            message: "Product item components retrieved successfully",
            data: components,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve product item components: ${error.message}`,
        });
    }
};

export const getProductItemComponentById = async (req, res) => {
    try {
        const { id } = req.params;

        const component = await ProductItemComponentModel.findOne({
            where: { COMPONENT_ID: id },
            include: [{
                model: ProductItemModel,
                as: "PRODUCT",
                attributes: ['PRODUCT_ID', 'PRODUCT_CAT_CODE', 'PRODUCT_DESCRIPTION']
            }]
        });

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Product item component not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product item component retrieved successfully",
            data: component,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve product item component: ${error.message}`,
        });
    }
};

export const updateProductItemComponent = async (req, res) => {
    try {
        const { id } = req.params;
        const { COMPONENT_NAME, PRODUCT_ID, IS_ACTIVE, USER_ID } = req.body;

        const component = await ProductItemComponentModel.findOne({
            where: { COMPONENT_ID: id, PRODUCT_ID, IS_DELETED: false },
        });

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Product item component not found",
            });
        }

        if (!COMPONENT_NAME || !PRODUCT_ID) {
            return res.status(400).json({
                success: false,
                message: "Component Name, and Product are required",
            });
        }


        const valid = await ProductItemModel.findOne({
            where: {
                PRODUCT_ID
            }
        })

        if (!valid) {
            return res.status(400).json({
                status: false,
                message: "Product Item not found",
            })
        }

        await component.update({
            COMPONENT_NAME,
            PRODUCT_ID,
            IS_ACTIVE,
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Product item component updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update product item component: ${error.message}`,
        });
    }
};

export const deleteProductItemComponent = async (req, res) => {
    try {
        const { id } = req.params;
        const { PRODUCT_ID } = req.query;

        if (!id || !PRODUCT_ID) {
            return res.status(400).json({
                success: false,
                message: "Both Component and Product are required",
            });
        }

        const component = await ProductItemComponentModel.findOne({
            where: { COMPONENT_ID: id, PRODUCT_ID },
        });

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Product item component not found",
            });
        }

        await component.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Product item component deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete product item component: ${error.message}`,
        });
    }
};