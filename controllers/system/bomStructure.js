import BomStructureModel, {BomStructureListModel} from "../../models/system/bomStructure.mod.js";
import BomTemplateModel from "../../models/system/bomTemplate.mod.js";
import {ModelOrderPOHeader} from "../../models/orderManagement/orderManagement.mod.js";
import {
    CustomerDetail,
    CustomerProductDivision,
    CustomerProductSeason,
    CustomerProgramName
} from "../../models/system/customer.mod.js";
import Users from "../../models/setup/users.mod.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";
import {ModelVendorDetail} from "../../models/system/VendorDetail.mod.js";
import {MasterItemGroup} from "../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../models/setup/ItemCategories.mod.js";

export const getAllBomStructures = async (req, res) => {
    try {
        const {BOM_TEMPLATE_ID, ORDER_ID, COMPANY_ID} = req.query;

        const where = {IS_DELETED: false};

        if (BOM_TEMPLATE_ID) where.BOM_TEMPLATE_ID = BOM_TEMPLATE_ID;
        if (ORDER_ID) where.ORDER_ID = ORDER_ID;
        if (COMPANY_ID) where.COMPANY_ID = COMPANY_ID;

        const structures = await BomStructureModel.findAll({
            where,
            include: [
                {
                    model: BomTemplateModel,
                    as: "BOM_TEMPLATE",
                    attributes: ["ID", "NAME", "REVISION_ID", "NOTE"],
                    required: false,
                    include: [
                        {
                            model: MasterItemIdModel,
                            as: "MASTER_ITEM",
                            attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                        }
                    ]
                },
                {
                    model: ModelOrderPOHeader,
                    as: "ORDER",
                    attributes: ["ORDER_ID", "ORDER_TYPE_CODE", "ORDER_STATUS", "ORDER_PLACEMENT_COMPANY", "ORDER_REFERENCE_PO_NO", "ORDER_STYLE_DESCRIPTION", "PRICE_TYPE_CODE", "ORDER_UOM", "CONTRACT_NO", "NOTE_REMARKS", "ITEM_ID", "CUSTOMER_ID", "CUSTOMER_DIVISION_ID", "CUSTOMER_SEASON_ID", "CUSTOMER_PROGRAM_ID", "CUSTOMER_BUYPLAN_ID"],
                    required: false,
                    duplicating: false,
                    include: [
                        {
                            model: MasterItemIdModel,
                            as: "ITEM",
                            attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                        },
                        {
                            model: CustomerDetail,
                            as: "CUSTOMER",
                            attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"],
                            required: false
                        },
                        {
                            model: CustomerProductDivision,
                            as: "CUSTOMER_DIVISION",
                            attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_CODE", "CTPROD_DIVISION_NAME", "CTPROD_DIVISION_STATUS"],
                            required: false
                        },
                        {
                            model: CustomerProductSeason,
                            as: "CUSTOMER_SEASON",
                            attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_CODE", "CTPROD_SESION_NAME", "CTPROD_SESION_YEAR"],
                            required: false
                        },
                        {
                            model: CustomerProgramName,
                            as: "CUSTOMER_PROGRAM",
                            attributes: ["CTPROG_ID", "CTPROG_CODE", "CTPROG_NAME", "CTPROG_STATUS"],
                            required: false
                        }
                    ]
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ['USER_NAME'],
                    required: false
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ['USER_NAME'],
                    required: false
                },
            ]
        });

        return res.status(200).json({
            success: true,
            message: "BOM structures retrieved successfully",
            data: structures,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM structures: ${error.message}`,
        });
    }
};

export const getBomStructureById = async (req, res) => {
    try {
        const {id} = req.params;

        const structure = await BomStructureModel.findOne({
            where: {ID: id, IS_DELETED: false},
            include: [
                {
                    model: BomTemplateModel,
                    as: "BOM_TEMPLATE",
                    include: [
                        {
                            model: CustomerDetail,
                            as: "CUSTOMER"
                        },
                        {
                            model: CustomerProductDivision,
                            as: "CUSTOMER_DIVISION"
                        },
                        {
                            model: CustomerProductSeason,
                            as: "CUSTOMER_SESSION"
                        },
                    ]
                },
                {
                    model: ModelOrderPOHeader,
                    as: "ORDER"
                }
            ]
        });

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: "BOM structure not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM structure retrieved successfully",
            data: structure,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM structure: ${error.message}`,
        });
    }
};
export const createBomStructure = async (req, res) => {
    try {
        const {
            NO_REVISION,
            NOTE,
            IS_ACTIVE,
            ACTIVE_STATUS,
            STATUS_STRUCTURE,
            BOM_TEMPLATE_ID,
            ORDER_ID,
            COMPANY_ID,
            CREATED_ID
        } = req.body;

        if (!BOM_TEMPLATE_ID || !ORDER_ID) {
            return res.status(400).json({
                success: false,
                message: "Order and Bom Template are required",
            });
        }

        const getLastID = await BomStructureModel.findOne({
            order: [['ID', 'DESC']],
            raw: true
        });
        const newIncrement = !getLastID ? '0000001' : Number(getLastID.ID.slice(-7)) + 1;
        const ID = 'BOM' + newIncrement.toString().padStart(7, '0');

        await BomStructureModel.create({
            ID,
            NO_REVISION: NO_REVISION || 0,
            NOTE,
            IS_ACTIVE,
            ACTIVE_STATUS,
            STATUS_STRUCTURE,
            BOM_TEMPLATE_ID,
            ORDER_ID,
            COMPANY_ID,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "BOM structure created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM structure: ${error.message}`,
        });
    }
};
export const updateBomStructure = async (req, res) => {
    try {
        const {id} = req.params;
        const {
            NO_REVISION,
            NOTE,
            IS_ACTIVE,
            ACTIVE_STATUS,
            STATUS_STRUCTURE,
            BOM_TEMPLATE_ID,
            ORDER_ID,
            COMPANY_ID,
            UPDATED_ID
        } = req.body;

        const structure = await BomStructureModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: "BOM structure not found",
            });
        }

        await structure.update({
            NO_REVISION,
            NOTE,
            IS_ACTIVE,
            ACTIVE_STATUS,
            STATUS_STRUCTURE,
            BOM_TEMPLATE_ID,
            ORDER_ID,
            COMPANY_ID,
            UPDATED_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM structure updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM structure: ${error.message}`,
        });
    }
};
export const deleteBomStructure = async (req, res) => {
    try {
        const {id} = req.params;

        const structure = await BomStructureModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: "BOM structure not found",
            });
        }

        await structure.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM structure deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM structure: ${error.message}`,
        });
    }
};

export const getAllBomStructureList = async (req, res) => {
    try {
        const {BOM_STRUCTURE_ID, MASTER_ITEM_ID, IS_DELETED, STATUS} = req.query;

        const where = {};
        if (BOM_STRUCTURE_ID) where.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
        if (MASTER_ITEM_ID) where.MASTER_ITEM_ID = MASTER_ITEM_ID;
        if (STATUS) where.STATUS = STATUS;
        if (IS_DELETED !== undefined) where.IS_DELETED = Number(IS_DELETED);

        const data = await BomStructureListModel.findAll({
            where,
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "NO_REVISION", "NOTE", "STATUS_STRUCTURE"],
                    required: false,
                    include: [
                        {
                            model: BomTemplateModel,
                            as: "BOM_TEMPLATE",
                            attributes: ["ID", "NAME", "REVISION_ID", "NOTE"],
                            include: [
                                {
                                    model: MasterItemIdModel,
                                    as: "MASTER_ITEM",
                                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: MasterItemIdModel,
                    as: "MASTER_ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"]
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"],
                    required: false
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ["USER_NAME"],
                    required: false
                }
            ],
            order: [['ID', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: "BOM structure list retrieved successfully",
            data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM structure list: ${error.message}`,
        });
    }
};

export const getBomStructureListById = async (req, res) => {
    try {
        const {id} = req.params;

        const data = await BomStructureListModel.findOne({
            where: {ID: id, IS_DELETED: false},
            include: [
                {
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
                },
                {
                    model: ModelVendorDetail,
                    as: "VENDOR",
                    attributes: ['VENDOR_ID', 'VENDOR_CODE', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
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
                }
            ]
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "BOM structure list not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM structure list retrieved successfully",
            data,
        });
    } catch (error) {
        console.error("Error retrieving BOM structure list by ID:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM structure list: ${error.message}`,
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
            VENDOR_ID,
            ITEM_POSITION,
            NOTE,
            IS_SPLIT_STATUS,
            IS_ACTIVE,
            CREATED_ID
        } = req.body;

        if (!BOM_STRUCTURE_ID || !MASTER_ITEM_ID) {
            return res.status(400).json({
                success: false,
                message: "BOM_STRUCTURE_ID and MASTER_ITEM_ID are required",
            });
        }

        // Optional: generate ID custom jika diperlukan
        // Tapi karena auto_increment, bisa biarkan DB handle

        const newEntry = await BomStructureListModel.create({
            BOM_STRUCTURE_ID,
            MASTER_ITEM_ID,
            STANDARD_CONSUMPTION_PER_ITEM: STANDARD_CONSUMPTION_PER_ITEM || 0,
            INTERNAL_CONSUMPTION_PER_ITEM: INTERNAL_CONSUMPTION_PER_ITEM || 0,
            BOOKING_CONSUMPTION_PER_ITEM: BOOKING_CONSUMPTION_PER_ITEM || 0,
            PRODUCTION_CONSUMPTION_PER_ITEM: PRODUCTION_CONSUMPTION_PER_ITEM || 0,
            EXTRA_BOOKS: EXTRA_BOOKS || 0,
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
            success: true,
            message: "BOM structure list created successfully",
            data: newEntry,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create BOM structure list: ${error.message}`,
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
                success: false,
                message: "BOM structure list not found",
            });
        }

        await data.update({
            ...body,
            UPDATED_ID: req.body.UPDATED_ID || null,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM structure list updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update BOM structure list: ${error.message}`,
        });
    }
};

export const deleteBomStructureList = async (req, res) => {
    try {
        const {id} = req.params;

        const data = await BomStructureListModel.findOne({
            where: {ID: id, IS_DELETED: false}
        });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "BOM structure list not found",
            });
        }

        await data.update({
            IS_DELETED: true,
            DELETED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM structure list deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete BOM structure list: ${error.message}`,
        });
    }
};