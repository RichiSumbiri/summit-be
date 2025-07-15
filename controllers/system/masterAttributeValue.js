import MasterAttributeValue from "../../models/system/masterAttributeValue.mod.js";
import MasterAttributeSetting from "../../models/system/masterAttributeSetting.mod.js";

/**
 * Get all attribute values (not deleted)
 */
export const getAllAttributeValues = async (req, res) => {
    try {
        const values = await MasterAttributeValue.findAll({
            include: [
                {
                    model: MasterAttributeSetting,
                    as: "attributeSetting",
                    where: { IS_DELETED: false },
                    required: true
                }
            ],
            where: { IS_DELETED: false }
        });

        return res.status(200).json({
            success: true,
            message: "Attribute Values retrieved successfully",
            data: values
        });
    } catch (error) {
        console.error("Error retrieving attribute values:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve attribute values: ${error.message}`
        });
    }
};

/**
 * Get single attribute value by ID
 */
export const getAttributeValueById = async (req, res) => {
    try {
        const { id } = req.params;

        const value = await MasterAttributeValue.findByPk(id, {
            include: [
                {
                    model: MasterAttributeSetting,
                    as: "attributeSetting",
                    where: { IS_DELETED: false },
                    required: true
                }
            ],
            where: { IS_DELETED: false }
        });

        if (!value) {
            return res.status(404).json({
                success: false,
                message: "Attribute Value not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attribute Value retrieved successfully",
            data: value
        });
    } catch (error) {
        console.error("Error retrieving attribute value:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve attribute value: ${error.message}`
        });
    }
};

/**
 * Create new attribute value
 */
export const createAttributeValue = async (req, res) => {
    try {
        const { ID, MASTER_ATTRIBUTE_ID, NAME, CODE, IS_ACTIVE, USER_ID } = req.body;
        let message = "Attribute Value created successfully"
        if (ID) {
            const [updated] = await MasterAttributeValue.update(
                {
                    MASTER_ATTRIBUTE_ID,
                    NAME,
                    CODE,
                    IS_ACTIVE,
                    UPDATE_ID: USER_ID,
                    UPDATED_AT: new Date()
                },
                {
                    where: { ID: ID, IS_DELETED: false },
                }
            );

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Attribute Value not found or already deleted"
                });
            }
            message = "Attribute Value updated successfully"
        } else {
            const count = await  MasterAttributeValue.count()
             await MasterAttributeValue.create({
                ID: `IAV${String(count + 1).padStart(7, "0")}`,
                MASTER_ATTRIBUTE_ID,
                NAME,
                CODE,
                CREATE_ID: USER_ID,
                CREATED_AT: new Date(),
                IS_ACTIVE
            });

        }

        return res.status(201).json({
            success: true,
            message,
        });
    } catch (error) {
        console.error("Error creating attribute value:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create attribute value: ${error.message}`
        });
    }
};

/**
 * Update existing attribute value
 */
export const updateAttributeValue = async (req, res) => {
    try {
        const { id } = req.params;
        const { MASTER_ATTRIBUTE_ID, NAME, CODE, IS_ACTIVE, USER_ID } = req.body;

        const [updated] = await MasterAttributeValue.update(
            {
                MASTER_ATTRIBUTE_ID,
                NAME,
                CODE,
                IS_ACTIVE,
                UPDATE_ID: USER_ID,
                UPDATED_AT: new Date()
            },
            {
                where: { ID: id, IS_DELETED: false },
            }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Attribute Value not found or already deleted"
            });
        }

        const updatedValue = await MasterAttributeValue.findByPk(id);

        return res.status(200).json({
            success: true,
            message: "Attribute Value updated successfully",
            data: updatedValue
        });
    } catch (error) {
        console.error("Error updating attribute value:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update attribute value: ${error.message}`
        });
    }
};

/**
 * Soft delete attribute value
 */
export const deleteAttributeValue = async (req, res) => {
    try {
        const { id } = req.params;

        const [deleted] = await MasterAttributeValue.update(
            {
                IS_DELETED: true,
                DELETED_AT: new Date()
            },
            {
                where: { ID: id },
            }
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Attribute Value not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attribute Value deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting attribute value:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete attribute value: ${error.message}`
        });
    }
};