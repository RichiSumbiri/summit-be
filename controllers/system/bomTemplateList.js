import BomTemplateListModel from "../../models/system/bomTemplateList.mod.js";
import BomTemplateModel from "../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";
import {ModelVendorDetail} from "../../models/system/VendorDetail.mod.js";
import {where} from "sequelize";
import Users from "../../models/setup/users.mod.js";
import BomTemplateListDetail from "../../models/system/bomTemplateListDetail.mod.js";

export const createBomTemplateList = async (req, res) => {
    try {
        const {
            BOM_TEMPLATE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            REV_ID,
            NOTE,
            MASTER_ITEM_ID,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            CREATED_ID,
        } = req.body;

        if (!BOM_TEMPLATE_ID || !STATUS) {
            return res.status(400).json({
                success: false, message: "Bom Template and Status are required",
            });
        }

        if (COSTING_CONSUMER_PER_ITEM < 0) {
            return res.status(400).json({
                success: false, message: "Min Costing Consumer is 0.000000",
            });
        }
        if (INTERNAL_CUSTOMER_PER_ITEM < 0) {
            return res.status(400).json({
                success: false, message: "Min Internal Customer is 0.000000",
            });
        }
        const masterItemid = await MasterItemIdModel.findByPk(MASTER_ITEM_ID)
        if (!masterItemid) return res.status(400).json({status: false, message: "Master item id not found"})

        const lastEntry = await BomTemplateListModel.findOne({
            where: {BOM_TEMPLATE_ID, REV_ID}, order: [["BOM_TEMPLATE_LINE_ID", "DESC"]],
        });

        const BOM_TEMPLATE_LINE_ID = lastEntry ? lastEntry.BOM_TEMPLATE_LINE_ID + 1 : 1;

        await BomTemplateListModel.create({
            BOM_TEMPLATE_ID,
            BOM_TEMPLATE_LINE_ID,
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            REV_ID,
            VENDOR_ID,
            NOTE,
            CONSUMPTION_UOM: masterItemid?.ITEM_UOM_BASE,
            CREATED_ID,
            MASTER_ITEM_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true, message: "BOM template list created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create BOM template list: ${error.message}`,
        });
    }
};

export const getAllBomTemplateLists = async (req, res) => {
    try {
        const {BOM_TEMPLATE_ID, REV_ID} = req.query;

        const whereCondition = {
            REV_ID: REV_ID || 0
        };
        if (BOM_TEMPLATE_ID) {
            whereCondition.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID;
        }

        const lists = await BomTemplateListModel.findAll({
            where: {
                ...whereCondition, IS_DELETED: false,
            }, include: [{
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ['ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_UOM_BASE'],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                },]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ['USER_NAME']
            }, {
                model: Users, as: "UPDATED", attributes: ['USER_NAME']
            },],
        });

        return res.status(200).json({
            success: true, message: "BOM template lists retrieved successfully", data: lists,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM template lists: ${error.message}`,
        });
    }
};

export const cloneBomTemplateList = async (req, res) => {
    try {
        const {id} = req.params;
        const {USER_ID, REV_ID} = req.body
        if (!id) {
            return res.status(400).json({
                success: false, message: "ID is required",
            });
        }

        if (!USER_ID) {
            return res.status(400).json({
                success: false, message: "User is required",
            });
        }

        const originalEntry = await BomTemplateListModel.findOne({
            where: {ID: id},
        });

        if (!originalEntry) {
            return res.status(404).json({
                success: false, message: "Original BOM template list not found",
            });
        }

        const bomTemplate = await BomTemplateModel.findByPk(originalEntry.BOM_TEMPLATE_ID)
        const masterItemid = await MasterItemIdModel.findByPk(bomTemplate.MASTER_ITEM_ID)

        const lastEntry = await BomTemplateListModel.findOne({
            where: {BOM_TEMPLATE_ID: originalEntry.BOM_TEMPLATE_ID, REV_ID}, order: [["BOM_TEMPLATE_LINE_ID", "DESC"]],
        });

        const BOM_TEMPLATE_LINE_ID = lastEntry ? lastEntry.BOM_TEMPLATE_LINE_ID + 1 : 1;

        await BomTemplateListModel.create({
            BOM_TEMPLATE_ID: originalEntry.BOM_TEMPLATE_ID,
            BOM_TEMPLATE_LINE_ID,
            STATUS: "Open",
            REV_ID: REV_ID,
            COSTING_CONSUMER_PER_ITEM: originalEntry.COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM: originalEntry.INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR: originalEntry.IS_SPLIT_COLOR,
            IS_SPLIT_SIZE: originalEntry.IS_SPLIT_SIZE,
            IS_SPLIT_STATUS: false,
            CONSUMPTION_UOM: masterItemid?.ITEM_UOM_BASE,
            ITEM_POSITION: originalEntry.ITEM_POSITION,
            VENDOR_ID: originalEntry.VENDOR_ID,
            NOTE: originalEntry.NOTE,
            MASTER_ITEM_ID: originalEntry.MASTER_ITEM_ID,
            CREATED_ID: USER_ID,
            UPDATED_ID: null,
            UPDATED_AT: null,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true, message: "BOM template list cloned successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to clone BOM template list: ${error.message}`,
        });
    }
};

export const getBomTemplateListById = async (req, res) => {
    try {
        const {id} = req.params;
        const {REV_ID} = req.query

        const where = {ID: id, IS_DELETED: false, REV_ID: REV_ID || 0}

        const list = await BomTemplateListModel.findOne({
            where: where, include: [{
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ['ITEM_ID', 'ITEM_GROUP_ID', 'ITEM_TYPE_ID', 'ITEM_CATEGORY_ID', 'ITEM_CODE', 'ITEM_DESCRIPTION', 'ITEM_UOM_BASE'],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                },]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ['USER_NAME']
            }, {
                model: Users, as: "UPDATED", attributes: ['USER_NAME']
            },],
        });

        if (!list) {
            return res.status(404).json({
                success: false, message: "BOM template list not found",
            });
        }

        return res.status(200).json({
            success: true, message: "BOM template list retrieved successfully", data: list,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM template list: ${error.message}`,
        });
    }
};

export const updateBomTemplateList = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            VENDOR_ID,
            REV_ID,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            MASTER_ITEM_ID,
            NOTE,
            UPDATED_ID,
        } = req.body;

        const list = await BomTemplateListModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!list) {
            return res.status(404).json({
                success: false, message: "BOM template list not found",
            });
        }

        if (COSTING_CONSUMER_PER_ITEM < 0) {
            return res.status(400).json({
                success: false, message: "Min Costing Consumer is 0.000000",
            });
        }
        if (INTERNAL_CUSTOMER_PER_ITEM < 0) {
            return res.status(400).json({
                success: false, message: "Min Internal Consumer is 0.000000",
            });
        }

        if (IS_SPLIT_COLOR !== list.IS_SPLIT_COLOR || IS_SPLIT_SIZE !== list.IS_SPLIT_SIZE) {
            const alreadyListDetail = await BomTemplateListDetail.findOne({
                where: {
                    BOM_TEMPLATE_LIST_ID: id, DELETED_AT: null
                }
            })

            if (alreadyListDetail) {
                return res.status(400).json({
                    success: false, message: "Cannot change because split detail already exist",
                })
            }
        }

        await list.update({
            STATUS,
            COSTING_CONSUMER_PER_ITEM,
            INTERNAL_CUSTOMER_PER_ITEM,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            MASTER_ITEM_ID,
            IS_SPLIT_STATUS,
            ITEM_POSITION,
            REV_ID,
            VENDOR_ID,
            NOTE,
            UPDATED_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true, message: "BOM template list updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update BOM template list: ${error.message}`,
        });
    }
};

export const updateBomTemplateListStatus = async (req, res) => {
    try {
        const listData = req.body;

        if (!Array.isArray(listData)) {
            return res.status(400).json({
                success: false, message: `Request must be array`,
            });
        }

        for (let i = 0; i < listData.length; i++) {
            const {ID, STATUS, REV_ID, UPDATED_ID} = listData[i]
            const request = {STATUS, UPDATED_ID, REV_ID, UPDATED_AT: new Date()}
            const listDetail = await BomTemplateListDetail.findOne({
                where: {
                    BOM_TEMPLATE_LIST_ID: ID, DELETED_AT: null
                }
            })
            if (listDetail) request.IS_SPLIT_STATUS = true
            if (STATUS === "Confirmed") {
                if (!listDetail) {
                    return res.status(500).json({status: false, message: "Cannot change to confirm because split detail not found "})
                }
                request.APPROVE_BY = UPDATED_ID
                request.APPROVE_DATE = new Date()
            }

            await BomTemplateListModel.update(request, {
                where: {
                    ID: ID
                }
            })
        }

        return res.status(200).json({
            success: true, message: "BOM template list updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update BOM template list: ${error.message}`,
        });
    }
};


export const updateBomTemplateListSingle = async (req, res) => {
    try {
        const {id} = req.params;
        const {USER_ID} = req.query
        const reqBody = req.body;

        const list = await BomTemplateListModel.findOne({
            where: {ID: id, IS_DELETED: false},
        });

        if (!list) {
            return res.status(404).json({
                success: false, message: "BOM template list not found",
            });
        }

        await list.update({
            ...reqBody, UPDATED_AT: new Date(), UPDATED_ID: USER_ID
        });

        return res.status(200).json({
            success: true, message: "BOM template list updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update BOM template list: ${error.message}`,
        });
    }
};


export const deleteBomTemplateList = async (req, res) => {
    try {
        const {id} = req.params;

        const list = await BomTemplateListModel.findOne({
            where: {ID: id},
        });


        if (!list) {
            return res.status(404).json({
                success: false, message: "BOM template list not found",
            });
        }

        if (list.STATUS.toLowerCase() === "confirmed") {
            return res.status(404).json({
                success: false, message: "BOM template can't be remove because status is 'confirm'",
            });
        }

        await list.update({
            STATUS: "Deleted"
        });

        return res.status(200).json({
            success: true, message: "BOM template list deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete BOM template list: ${error.message}`,
        });
    }
};