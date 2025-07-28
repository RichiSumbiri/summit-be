import MasterAttributeSetting from "../../models/system/masterAttributeSetting.mod.js";
import MasterAttributeValue from "../../models/system/masterAttributeValue.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";

export const getAllAttributeSettings = async (req, res) => {
    const {ITEM_CATEGORY_ID,ITEM_TYPE_ID,ITEM_GROUP_ID} = req.query
    const whereCondition = {}
    if (ITEM_CATEGORY_ID) {
        whereCondition.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID
    }
    if (ITEM_TYPE_ID) {
        whereCondition.ITEM_TYPE_ID = ITEM_TYPE_ID
    }
    if (ITEM_GROUP_ID) {
        whereCondition.ITEM_GROUP_ID = ITEM_GROUP_ID
    }
    try {
        const settings = await MasterAttributeSetting.findAll({
            include: [
                {
                    model: MasterItemGroup,
                    as: "ITEM_GROUP",
                    attributes: ["ITEM_GROUP_ID", "ITEM_GROUP_CODE", "ITEM_GROUP_DESCRIPTION"],
                },
                {
                    model: MasterItemTypes,
                    as: "ITEM_TYPE",
                    attributes: ["ITEM_TYPE_ID", "ITEM_TYPE_CODE", "ITEM_TYPE_DESCRIPTION"],
                },
                {
                    model: MasterItemCategories,
                    as: "ITEM_CATEGORY",
                    attributes: ["ITEM_CATEGORY_ID", "ITEM_CATEGORY_CODE", "ITEM_CATEGORY_DESCRIPTION"],
                },
            ],
            where: { IS_DELETED: false, ...whereCondition },
        });

        return res.status(200).json({
            success: true,
            message: "Attribute Settings retrieved successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error retrieving attribute settings:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve attribute settings: ${error.message}`,
        });
    }
};

export const getAttributeSettingById = async (req, res) => {
    try {
        const { id } = req.params;

        const setting = await MasterAttributeSetting.findByPk(id, {
            include: [
                {
                    model: MasterAttributeValue,
                    as: "attributeValues",
                    where: { IS_DELETED: false },
                    required: false,
                },
            ],
            where: { IS_DELETED: false },
        });

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: "Attribute Setting not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attribute Setting retrieved successfully",
            data: setting,
        });
    } catch (error) {
        console.error("Error retrieving attribute setting:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve attribute setting: ${error.message}`,
        });
    }
};

export const createAttributeSetting = async (req, res) => {
    try {
        const { ID, NAME, DATA_TYPE, ITEM_GROUP_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID, IS_ACTIVE, IS_ATTRIBUTE, IS_DISPLAY, USER_ID } = req.body;
        let message = "Attribute Setting created successfully";
        if (ID) {
            const [updated] = await MasterAttributeSetting.update(
                {
                    NAME,
                    DATA_TYPE,
                    ITEM_GROUP_ID,
                    ITEM_TYPE_ID,
                    IS_ACTIVE,
                    IS_ATTRIBUTE,
                    IS_DISPLAY,
                    ITEM_CATEGORY_ID,
                    UPDATE_ID: USER_ID,
                    UPDATED_AT: new Date(),
                },
                {
                    where: { ID: ID, IS_DELETED: false },
                }
            );
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Attribute Setting not found",
                });
            }
            message = "Attribute Setting update successfully";
        } else {
            const count = await MasterAttributeSetting.count();
            await MasterAttributeSetting.create({
                ID: `IAM${String(count + 1).padStart(7, "0")}`,
                NAME,
                DATA_TYPE,
                ITEM_GROUP_ID,
                ITEM_TYPE_ID,
                ITEM_CATEGORY_ID,
                IS_ACTIVE,
                IS_ATTRIBUTE,
                IS_DISPLAY,
                CREATE_ID: USER_ID,
                CREATED_AT: new Date(),
                IS_DELETED: false,
            });
        }

        return res.status(201).json({
            success: true,
            message,
        });
    } catch (error) {
        console.error("Error creating attribute setting:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to create attribute setting: ${error.message}`,
        });
    }
};

export const updateAttributeSettingAction = async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const [updated] = await MasterAttributeSetting.update(body, {
        where: { ID: id, IS_DELETED: false },
        returning: true,
    });

    if (!updated) {
        return res.status(404).json({
            success: false,
            message: "Attribute Setting not found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Attribute Setting updated successfully",
    });
};

export const updateAttributeSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { NAME, DATA_TYPE, ITEM_GROUP_ID, ITEM_TYPE_ID, ITEM_CATEGORY_ID, USER_ID } = req.body;

        const [updated] = await MasterAttributeSetting.update(
            {
                NAME,
                DATA_TYPE,
                ITEM_GROUP_ID,
                ITEM_TYPE_ID,
                ITEM_CATEGORY_ID,
                UPDATE_ID: USER_ID,
                UPDATED_AT: new Date(),
            },
            {
                where: { ID: id, IS_DELETED: false },
                returning: true,
            }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Attribute Setting not found",
            });
        }

        const updatedSetting = await MasterAttributeSetting.findByPk(id);

        return res.status(200).json({
            success: true,
            message: "Attribute Setting updated successfully",
            data: updatedSetting,
        });
    } catch (error) {
        console.error("Error updating attribute setting:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update attribute setting: ${error.message}`,
        });
    }
};

export const deleteAttributeSetting = async (req, res) => {
    try {
        const { id } = req.params;

        const [deleted] = await MasterAttributeSetting.update(
            {
                IS_DELETED: true,
                DELETED_AT: new Date(),
            },
            {
                where: { ID: id },
                returning: true,
            }
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Attribute Setting not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attribute Setting deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting attribute setting:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to delete attribute setting: ${error.message}`,
        });
    }
};