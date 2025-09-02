import BomStructureModel, {
    BomStructureListDetailModel,
    BomStructureListModel, BomStructureSourcingDetail
} from "../../../models/system/bomStructure.mod.js";
import BomTemplateModel from "../../../models/system/bomTemplate.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import {MasterItemGroup} from "../../../models/setup/ItemGroups.mod.js";
import {MasterItemTypes} from "../../../models/setup/ItemTypes.mod.js";
import {MasterItemCategories} from "../../../models/setup/ItemCategories.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import Users from "../../../models/setup/users.mod.js";
import MasterCompanyModel from "../../../models/setup/company.mod.js";
import BomTemplateListModel from "../../../models/system/bomTemplateList.mod.js";
import { Op} from "sequelize";

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
                attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE", "ITEM_GROUP_ID", "ITEM_TYPE_ID", "ITEM_CATEGORY_ID"],
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

        if (body?.MASTER_ITEM_ID) {
            if (body?.MASTER_ITEM_ID !== data.MASTER_ITEM_ID) {
                const bomStructureListDetailCount = await BomStructureListDetailModel.count({
                    where: {
                        BOM_STRUCTURE_LIST_ID: id
                    }
                })
                if (bomStructureListDetailCount) return res.status(500).json({status: false, message: "Failed to change master item because split detail already declared"})
            }
        }

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


export const getBomTemplateListByBomStructureList = async (req, res) => {
    const {id} = req.params
    if (!id) return res.status(400).json({status: false, message: "Id is required"})
    try {
        const bomStructureList = await BomStructureListModel.findByPk(id)
        if (!bomStructureList) return res.status(404).json({status: false, message: "Bom structure list not found"})

        const bomStructure = await BomStructureModel.findByPk(bomStructureList.BOM_STRUCTURE_ID)
        if (!bomStructure) return res.status(404).json({status: false, message: "Bom structure not found"})

        const bomTemplate = await BomTemplateModel.findByPk(bomStructure.BOM_TEMPLATE_ID)
        if (!bomTemplate) return res.status(404).json({status: false, message: "Bom template not found"})

        const lists = await BomTemplateListModel.findAll({
            where: {
                BOM_TEMPLATE_ID: bomTemplate.ID,
                REV_ID: bomTemplate.LAST_REV_ID,
                MASTER_ITEM_ID: bomStructureList.MASTER_ITEM_ID,
                VENDOR_ID: bomStructureList.VENDOR_ID,
                IS_DELETED: false,
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

        return res.status(200).json({status: true, message: "Success get bom template list", data: lists })
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: "Gagagl menampilkan bom template list " + err.message
        })
    }
}



export const updateBomStructureListStatus = async (req, res) => {
    const { id, status, UPDATED_ID } = req.body;

    if (!["Confirmed", "Canceled", "Deleted"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status hanya boleh: Confirmed, Canceled, Deleted",
        });
    }

    try {
        const record = await BomStructureListModel.findByPk(id, {
            include: [{
                model: BomStructureModel,
                as: 'BOM_STRUCTURE',
                attributes: ['ORDER_ID']
            }]
        });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Bom Structure List tidak ditemukan",
            });
        }

        if (record.STATUS !== "Open") {
            return res.status(400).json({
                success: false,
                message: `Status hanya bisa diubah dari 'Open', status saat ini: ${record.STATUS}`,
            });
        }

        if (status === "Confirmed") {
            const listDetails = await BomStructureListDetailModel.findAll({
                where: { BOM_STRUCTURE_LIST_ID: id }
            });

            if (listDetails.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Tidak bisa Confirm: Belum ada detail BOM",
                });
            }

            const grouped = listDetails.reduce((acc, detail) => {
                const key = detail.ITEM_DIMENSION_ID;
                if (!acc[key]) {
                    acc[key] = {
                        ITEM_DIMENSION_ID: key,
                        costQuantity: 0,
                        approveQuantity: 0
                    };
                }

                const requirement = parseFloat(detail.MATERIAL_ITEM_REQUIREMENT_QUANTITY) || 0;

                acc[key].costQuantity += requirement;
                if (detail.IS_BOOKING) {
                    acc[key].approveQuantity += requirement;
                }

                return acc;
            }, {});

            const sourcingToCreate = [];
            for (const group of Object.values(grouped)) {
                const exists = await BomStructureSourcingDetail.findOne({
                    where: {
                        BOM_STRUCTURE_LINE_ID: id,
                        ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID
                    }
                });

                if (!exists) {
                    sourcingToCreate.push({
                        BOM_STRUCTURE_LINE_ID: id,
                        ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID,
                        ORDER_PO_ID: record.BOM_STRUCTURE?.ORDER_ID || null,
                        APPROVE_PURCHASE_QUANTITY: parseFloat(group.approveQuantity) || 0,
                        PLAN_CURRENT_QUANTITY: parseFloat(group.costQuantity) || 0,
                        COST_PER_ITEM: parseFloat(group.costQuantity) || 0,
                        FINANCE_COST: 0,
                        FREIGHT_COST: 0,
                        OTHER_COST: 0,
                        NOTE: ""
                    });
                }
            }

            if (sourcingToCreate.length > 0) {
                await BomStructureSourcingDetail.bulkCreate(sourcingToCreate, { validate: true });
            }
        }

        await record.update({
            STATUS: status,
            UPDATED_AT: new Date(),
            UPDATED_ID
        });

        return res.status(200).json({
            success: true,
            message: `Status berhasil diubah menjadi ${status}`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui status: ${error.message}`,
        });
    }
};

export const updateBomStructureListStatusBulk = async (req, res) => {
    const { bom_structure_list, status, UPDATED_ID } = req.body;

    if (!Array.isArray(bom_structure_list) || bom_structure_list.length === 0) {
        return res.status(400).json({
            success: false,
            message: "bom_structure_list harus array dan tidak boleh kosong",
        });
    }

    if (!["Confirmed", "Canceled", "Deleted"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status hanya boleh: Confirmed, Canceled, Deleted",
        });
    }

    try {
        const records = await BomStructureListModel.findAll({
            where: {
                ID: { [Op.in]: bom_structure_list },
                STATUS: "Open"
            },
            include: [{
                model: BomStructureModel,
                as: 'BOM_STRUCTURE',
                attributes: ['ORDER_ID']
            }]
        });

        if (records.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Tidak ada data yang bisa diproses (semua bukan status Open)",
                updated_count: 0
            });
        }

        let updatedCount = 0;

        for (const record of records) {
            try {
                if (status === "Confirmed") {
                    const listDetails = await BomStructureListDetailModel.findAll({
                        where: { BOM_STRUCTURE_LIST_ID: record.ID }
                    });

                    if (listDetails.length === 0) {
                        continue;
                    }

                    const grouped = listDetails.reduce((acc, detail) => {
                        const key = detail.ITEM_DIMENSION_ID;
                        if (!acc[key]) {
                            acc[key] = {
                                ITEM_DIMENSION_ID: key,
                                costQuantity: 0,
                                approveQuantity: 0
                            };
                        }
                        acc[key].costQuantity += detail.MATERIAL_ITEM_REQUIREMENT_QUANTITY || 0;
                        if (detail.IS_BOOKING) {
                            acc[key].approveQuantity += detail.MATERIAL_ITEM_REQUIREMENT_QUANTITY || 0;
                        }
                        return acc;
                    }, {});

                    const sourcingToCreate = [];
                    for (const group of Object.values(grouped)) {
                        const exists = await BomStructureSourcingDetail.findOne({
                            where: {
                                BOM_STRUCTURE_LINE_ID: record.ID,
                                ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID
                            }
                        });

                        if (!exists) {
                            sourcingToCreate.push({
                                BOM_STRUCTURE_LINE_ID: record.ID,
                                ITEM_DIMENSION_ID: group.ITEM_DIMENSION_ID,
                                ORDER_PO_ID: record.BOM_STRUCTURE?.ORDER_ID || null,
                                APPROVE_PURCHASE_QUANTITY: group.approveQuantity,
                                PLAN_CURRENT_QUANTITY: group.costQuantity,
                                COST_PER_ITEM: group.costQuantity,
                                FINANCE_COST: 0,
                                FREIGHT_COST: 0,
                                OTHER_COST: 0,
                                NOTE: ""
                            });
                        }
                    }

                    if (sourcingToCreate.length > 0) {
                        await BomStructureSourcingDetail.bulkCreate(sourcingToCreate, { validate: true });
                    }
                }

                await record.update({
                    STATUS: status,
                    UPDATED_AT: new Date(),
                    UPDATED_ID: UPDATED_ID || null
                });

                updatedCount++;
            } catch (err) {
                console.error("Error updating record ID:", record.ID, err.message);
                continue;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Berhasil memperbarui ${updatedCount} data ke status ${status}`,
        });

    } catch (error) {
        console.error("Error in updateBomStructureListStatusBulk:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal memperbarui status",
        });
    }
};