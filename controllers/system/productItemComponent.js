import ProductItemComponentModel from "../../models/system/productItemComponent.mod.js";
import ProductItemModel from "../../models/system/productItem.mod.js";
import Users from "../../models/setup/users.mod.js";
import MasterItemComponent from "../../models/system/masterItemComponent.mod.js";
import {Op} from "sequelize";

export const createProductItemComponent = async (req, res) => {
    try {
        const { COMPONENT_ID, PRODUCT_ID, IS_ACTIVE, USER_ID } = req.body;

        if (!COMPONENT_ID || !PRODUCT_ID) {
            return res.status(400).json({
                success: false,
                message: "Component and Product are required",
            });
        }
        const productItem = await ProductItemModel.findOne({
            where: {
                PRODUCT_ID
            }
        })
        if (!productItem) {
            return res.status(400).json({
                status: false,
                message: "Product Item not found",
            })
        }

        const masterItemComponent = await MasterItemComponent.findOne({
            where: {
                ID: COMPONENT_ID
            }
        })
        if (!masterItemComponent) {
            return res.status(400).json({
                status: false,
                message: "Component not found",
            })
        }

        const alreadyData = await  ProductItemComponentModel.findOne({ where: {
                COMPONENT_ID, PRODUCT_ID
            }})

        if (alreadyData) return res.status(400).json({status: false, message: "Product Item & Component already exists"})

        await ProductItemComponentModel.create({
            COMPONENT_ID,
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
    const { PRODUCT_ID, COMPONENT_ID } = req.query

    const where = { IS_DELETED: false }
    if (PRODUCT_ID) {
        where.PRODUCT_ID = PRODUCT_ID
    }
    if (COMPONENT_ID) {
        where.COMPONENT_ID = COMPONENT_ID
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
                    model: MasterItemComponent,
                    as: "MASTER_ITEM_COMPONENT",
                    attributes: ['ID', 'NAME']
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
            }, {
                model: MasterItemComponent,
                as: "MASTER_ITEM_COMPONENT",
                attributes: ['ID', 'NAME']
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
        const { COMPONENT_ID, PRODUCT_ID, IS_ACTIVE, USER_ID } = req.body;

        const component = await ProductItemComponentModel.findOne({
            where: { ID: id},
        });

        if (!component) {
            return res.status(404).json({
                success: false,
                message: "Product item component not found",
            });
        }

        if (!COMPONENT_ID || !PRODUCT_ID) {
            return res.status(400).json({
                success: false,
                message: "Component and Product are required",
            });
        }

        const productItem = await ProductItemModel.findOne({
            where: {
                PRODUCT_ID
            }
        })
        if (!productItem) {
            return res.status(400).json({
                status: false,
                message: "Product Item not found",
            })
        }

        const masterItemComponent = await MasterItemComponent.findOne({
            where: {
                ID: COMPONENT_ID
            }
        })
        if (!masterItemComponent) {
            return res.status(400).json({
                status: false,
                message: "Component not found",
            })
        }

        const alreadyData = await  ProductItemComponentModel.findOne({ where: {
                COMPONENT_ID, PRODUCT_ID, ID: {[Op.ne]: id}
            }})

        if (alreadyData) return res.status(400).json({status: false, message: "Product Item & Component already exists"})

        await component.update({
            COMPONENT_ID,
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

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID cant be empty",
            });
        }

        const component = await ProductItemComponentModel.findOne({
            where: { ID: id },
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