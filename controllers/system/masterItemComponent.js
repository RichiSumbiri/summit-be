import MasterItemComponent from "../../models/system/masterItemComponent.mod.js";

export const getAllMasterItems = async (req, res) => {
    try {
        const items = await MasterItemComponent.findAll();

        return res.status(200).json({
            success: true,
            message: "Master item components retrieved successfully",
            data: items,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve product items: ${error.message}`,
        });
    }
};

export const getMasterItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await MasterItemComponent.findOne({
            where: { ID: id },
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Master item component not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Master item component retrieved successfully",
            data: item,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve product item: ${error.message}`,
        });
    }
};