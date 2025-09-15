import db from "../../../config/database.js";
import {QueryTypes, Op, Sequelize} from "sequelize";
import {
    findNewCapId,
    getDetailPoSize,
    getDetailQrGenerate,
    getListBlkNo,
    getOrderSizeByBlk,
    OrderPoListing,
    OrderPoListingSize,
} from "../../../models/production/order.mod.js";
import {
    SchSizeAloc,
    WeeklyProSchd,
    WeekSchDetail,
} from "../../../models/planning/weekLyPlan.mod.js";
import ColorChartMod from "../../../models/system/colorChart.mod.js";
import SizeChartMod from "../../../models/system/sizeChart.mod.js";

// CONTROLLER GET ALL ORDER DATA
export const getOrderPOListing = async (req, res) => {
    const {COLOR_ID, ORDER_NO} = req.query


    const where = {}
    if (COLOR_ID) {
        where.ITEM_COLOR_ID = COLOR_ID
    }
    if (ORDER_NO) {
        where.ORDER_NO = ORDER_NO
    }

    try {
        const orders = await OrderPoListing.findAll({
            where,
            include: [
                {
                    model: ColorChartMod,
                    as: "ITEM_COLOR",
                    attributes: ['COLOR_ID', 'COLOR_CODE', 'COLOR_DESCRIPTION', 'IS_ACTIVE']
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Data Order Retrieved Successfully",
            data: orders,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error,
        });
    }
};


export const getOrderPoListingByOrderNo = async (req, res) => {
    const {ORDER_NO, ITEM_COLOR_ID} = req.query;

    const where = {
        SIZE_ID: {[Op.ne]: null},
        ORDER_QTY: {[Op.ne]: null}
    };

    if (ORDER_NO) where.ORDER_NO = ORDER_NO;
    if (ITEM_COLOR_ID) where.ITEM_COLOR_ID = ITEM_COLOR_ID;

    try {
        const uniqueSizeIds = await OrderPoListingSize.aggregate('SIZE_ID', 'DISTINCT', {
            where,
            plain: false
        });

        const sizeIds = uniqueSizeIds.map(item => item.DISTINCT).filter(Boolean);

        if (sizeIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No data found",
                data: {
                    headers: [],
                    rows: []
                }
            });
        }

        const sizeMasters = await SizeChartMod.findAll({
            where: {SIZE_ID: {[Op.in]: sizeIds}},
            attributes: ['SIZE_ID', 'SIZE_DESCRIPTION'],
            raw: true
        });

        const sizeMap = new Map();
        sizeMasters.forEach(s => {
            sizeMap.set(s.SIZE_ID, s.SIZE_DESCRIPTION);
        });

        sizeIds.forEach(id => {
            if (!sizeMap.has(id)) sizeMap.set(id, id);
        });

        const poData = await OrderPoListingSize.findAll({
            attributes: [
                'ORDER_PO_ID',
                'SIZE_ID',
                [Sequelize.fn('SUM', Sequelize.col('ORDER_QTY')), 'ORDER_QTY']
            ],
            where: {
                ...where,
                SIZE_ID: {[Op.in]: sizeIds}
            },
            group: ['ORDER_PO_ID', 'SIZE_ID'],
            raw: true
        });

        const poQtyMap = new Map();
        poData.forEach(row => {
            const {ORDER_PO_ID, SIZE_ID, ORDER_QTY} = row;
            if (!poQtyMap.has(ORDER_PO_ID)) poQtyMap.set(ORDER_PO_ID, {});
            poQtyMap.get(ORDER_PO_ID)[SIZE_ID] = parseFloat(ORDER_QTY) || 0;
        });

        const rows = [];
        const totals = {};
        sizeIds.forEach(id => totals[id] = 0);

        for (const [poId, qtyMap] of poQtyMap.entries()) {
            const row = {ORDER_PO_ID: poId};
            let rowTotal = 0;

            sizeIds.forEach(sizeId => {
                const qty = qtyMap[sizeId] || 0;
                row[sizeId] = qty;
                rowTotal += qty;
                totals[sizeId] += qty;
            });

            row.TOTAL = rowTotal;
            rows.push(row);
        }

        const totalRow = {ORDER_PO_ID: 'Total'};
        let grandTotal = 0;
        sizeIds.forEach(sizeId => {
            totalRow[sizeId] = totals[sizeId];
            grandTotal += totals[sizeId];
        });
        totalRow.TOTAL = grandTotal;
        rows.push(totalRow);

        const headers = sizeIds.map(id => sizeMap.get(id));
        const resultRows = rows.map(row => {
            const formatted = {ORDER_PO_ID: row.ORDER_PO_ID, TOTAL: row.TOTAL};
            sizeIds.forEach((id, idx) => {
                formatted[headers[idx]] = row[id] || 0;
            });
            return formatted;
        });

        return res.status(200).json({
            success: true,
            message: "PO listing retrieved successfully",
            data: {
                headers: [...headers, 'TOTAL'],
                rows: resultRows
            }
        });

    } catch (error) {
        console.error("Error fetching PO listing:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve PO listing: ${error.message}`
        });
    }
};

export const getAllColorsFromOrderPoListing = async (req, res) => {
    const {ORDER_NO, ITEM_COLOR_ID} = req.query
    const where = {ITEM_COLOR_ID: {[Op.ne]: null}}

    if (ORDER_NO) {
        where.ORDER_NO = ORDER_NO
    }

    if (ITEM_COLOR_ID) {
        where.ITEM_COLOR_ID = ITEM_COLOR_ID
    }

    try {
        const colors = await OrderPoListing.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('ITEM_COLOR_ID')), 'ITEM_COLOR_ID']
            ],
            include: [
                {
                    model: ColorChartMod,
                    as: "ITEM_COLOR",
                    attributes: ['COLOR_ID', 'COLOR_CODE', 'COLOR_DESCRIPTION'],
                    required: true
                }
            ],
            where,
            order: [[{model: ColorChartMod, as: "ITEM_COLOR"}, 'COLOR_CODE', 'ASC']],
            raw: true
        });

        const result = colors.map(color => ({
            ITEM_COLOR_ID: color.ITEM_COLOR_ID,
            COLOR_CODE: color['ITEM_COLOR.COLOR_CODE'],
            COLOR_DESCRIPTION: color['ITEM_COLOR.COLOR_DESCRIPTION'],
            COLOR_GROUP: color['ITEM_COLOR.COLOR_GROUP']
        }));

        return res.status(200).json({
            success: true,
            message: "All colors used in Order PO Listing retrieved successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve colors: ${error.message}`
        });
    }
};
// CONTROLLER CREATE NEW ORDER PO LISTING DATA
export const newOrderPOListing = async (req, res) => {
    try {
        // let existData = [];
        const dataOrder = req.body;

        if (!dataOrder.length) {
            return res.status(404).json({
                success: false,
                message: "no data upload!",
                data: dataOrder,
            });
        }

        dataOrder.forEach(async (order, i) => {
            const checkOrderPOData = await OrderPoListing.findOne({
                where: {
                    ORDER_NO: order.ORDER_NO,
                    ORDER_PO_ID: order.ORDER_PO_ID,
                },
            });

            if (checkOrderPOData) {
                //filter hanya data tanpa prototype Sequelize
                const records = checkOrderPOData.dataValues;
                // console.log(order);
                // console.log(records);
                // Rest in Object Destructuring New Object/Data  PO Listing without Don’t Update Category and Change Name New Cloumn Date
                const {
                    MANUFACTURING_SITE,
                    CUSTOMER_NAME,
                    CUSTOMER_DIVISION,
                    CUSTOMER_PROGRAM,
                    CUSTOMER_SEASON,
                    ORDER_NO,
                    // ORDER_REFERENCE_PO_NO,
                    PRODUCT_ITEM_CODE,
                    // ORDER_STYLE_DESCRIPTION,
                    ITEM_COLOR_CODE,
                    ITEM_COLOR_NAME,
                    // TARGET_PCD,
                    PLAN_EXFACTORY_DATE,
                    ORIGINAL_DELIVERY_DATE,
                    ...newOrdr
                } = {
                    ...order,
                };

                //Join New Data with existing Object/Data
                const joinAfterDecon = {...records, ...newOrdr};
                // jika new manufacture juga berbeda dengan manufacture yang baru diupload
                if (
                    records.NEW_MANUFACTURING_SITE !== null &&
                    records.NEW_MANUFACTURING_SITE !== order.MANUFACTURING_SITE
                )
                    joinAfterDecon.NEW_MANUFACTURING_SITE = order.MANUFACTURING_SITE;

                if (records.MANUFACTURING_SITE !== order.MANUFACTURING_SITE)
                    joinAfterDecon.NEW_MANUFACTURING_SITE = order.MANUFACTURING_SITE;

                if (records.NEW_TARGET_PCD !== order.TARGET_PCD)
                    joinAfterDecon.NEW_TARGET_PCD = order.TARGET_PCD;

                if (records.TARGET_PCD !== order.TARGET_PCD)
                    joinAfterDecon.NEW_TARGET_PCD = order.TARGET_PCD;

                if (joinAfterDecon.FINAL_DELIVERY_DATE !== order.FINAL_DELIVERY_DATE)
                    joinAfterDecon.NEW_FINAL_DELIVERY_DATE = order.FINAL_DELIVERY_DATE;

                if (joinAfterDecon.PLAN_EXFACTORY_DATE !== order.PLAN_EXFACTORY_DATE)
                    joinAfterDecon.NEW_PLAN_EXFACTORY_DATE = order.PLAN_EXFACTORY_DATE;

                const updtD = await OrderPoListing.update(joinAfterDecon, {
                    where: {
                        ORDER_NO: records.ORDER_NO,
                        ORDER_STYLE_DESCRIPTION: records.ORDER_STYLE_DESCRIPTION,
                        ORDER_PO_ID: records.ORDER_PO_ID,
                        // MO_NO: records.MO_NO,
                    },
                });
            } else {
                try {
                    await OrderPoListing.create(order);
                } catch (error) {
                    console.log(error);
                }
            }

            if (i + 1 === dataOrder.length) {
                await updateIdCapacity(order.PRODUCTION_MONTH);
                return res.status(201).json({
                    success: true,
                    message: "Order PO Data Added Successfully",
                    data: order,
                    // duplicate: existData,
                });
            }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error,
        });
    }
};

//function for update ID Capacity in weekly_sch_schedule, weekly_prod_sch_detail, weekly_sch_size
async function updateIdCapacity(prodMonth) {
    //first find List NEW_ID_CAPACITY base on PO Listing updated controler on the top
    const listCapNewId = await db.query(findNewCapId, {
        replacements: {
            prodMonth: prodMonth,
        },
        type: QueryTypes.SELECT,
    });

    //if finded do looping and update every table wit Capacity ID
    if (listCapNewId.length > 0) {
        listCapNewId.forEach(async (capNew) => {
            //find and update Schedule Header
            const schHeader = await WeeklyProSchd.findAll({
                where: {
                    SCH_CAPACITY_ID: capNew.ID_CAPACITY,
                },
            });
            if (schHeader) {
                await WeeklyProSchd.update(
                    {SCH_CAPACITY_ID: capNew.NEW_ID_CAPACITY},
                    {
                        where: {
                            SCH_CAPACITY_ID: capNew.ID_CAPACITY,
                        },
                    }
                );
            }

            //find and update Schedule Detail/daily
            const schDetail = await WeekSchDetail.findAll({
                where: {
                    SCHD_CAPACITY_ID: capNew.ID_CAPACITY,
                },
            });
            if (schDetail) {
                await WeekSchDetail.update(
                    {SCHD_CAPACITY_ID: capNew.NEW_ID_CAPACITY},
                    {
                        where: {
                            SCHD_CAPACITY_ID: capNew.ID_CAPACITY,
                        },
                    }
                );
            }

            //find and update Schedule size
            const schSize = await SchSizeAloc.findAll({
                where: {
                    ID_CAPACITY: capNew.ID_CAPACITY,
                },
            });
            if (schSize) {
                await SchSizeAloc.update(
                    {ID_CAPACITY: capNew.NEW_ID_CAPACITY},
                    {
                        where: {
                            ID_CAPACITY: capNew.ID_CAPACITY,
                        },
                    }
                );
            }
        });
    }
}

// CONTROLLER CREATE NEW ORDER PO LISTING DATA with sizes
export const newOrderPOListingSizes = async (req, res) => {
    try {
        // let existData = [];
        const dataOrder = req.body;

        if (!dataOrder.length) {
            return res.status(404).json({
                success: false,
                message: "no data upload!",
                data: dataOrder,
            });
        }

        //get list of month for destroy data befor post new data
        const listMonth = [
            ...new Set(dataOrder.map((item) => item.PRODUCTION_MONTH)),
        ];
        for (const [i, month] of listMonth.entries()) {
            await OrderPoListingSize.destroy({
                where: {
                    PRODUCTION_MONTH: month,
                },
            });
            if (i + 1 === listMonth.length) {
                await OrderPoListingSize.bulkCreate(dataOrder).then(() => {
                    return res.status(200).json({
                        success: true,
                        message: "Data Order Retrieved Successfully create",
                    });
                });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
            message: "error processing request",
            data: error,
        });
    }
};

// get order poListingSize
export const getOrderPOListingSize = async (req, res) => {
    try {
        const {orderId} = req.params;

        const ordersSize = await db.query(getOrderSizeByBlk, {
            replacements: {
                orderId: orderId,
            },
            type: QueryTypes.SELECT,
        });

        res.status(200).json({
            success: true,
            message: "Get Data Order Successfully",
            data: ordersSize,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
            message: "error saat mencari order size",
            data: error,
        });
    }
};

// get order poListingSize
export const getBlkNoList = async (req, res) => {
    try {
        const {orderId} = req.params;
        const qry = `%${orderId}%`;

        const ordersSize = await db.query(getListBlkNo, {
            replacements: {
                orderId: qry,
            },
            type: QueryTypes.SELECT,
        });

        res.status(200).json({
            success: true,
            message: "Data Order Retrieved Successfully",
            data: ordersSize,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
            message: "error saat mencari order size",
            data: error,
        });
    }
};

// get order poListingSize
export const getOneDetailPoSize = async (req, res) => {
    try {
        const {poId, colorCode, sizeCode} = req.params;

        const ordersSizeDetail = await db.query(getDetailPoSize, {
            replacements: {poId, colorCode, sizeCode},
            type: QueryTypes.SELECT,
        });

        const resultDetail = await db.query(getDetailQrGenerate, {
            replacements: {poId, colorCode, sizeCode},
            type: QueryTypes.SELECT,
        });

        res.status(200).json({
            success: true,
            message: "Data Order Retrieved Successfully",
            data: ordersSizeDetail,
            dataResult: resultDetail,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            success: false,
            message: "error saat mencari order size",
            data: error,
        });
    }
};
