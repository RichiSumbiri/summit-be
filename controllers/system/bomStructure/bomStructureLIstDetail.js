import {
    BomStructureListDetailModel,
    BomStructureListModel,
    BomStructurePendingDimension
} from "../../../models/system/bomStructure.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";
import MasterItemDimensionModel from "../../../models/system/masterItemDimention.mod.js";
import {Op} from "sequelize";
import {OrderPoListing} from "../../../models/production/order.mod.js";
import {ModelVendorDetail} from "../../../models/system/VendorDetail.mod.js";
import {limitFloating} from "../../../util/general.js";

export const getAllBomStructureListDetails = async (req, res) => {
    const { BOM_STRUCTURE_LIST_ID, ITEM_DIMENSION_ID, COLOR_ID, SIZE_ID } = req.query;
    const where = {};

    if (BOM_STRUCTURE_LIST_ID) where.BOM_STRUCTURE_LIST_ID = BOM_STRUCTURE_LIST_ID;
    if (ITEM_DIMENSION_ID) where.ITEM_DIMENSION_ID = ITEM_DIMENSION_ID;
    if (COLOR_ID) where.COLOR_ID = COLOR_ID;
    if (SIZE_ID) where.SIZE_ID = SIZE_ID;

    try {
        const details = await BomStructureListDetailModel.findAll({
            where,
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LIST",
                    attributes: ["ID", "MASTER_ITEM_ID", "STATUS", "BOM_LINE_ID", "CONSUMPTION_UOM", "VENDOR_ID"],
                    include: [
                        {
                            model: ModelVendorDetail,
                            as: "VENDOR",
                            attributes: ['VENDOR_ID', 'VENDOR_NAME', 'VENDOR_COUNTRY_CODE']
                        }
                    ]
                },
                {
                    model: OrderPoListing,
                    as: "ORDER_PO",
                    attributes: ["ORDER_PO_ID", "ITEM_COLOR_ID", "ITEM_COLOR_CODE", "ITEM_COLOR_NAME"],
                },
                {
                    model: ColorChartMod,
                    as: "COLOR",
                    attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                },
                {
                    model: SizeChartMod,
                    as: "SIZE",
                    attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                },
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION",
                    attributes: ["ID", "DIMENSION_ID", "SERIAL_NO", "MASTER_ITEM_ID", "COLOR_ID", "SIZE_ID"],
                    include: [
                        {
                            model: ColorChartMod,
                            as: "MASTER_COLOR",
                            attributes: ["COLOR_ID", "COLOR_CODE", "COLOR_DESCRIPTION"],
                        },
                        {
                            model: SizeChartMod,
                            as: "MASTER_SIZE",
                            attributes: ["SIZE_ID", "SIZE_CODE", "SIZE_DESCRIPTION"],
                        },
                    ],
                }
            ],
            order: [['ID', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: "BOM Structure List detail retrieved successfully",
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve data: ${error.message}`,
        });
    }
};


export const getBomStructureListDetailById = async (req, res) => {
    const { id } = req.params;

    try {
        const detail = await BomStructureListDetailModel.findByPk(id, {
            include: [
                { model: BomStructureListModel, as: "BOM_STRUCTURE_LIST" },
                { model: ColorChartMod, as: "COLOR" },
                { model: SizeChartMod, as: "SIZE" },
                { model: MasterItemDimensionModel, as: "ITEM_DIMENSION" },
            ]
        });

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: "Detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail retrieved successfully",
            data: detail,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve detail: ${error.message}`,
        });
    }
};

export const createBomStructureListDetail = async (req, res) => {
    const {
        BOM_STRUCTURE_LIST_ID,
        ITEM_SPLIT_ID,
        ORDER_PO_ID,
        COLOR_ID,
        SIZE_ID,
        ITEM_DIMENSION_ID,
        ORDER_QUANTITY,
        STANDARD_CONSUMPTION_PER_ITEM,
        INTERNAL_CONSUMPTION_PER_ITEM,
        BOOKING_CONSUMPTION_PER_ITEM,
        PRODUCTION_CONSUMPTION_PER_ITEM,
        EXTRA_BOOKS,
        MATERIAL_ITEM_REQUIREMENT_QUANTITY,
        EXTRA_REQUIRE_QUANTITY,
        TOTAL_EXTRA_PURCHASE_PLAN,
        IS_BOOKING = true,
        EXTRA_APPROVAL_ID,
        CREATED_ID
    } = req.body;

    try {
        if (!BOM_STRUCTURE_LIST_ID) {
            return res.status(400).json({
                success: false,
                message: "Bom Structure List is required",
            });
        }

        await BomStructureListDetailModel.create({
            BOM_STRUCTURE_LIST_ID,
            ITEM_SPLIT_ID,
            ORDER_PO_ID,
            COLOR_ID,
            SIZE_ID,
            ITEM_DIMENSION_ID,
            ORDER_QUANTITY,
            STANDARD_CONSUMPTION_PER_ITEM,
            INTERNAL_CONSUMPTION_PER_ITEM,
            BOOKING_CONSUMPTION_PER_ITEM,
            PRODUCTION_CONSUMPTION_PER_ITEM,
            EXTRA_BOOKS,
            MATERIAL_ITEM_REQUIREMENT_QUANTITY,
            EXTRA_REQUIRE_QUANTITY,
            TOTAL_EXTRA_PURCHASE_PLAN,
            IS_BOOKING,
            EXTRA_APPROVAL_ID,
            CREATED_ID,
            CREATED_AT: new Date(),
        });

        return res.status(201).json({
            success: true,
            message: "Detail created successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to create detail: ${error.message}`,
        });
    }
};


export const revertBomStructureListDetail = async (req, res) => {
    const { bomStructureListId, bomStructureListDetail = [] } = req.body;

    if (!bomStructureListId || !Array.isArray(bomStructureListDetail) || bomStructureListDetail.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Item Dimension ID and Bom Template Pending List are required",
        });
    }

    try {
        const bomStructureList = await BomStructureListModel.findByPk(bomStructureListId);
        if (!bomStructureList) {
            return res.status(404).json({
                success: false,
                message: "BOM Structure List not found",
            });
        }

        if (bomStructureList.STATUS !== "Open") {
            return res.status(400).json({
                success: false,
                message: "Cannot revert: BOM Structure List is not in 'Open' status",
            });
        }

        const detailsToDelete = await BomStructureListDetailModel.findAll({
            where: {
                ID: { [Op.in]: bomStructureListDetail },
                BOM_STRUCTURE_LIST_ID: bomStructureListId
            }
        });

        if (detailsToDelete.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No valid Bom Structure List Details found for this BOM",
            });
        }

        await BomStructureListDetailModel.destroy({
            where: {
                ID: { [Op.in]: bomStructureListDetail },
                BOM_STRUCTURE_LIST_ID: bomStructureListId
            }
        });

        return res.status(201).json({
            success: true,
            message: `BOM structure list detail successfully reverted`,
        });
    } catch (err) {
        return res.status(500).json({status: false, message: "Failed to revert bom structure list detail " + err.message})
    }
}

export const createBomStructureListDetailBulk = async (req, res) => {
    const { bomStructureListId, itemDimensionId, createdId, bomTemplatePendingList = [] } = req.body;

    if (!bomStructureListId || !itemDimensionId || !Array.isArray(bomTemplatePendingList) || bomTemplatePendingList.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Item Dimension ID and Bom Template Pending List are required",
        });
    }

    try {
        const bomStructureList = await BomStructureListModel.findByPk(bomStructureListId)
        if (!bomStructureList) return res.status(404).json({
            success: false,
            message: "Bom Structure List not found",
        });

        const itemDimension = await MasterItemDimensionModel.findByPk(itemDimensionId);
        if (!itemDimension) {
            return res.status(404).json({
                success: false,
                message: "Item Dimension not found",
            });
        }

        const pendingDimensions = await BomStructurePendingDimension.findAll({
            where: {
                ID: { [Op.in]: bomTemplatePendingList }
            }
        });

        if (pendingDimensions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No valid Pending Dimensions found",
            });
        }

        const lastID = await BomStructureListDetailModel.findOne({where: {
            BOM_STRUCTURE_LIST_ID: bomStructureListId,
            }, order: [['ITEM_SPLIT_ID', 'DESC']]})


        const detailToCreate = pendingDimensions.map((pd, idx) => {
            if (pd.MATERIAL_ITEM_REQUIREMENT_QTY <= 0 ) {
                throw new Error("Material item requirement quantity cannot be zero");
            }
            return {
                BOM_STRUCTURE_LIST_ID: pd.BOM_STRUCTURE_LIST_ID,
                ITEM_SPLIT_ID: (lastID + idx) + 1,
                ORDER_PO_ID: pd.ORDER_PO_ID,
                COLOR_ID: pd.COLOR_ID,
                SIZE_ID: pd.SIZE_ID,
                ITEM_DIMENSION_ID: itemDimensionId,
                ORDER_QUANTITY: pd.ORDER_QUANTITY,
                STANDARD_CONSUMPTION_PER_ITEM: limitFloating(pd.STANDARD_CONSUMPTION_PER_ITEM),
                INTERNAL_CONSUMPTION_PER_ITEM: limitFloating(pd.INTERNAL_CONSUMPTION_PER_ITEM),
                BOOKING_CONSUMPTION_PER_ITEM: limitFloating(pd.BOOKING_CONSUMPTION_PER_ITEM),
                PRODUCTION_CONSUMPTION_PER_ITEM: limitFloating(pd.PRODUCTION_CONSUMPTION_PER_ITEM),
                EXTRA_BOOKS: limitFloating(pd.EXTRA_BOOKS, 2),
                MATERIAL_ITEM_REQUIREMENT_QUANTITY: limitFloating(pd.MATERIAL_ITEM_REQUIREMENT_QTY),
                EXTRA_REQUIRE_QUANTITY: limitFloating(pd.EXTRA_REQUIRE_QTY),
                TOTAL_EXTRA_PURCHASE_PLAN: limitFloating(pd.TOTAL_EXTRA_PURCHASE_PLAN_PERCENT),
                IS_BOOKING: pd.IS_BOOKING,
                EXTRA_APPROVAL_ID: pd.EXTRA_APPROVAL_ID,
                CREATED_AT: new Date(),
                CREATED_ID: createdId || null,
            }
        });


        await BomStructureListDetailModel.bulkCreate(detailToCreate, {
            returning: true,
            validate: true
        });

        await BomStructurePendingDimension.destroy({
            where: {
                ID: { [Op.in]: bomTemplatePendingList }
            }
        });

        return res.status(201).json({
            success: true,
            message: "Successfully created from pending dimension"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to create BOM Structure List Detail: " + err.message        });
    }
};

export const updateBomStructureListDetail = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const [updated] = await BomStructureListDetailModel.update(updateData, {
            where: { ID: id }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Detail not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Detail successfully updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to update detail: ${error.message}`,
        });
    }
};

export const deleteBomStructureListDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await BomStructureListDetailModel.destroy({ where: { ID: id } });
        if (!deleted) return res.status(404).json({
            success: false,
            message: "Detail not found",
        });

        return res.status(200).json({
            success: true,
            message: "Detail successfully deleted"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to delete detail: ${error.message}`
        });
    }
};