import BomStructureModel, {
    BomStructureListDetailModel,
    BomStructureListModel,
    BomStructureNoteModel,
    BomStructureRevModel
} from "../../../models/materialManagement/bomStructure/bomStructure.mod.js";
import Users from "../../../models/setup/users.mod.js";
import {Op} from "sequelize";
import BomTemplateModel from "../../../models/materialManagement/bomTemplate/bomTemplate.mod.js";
import {ModelOrderPOHeader} from "../../../models/orderManagement/orderManagement.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import {
    CustomerDetail,
    CustomerProductDivision,
    CustomerProductSeason,
    CustomerProgramName
} from "../../../models/system/customer.mod.js";
import {OrderPoListing, OrderPoListingSize} from "../../../models/production/order.mod.js";

export const getAllBomStructureRevs = async (req, res) => {
    const { BOM_STRUCTURE_ID, SEQUENCE, TITLE } = req.query;
    const whereCondition = {};

    if (BOM_STRUCTURE_ID) whereCondition.BOM_STRUCTURE_ID = BOM_STRUCTURE_ID;
    if (SEQUENCE !== undefined) whereCondition.SEQUENCE = parseInt(SEQUENCE);
    if (TITLE) whereCondition.TITLE = { [Op.like]: `%${TITLE}%` };

    try {
        const revs = await BomStructureRevModel.findAll({
            where: {
                DELETED_AT: null,
                ...whereCondition,
            },
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "STATUS_STRUCTURE"],
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"],
                },
            ],
            order: [["SEQUENCE", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            message: "BOM revision list successfully retrieved",
            data: revs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM revision data: ${error.message}`,
        });
    }
};

export const getBomStructureRevById = async (req, res) => {
    const { id } = req.params;

    try {
        const rev = await BomStructureRevModel.findByPk(id, {
            where: { DELETED_AT: null },
            include: [
                {
                    model: BomStructureModel,
                    as: "BOM_STRUCTURE",
                    attributes: ["ID", "STATUS_STRUCTURE"],
                },
            ],
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "BOM revision not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "BOM revision successfully retrieved",
            data: rev,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve BOM revision: ${error.message}`,
        });
    }
};


export const createBomStructureRev = async (req, res) => {
    const { BOM_STRUCTURE_ID, CREATED_ID } = req.body;

    if (!BOM_STRUCTURE_ID) {
        return res.status(400).json({
            success: false,
            message: "Bom Structure is required",
        });
    }

    try {
        const bomStructure = await BomStructureModel.findOne({
            where: { ID: BOM_STRUCTURE_ID, IS_DELETED: false },
        });

        if (!bomStructure) {
            return res.status(400).json({
                success: false,
                message: "BOM Structure not found",
            });
        }

        if (bomStructure.IS_NOT_ALLOW_REVISION) {
            return res.status(400).json({
                success: false,
                message: "Cannot create new revision because it is not permitted.",
            });
        }

        const lastRevId = bomStructure.LAST_REV_ID;
        let nextSequence = 1;

        if (lastRevId && lastRevId !== 0) {
            const lastRev = await BomStructureRevModel.findByPk(lastRevId);
            if (!lastRev) {
                return res.status(400).json({
                    success: false,
                    message: "Lastes revision not found",
                });
            }
            nextSequence = lastRev.SEQUENCE + 1;
        }

        const existingRev = await BomStructureRevModel.findOne({
            where: {
                BOM_STRUCTURE_ID,
                SEQUENCE: nextSequence,
                DELETED_AT: null
            }
        });

        if (existingRev) {
            return res.status(400).json({
                success: false,
                message: `Revision with SEQUENCE ${nextSequence} already exists`,
            });
        }

        const newRev = await BomStructureRevModel.create({
            TITLE: `Revision ${nextSequence}`,
            DESCRIPTION: `Description Revision ${nextSequence}`,
            BOM_STRUCTURE_ID,
            SEQUENCE: nextSequence,
            CREATED_ID,
            CREATED_AT: new Date(),
            UPDATED_AT: new Date(),
        });


        const noteBomStructure = await BomStructureNoteModel.findOne({
            where: {
                REV_ID: lastRevId,
                BOM_STRUCTURE_ID: bomStructure.ID
            }
        });

        if (noteBomStructure) {
            await BomStructureNoteModel.create({
                ...noteBomStructure.dataValues,
                ID: null,
                REV_ID: newRev.ID,
                CREATED_AT: new Date(),
                UPDATED_AT: null
            });
        }

        await BomStructureModel.update(
            { LAST_REV_ID: newRev.ID, IS_NOT_ALLOW_REVISION: true },
            { where: { ID: BOM_STRUCTURE_ID } }
        );



        const bomStructureListTrash = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID,
                status: {
                    [Op.in]: ["Canceled", "Deleted"]
                }
            }
        })

        if (bomStructureListTrash.length > 0) {
            await BomStructureListModel.update(
                { IS_DELETED: true, DELETED_AT: new Date() },
                {
                    where: {
                        ID: { [Op.in]: bomStructureListTrash.map(item => item.ID) }
                    }
                }
            );
        }

        const activeLists = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID,
                IS_DELETED: false
            },
            order: [['ID', 'ASC']]
        });

        const updates = activeLists.map((list, index) =>
            list.update({
                BOM_LINE_ID: index + 1,
                UPDATED_AT: new Date(),
                UPDATED_ID: CREATED_ID
            })
        );

        if (updates.length > 0) {
            await Promise.all(updates);
        }

        const bomStructureListConfirm = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID,
                status: {[Op.in]: ["Confirmed"]}
            },
            include: [{
                model: BomStructureModel,
                as: 'BOM_STRUCTURE',
                attributes: ['ORDER_ID']
            }]
        })

        const bomStructureListOpen = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID,
                status: {[Op.in]: ["Open"]}
            },
            include: [{
                model: BomStructureModel,
                as: 'BOM_STRUCTURE',
                attributes: ['ORDER_ID']
            }]
        })

        if (bomStructureListConfirm.length > 0) {
            await BomStructureListModel.update(
                {STATUS: "Re-Confirmed"},
                {
                    where: {
                        ID: {[Op.in]: bomStructureListConfirm.map(item => item.ID)}
                    }
                }
            );
        }



        const orderPos = await OrderPoListing.findAll({
            where: {ORDER_NO: bomStructure.ORDER_ID, PO_STATUS: "Confirmed"},
            attributes: ["ORDER_PO_ID", "ITEM_COLOR_ID", "ORDER_QTY"]
        });

        const allSizeRecords = await OrderPoListingSize.findAll({
            where: {ORDER_NO: bomStructure.ORDER_ID, PO_STATUS: "Confirmed"},
            attributes: ["ORDER_PO_ID", "SIZE_ID", "ORDER_QTY"]
        });



        const listsToProcess = [...bomStructureListConfirm, ...bomStructureListOpen];
        for (const list of listsToProcess) {
            const {IS_SPLIT_SIZE, IS_SPLIT_COLOR, IS_SPLIT_NO_PO} = list;


            if (IS_SPLIT_NO_PO && IS_SPLIT_COLOR) {
                console.log(`Skipped: Invalid split (IS_SPLIT_NO_PO && IS_SPLIT_COLOR) for ID ${list.ID}`);
                continue;
            }

            const detailCount = await BomStructureListDetailModel.count({
                where: { BOM_STRUCTURE_LIST_ID: list.ID }
            });

            if (detailCount <= 0) {
                continue;
            }

            const finalDetails = [];
            if (IS_SPLIT_NO_PO && !IS_SPLIT_COLOR && !IS_SPLIT_SIZE) {
                for (const po of orderPos) {
                    const quantity = po.ORDER_QTY || 0;
                    const materialRequirement = quantity * list.PRODUCTION_CONSUMPTION_PER_ITEM;

                    finalDetails.push({
                        BOM_STRUCTURE_LIST_ID: list.ID,
                        COLOR_ID: null,
                        SIZE_ID: null,
                        ORDER_PO_ID: po.ORDER_PO_ID,
                        ORDER_QUANTITY: quantity,
                        MATERIAL_ITEM_REQUIREMENT_QUANTITY: materialRequirement
                    });
                }
            } else if (IS_SPLIT_COLOR && !IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
                const colorMap = new Map();
                for (const po of orderPos) {
                    const colorId = po.ITEM_COLOR_ID;
                    if (!colorMap.has(colorId)) {
                        colorMap.set(colorId, 0);
                    }
                    colorMap.set(colorId, colorMap.get(colorId) + (po.ORDER_QTY || 0));
                }

                for (const [colorId, quantity] of colorMap) {
                    const materialRequirement = quantity * list.PRODUCTION_CONSUMPTION_PER_ITEM;
                    finalDetails.push({
                        BOM_STRUCTURE_LIST_ID: list.ID,
                        COLOR_ID: colorId,
                        SIZE_ID: null,
                        ORDER_PO_ID: null,
                        ORDER_QUANTITY: quantity,
                        MATERIAL_ITEM_REQUIREMENT_QUANTITY: materialRequirement
                    });
                }
            } else if (IS_SPLIT_SIZE && !IS_SPLIT_COLOR && !IS_SPLIT_NO_PO) {
                const sizeMap = new Map();
                for (const record of allSizeRecords) {
                    const sizeId = record.SIZE_ID;
                    if (!sizeMap.has(sizeId)) {
                        sizeMap.set(sizeId, 0);
                    }
                    sizeMap.set(sizeId, sizeMap.get(sizeId) + (record.ORDER_QTY || 0));
                }

                for (const [sizeId, quantity] of sizeMap) {
                    const materialRequirement = quantity * list.PRODUCTION_CONSUMPTION_PER_ITEM;
                    finalDetails.push({
                        BOM_STRUCTURE_LIST_ID: list.ID,
                        COLOR_ID: null,
                        SIZE_ID: sizeId,
                        ORDER_PO_ID: null,
                        ORDER_QUANTITY: quantity,
                        MATERIAL_ITEM_REQUIREMENT_QUANTITY: materialRequirement
                    });
                }
            } else if (IS_SPLIT_COLOR && IS_SPLIT_SIZE && !IS_SPLIT_NO_PO) {
                const comboMap = new Map();
                for (const record of allSizeRecords) {
                    const po = orderPos.find(p => p.ORDER_PO_ID === record.ORDER_PO_ID);
                    if (!po || !record.SIZE_ID) continue;
                    const key = `${po.ITEM_COLOR_ID}-${record.SIZE_ID}`;
                    if (!comboMap.has(key)) {
                        comboMap.set(key, {
                            COLOR_ID: po.ITEM_COLOR_ID,
                            SIZE_ID: record.SIZE_ID,
                            quantity: 0
                        });
                    }
                    comboMap.get(key).quantity += record.ORDER_QTY || 0;
                }

                for (const {COLOR_ID, SIZE_ID, quantity} of comboMap.values()) {
                    const materialRequirement = quantity * list.PRODUCTION_CONSUMPTION_PER_ITEM;
                    finalDetails.push({
                        BOM_STRUCTURE_LIST_ID: list.ID,
                        COLOR_ID,
                        SIZE_ID,
                        ORDER_PO_ID: null,
                        ORDER_QUANTITY: quantity,
                        MATERIAL_ITEM_REQUIREMENT_QUANTITY: materialRequirement
                    });
                }
            } else if (IS_SPLIT_NO_PO && IS_SPLIT_SIZE && !IS_SPLIT_COLOR) {
                for (const po of orderPos) {
                    const sizeRecords = allSizeRecords.filter(r => r.ORDER_PO_ID === po.ORDER_PO_ID);
                    for (const record of sizeRecords) {
                        const quantity = record.ORDER_QTY || 0;
                        const materialRequirement = quantity * list.PRODUCTION_CONSUMPTION_PER_ITEM;
                        finalDetails.push({
                            BOM_STRUCTURE_LIST_ID: list.ID,
                            COLOR_ID: null,
                            SIZE_ID: record.SIZE_ID,
                            ORDER_PO_ID: po.ORDER_PO_ID,
                            ORDER_QUANTITY: quantity,
                            MATERIAL_ITEM_REQUIREMENT_QUANTITY: materialRequirement
                        });
                    }
                }
            } else {
                const totalQty = orderPos.reduce((sum, po) => sum + (po.ORDER_QTY || 0), 0);
                const materialRequirement = totalQty * list.PRODUCTION_CONSUMPTION_PER_ITEM;
                finalDetails.push({
                    BOM_STRUCTURE_LIST_ID: list.ID,
                    COLOR_ID: null,
                    SIZE_ID: null,
                    ORDER_PO_ID: null,
                    ORDER_QUANTITY: totalQty,
                    MATERIAL_ITEM_REQUIREMENT_QUANTITY: materialRequirement
                });
            }

            for (const detail of finalDetails) {
                await BomStructureListDetailModel.update(
                    {
                        ORDER_QUANTITY: detail.ORDER_QUANTITY,
                        MATERIAL_ITEM_REQUIREMENT_QUANTITY: detail.MATERIAL_ITEM_REQUIREMENT_QUANTITY,
                        UPDATED_AT: new Date(),
                        UPDATED_ID: CREATED_ID
                    },
                    {
                        where: {
                            BOM_STRUCTURE_LIST_ID: detail.BOM_STRUCTURE_LIST_ID,
                            COLOR_ID: detail.COLOR_ID,
                            SIZE_ID: detail.SIZE_ID,
                            ORDER_PO_ID: detail.ORDER_PO_ID
                        }
                    }
                );
            }
        }

        const updatedStructure = await BomStructureModel.findOne({
            where: { ID: BOM_STRUCTURE_ID },
            include: [
                { model: BomTemplateModel, as: "BOM_TEMPLATE", attributes: ["ID", "NAME", "LAST_REV_ID"] },
                { model: BomStructureRevModel, as: "REV", attributes: ["ID", "TITLE", "SEQUENCE"] },
                {
                    model: ModelOrderPOHeader,
                    as: "ORDER",
                    attributes: [
                        "ORDER_ID", "ORDER_TYPE_CODE", "ORDER_STATUS", "ORDER_PLACEMENT_COMPANY",
                        "ORDER_REFERENCE_PO_NO", "ORDER_STYLE_DESCRIPTION", "PRICE_TYPE_CODE",
                        "ORDER_UOM", "CONTRACT_NO", "NOTE_REMARKS", "ITEM_ID", "CUSTOMER_ID",
                        "CUSTOMER_DIVISION_ID", "CUSTOMER_SEASON_ID", "CUSTOMER_PROGRAM_ID", "CUSTOMER_BUYPLAN_ID"
                    ],
                    include: [
                        { model: MasterItemIdModel, as: "ITEM", attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION", "ITEM_ACTIVE", "ITEM_UOM_BASE"] },
                        { model: CustomerDetail, as: "CUSTOMER", attributes: ["CTC_ID", "CTC_CODE", "CTC_NAME", "CTC_COMPANY_NAME"] },
                        { model: CustomerProductDivision, as: "CUSTOMER_DIVISION", attributes: ["CTPROD_DIVISION_ID", "CTPROD_DIVISION_CODE", "CTPROD_DIVISION_NAME", "CTPROD_DIVISION_STATUS"] },
                        { model: CustomerProductSeason, as: "CUSTOMER_SEASON", attributes: ["CTPROD_SESION_ID", "CTPROD_SESION_CODE", "CTPROD_SESION_NAME", "CTPROD_SESION_YEAR"] },
                        { model: CustomerProgramName, as: "CUSTOMER_PROGRAM", attributes: ["CTPROG_ID", "CTPROG_CODE", "CTPROG_NAME", "CTPROG_STATUS"] }
                    ]
                },
                { model: Users, as: "CREATED", attributes: ['USER_NAME'] },
                { model: Users, as: "UPDATED", attributes: ['USER_NAME'] }
            ]
        });

        const note = await BomStructureNoteModel.findOne({
            where: { REV_ID: newRev.ID, BOM_STRUCTURE_ID: bomStructure.ID }
        });

        return res.status(201).json({
            success: true,
            message: "BOM revision successfully created",
            data: {
                ...updatedStructure.dataValues,
                NOTE: note?.NOTE ?? ""
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create new revision: ${error.message}`,
        });
    }
};

export const updateBomStructureRev = async (req, res) => {
    const { id } = req.params;
    const { TITLE, DESCRIPTION, SEQUENCE, UPDATED_ID } = req.body;

    try {
        const rev = await BomStructureRevModel.findOne({
            where: { ID: id, DELETED_AT: null },
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "BOM revision not found",
            });
        }

        if (SEQUENCE !== undefined) {
            const conflict = await BomStructureRevModel.findOne({
                where: {
                    BOM_STRUCTURE_ID: rev.BOM_STRUCTURE_ID,
                    SEQUENCE,
                    ID: { [Op.ne]: id },
                    DELETED_AT: null,
                },
            });
            if (conflict) {
                return res.status(400).json({
                    success: false,
                    message: `SEQUENCE ${SEQUENCE} already used`,
                });
            }
        }

        await rev.update({
            TITLE,
            DESCRIPTION,
            SEQUENCE: SEQUENCE !== undefined ? SEQUENCE : rev.SEQUENCE,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM Revision success updated",
            data: rev,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update bom revision: ${error.message}`,
        });
    }
};

export const deleteBomStructureRev = async (req, res) => {
    const { id } = req.params;
    const { UPDATED_ID } = req.body;

    try {
        const rev = await BomStructureRevModel.findOne({
            where: { ID: id, DELETED_AT: null },
        });

        if (!rev) {
            return res.status(404).json({
                success: false,
                message: "BOM Revision not found",
            });
        }

        await rev.update({
            DELETED_AT: new Date(),
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true,
            message: "BOM revision successfully deleted",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete bom revision: ${error.message}`,
        });
    }
};