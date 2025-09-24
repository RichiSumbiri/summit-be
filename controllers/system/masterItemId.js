import { redisConn } from "../../config/dbAudit.js";
import MasterItemIdModel, {
    MasterItemIdAttributesModel,
    MasterItemIdService
} from "../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import MasterAttributeSetting from "../../models/system/masterAttributeSetting.mod.js";
import MasterAttributeValue from "../../models/system/masterAttributeValue.mod.js";
import {Op, QueryTypes} from "sequelize";
import ServiceAttributesMod from "../../models/system/serviceAttributes.mod.js";
import ServiceAttributeValuesMod from "../../models/system/serviceAttributeValues.mod.js";
import MasterItemDimensionModel from "../../models/system/masterItemDimention.mod.js";
import {buildMediaUrl} from "../../util/general.js";
import MasterServiceCategories from "../../models/setup/ServiceCategories.mod.js";
import db from "../../config/database.js";
import { queryMasterProductIDGMT } from "../../models/system/masterProductIDGMT.mod.js";

export const createItem = async (req, res) => {
    try {
         let {
            ITEM_CODE,
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            CREATE_BY,
        } = req.body;


        if (!ITEM_CODE || !ITEM_GROUP_ID || !ITEM_TYPE_ID || !ITEM_CATEGORY_ID) {
            return res.status(400).json({
                success: false,
                message: "Item Code, Item Group, Item Type, Item Category is required",
            });
        }
        ITEM_CODE = ITEM_CODE.trim()

        if (MIN_UNDER_DELIVERY < 0) {
            return res.status(400).json({
                success: false,
                message: "Under Delivery min 0%",
            });
        }

        if (MAX_OVER_DELIVERY < 0) {
            return res.status(400).json({
                success: false,
                message: "Over Delivery min 0%",
            });
        }

        const masterCategory = await MasterItemCategories.findOne({
            where: {
                ITEM_CATEGORY_ID
            }
        })
        if (!masterCategory) {
            return res.status(404).json({
                success: false,
                message: `Item Category ID not found`,
            });
        }


        const getLastID = await MasterItemIdModel.findOne({
            where: {
                ITEM_CATEGORY_ID: masterCategory.ITEM_CATEGORY_ID
            },
            order: [['ITEM_ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001': Number(getLastID.ITEM_ID.slice(-7)) + 1;
        const newID = masterCategory.ITEM_CATEGORY_CODE + newIncrement.toString().padStart(7, '0');

        const masterItem = await MasterItemIdModel.create({
            ITEM_ID: newID,
            ITEM_CODE: ITEM_CODE.trim(),
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            CREATE_BY,
            CREATE_DATE: new Date(),
            IS_DELETED: false
        });

        const resp = await MasterItemIdModel.findOne({
            where: {ITEM_ID: masterItem.ITEM_ID},
            include: [
                {
                    model: MasterItemGroup,
                    as: 'ITEM_GROUP',
                    attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                },
                {
                    model: MasterItemTypes,
                    as: 'ITEM_TYPE',
                    attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                },
                {
                    model: MasterItemCategories,
                    as: 'ITEM_CATEGORY',
                    attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Item created successfully",
            data: {...resp.dataValues,ITEM_IMAGE: buildMediaUrl(resp.dataValues.ITEM_IMAGE)}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create item: ${error.message}`,
        });
    }
};


export const updateCloneItem = async (req, res) => {
    const {ITEM_ID} = req.body
    if (!ITEM_ID) {
        return res.status(400).json({
            status: false,
            message: "Item Id is required",
        })
    }

    try {
        const masterItem = await MasterItemIdModel.findOne({
            where: {ITEM_ID, IS_DELETED: false},
            include: [
                {
                    model: MasterItemGroup,
                    as: "ITEM_GROUP",
                    attributes: ["ITEM_GROUP_ID", "ITEM_GROUP_CODE", "ITEM_GROUP_DESCRIPTION"]
                },
                {
                    model: MasterItemTypes,
                    as: "ITEM_TYPE",
                    attributes: ["ITEM_TYPE_ID", "ITEM_TYPE_CODE", "ITEM_TYPE_DESCRIPTION"],
                },
                {
                    model: MasterItemCategories,
                    as: "ITEM_CATEGORY",
                    attributes: ["ITEM_CATEGORY_ID", "ITEM_CATEGORY_CODE", "ITEM_CATEGORY_BASE_UOM"]
                }
            ]
        })

        if (!masterItem) {
            return res.status(404).json({
                status: false,
                message: "Item ID not found",
            })
        }


        const getLastID = await MasterItemIdModel.findOne({
            where: {ITEM_CATEGORY_ID: masterItem?.ITEM_CATEGORY?.ITEM_CATEGORY_ID},
            order: [['ITEM_ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001': (getLastID.ITEM_ID.slice(-7)) + 1;
        const newID = masterItem?.ITEM_CATEGORY?.ITEM_CATEGORY_CODE + newIncrement.toString().padStart(7, '0');

        const itemIdCreate = await MasterItemIdModel.create({
            ...masterItem.toJSON(),
            ITEM_DESCRIPTION:masterItem.dataValues.ITEM_DESCRIPTION  + " (Duplicate)",
            ITEM_CODE: masterItem.dataValues.ITEM_CODE + " (Duplicate)",
            ITEM_ID: newID,
            CREATE_DATE: new Date(),
        });

        const itemDimentionList = await  MasterItemDimensionModel.findAll({
            where: {MASTER_ITEM_ID: ITEM_ID, IS_DELETED: false}
        })

        if (itemDimentionList.length) {
            const getLastID = await MasterItemDimensionModel.findOne({
            where: {MASTER_ITEM_ID: itemIdCreate.ITEM_ID},
                order: [['ID', 'DESC']],
                raw: true
            });
            const newIncrement = !getLastID ? '0000001': (getLastID.ID.slice(-7)) + 1;
            const newID = 'CID' + newIncrement.toString().padStart(7, '0');

            await MasterItemDimensionModel.bulkCreate(itemDimentionList.map((item, idx) => ({...item.dataValues,ID: null, DIMENSION_ID: countMasterItemModel+1,  CREATED_AT: new Date(), MASTER_ITEM_ID: itemIdCreate.ITEM_ID, UPDATED_AT: null})))
        }

        const masterItemIdAtt = await  MasterItemIdAttributesModel.findAll({
            where: {MASTER_ITEM_ID: ITEM_ID, IS_DELETED: false}
        })

        if (masterItemIdAtt.length) {
            await MasterItemIdAttributesModel.bulkCreate(masterItemIdAtt.map(item => ({...item.dataValues,ID: null,  CREATED_AT: new Date(), MASTER_ITEM_ID: itemIdCreate.ITEM_ID, UPDATED_AT: null})))
        }

        const masterItemIdSvc = await MasterItemIdService.findAll({
            where: {MASTER_ITEM_ID: ITEM_ID, IS_DELETED: false}
        })

        if (masterItemIdSvc.length) {
            await MasterItemIdService.bulkCreate(masterItemIdSvc.map(item => ({...item.dataValues,ID: null, CREATED_AT: new Date(), MASTER_ITEM_ID: itemIdCreate.ITEM_ID, UPDATED_AT: null})))
        }

        return  res.status(200).json({
            status: true,
            message: "Success clone master item id"
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            status: false,
            message: "Error update clone master item",
        })
    }
}


export const getAllItems = async (req, res) => {
    try {
        const {ITEM_ID, ITEM_CATEGORY_ID, IGNORE_ID, IS_FILTER} = req.query;

        const whereCondition = {IS_DELETED: false}

        const attributes = IS_FILTER ? ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"] : undefined;

        if (ITEM_ID) {
            whereCondition.ITEM_ID = ITEM_ID
        }

        if (ITEM_CATEGORY_ID) {
            whereCondition.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID
        }

        if (IGNORE_ID) {
            whereCondition.ITEM_CATEGORY_ID = {
                [Op.not]:IGNORE_ID
            }
        }

        const items = await MasterItemIdModel.findAll({
            where: whereCondition,
            attributes: attributes,
            include: [
                {
                    model: MasterItemGroup,
                    as: 'ITEM_GROUP',
                    attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                },
                {
                    model: MasterItemTypes,
                    as: 'ITEM_TYPE',
                    attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                },
                {
                    model: MasterItemCategories,
                    as: 'ITEM_CATEGORY',
                    attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Items retrieved successfully",
            data: items.map(data => ({
                ...data.dataValues,
                ITEM_IMAGE: buildMediaUrl(data.dataValues.ITEM_IMAGE)
            })),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve items: ${error.message}`,
        });
    }
};


export const getItemById = async (req, res) => {
    try {
        const {itemId} = req.params;

        const item = await MasterItemIdModel.findOne({
            where: {ITEM_ID: itemId},
            include: [
                {
                    model: MasterItemGroup,
                    as: 'ITEM_GROUP',
                    attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                },
                {
                    model: MasterItemTypes,
                    as: 'ITEM_TYPE',
                    attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                },
                {
                    model: MasterItemCategories,
                    as: 'ITEM_CATEGORY',
                    attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                }
            ]
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item retrieved successfully",
            data: item,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve item: ${error.message}`,
        });
    }
};


export const updateItem = async (req, res) => {
    try {
        const {itemId} = req.params;
        let {
            ITEM_CODE,
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            UPDATE_BY,
        } = req.body;

        if (!ITEM_CODE || !ITEM_GROUP_ID || !ITEM_TYPE_ID || !ITEM_CATEGORY_ID) {
            return res.status(400).json({
                success: false,
                message: "Item Code, Item Group, Item Type, Item Category is required",
            });
        }

        if (MIN_UNDER_DELIVERY < 0) {
            return res.status(400).json({
                success: false,
                message: "Under Delivery min 0%",
            });
        }

        if (MAX_OVER_DELIVERY < 0) {
            return res.status(400).json({
                success: false,
                message: "Over Delivery min 0%",
            });
        }

        ITEM_CODE = ITEM_CODE.trim()


        const item = await MasterItemIdModel.findOne({
            where: {ITEM_ID: itemId},
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        await item.update({
            ITEM_CODE: ITEM_CODE.trim(),
            ITEM_DESCRIPTION,
            ITEM_ACTIVE,
            ITEM_GROUP_ID,
            ITEM_TYPE_ID,
            ITEM_CATEGORY_ID,
            ITEM_UOM_BASE,
            ITEM_UOM_BASE_DESC,
            ITEM_UOM_DEFAULT,
            ITEM_UOM_DEFAULT_DESC,
            ITEM_UOM_PURCHASE,
            ITEM_UOM_PURCHASE_DESC,
            MAX_OVER_DELIVERY,
            MIN_UNDER_DELIVERY,
            ITEM_LOT_TRACKING,
            ITEM_NONSTOCK,
            ITEM_CAPITALIZATION,
            ITEM_INSPECTION,
            ITEM_IMAGE,
            UPDATE_BY,
            UPDATE_DATE: new Date(),
        });


        const resp = await MasterItemIdModel.findOne({
            where: {ITEM_ID: itemId},
            include: [
                {
                    model: MasterItemGroup,
                    as: 'ITEM_GROUP',
                    attributes: ['ITEM_GROUP_ID', 'ITEM_GROUP_CODE', 'ITEM_GROUP_DESCRIPTION']
                },
                {
                    model: MasterItemTypes,
                    as: 'ITEM_TYPE',
                    attributes: ['ITEM_TYPE_ID', 'ITEM_TYPE_CODE', 'ITEM_TYPE_DESCRIPTION']
                },
                {
                    model: MasterItemCategories,
                    as: 'ITEM_CATEGORY',
                    attributes: ['ITEM_CATEGORY_ID', 'ITEM_CATEGORY_CODE', 'ITEM_CATEGORY_DESCRIPTION']
                }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: {...resp.dataValues, ITEM_IMAGE: buildMediaUrl(resp.dataValues.ITEM_IMAGE)}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update item: ${error.message}`,
        });
    }
};


export const deleteItem = async (req, res) => {
    try {
        const {itemId} = req.params;

        const item = await MasterItemIdModel.findOne({
            where: {ITEM_ID: itemId},
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }


        await item.update({
            IS_DELETED: true,
            DELETED_AT: new Date()
        })

        return res.status(200).json({
            success: true,
            message: "Item deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete item: ${error.message}`,
        });
    }
};

export const createAttribute = async (req, res) => {
    try {
        const {MASTER_ITEM_ID, MASTER_ATTRIBUTE_ID, MASTER_ATTRIBUTE_VALUE_ID, NOTE} = req.body;


        if (!MASTER_ITEM_ID || !MASTER_ATTRIBUTE_ID || !MASTER_ATTRIBUTE_VALUE_ID) {
            return res.status(400).json({
                success: false,
                message: "Master Item ID, Master Attribute, and Master Attribute Value are required",
            });
        }

        const validation = await MasterItemIdAttributesModel.findOne({
            where: {MASTER_ITEM_ID, MASTER_ATTRIBUTE_ID, IS_DELETED: false}
        })

        if (validation) {
            return res.status(500).json({
                success: false,
                message: "Data already exist"
            })
        }

        await MasterItemIdAttributesModel.create({
            MASTER_ITEM_ID,
            MASTER_ATTRIBUTE_ID,
            MASTER_ATTRIBUTE_VALUE_ID,
            NOTE,
            CREATED_AT: new Date(),
        });


        return res.status(201).json({
            success: true,
            message: "Attribute created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create attribute: ${error.message}`,
        });
    }
};


export const getAllAttributes = async (req, res) => {
    try {
        const {MASTER_ITEM_ID, MASTER_ATTRIBUTE_ID, MASTER_ATTRIBUTE_VALUE_ID} = req.query;

        const whereCondition = {
            IS_DELETED: false,
        };

        if (MASTER_ITEM_ID) {
            whereCondition.MASTER_ITEM_ID = MASTER_ITEM_ID;
        }

        if (MASTER_ATTRIBUTE_ID) {
            whereCondition.MASTER_ATTRIBUTE_ID = MASTER_ATTRIBUTE_ID
        }

        if (MASTER_ATTRIBUTE_VALUE_ID) {
            whereCondition.MASTER_ATTRIBUTE_VALUE_ID = MASTER_ATTRIBUTE_VALUE_ID
        }

        const attributes = await MasterItemIdAttributesModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: MasterAttributeSetting,
                    as: "MASTER_ATTRIBUTE",
                },
                {
                    model: MasterAttributeValue,
                    as: "MASTER_ATTRIBUTE_VALUE",
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Attributes retrieved successfully",
            data: attributes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve attributes: ${error.message}`,
        });
    }
};


export const getAttributeById = async (req, res) => {
    try {
        const {id} = req.params;

        const attribute = await MasterItemIdAttributesModel.findOne({
            where: {ID: id, IS_DELETED: false},
            include: [
                {
                    model: MasterAttributeSetting,
                    as: "MASTER_ATTRIBUTE",
                    attributes: ["ID", "NAME"],
                },
                {
                    model: MasterAttributeValue,
                    as: "MASTER_ATTRIBUTE_VALUE",
                    attributes: ["ID", "VALUE"],
                },
            ],
        });

        if (!attribute) {
            return res.status(404).json({
                success: false,
                message: "Attribute not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Attribute retrieved successfully",
            data: attribute,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve attribute: ${error.message}`,
        });
    }
};


export const updateAttribute = async (req, res) => {
    try {
        const {id} = req.params;
        const {MASTER_ITEM_ID, MASTER_ATTRIBUTE_ID, MASTER_ATTRIBUTE_VALUE_ID, NOTE} = req.body;

        if (!MASTER_ITEM_ID || !MASTER_ATTRIBUTE_ID || !MASTER_ATTRIBUTE_VALUE_ID) {
            return res.status(400).json({
                success: false,
                message: "Master Item Id, Master Attribute, and Attribute Value are required",
            });
        }

        const attribute = await MasterItemIdAttributesModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!attribute) {
            return res.status(404).json({
                success: false,
                message: "Attribute not found",
            });
        }

        const validation = await MasterItemIdAttributesModel.findOne({
            where: {
                IS_DELETED: false, MASTER_ITEM_ID, MASTER_ATTRIBUTE_ID, ID: {
                    [Op.not]: id
                }
            }
        })

        if (validation) {
            return res.status(500).json({
                success: false,
                message: "Data already exist"
            })
        }

        await attribute.update({
            MASTER_ITEM_ID,
            MASTER_ATTRIBUTE_ID,
            MASTER_ATTRIBUTE_VALUE_ID,
            NOTE,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Attribute updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update attribute: ${error.message}`,
        });
    }
};


export const deleteAttribute = async (req, res) => {
    try {
        const {id} = req.params;

        const attribute = await MasterItemIdAttributesModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!attribute) {
            return res.status(404).json({
                success: false,
                message: "Attribute not found",
            });
        }

        await attribute.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Attribute soft-deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete attribute: ${error.message}`,
        });
    }
};

export const createService = async (req, res) => {
    try {
        const {
            MASTER_ITEM_ID,
            MASTER_SERVICE_ID,
            MASTER_SERVICE_VALUE_ID,
            NOTE,
        } = req.body;

        if (!MASTER_ITEM_ID || !MASTER_SERVICE_ID || !MASTER_SERVICE_VALUE_ID) {
            return res.status(400).json({
                success: false,
                message: "Master Item ID, Master Service, Service Value are required",
            });
        }


        const existingService = await MasterItemIdService.findOne({
            where: {
                MASTER_ITEM_ID,
                MASTER_SERVICE_ID,
                IS_DELETED: false
            }
        });

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service combination already exists",
            });
        }

        const newService = await MasterItemIdService.create({
            MASTER_ITEM_ID,
            MASTER_SERVICE_ID,
            MASTER_SERVICE_VALUE_ID,
            NOTE,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: newService,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create service: ${error.message}`,
        });
    }
};

export const getAllServices = async (req, res) => {
    try {
        const { MASTER_ITEM_ID, MASTER_SERVICE_ID, MASTER_SERVICE_VALUE_ID } = req.query;

        const whereCondition = {
            IS_DELETED: false,
        };

        if (MASTER_ITEM_ID) {
            whereCondition.MASTER_ITEM_ID = MASTER_ITEM_ID;
        }
        if (MASTER_SERVICE_ID) {
            whereCondition.MASTER_SERVICE_ID = MASTER_SERVICE_ID;
        }
        if (MASTER_SERVICE_VALUE_ID) {
            whereCondition.MASTER_SERVICE_VALUE_ID = MASTER_SERVICE_VALUE_ID;
        }

        const services = await MasterItemIdService.findAll({
            where: whereCondition,
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
                },
                {
                    model: ServiceAttributesMod,
                    as: "MASTER_SERVICE",
                    attributes: ["SERVICE_ATTRIBUTE_ID", "ATTRIBUTE_NAME"],
                    include: [
                        {
                            model: MasterServiceCategories,
                            as: "SERVICE_ITEM_GROUP",
                            attributes: ['SERVICE_CATEGORY_CODE']
                        }
                    ]
                },
                {
                    model: ServiceAttributeValuesMod,
                    as: "MASTER_SERVICE_VALUE",
                    attributes: ["SERVICE_ATTRIBUTE_VALUE_ID", "SERVICE_ATTRIBUTE_VALUE_NAME", "SERVICE_ATTRIBUTE_VALUE_CODE"],
                },
            ],
            order: [['ID', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: "Services retrieved successfully",
            data: services,
            count: services.length,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve services: ${error.message}`,
        });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await MasterItemIdService.findOne({
            where: {
                ID: id,
                IS_DELETED: false
            },
            include: [
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"],
                },
                {
                    model: ServiceAttributesMod,
                    as: "MASTER_SERVICE",
                    attributes: ["SERVICE_ATTRIBUTE_ID", "ATTRIBUTE_NAME"],
                },
                {
                    model: ServiceAttributeValuesMod,
                    as: "MASTER_SERVICE_VALUE",
                    attributes: ["SERVICE_ATTRIBUTE_VALUE_ID", "SERVICE_ATTRIBUTE_VALUE_NAME"],
                },
            ],
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Service retrieved successfully",
            data: service,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve service: ${error.message}`,
        });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            MASTER_ITEM_ID,
            MASTER_SERVICE_ID,
            MASTER_SERVICE_VALUE_ID,
            NOTE,
        } = req.body;

        if (!MASTER_ITEM_ID || !MASTER_SERVICE_ID || !MASTER_SERVICE_VALUE_ID) {
            return res.status(400).json({
                success: false,
                message: "Master Item, Master Service, Service Value are required",
            });
        }


        const service = await MasterItemIdService.findOne({
            where: {
                ID: id,
                IS_DELETED: false
            },
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }


        const existingService = await MasterItemIdService.findOne({
            where: {
                MASTER_ITEM_ID: MASTER_ITEM_ID,
                MASTER_SERVICE_ID: MASTER_SERVICE_ID,
                ID: {
                    [Op.not]: id
                }
            }
        });

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service combination already exists",
            });
        }

        await service.update({
            MASTER_ITEM_ID: MASTER_ITEM_ID,
            MASTER_SERVICE_ID: MASTER_SERVICE_ID,
            MASTER_SERVICE_VALUE_ID: MASTER_SERVICE_VALUE_ID,
            NOTE: NOTE !== undefined ? NOTE : service.NOTE,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: service,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update service: ${error.message}`,
        });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await MasterItemIdService.findOne({
            where: {
                ID: id,
                IS_DELETED: false
            },
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        await service.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "Service soft-deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete service: ${error.message}`,
        });
    }
};



export const getListFGItemID = async(req,res) => {
    try {
        const dataGMT = await MasterItemIdModel.findAll({
            where: {
                ITEM_ID: {
                    [Op.like]: 'GMT0%'
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: "success get list FG Item",
            data: dataGMT
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            message: `Failed to get list FG Item`,
            error: err
        });
    }
}

export const getListFGItemIDByProductID = async(req,res) => {
    try {
        let dataGMT;
        const dataRedis = await redisConn.get('list-finish-good-product');
        if(dataRedis){
            dataGMT = JSON.parse(dataRedis);
        } else {
            // dataGMT = await db.query(queryMasterProductIDGMT, { type: QueryTypes.SELECT });
            dataGMT = await db.query('SELECT * FROM view_finish_good_product',{ type: QueryTypes.SELECT });
            redisConn.set('list-finish-good-product', JSON.stringify(dataGMT), { EX: 604800 })
        }
        if(dataGMT){
            return res.status(200).json({
            success: true,
            message: "success get list FG Item by Product ID",
            data: dataGMT
        });
        }
        
    } catch(err){
        return res.status(500).json({
            success: false,
            message: `Failed to get list FG Item by Product ID`,
            error: err
        });
    }
}