import MasterAttributeValue from "../../models/system/masterAttributeValue.mod.js";
import MasterAttributeSetting from "../../models/system/masterAttributeSetting.mod.js";
import {Op, Sequelize} from "sequelize";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import Users from "../../models/setup/users.mod.js";

/**
 * Get all attribute values (not deleted)
 */
export const getAllAttributeValues = async (req, res) => {
    const {attributeId } = req.query
    const  whereCondition ={}
    if (attributeId) {
        whereCondition.MASTER_ATTRIBUTE_ID = attributeId
    }
    try {
        const values = await MasterAttributeValue.findAll({
            include: [
                {
                    model: MasterAttributeSetting,
                    as: "attributeSetting",
                    where: { IS_DELETED: false },
                    required: true,
                    include: [
                        {
                            model: MasterItemCategories,
                            as: "ITEM_CATEGORY",
                            attributes: ['ITEM_CATEGORY_ID','ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                        }
                    ]
                },
                {
                    model: Users,
                    as: "CREATE",
                    attributes: ['USER_NAME']
                },
                {
                    model: Users,
                    as: "UPDATE",
                    attributes: ['USER_NAME']
                }
            ],
            where: { IS_DELETED: false, ...whereCondition }
        });

        return res.status(200).json({
            success: true,
            message: "Attribute Values retrieved successfully",
            data: values
        });
    } catch (error) {
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
                },
                {
                    model: Users,
                    as: "CREATE",
                    attributes: ['USER_NAME']
                },
                {
                    model: Users,
                    as: "UPDATE",
                    attributes: ['USER_NAME']
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
        const { ID, MASTER_ATTRIBUTE_ID, NAME, CODE, IS_ACTIVE, USER_ID, DESCRIPTION } = req.body;
        if (!NAME || !CODE) {
            return res.status(400).json({
                status: false,
                message: "Name and Code are required"
            })
        }

        const normalizedNAME = NAME.trim().toLowerCase();
        const existingEntry = await MasterAttributeValue.findOne({
            where: {
                [Op.and]: [
                    {NAME: {[Op.ne]: null}},
                    Sequelize.where(
                        Sequelize.fn("LOWER", Sequelize.fn("TRIM", Sequelize.col("NAME"))),
                        normalizedNAME
                    ),
                    {MASTER_ATTRIBUTE_ID},
                    {IS_DELETED: false},
                    ID ? {ID: {[Op.ne]: ID}} : {},
                ],
            },
        });

        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: "Name already exists",
            });
        }


        let message = "Attribute Value created successfully"
        if (ID) {
            const [updated] = await MasterAttributeValue.update(
                {
                    MASTER_ATTRIBUTE_ID,
                    NAME: NAME.trim(),
                    DESCRIPTION,
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
            const getLastID = await MasterAttributeValue.findOne({
                order: [['ID', 'DESC']],
                raw: true
            });
            const newIncrement = !getLastID ? '0000001': Number(getLastID.ID.slice(-7)) + 1;
            const newID = 'IAV' + newIncrement.toString().padStart(7, '0');

             await MasterAttributeValue.create({
                ID: newID,
                MASTER_ATTRIBUTE_ID,
                NAME: NAME.trim(),
                 DESCRIPTION,
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

        if (!NAME || !CODE) {
            return res.status(400).json({
                status: false,
                message: "Name and Code are required"
            })
        }

        const [updated] = await MasterAttributeValue.update(
            {
                MASTER_ATTRIBUTE_ID,
                NAME: NAME.trim(),
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
        return res.status(500).json({
            success: false,
            message: `Failed to delete attribute value: ${error.message}`
        });
    }
};