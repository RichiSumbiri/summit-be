import BomStructureModel, {BomStructureListModel} from "../../../models/system/bomStructure.mod.js";
import BomTemplateModel from "../../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../../models/setup/ItemCategories.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterCompanyModel from "../../../models/setup/company.mod.js";

export const getAllBomStructureList = async (req, res) => {
    try {
        const {BOM_STRUCTURE_ID, MASTER_ITEM_ID, STATUS} = req.query;

        const where = {IS_DELETED: false};
        if (BOM_STRUCTURE_ID) where.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
        if (MASTER_ITEM_ID) where.MASTER_ITEM_ID = MASTER_ITEM_ID;
        if (STATUS) where.STATUS = STATUS;

        const data = await BomStructureListModel.findAll({
            where, include: [{
                model: BomStructureModel,
                as: "BOM_STRUCTURE",
                attributes: ["ID", "LAST_REV_ID", "STATUS_STRUCTURE"],
                required: false,
                include: [{
                    model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"],
                }]
            }, {
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                }]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ["USER_NAME"], required: false
            }, {
                model: Users, as: "UPDATED", attributes: ["USER_NAME"], required: false
            }, {
                model: MasterCompanyModel, as: "COMPANY", attributes: ["CODE"]
            }], order: [['ID', 'ASC']]
        });

        return res.status(200).json({
            success: true, message: "BOM structure list retrieved successfully", data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM structure list: ${error.message}`,
        });
    }
};

export const getBomStructureListById = async (req, res) => {
    try {
        const {id} = req.params;

        const data = await BomStructureListModel.findOne({
            where: {ID: id, IS_DELETED: false}, include: [{
                model: BomStructureModel,
                as: "BOM_STRUCTURE",
                attributes: ["ID", "LAST_REV_ID", "STATUS_STRUCTURE"],
                required: false,
                include: [{
                    model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"],
                }]
            }, {
                model: MasterItemIdModel,
                as: "MASTER_ITEM",
                attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"],
                include: [{
                    model: MasterItemGroup, as: "ITEM_GROUP", attributes: ['ITEM_GROUP_CODE']
                }, {
                    model: MasterItemTypes, as: "ITEM_TYPE", attributes: ['ITEM_TYPE_CODE']
                }, {
                    model: MasterItemCategories, as: "ITEM_CATEGORY", attributes: ['ITEM_CATEGORY_CODE']
                }]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
            }, {
                model: Users, as: "CREATED", attributes: ["USER_NAME"], required: false
            }, {
                model: Users, as: "UPDATED", attributes: ["USER_NAME"], required: false
            }, {
                model: MasterCompanyModel, as: "COMPANY", attributes: ["CODE"]
            }]
        });

        if (!data) {
            return res.status(404).json({
                success: false, message: "BOM structure list not found",
            });
        }

        return res.status(200).json({
            success: true, message: "BOM structure list retrieved successfully", data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve BOM structure list: ${error.message}`,
        });
    }
};

export const createBomStructureList = async (req, res) => {
    try {
        const {
            BOM_STRUCTURE_ID,
            MASTER_ITEM_ID,
            STANDARD_CONSUMPTION_PER_ITEM,
            INTERNAL_CONSUMPTION_PER_ITEM,
            BOOKING_CONSUMPTION_PER_ITEM,
            PRODUCTION_CONSUMPTION_PER_ITEM,
            EXTRA_BOOKS,
            IS_SPLIT_COLOR,
            IS_SPLIT_SIZE,
            IS_SPLIT_NO_PO,
            COMPANY_ID,
            VENDOR_ID,
            ITEM_POSITION,
            NOTE,
            IS_SPLIT_STATUS,
            IS_ACTIVE,
            CREATED_ID
        } = req.body;

        if (!BOM_STRUCTURE_ID || !MASTER_ITEM_ID || !COMPANY_ID) {
            return res.status(400).json({
                success: false, message: "Bom Structure, Master Item, and company are required",
            });
        }

        if (STANDARD_CONSUMPTION_PER_ITEM <0 || INTERNAL_CONSUMPTION_PER_ITEM <0 || BOOKING_CONSUMPTION_PER_ITEM <0 || PRODUCTION_CONSUMPTION_PER_ITEM <0) {
            return res.status(400).json({
                success: false, message: "Coasting cannot be negative",
            });
        }

        const masterItemId = await MasterItemIdModel.findByPk(MASTER_ITEM_ID)
        if (!masterItemId) return res.status(404).json({
            status:false,
            message: "Master item id not found"
        })

        const lastStructure = await BomStructureListModel.findOne({
            where: {BOM_STRUCTURE_ID: BOM_STRUCTURE_ID},
            order: [['BOM_LINE_ID', 'DESC']],
        });
        const nextId = lastStructure ? lastStructure.BOM_LINE_ID + 1 : 1;

        const newEntry = await BomStructureListModel.create({
            BOM_STRUCTURE_ID,
            COMPANY_ID,
            MASTER_ITEM_ID,
            STATUS: "Open",
            BOM_LINE_ID: nextId,
            STANDARD_CONSUMPTION_PER_ITEM: STANDARD_CONSUMPTION_PER_ITEM || 0,
            INTERNAL_CONSUMPTION_PER_ITEM: INTERNAL_CONSUMPTION_PER_ITEM || 0,
            BOOKING_CONSUMPTION_PER_ITEM: BOOKING_CONSUMPTION_PER_ITEM || 0,
            PRODUCTION_CONSUMPTION_PER_ITEM: PRODUCTION_CONSUMPTION_PER_ITEM || 0,
            EXTRA_BOOKS: EXTRA_BOOKS || 0,
            CONSUMPTION_UOM: masterItemId?.ITEM_UOM_BASE,
            IS_SPLIT_COLOR: IS_SPLIT_COLOR ? 1 : 0,
            IS_SPLIT_SIZE: IS_SPLIT_SIZE ? 1 : 0,
            IS_SPLIT_NO_PO: IS_SPLIT_NO_PO ? 1 : 0,
            VENDOR_ID,
            ITEM_POSITION,
            NOTE,
            IS_SPLIT_STATUS: IS_SPLIT_STATUS ? 1 : 0,
            IS_ACTIVE: IS_ACTIVE ? 1 : 0,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true, message: "BOM structure list created successfully", data: newEntry,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create BOM structure list: ${error.message}`,
        });
    }
};

export const createBomStructureListBulk = async (req, res) => {
    try {
        const payload = req.body;

        if (!Array.isArray(payload) || payload.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Payload must be a non-empty array",
            });
        }


        const data = await Promise.all(payload.map(async (item, idx) => {
            const lastStructure = await BomStructureListModel.findOne({
                where: {BOM_STRUCTURE_ID: item.BOM_STRUCTURE_ID},
                order: [['BOM_LINE_ID', 'DESC']],
            });
            const masterItemId = await MasterItemIdModel.findByPk(item.MASTER_ITEM_ID)
            const nextId = lastStructure ? lastStructure.BOM_LINE_ID + 1 : 1;
            return {
                BOM_STRUCTURE_ID: item.BOM_STRUCTURE_ID,
                STATUS: item.STATUS || "Open",
                MASTER_ITEM_ID: item.MASTER_ITEM_ID,
                CONSUMPTION_UOM: masterItemId.CONSUMPTION_UOM,
                BOM_LINE_ID: nextId + idx,
                COMPANY_ID: item.COMPANY_ID,
                STANDARD_CONSUMPTION_PER_ITEM: item.STANDARD_CONSUMPTION_PER_ITEM ?? 0,
                INTERNAL_CONSUMPTION_PER_ITEM: item.INTERNAL_CONSUMPTION_PER_ITEM ?? 0,
                BOOKING_CONSUMPTION_PER_ITEM: item.BOOKING_CONSUMPTION_PER_ITEM ?? 0,
                PRODUCTION_CONSUMPTION_PER_ITEM: item.PRODUCTION_CONSUMPTION_PER_ITEM ?? 0,
                EXTRA_BOOKS: item.EXTRA_BOOKS ?? 0,
                IS_SPLIT_COLOR: item.IS_SPLIT_COLOR ? 1 : 0,
                IS_SPLIT_SIZE: item.IS_SPLIT_SIZE ? 1 : 0,
                IS_SPLIT_NO_PO: item.IS_SPLIT_NO_PO ? 1 : 0,
                VENDOR_ID: item.VENDOR_ID || null,
                ITEM_POSITION: item.ITEM_POSITION || null,
                NOTE: item.NOTE || null,
                IS_SPLIT_STATUS: item.IS_SPLIT_STATUS ? 1 : 0,
                IS_ACTIVE: item.IS_ACTIVE ? 1 : 0,
                CREATED_ID: item.CREATED_ID,
                CREATED_AT: new Date(),
            }
        }));

        for (const item of data) {
            if (!item.BOM_STRUCTURE_ID || !item.MASTER_ITEM_ID || !item.CREATED_ID) {
                return res.status(400).json({
                    success: false,
                    message: "BOM_STRUCTURE_ID, MASTER_ITEM_ID, and CREATED_ID are required for all items",
                });
            }
        }

        const result = await BomStructureListModel.bulkCreate(data, {
            validate: true,
            returning: true,
        });

        return res.status(201).json({
            success: true,
            message: `Created ${result.length} item(s) successfully`,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM structure: ${error.message}`,

        });
    }
};

export const updateBomStructureList = async (req, res) => {
    try {
        const {id} = req.params;
        const body = req.body;

        const data = await BomStructureListModel.findOne({
            where: {ID: id}
        });

        if (!data) {
            return res.status(404).json({
                success: false, message: "BOM structure list not found",
            });
        }

        const isSplitNoPO = body.IS_SPLIT_NO_PO ? body.IS_SPLIT_NO_PO : data.IS_SPLIT_NO_PO;
        const isSplitColor = body.IS_SPLIT_COLOR ? body.IS_SPLIT_COLOR : data.IS_SPLIT_COLOR;

        if (isSplitNoPO && isSplitColor) {
            return res.status(400).json({
                success: false,
                message: "Split po no and Split color cannot both be true at the same time",
            });
        }

        await data.update({
            ...body, UPDATED_ID: req.body.UPDATED_ID || null, UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true, message: "BOM structure list updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update BOM structure list: ${error.message}`,
        });
    }
};

export const deleteBomStructureList = async (req, res) => {
    try {
        const {id} = req.params;
        const {USER_ID} = req.query

        const data = await BomStructureListModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!data) {
            return res.status(404).json({
                success: false, message: "BOM structure list not found",
            });
        }

        await data.update({
            STATUS: "Deleted",
            UPDATED_ID: USER_ID,
            UPDATED_AT: new Date()
        });

        return res.status(200).json({
            success: true, message: "BOM structure list deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete BOM structure list: ${error.message}`,
        });
    }
};


