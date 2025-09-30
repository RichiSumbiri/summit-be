import {
    PurchaseOrderModel, PurchaseOrderNotesModel, PurchaseOrderRevModel
} from "../../models/procurement/purchaseOrder.mod.js";
import { ListCountry } from "../../models/list/referensiList.mod.js";
import { ModelWarehouseDetail } from "../../models/setup/WarehouseDetail.mod.js";
import { ModelVendorDetail, ModelVendorShipperLocation } from "../../models/system/VendorDetail.mod.js";
import { MasterPayMethode } from "../../models/system/finance.mod.js";
import Users from "../../models/setup/users.mod.js";
import PurchaseOrderDetailModel from "../../models/procurement/purchaseOrderDetail.mod.js";
import { Op, where, col } from "sequelize";
import ColorChartMod from "../../models/system/colorChart.mod.js";
import SizeChartMod from "../../models/system/sizeChart.mod.js";
import MasterItemDimensionModel from "../../models/system/masterItemDimention.mod.js";
import {
    BomStructureListModel,
    BomStructureSourcingDetail
} from "../../models/materialManagement/bomStructure/bomStructure.mod.js";
import db from "../../config/database.js";

export const createPurchaseOrder = async (req, res) => {
    try {
        const {
            REV_ID = 0,
            MPO_DATE,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            RECEIPT_STATUS,
            PORT_DISCHARGE,
            VENDOR_DETAIL,
            INVOICE_DETAIL,
            WAREHOUSE_ID,
            VENDOR_ID,
            MOQ_VALIDATION_STATUS,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            DELIVERY_UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            MOQ_NOTE,
            CREATE_BY,
        } = req.body;

        if (!COUNTRY_ID || !WAREHOUSE_ID || !VENDOR_ID || !VENDOR_SHIPPER_LOCATION_ID || !COMPANY_ID || !INVOICE_UNIT_ID || !DELIVERY_UNIT_ID || !PAYMENT_TERM_ID) {
            return res.status(400).json({
                status: false, message: "Field are required"
            })
        }

        const getLastID = await PurchaseOrderModel.findOne({
            order: [['MPO_ID', 'DESC']], raw: true
        });
        const newIncrement = !getLastID ? '0000001' : Number(getLastID.ID.slice(-7)) + 1;
        const MPO_ID = 'MPO' + newIncrement.toString().padStart(7, '0');

        const purchaseOrder = await PurchaseOrderModel.create({
            MPO_ID,
            REV_ID,
            MOQ_VALIDATION_STATUS,
            MPO_DATE,
            RECEIPT_STATUS,
            MOQ_NOTE,
            VENDOR_ID,
            VENDOR_DETAIL,
            INVOICE_DETAIL,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            CURRENCY_CODE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            CREATE_BY,
            CREATE_DATE: new Date(),
        });

        await PurchaseOrderNotesModel.create({
            PURCHASE_ORDER_ID: purchaseOrder.MPO_ID,
            REV_ID,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            MPO_STATUS: 'Open',
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            DELIVERY_UNIT_ID,
            WAREHOUSE_ID,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            IS_ACTIVE: true,
            CREATED_AT: new Date(),
            CREATED_ID: CREATE_BY
        })

        return res.status(201).json({
            success: true, message: "Purchase Order created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create purchase order: ${error.message}`,
        });
    }
};

export const getAllPurchaseOrders = async (req, res) => {
    const { UNIT_ID, VENDOR_ID, MPO_STATUS } = req.query;

    try {
        const whereNote = {};
        const wherePO = {};

        if (MPO_STATUS) whereNote.MPO_STATUS = MPO_STATUS;
        if (UNIT_ID) whereNote.UNIT_ID = UNIT_ID;

        if (VENDOR_ID) wherePO.VENDOR_ID = VENDOR_ID;

        whereNote[Op.and] = [
            where(col("NOTES.REV_ID"), col("purchase_order.REV_ID"))
        ];

        const purchaseOrders = await PurchaseOrderModel.findAll({
            include: [
                {
                    model: PurchaseOrderNotesModel,
                    as: "NOTES",
                    where: whereNote,
                    required: true,
                    attributes: [
                        'ID',
                        'REV_ID',
                        'MPO_STATUS',
                        'MPO_ETD',
                        'MPO_ETA',
                        'DELIVERY_MODE_CODE',
                        'DELIVERY_TERM',
                        'COUNTRY_ID',
                        'PORT_DISCHARGE',
                        'WAREHOUSE_ID',
                        'PAYMENT_TERM_ID',
                        'PAYMENT_REFERENCE',
                        'NOTE',
                    ],
                    include: [
                        {
                            model: ListCountry,
                            as: "COUNTRY",
                            attributes: ["BUYER_CODE", "COUNTRY_CODE", "COUNTRY_NAME"]
                        },
                        {
                            model: ModelWarehouseDetail,
                            as: "WAREHOUSE",
                            attributes: ["WHI_CODE", "WHI_NAME"]
                        },
                        {
                            model: MasterPayMethode,
                            as: "PAYMENT_TERM",
                            attributes: ["PAYMET_CODE", "PAYMET_DESC", "PAYMET_LEADTIME"]
                        }
                    ]
                },
                {
                    model: PurchaseOrderRevModel,
                    as: "REV",
                    attributes: ["NAME", "DESCRIPTION", "SEQUENCE"]
                },
                {
                    model: ModelVendorDetail,
                    as: "VENDOR",
                    attributes: [
                        "VENDOR_CODE", "VENDOR_NAME", "VENDOR_ACTIVE", "VENDOR_COMPANY_NAME",
                        "VENDOR_PHONE", "VENDOR_FAX", "VENDOR_WEB", "VENDOR_ADDRESS_1",
                        "VENDOR_ADDRESS_2", "VENDOR_CITY", "VENDOR_PROVINCE", "VENDOR_POSTAL_CODE",
                        "VENDOR_COUNTRY_CODE", "VENDOR_CONTACT_TITLE", "VENDOR_CONTACT_NAME",
                        "VENDOR_CONTACT_POSITION", "VENDOR_CONTACT_PHONE_1", "VENDOR_CONTACT_PHONE_2",
                        "VENDOR_CONTACT_EMAIL"
                    ]
                },
                {
                    model: ModelVendorShipperLocation,
                    as: "VENDOR_SHIPPER_LOCATION",
                    attributes: ["VSL_NAME", "VSL_CONTACT_TITLE", "VSL_CONTACT_NAME", "VSL_CONTACT_POSITION", "VSL_ADDRESS_1"]
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"]
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ["USER_NAME"]
                }
            ],
            where: wherePO,
            order: [['MPO_ID', 'ASC']]
        });

        const formattedData = purchaseOrders.map(item => {
            const note = item.NOTES[0];

            let vendorDetail = null;
            let invoiceDetail = null;
            try {
                vendorDetail = item?.VENDOR_DETAIL ? JSON.parse(item.VENDOR_DETAIL) : null;
                invoiceDetail = item?.INVOICE_DETAIL ? JSON.parse(item.INVOICE_DETAIL) : null;
            } catch (e) {
                console.warn("Failed to parse JSON for MPO_ID:", item.MPO_ID);
            }

            return {
                ...item.dataValues,
                ...note.dataValues,
                VENDOR_DETAIL: vendorDetail,
                INVOICE_DETAIL: invoiceDetail,
                NOTES: undefined
            };
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Orders retrieved successfully",
            data: formattedData,
        });
    } catch (error) {
        console.error("Error in getAllPurchaseOrders:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase orders: ${error.message}`,
        });
    }
};

export const getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrderModel.findOne({
            where: {
                MPO_ID: id
            }, include: [{
                model: PurchaseOrderRevModel, as: "REV", attributes: ["NAME", "DESCRIPTION", "SEQUENCE"]
            }, {
                model: ModelVendorDetail,
                as: "VENDOR",
                attributes: ["VENDOR_CODE", "VENDOR_NAME", "VENDOR_ACTIVE", "VENDOR_COMPANY_NAME", "VENDOR_PHONE", "VENDOR_FAX", "VENDOR_WEB", "VENDOR_ADDRESS_1", "VENDOR_ADDRESS_2", "VENDOR_CITY", "VENDOR_PROVINCE", "VENDOR_POSTAL_CODE", "VENDOR_COUNTRY_CODE", "VENDOR_CONTACT_TITLE", "VENDOR_CONTACT_NAME", "VENDOR_CONTACT_POSITION", "VENDOR_CONTACT_PHONE_1", "VENDOR_CONTACT_PHONE_2", "VENDOR_CONTACT_EMAIL"]
            }, {
                model: ModelVendorShipperLocation,
                as: "VENDOR_SHIPPER_LOCATION",
                attributes: ["VSL_NAME", "VSL_CONTACT_TITLE", "VSL_CONTACT_NAME", "VSL_CONTACT_POSITION", "VSL_ADDRESS_1"]
            }, {
                model: Users, as: "CREATED", attributes: ["USER_NAME"]
            }, {
                model: Users, as: "UPDATED", attributes: ["USER_NAME"]
            },]
        });

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false, message: "Purchase Order not found",
            });
        }

        const notes = await PurchaseOrderNotesModel.findOne({
            where: {
                PURCHASE_ORDER_ID: id, REV_ID: purchaseOrder.REV_ID
            }, include: [{
                model: ListCountry, as: "COUNTRY", attributes: ["BUYER_CODE", "COUNTRY_CODE", "COUNTRY_NAME"]
            }, {
                model: ModelWarehouseDetail, as: "WAREHOUSE", attributes: ["WHI_CODE", "WHI_NAME"]
            }, {
                model: MasterPayMethode,
                as: "PAYMENT_TERM",
                attributes: ["PAYMET_CODE", "PAYMET_DESC", "PAYMET_LEADTIME"]
            },]
        })

        return res.status(200).json({
            success: true, message: "Purchase Order retrieved successfully", data: {
                ...purchaseOrder.dataValues, ...notes?.dataValues,
                VENDOR_DETAIL: JSON.parse(purchaseOrder.VENDOR_DETAIL),
                INVOICE_DETAIL: JSON.parse(purchaseOrder.INVOICE_DETAIL)
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve purchase order: ${error.message}`,
        });
    }
};

export const updatePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { REV_ID } = req.query
        const {
            MPO_DATE,
            MPO_ETD,
            MPO_ETA,
            MPO_STATUS,
            MOQ_VALIDATION_STATUS,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            WAREHOUSE_ID,
            VENDOR_ID,
            VENDOR_DETAIL,
            INVOICE_DETAIL,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            DELIVERY_UNIT_ID,
            CURRENCY_CODE,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            MOQ_NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            UPDATE_BY,
        } = req.body;

        if (REV_ID === undefined) {
            return res.status(404).json({
                success: false, message: "Revision id is required",
            });
        }

        const purchaseOrder = await PurchaseOrderModel.findOne({ where: { MPO_ID: id, REV_ID } });

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false, message: "Purchase Order not found",
            });
        }


        await purchaseOrder.update({
            MPO_DATE,
            MOQ_VALIDATION_STATUS,
            MPO_STATUS,
            VENDOR_DETAIL: JSON.stringify(VENDOR_DETAIL),
            INVOICE_DETAIL: JSON.stringify(INVOICE_DETAIL),
            VENDOR_ID,
            VENDOR_SHIPPER_LOCATION_ID,
            COMPANY_ID,
            INVOICE_UNIT_ID,
            CURRENCY_CODE,
            MOQ_NOTE,
            SURCHARGE_AMOUNT,
            TAX_PERCENTAGE,
            UPDATE_BY,
            UPDATE_DATE: new Date(),
        });

        await PurchaseOrderNotesModel.update({
            PURCHASE_ORDER_ID: purchaseOrder.MPO_ID,
            MPO_ETD,
            MPO_ETA,
            MPO_STATUS,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            DELIVERY_UNIT_ID,
            WAREHOUSE_ID,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            UPDATED_AT: new Date(),
            UPDATED_ID: UPDATE_BY
        }, {
            where: {
                PURCHASE_ORDER_ID: purchaseOrder.MPO_ID, REV_ID
            }
        })

        return res.status(200).json({
            success: true, message: "Purchase Order updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update purchase order: ${error.message}`,
        });
    }
};

export const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { STATUS, UPDATE_BY } = req.body;

        if (!STATUS) {
            return res.status(400).json({
                success: false, message: "Status can't empty",
            });
        }

        const purchaseOrder = await PurchaseOrderModel.findByPk(id)
        if (!purchaseOrder) {
            return res.status(404).json({
                success: false, message: "Purchase Order not found",
            });
        }

        let IS_APPROVE = false

        if (STATUS === "Confirmed") {
            IS_APPROVE = true
            const listPurchaseOrderDetail = await PurchaseOrderDetailModel.findAll({
                where: {
                    MPO_ID: purchaseOrder.MPO_ID,
                    REV_ID: purchaseOrder.REV_ID
                }
            })

            const transaction = await db.transaction();

            for (let i = 0; i < listPurchaseOrderDetail.length; i++) {
                const data = listPurchaseOrderDetail[i].dataValues

                const sourcingDetail = await BomStructureSourcingDetail.findOne({
                    where: {
                        BOM_STRUCTURE_LINE_ID: data.BOM_STRUCTURE_LINE_ID, ITEM_DIMENSION_ID: data.ITEM_DIMENSION_ID
                    },
                    transaction
                })

                if (!sourcingDetail) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false, message: "Sourcing detail not found",
                    });
                }
                const UNCONFIRM_PO_QTY = Number(sourcingDetail.UNCONFIRM_PO_QTY) - Number(data.PURCHASE_ORDER_QTY)

                if (UNCONFIRM_PO_QTY < 0) {
                    await transaction.rollback();
                    return res.status(500).json({
                        success: false,
                        message: "Availabel un confirm po quantity cannot negative, result " + UNCONFIRM_PO_QTY,
                    });
                }

                await sourcingDetail.update({
                    CONFIRM_PO_QTY: Number(sourcingDetail.CONFIRM_PO_QTY) + Number(data.PURCHASE_ORDER_QTY),
                    UNCONFIRM_PO_QTY,
                    PENDING_PURCHASE_ORDER_QTY: Number(sourcingDetail.PENDING_PURCHASE_ORDER_QTY) + Number(data.PURCHASE_ORDER_QTY)
                })
            }

            await transaction.commit();
        }


        await PurchaseOrderNotesModel.update({
            MPO_STATUS: STATUS,
            IS_APPROVE,
            UPDATED_ID: UPDATE_BY,
            UPDATED_AT: new Date()
        }, {
            where: {
                REV_ID: purchaseOrder.REV_ID, PURCHASE_ORDER_ID: purchaseOrder.MPO_ID
            }
        })

        return res.status(200).json({
            success: true, message: "Purchase Order updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update purchase order: ${error.message}`,
        });
    }
};

export const deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const purchaseOrder = await PurchaseOrderModel.findByPk(id);

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false, message: "Purchase Order not found",
            });
        }

        await purchaseOrder.destroy();

        return res.status(200).json({
            success: true, message: "Purchase Order deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete purchase order: ${error.message}`,
        });
    }
};

export const createPurchaseOrderRev = async (req, res) => {
    try {
        const { MPO_ID, CREATED_ID } = req.body;

        if (!MPO_ID || !CREATED_ID) return res.status(400).json({
            success: false, message: `MPO and created id must be rquired`,
        });

        const purchaseOrder = await PurchaseOrderModel.findByPk(MPO_ID)
        if (!purchaseOrder) return res.status(404).json({
            success: false, message: `Purchase order not found`,
        });

        const purchaseOrderNote = await PurchaseOrderNotesModel.findOne({
            where: {
                PURCHASE_ORDER_ID: purchaseOrder.MPO_ID, REV_ID: purchaseOrder.REV_ID
            }
        })

        if (!purchaseOrderNote) return res.status(404).json({
            success: false, message: `Purchase order note not found`,
        });


        const purchaseOrderDetail = await PurchaseOrderDetailModel.findAll({
            where: {
                MPO_ID: purchaseOrder.MPO_ID, REV_ID: purchaseOrder.REV_ID
            }
        })

        let countRev = 0

        const checkRev = await PurchaseOrderRevModel.findOne({
            where: {
                MPO_ID: purchaseOrder.MPO_ID,
            },
            order: [['SEQUENCE', 'DESC']]
        })
        if (checkRev) countRev = checkRev.SEQUENCE

        const transaction = await db.transaction();

        const createNewRev = await PurchaseOrderRevModel.create({
            NAME: `Revision ${purchaseOrder.MPO_ID}`,
            DESCRIPTION: `Revision ${purchaseOrder.MPO_ID} ke ${countRev + 1}`,
            MPO_ID: purchaseOrder.MPO_ID,
            SEQUENCE: countRev + 1
        }, { transaction })

        await purchaseOrder.update({
            REV_ID: createNewRev.ID,
            UPDATE_BY: CREATED_ID,
            UPDATE_DATE: new Date()
        }, { transaction })

        await PurchaseOrderNotesModel.create({
            ...purchaseOrderNote.dataValues,
            ID: null,
            IS_ACTIVE: true,
            MPO_STATUS: 'Open',
            REV_ID: createNewRev.ID,
            CREATED_ID,
            CREATED_AT: new Date(),
            UPDATED_ID: null,
            UPDATED_AT: null
        }, { transaction })
        for (let i = 0; i < purchaseOrderDetail.length; i++) {
            const data = purchaseOrderDetail[i].dataValues
            await PurchaseOrderDetailModel.create({
                ...data,
                ID: null,
                REV_ID: createNewRev.ID,
                CREATE_BY: CREATED_ID,
                CREATE_DATE: new Date(),
                UPDATE_BY: null,
                UPDATE_DATE: null
            }, { transaction })

            const sourcingDetail = await BomStructureSourcingDetail.findOne({
                where: {
                    BOM_STRUCTURE_LINE_ID: data.BOM_STRUCTURE_LINE_ID, ITEM_DIMENSION_ID: data.ITEM_DIMENSION_ID
                },
                transaction
            })

            if (!sourcingDetail) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false, message: "Sourcing detail not found",
                });
            }

            const CONFIRM_PO_QTY = Number(sourcingDetail.CONFIRM_PO_QTY) - Number(data.PURCHASE_ORDER_QTY)

            if (CONFIRM_PO_QTY < 0) {
                await transaction.rollback();
                return res.status(500).json({
                    success: false,
                    message: "Availabel un confirm po quantity cannot negative, result " + CONFIRM_PO_QTY,
                });
            }

            await sourcingDetail.update({
                UNCONFIRM_PO_QTY: Number(sourcingDetail.UNCONFIRM_PO_QTY) + Number(data.PURCHASE_ORDER_QTY),
                CONFIRM_PO_QTY,
                PENDING_PURCHASE_ORDER_QTY: Number(sourcingDetail.PENDING_PURCHASE_ORDER_QTY) + Number(data.PURCHASE_ORDER_QTY)
            }, { transaction })


        }

        await transaction.commit();

        return res.status(201).json({
            success: true, message: "Purchase Order Revision created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create purchase order revision: ${error.message}`,
        });
    }
};

export const getAllPurchaseOrderRevs = async (req, res) => {
    try {
        const records = await PurchaseOrderRevModel.findAll();

        return res.status(200).json({
            success: true, message: "Purchase Order Revisions retrieved successfully", data: records,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve purchase order revisions: ${error.message}`,
        });
    }
};

export const getPurchaseOrderRevById = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await PurchaseOrderRevModel.findByPk(id);

        if (!record) {
            return res.status(404).json({
                success: false, message: "Purchase Order Revision not found",
            });
        }

        return res.status(200).json({
            success: true, message: "Purchase Order Revision retrieved successfully", data: record,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve purchase order revision: ${error.message}`,
        });
    }
};

export const updatePurchaseOrderRev = async (req, res) => {
    try {
        const { id } = req.params;
        const { NAME, DESCRIPTION, SEQUENCE, CREATED_ID } = req.body;

        const record = await PurchaseOrderRevModel.findByPk(id);

        if (!record) {
            return res.status(404).json({
                success: false, message: "Purchase Order Revision not found",
            });
        }

        await record.update({
            NAME, DESCRIPTION, SEQUENCE, CREATED_ID,
        });

        return res.status(200).json({
            success: true, message: "Purchase Order Revision updated successfully", data: record,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update purchase order revision: ${error.message}`,
        });
    }
};

export const deletePurchaseOrderRev = async (req, res) => {
    try {
        const { id } = req.params;

        const record = await PurchaseOrderRevModel.findByPk(id);

        if (!record) {
            return res.status(404).json({
                success: false, message: "Purchase Order Revision not found",
            });
        }

        await record.destroy();

        return res.status(200).json({
            success: true, message: "Purchase Order Revision deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete purchase order revision: ${error.message}`,
        });
    }
};

export const createPurchaseOrderNote = async (req, res) => {
    try {
        const {
            REV_ID = 0,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            MPO_STATUS,
            COUNTRY_ID,
            PORT_DISCHARGE,
            DELIVERY_UNIT_ID = "1",
            WAREHOUSE_ID,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            CREATED_ID,
        } = req.body;

        await PurchaseOrderNotesModel.create({
            REV_ID,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            MPO_STATUS,
            PORT_DISCHARGE,
            DELIVERY_UNIT_ID,
            WAREHOUSE_ID,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            IS_ACTIVE: true,
            NOTE,
            CREATED_ID
        });

        return res.status(201).json({
            success: true, message: "Purchase Order Note created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to create purchase order note: ${error.message}`,
        });
    }
};

export const getAllPurchaseOrderNotes = async (req, res) => {
    const { PURCHASE_ORDER_ID, REV_ID, WAREHOUSE_ID } = req.query;

    if (!PURCHASE_ORDER_ID) {
        return res.status(400).json({
            success: false,
            message: "Purchase order ID is required",
        });
    }

    try {
        const where = { PURCHASE_ORDER_ID };
        if (REV_ID !== undefined) where.REV_ID = Number(REV_ID);
        if (WAREHOUSE_ID) where.WAREHOUSE_ID = WAREHOUSE_ID;

        const notes = await PurchaseOrderNotesModel.findAll({
            where,
            include: [
                {
                    model: PurchaseOrderModel,
                    as: "PURCHASE_ORDER",
                    attributes: [
                        "VENDOR_DETAIL",
                        "INVOICE_DETAIL",
                        "VENDOR_ID",
                        "VENDOR_SHIPPER_LOCATION_ID",
                        "CURRENCY_CODE",
                        "COMPANY_ID",
                    ],
                    include: [
                        {
                            model: ModelVendorDetail,
                            as: "VENDOR",
                            attributes: [
                                "VENDOR_CODE", "VENDOR_NAME", "VENDOR_ACTIVE", "VENDOR_COMPANY_NAME",
                                "VENDOR_PHONE", "VENDOR_FAX", "VENDOR_WEB", "VENDOR_ADDRESS_1",
                                "VENDOR_ADDRESS_2", "VENDOR_CITY", "VENDOR_PROVINCE", "VENDOR_POSTAL_CODE",
                                "VENDOR_COUNTRY_CODE", "VENDOR_CONTACT_TITLE", "VENDOR_CONTACT_NAME",
                                "VENDOR_CONTACT_POSITION", "VENDOR_CONTACT_PHONE_1", "VENDOR_CONTACT_PHONE_2",
                                "VENDOR_CONTACT_EMAIL"
                            ],
                        },
                        {
                            model: ModelVendorShipperLocation,
                            as: "VENDOR_SHIPPER_LOCATION",
                            attributes: [
                                "VSL_NAME", "VSL_CONTACT_TITLE", "VSL_CONTACT_NAME",
                                "VSL_CONTACT_POSITION", "VSL_ADDRESS_1"
                            ],
                        },
                    ],
                },
                {
                    model: PurchaseOrderRevModel,
                    as: "REV",
                    attributes: ["NAME", "DESCRIPTION", "SEQUENCE"],
                },
                {
                    model: ListCountry,
                    as: "COUNTRY",
                    attributes: ["BUYER_CODE", "COUNTRY_CODE", "COUNTRY_NAME"],
                },
                {
                    model: Users,
                    as: "CREATED",
                    attributes: ["USER_NAME"],
                },
                {
                    model: Users,
                    as: "UPDATED",
                    attributes: ["USER_NAME"],
                },
            ],
        });

        const parsedNotes = notes.map(note => {
            let vendorDetail = null;
            let invoiceDetail = null;

            try {
                vendorDetail = note.PURCHASE_ORDER?.VENDOR_DETAIL
                    ? JSON.parse(note.PURCHASE_ORDER.VENDOR_DETAIL)
                    : null;
                invoiceDetail = note.PURCHASE_ORDER?.INVOICE_DETAIL
                    ? JSON.parse(note.PURCHASE_ORDER.INVOICE_DETAIL)
                    : null;
            } catch (e) {
                console.warn(`Failed to parse JSON for note ID: ${note.ID}`);
            }

            return {
                ...note.dataValues,
                VENDOR_DETAIL: vendorDetail,
                INVOICE_DETAIL: invoiceDetail,
            };
        });

        return res.status(200).json({
            success: true,
            message: "Purchase Order Notes retrieved successfully",
            data: parsedNotes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order notes: ${error.message}`,
        });
    }
};

export const getPurchaseOrderNoteHistoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await PurchaseOrderNotesModel.findOne({
            where: { ID: id },
            include: [
                {
                    model: PurchaseOrderRevModel,
                    as: "REV",
                    attributes: ["SEQUENCE", "MPO_ID"],
                    order: [['SEQUENCE', 'DESC']]
                }
            ]
        })

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Purchase Order Note not found",
            });
        }

        const mpoid = note.PURCHASE_ORDER_ID;
        const currentRevId = note.REV_ID;
        const currentSequence = note.REV?.SEQUENCE || 0;

        const detailsNew = await PurchaseOrderDetailModel.findAll({
            where: { MPO_ID: mpoid, REV_ID: currentRevId },
            include: [
                {
                    model: BomStructureListModel,
                    as: "BOM_STRUCTURE_LINE",
                    attributes: ["ID", "BOM_LINE_ID", "MASTER_ITEM_ID", "STATUS", "CONSUMPTION_UOM", "VENDOR_ID", "BOM_STRUCTURE_ID"]
                },
                {
                    model: MasterItemDimensionModel,
                    as: "ITEM_DIMENSION",
                    attributes: ["ID", "COLOR_ID", "SIZE_ID"],
                    include: [
                        {
                            model: ColorChartMod,
                            as: "MASTER_COLOR",
                            attributes: ["COLOR_DESCRIPTION"]
                        },
                        {
                            model: SizeChartMod,
                            as: "MASTER_SIZE",
                            attributes: ["SIZE_DESCRIPTION"]
                        }
                    ]
                }
            ]
        });

        let detailsOld = [];
        if (currentSequence > 0) {

            const seq = currentSequence - 1
            const prevRev = await PurchaseOrderRevModel.findOne({
                where: { MPO_ID: mpoid, SEQUENCE: seq },
                attributes: ["ID"]
            });


            if (seq >= 0) {
                detailsOld = await PurchaseOrderDetailModel.findAll({
                    where: { MPO_ID: mpoid, REV_ID: prevRev?.ID ?? seq },
                    include: [
                        {
                            model: BomStructureListModel,
                            as: "BOM_STRUCTURE_LINE",
                            attributes: ["ID", "BOM_LINE_ID", "MASTER_ITEM_ID", "STATUS", "CONSUMPTION_UOM", "VENDOR_ID", "BOM_STRUCTURE_ID"]
                        },
                        {
                            model: MasterItemDimensionModel,
                            as: "ITEM_DIMENSION",
                            attributes: ["ID", "COLOR_ID", "SIZE_ID"],
                            include: [
                                {
                                    model: ColorChartMod,
                                    as: "MASTER_COLOR",
                                    attributes: ["COLOR_DESCRIPTION"]
                                },
                                {
                                    model: SizeChartMod,
                                    as: "MASTER_SIZE",
                                    attributes: ["SIZE_DESCRIPTION"]
                                }
                            ]
                        }
                    ]
                });
            }
        }

        const newMap = {};
        const oldMap = {};

        detailsNew.forEach(detail => {
            const key = `${detail.BOM_STRUCTURE_LINE_ID || ''}-${detail.ITEM_DIMENSION_ID || ''}`;
            newMap[key] = detail;
        });

        detailsOld.forEach(detail => {
            const key = `${detail.BOM_STRUCTURE_LINE_ID || ''}-${detail.ITEM_DIMENSION_ID || ''}`;
            oldMap[key] = detail;
        });

        const allKeys = new Set([
            ...Object.keys(newMap),
            ...Object.keys(oldMap)
        ]);

        const result = Array.from(allKeys).map(key => {
            const newDetail = newMap[key];
            const oldDetail = oldMap[key];

            const bomLine = newDetail?.BOM_STRUCTURE_LINE;
            const dim = newDetail?.ITEM_DIMENSION || {};
            const colorDesc = dim.MASTER_COLOR?.COLOR_DESCRIPTION || "";
            const sizeDesc = dim.MASTER_SIZE?.SIZE_DESCRIPTION || "";

            let oldBomLine = null;
            let oldDim = null;
            let oldColorDesc = "";
            let oldSizeDesc = "";

            if (oldDetail) {
                oldBomLine = oldDetail.BOM_STRUCTURE_LINE;
                oldDim = oldDetail.ITEM_DIMENSION || {};
                oldColorDesc = oldDim.MASTER_COLOR?.COLOR_DESCRIPTION || "";
                oldSizeDesc = oldDim.MASTER_SIZE?.SIZE_DESCRIPTION || "";
            }

            const poQtyNew = newDetail ? Number(newDetail.PURCHASE_ORDER_QTY) || 0 : 0;
            const poQtyOld = oldDetail ? Number(oldDetail.PURCHASE_ORDER_QTY) || 0 : 0;
            const unitCostNew = newDetail ? Number(newDetail.UNIT_COST) || 0 : 0;
            const unitCostOld = oldDetail ? Number(oldDetail.UNIT_COST) || 0 : 0;

            return {
                BOM_ID: bomLine?.BOM_STRUCTURE_ID || oldBomLine?.BOM_STRUCTURE_ID || "",
                REVISION_QTY: poQtyNew - poQtyOld,
                BOM_LINE_ID: bomLine?.BOM_LINE_ID || "",
                ITEM_ID: bomLine?.MASTER_ITEM_ID || "",
                DIMENSION_ID: dim?.ID || "",
                COLOR: colorDesc || "",
                SIZE: sizeDesc || "",
                UOM: bomLine?.CONSUMPTION_UOM || "",
                COST_PER_UNIT: unitCostNew,
                PO_QTY: poQtyNew,

                BOM_LINE_ID_OLD: oldBomLine?.BOM_LINE_ID || "",
                ITEM_ID_OLD: oldBomLine?.MASTER_ITEM_ID || "",
                DIMENSION_ID_OLD: oldDim?.ID || "",
                COLOR_OLD: oldColorDesc,
                SIZE_OLD: oldSizeDesc,
                UOM_OLD: oldBomLine?.CONSUMPTION_UOM || "",
                COST_PER_UNIT_OLD: unitCostOld,
                PO_QTY_OLD: poQtyOld,
            };
        });


        return res.status(200).json({
            success: true,
            message: "Purchase Order Note history retrieved successfully",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Failed to retrieve purchase order note history: ${error.message}`,
        });
    }
};

export const getPurchaseOrderNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await PurchaseOrderNotesModel.findByPk(id);

        if (!note) {
            return res.status(404).json({
                success: false, message: "Purchase Order Note not found",
            });
        }

        return res.status(200).json({
            success: true, message: "Purchase Order Note retrieved successfully", data: note,
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to retrieve purchase order note: ${error.message}`,
        });
    }
};

export const updatePurchaseOrderNote = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            REV_ID,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            DELIVERY_UNIT_ID,
            WAREHOUSE_ID,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            UPDATED_ID
        } = req.body;

        const note = await PurchaseOrderNotesModel.findByPk(id);

        if (!note) {
            return res.status(404).json({
                success: false, message: "Purchase Order Note not found",
            });
        }

        await note.update({
            REV_ID,
            MPO_ETD,
            MPO_ETA,
            DELIVERY_MODE_CODE,
            DELIVERY_TERM,
            COUNTRY_ID,
            PORT_DISCHARGE,
            DELIVERY_UNIT_ID,
            WAREHOUSE_ID,
            PAYMENT_TERM_ID,
            PAYMENT_REFERENCE,
            NOTE,
            UPDATED_ID,
            UPDATED_AT: new Date(),
        });

        return res.status(200).json({
            success: true, message: "Purchase Order Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to update purchase order note: ${error.message}`,
        });
    }
};

export const deletePurchaseOrderNote = async (req, res) => {
    try {
        const { id } = req.params;

        const note = await PurchaseOrderNotesModel.findByPk(id);

        if (!note) {
            return res.status(404).json({
                success: false, message: "Purchase Order Note not found",
            });
        }

        await note.destroy();

        return res.status(200).json({
            success: true, message: "Purchase Order Note deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false, message: `Failed to delete purchase order note: ${error.message}`,
        });
    }
};