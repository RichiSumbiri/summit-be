import ProductItemModel from "../../models/system/productItem.mod.js";

export const getAllProductItems = async (req, res) => {
    try {
        const items = await ProductItemModel.findAll();

        return res.status(200).json({
            success: true,
            message: "Product items retrieved successfully",
            data: items,
        });
    } catch (error) {
        console.error("Error retrieving product items:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve product items: ${error.message}`,
        });
    }
};

export const getProductItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await ProductItemModel.findOne({
            where: { PRODUCT_ID: id },
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product item retrieved successfully",
            data: item,
        });
    } catch (error) {
        console.error("Error retrieving product item:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve product item: ${error.message}`,
        });
    }
};