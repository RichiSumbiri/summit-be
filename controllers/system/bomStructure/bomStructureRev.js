import BomStructureModel, {
    BomStructureListDetailModel,
    BomStructureListModel,
    BomStructureNoteModel,
    BomStructureRevModel
} from "../../../models/system/bomStructure.mod.js";
import Users from "../../../models/setup/users.mod.js";
import {Op} from "sequelize";
import BomTemplateModel from "../../../models/system/bomTemplate.mod.js";
import {ModelOrderPOHeader} from "../../../models/orderManagement/orderManagement.mod.js";
import MasterItemIdModel from "../../../models/system/masterItemId.mod.js";
import {
    CustomerDetail,
    CustomerProductDivision,
    CustomerProductSeason,
    CustomerProgramName
} from "../../../models/system/customer.mod.js";

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

        const checkOpenList = await BomStructureListModel.findOne({
            where: {
                BOM_STRUCTURE_ID: bomStructure.ID,
                STATUS: "Open",
                REV_ID: bomStructure.LAST_REV_ID
            }
        })


        if (checkOpenList) {
            return res.status(500).json({status: false, message: `Cannot create revision because there are still items with "open" status in the BOM structure list.`})
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

        const oldBomStructureLists = await BomStructureListModel.findAll({
            where: {
                BOM_STRUCTURE_ID: bomStructure.ID,
                REV_ID: lastRevId,
                STATUS: {
                    [Op.in]: ["Confirmed"]
                },
                IS_DELETED: false,
            },
            order: [['ID', 'ASC']]
        });

        if (oldBomStructureLists.length === 0) {
            return res.status(400).json({
                success: false,
                message: "There is no BOM Structure List data to revise",
            });
        }

        const oldToNewMap = new Map();

        const newBomStructureLists = await BomStructureListModel.bulkCreate(
            oldBomStructureLists.map((item, idx) => {
                const data = item.dataValues;
                const newListId = null;
                oldToNewMap.set(data.ID, newListId);
                return {
                    ...data,
                    ID: null,
                    BOM_LINE_ID: idx + 1,
                    REV_ID: newRev.ID,
                    STATUS: "Open",
                    CREATED_ID,
                    CREATED_AT: new Date(),
                    UPDATED_ID: null,
                    UPDATED_AT: null
                };
            }),
            { returning: true }
        );

        oldBomStructureLists.forEach((old, index) => {
            oldToNewMap.set(old.ID, newBomStructureLists[index].ID);
        });

        const allOldDetails = await BomStructureListDetailModel.findAll({
            where: {
                BOM_STRUCTURE_LIST_ID: { [Op.in]: oldBomStructureLists.map(l => l.ID) }
            }
        });

        const newDetailsToCreate = allOldDetails.map(detail => {
            const newBomStructureListId = oldToNewMap.get(detail.BOM_STRUCTURE_LIST_ID);
            if (!newBomStructureListId) {
                throw new Error(`Mapping failed for BOM_STRUCTURE_LIST_ID: ${detail.BOM_STRUCTURE_LIST_ID}`);
            }

            const data = detail.dataValues;
            return {
                ...data,
                ID: null,
                BOM_STRUCTURE_LIST_ID: newBomStructureListId,
                CREATED_ID,
                CREATED_AT: new Date(),
                UPDATED_ID: null,
                UPDATED_AT: null
            };
        });

        if (newDetailsToCreate.length > 0) {
            await BomStructureListDetailModel.bulkCreate(newDetailsToCreate, { validate: true });
        }

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
                IS_BOM_CONFIRMATION: false,
                CREATED_AT: new Date(),
                UPDATED_AT: null
            });
        }

        await BomStructureModel.update(
            { LAST_REV_ID: newRev.ID, IS_NOT_ALLOW_REVISION: true },
            { where: { ID: BOM_STRUCTURE_ID } }
        );

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
                IS_BOM_CONFIRMATION: note?.IS_BOM_CONFIRMATION ?? false,
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