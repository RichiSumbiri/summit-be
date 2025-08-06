import ProductItemComponentModel from "../../models/system/productItemComponent.mod.js";
import ProductItemModel from "../../models/system/productItem.mod.js";

export const createProductItemComponent = async (req, res) => {
    try {
        const { COMPONENT_NAME, PRODUCT_ID, IS_ACTIVE, USER_ID } = req.body;

        if (!COMPONENT_NAME || !PRODUCT_ID) {
            return res.status(400).json({
                success: false,
                message: "COMPONENT_ID, COMPONENT_NAME, and PRODUCT_ID are required",
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

        const count = await ProductItemComponentModel.count({
            where: { PRODUCT_ID },
        });


        await ProductItemComponentModel.create({
            COMPONENT_ID: `CID${String(count + 1).padStart(7, "0")}`,
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
        console.error("Error creating product item component:", error);
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
            include: [{
                model: ProductItemModel,
                as: "PRODUCT",
                attributes: ['PRODUCT_ID', 'PRODUCT_CAT_CODE', 'PRODUCT_DESCRIPTION']
            }]
        });
        return res.status(200).json({
            success: true,
            message: "Product item components retrieved successfully",
            data: components,
        });
    } catch (error) {
        console.error("Error retrieving product item components:", error);
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
        console.error("Error retrieving product item component:", error);
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
                message: "COMPONENT_ID, COMPONENT_NAME, and PRODUCT_ID are required",
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
        console.error("Error updating product item component:", error);
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
                message: "Both COMPONENT_ID and PRODUCT_ID are required",
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
        console.error("Error deleting product item component:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete product item component: ${error.message}`,
        });
    }
};