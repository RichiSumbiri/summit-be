import {QueryTypes} from "sequelize";
import db from "../../config/database.js";
import {
    ModelOrderPOHeader,
    ModelOrderPOListingLogStatus,
    ModelSupplyChainPlanning,
    OrderMOListing,
    queryGetAllPOIDByOrderID,
    queryGetListOrderHeader,
    queryGetListPOIDStatus,
    queryGetMOListingByOrderID,
    querySupplyChainPlanningByOrderID
} from "../../models/orderManagement/orderManagement.mod.js";
import {OrderPoListing, OrderPoListingSize} from "../../models/production/order.mod.js";
import moment from "moment";
import MasterItemIdModel, { MasterItemIdAttributesModel } from "../../models/system/masterItemId.mod.js";
import {
    CustomerDetail,
    CustomerProductDivision,
    CustomerProductSeason,
    CustomerProgramName
} from "../../models/system/customer.mod.js";
// import { queryGetItemMasterAttribute } from "../../models/system/masterItemAttribute.mod.js";
// import ProductItemModel from "../../models/system/productItem.mod.js";


export const getListOrderHeaderByStatus = async (req, res) => {
    try {
        const {status} = req.params;
        const getList = await db.query(queryGetListOrderHeader, {
            replacements: {
                orderStatus: status
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get list order header by status",
            data: getList
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order header by status"
        });
    }
}

export const changeOrderHeaderStatus = async (req, res) => {
    try {
        const { ORDER_ID, OLD_STATUS, NEW_STATUS, UPDATE_BY } = req.body;
        if (!ORDER_ID || !OLD_STATUS || !NEW_STATUS || !UPDATE_BY) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters"
            });
        }
        // Update the order status for the specified ORDER_ID
        const [updatedRows] = await ModelOrderPOHeader.update({
            ORDER_STATUS: NEW_STATUS,
            UPDATE_BY: UPDATE_BY,
            UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: {
                ORDER_ID: ORDER_ID,
                ORDER_STATUS: OLD_STATUS
            }
        });
        if (updatedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or status mismatch"
            });
        }
        return res.status(200).json({
            success: true,
            message: "success change order header status"
        });

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error change order header status"
        });
    }

}

export const postOrderHeader = async (req, res) => {
    try {
        const {DataHeader} = req.body;

        // // GET ITEM ID ATTRIBUTE 
        // const itemAttributeData = await db.query(queryGetItemMasterAttribute, {
        //     replacements: {
        //         itemID: DataHeader.ITEM_ID
        //     }, type: QueryTypes.SELECT
        // });

        // // GET MASTER ATTRIBUTE PRODUCT ITEM TYPE
        // const itemAttributeType = itemAttributeData.filter(a=> a.MASTER_ATTRIBUTE_NAME === 'PRODUCT ITEM TYPE');

        // // GET MASTER ATTRIBUTE PRODUCT ITEM CATEGORY
        // const itemAttributeCategory = itemAttributeData.filter(a=> a.MASTER_ATTRIBUTE_NAME === 'PRODUCT ITEM CATEGORIES');

        // // GET PRODUCT ITEM ID
        // const ProductItemData = await ProductItemModel.findOne({
        //     where: {
        //         PRODUCT_TYPE_ATTB: itemAttributeType.length > 0 ? itemAttributeType[0].MASTER_ATTRIBUTE_VALUE_ID : null,
        //         PRODUCT_CAT_ATTB: itemAttributeCategory.length > 0 ? itemAttributeCategory[0].MASTER_ATTRIBUTE_VALUE_ID : null
        //     }, raw: true
        // });

        if (DataHeader.ORDER_ID) {
            // UPDATE ORDER HEADER
            await ModelOrderPOHeader.update({
                ORDER_STATUS: DataHeader.ORDER_STATUS,
                UOM_CODE: DataHeader.UOM_CODE,
                CURRENCY_CODE: DataHeader.CURRENCY_CODE,
                ORDER_PLACEMENT_COMPANY: DataHeader.ORDER_PLACEMENT_COMPANY,
                ITEM_ID: DataHeader.ITEM_ID,
                ORDER_STYLE_DESCRIPTION: DataHeader.ORDER_STYLE_DESCRIPTION,
                PRICE_TYPE_CODE: DataHeader.PRICE_TYPE_CODE,
                CUSTOMER_ID: DataHeader.CUSTOMER_ID,
                CUSTOMER_DIVISION_ID: DataHeader.CUSTOMER_DIVISION_ID,
                CUSTOMER_SEASON_ID: DataHeader.CUSTOMER_SEASON_ID,
                CUSTOMER_PROGRAM_ID: DataHeader.CUSTOMER_PROGRAM_ID,
                CUSTOMER_BUYPLAN_ID: DataHeader.CUSTOMER_BUYPLAN_ID,
                ORDER_CONFIRMED_DATE: DataHeader.ORDER_CONFIRMED_DATE,
                CONTRACT_CONFIRMED_DATE: DataHeader.CONTRACT_CONFIRMED_DATE,
                CONTRACT_EXPIRED_DATE: DataHeader.CONTRACT_EXPIRED_DATE,
                CONTRACT_REF_NO: DataHeader.CONTRACT_REF_NO,
                ORDER_REFERENCE_PO_NO: DataHeader.ORDER_REFERENCE_PO_NO,
                FLAG_MULTISET_ITEMS: DataHeader.FLAG_MULTISET_ITEMS || 0,
                NOTE_REMARKS: DataHeader.NOTE_REMARKS,
                SIZE_TEMPLATE_ID: DataHeader.SIZE_TEMPLATE_ID,
                PRODUCT_ID: DataHeader.PRODUCT_ID,
                UPDATE_BY: DataHeader.CREATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    ORDER_ID: DataHeader.ORDER_ID
                }
            });
        } else {
            // CREATE NEW ORDER ID
            const latestOrder = await ModelOrderPOHeader.findOne({
                where: {
                    ORDER_TYPE_CODE: DataHeader.ORDER_TYPE_CODE
                },
                order: [['ORDER_ID', 'DESC']],
                raw: true
            });
            const newIncrement = !latestOrder ? '0000001' : parseInt(latestOrder.ORDER_ID.slice(-7)) + 1;
            const newOrderID = DataHeader.ORDER_TYPE_CODE + newIncrement.toString().padStart(7, '0');
            
            // CREATE NEW ORDER HEADER
            await ModelOrderPOHeader.create({
                ORDER_ID: newOrderID,
                ORDER_TYPE_CODE: DataHeader.ORDER_TYPE_CODE,
                ORDER_STATUS: DataHeader.ORDER_STATUS,
                ORDER_UOM: DataHeader.UOM_CODE,
                ORDER_QTY: DataHeader.ORDER_UOM,
                CURRENCY_CODE: DataHeader.CURRENCY_CODE,
                ORDER_PLACEMENT_COMPANY: DataHeader.ORDER_PLACEMENT_COMPANY,
                ITEM_ID: DataHeader.ITEM_ID,
                ORDER_STYLE_DESCRIPTION: DataHeader.ORDER_STYLE_DESCRIPTION,
                PRICE_TYPE_CODE: DataHeader.PRICE_TYPE_CODE,
                CUSTOMER_ID: DataHeader.CUSTOMER_ID,
                CUSTOMER_DIVISION_ID: DataHeader.CUSTOMER_DIVISION_ID,
                CUSTOMER_SEASON_ID: DataHeader.CUSTOMER_SEASON_ID,
                CUSTOMER_PROGRAM_ID: DataHeader.CUSTOMER_PROGRAM_ID,
                CUSTOMER_BUYPLAN_ID: DataHeader.CUSTOMER_BUYPLAN_ID,
                ORDER_CONFIRMED_DATE: DataHeader.ORDER_CONFIRMED_DATE,
                CONTRACT_CONFIRMED_DATE: DataHeader.CONTRACT_CONFIRMED_DATE,
                CONTRACT_EXPIRED_DATE: DataHeader.CONTRACT_EXPIRED_DATE,
                CONTRACT_REF_NO: DataHeader.CONTRACT_REF_NO,
                ORDER_REFERENCE_PO_NO: DataHeader.ORDER_REFERENCE_PO_NO,
                FLAG_MULTISET_ITEMS: DataHeader.FLAG_MULTISET_ITEMS || 0,
                NOTE_REMARKS: DataHeader.NOTE_REMARKS,
                SIZE_TEMPLATE_ID: DataHeader.SIZE_TEMPLATE_ID,
                PRODUCT_ID: DataHeader.PRODUCT_ID,
                CREATE_BY: DataHeader.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        return res.status(200).json({
            success: true,
            message: "success post order header"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post order header"
        });
    }
}

export const getListPODetailByOrderID = async (req, res) => {
    try {
        const {orderID} = req.params;
        // const listDetail = await OrderPoListing.findAll({
        //     where: {
        //         ORDER_NO: orderID
        //     }, raw: true
        // });
        const listDetail = await db.query(queryGetAllPOIDByOrderID, {
            replacements: {
                orderID: orderID
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get list order detail by order id",
            data: listDetail
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order detail by order id"
        });
    }
}

export const getPOListingSizeByPOID = async (req, res) => {
    try {
        const {poid} = req.params;
        const getData = await OrderPoListingSize.findAll({
            where: {
                ORDER_PO_ID: poid
            }
        });
        return res.status(200).json({
            success: true,
            message: "success get list po listing size by poid",
            data: getData
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get po listing size by order poid"
        });
    }
}

export const getAllPODetailHeader = async (req, res) => {
    const {ORDER_TYPE_CODE, ORDER_STATUS} = req.query

    const where = {}
    if (ORDER_TYPE_CODE) {
        where.ORDER_TYPE_CODE = ORDER_TYPE_CODE
    }
    if (ORDER_STATUS) {
        where.ORDER_STATUS = ORDER_STATUS
    }


    try {
        const listDetail = await ModelOrderPOHeader.findAll({
            where,
            include: [
                {
                    model: MasterItemIdModel,
                    as: "ITEM",
                    attributes: ["ITEM_ID", "ITEM_CODE", "ITEM_DESCRIPTION"]
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
        });
        return res.status(200).json({
            success: true,
            message: "success get list po detail header by order id",
            data: listDetail
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get po detail header by order id"
        });
    }
}


export const postPOListing = async (req, res) => {
    try {
        const {DataPOID} = req.body;
        if (DataPOID.ORDER_PO_ID) {
            await OrderPoListing.update({
                MANUFACTURING_COMPANY: DataPOID.MANUFACTURING_COMPANY,
                MANUFACTURING_SITE: DataPOID.MANUFACTURING_SITE,
                ORDER_PLACEMENT_COMPANY: DataPOID.ORDER_PLACEMENT_COMPANY,
                ORDER_TYPE_CODE: DataPOID.ORDER_TYPE_CODE,
                ORDER_NO: DataPOID.ORDER_ID,
                ORDER_REFERENCE_PO_NO: DataPOID.ORDER_REFERENCE_PO_NO,
                ORDER_STYLE_DESCRIPTION: DataPOID.ORDER_STYLE_DESCRIPTION,
                PRODUCT_ITEM_ID: DataPOID.PRODUCT_ITEM_ID,
                PRODUCT_ITEM_CODE: DataPOID.PRODUCT_ITEM_CODE,
                PRODUCT_ITEM_DESCRIPTION: DataPOID.PRODUCT_ITEM_DESCRIPTION,
                CUSTOMER_ID: DataPOID.CUSTOMER_ID,
                CUSTOMER_NAME: DataPOID.CUSTOMER_NAME,
                CUSTOMER_DIVISION_ID: DataPOID.CUSTOMER_DIVISION_ID,
                CUSTOMER_DIVISION: DataPOID.CUSTOMER_DIVISION,
                CUSTOMER_SEASON_ID: DataPOID.CUSTOMER_SEASON_ID,
                CUSTOMER_SEASON: DataPOID.CUSTOMER_SEASON,
                CUSTOMER_BUYPLAN_ID: DataPOID.CUSTOMER_BUYPLAN_ID,
                CUSTOMER_BUY_PLAN: DataPOID.CUSTOMER_BUY_PLAN,
                CUSTOMER_PROGRAM_ID: DataPOID.CUSTOMER_PROGRAM_ID,
                CUSTOMER_PROGRAM: DataPOID.CUSTOMER_PROGRAM,
                PO_REF_CODE: DataPOID.PO_REF_CODE,
                ITEM_COLOR_ID: DataPOID.ITEM_COLOR_ID,
                ITEM_COLOR_CODE: DataPOID.ITEM_COLOR_CODE,
                ITEM_COLOR_NAME: DataPOID.ITEM_COLOR_NAME,
                COUNTRY: DataPOID.COUNTRY,
                DELIVERY_LOCATION_ID: DataPOID.DELIVERY_LOCATION_ID,
                DELIVERY_LOCATION_CODE: DataPOID.DELIVERY_LOCATION_CODE,
                DELIVERY_LOCATION_NAME: DataPOID.DELIVERY_LOCATION_NAME,
                PACKING_METHOD: DataPOID.PACKING_METHOD,
                DELIVERY_MODE_CODE: DataPOID.DELIVERY_MODE_CODE,
                PO_CONFIRMED_DATE: DataPOID.PO_CONFIRMED_DATE,
                PO_EXPIRY_DATE: DataPOID.PO_EXPIRY_DATE,
                ORIGINAL_DELIVERY_DATE: DataPOID.ORIGINAL_DELIVERY_DATE,
                FINAL_DELIVERY_DATE: DataPOID.FINAL_DELIVERY_DATE,
                PLAN_EXFACTORY_DATE: DataPOID,
                PRODUCTION_MONTH: moment(DataPOID.PRODUCTION_MONTH, "YYYY-MM").format("MMMM/YYYY"),
                SHIPPING_TERMS_CODE: DataPOID.SHIPPING_TERMS_CODE,
                PRICE_TYPE: DataPOID.PRICE_TYPE,
                UNIT_PRICE: DataPOID.UNIT_PRICE,
                MO_COST: DataPOID.MO_COST,
                REVISED_UNIT_PRICE: DataPOID.REVISED_UNIT_PRICE,
                ORDER_UOM: DataPOID.ORDER_UOM,
                ORDER_QTY: DataPOID.ORDER_QTY,
                MO_QTY: DataPOID.MO_QTY,
                TOTAL_ORDER_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.ORDER_QTY),
                TOTAL_MO_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.MO_QTY),
                SCRAP_PERCENTAGE: DataPOID.SCRAP_PERCENTAGE,
                CURRENCY_CODE: DataPOID.CURRENCY_CODE,
                NOTE_REMARKS: DataPOID.NOTE_REMARKS,
                DELIVERY_TERM: DataPOID.SHIPPING_TERMS_CODE,
                PO_CREATED_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                UPDATE_BY: DataPOID.CREATE_BY
            }, {
                where: {
                    ORDER_PO_ID: DataPOID.ORDER_PO_ID,
                    ORDER_NO: DataPOID.ORDER_ID
                }
            });
        } else {
            // CREATE NEW ORDER PO ID
            const getLastPOID = await OrderPoListing.findOne({order: [['ORDER_PO_ID', 'DESC']], raw: true});
            const newIncrement = !getLastPOID ? '0000001' : parseInt(getLastPOID.ORDER_PO_ID.slice(-8)) + 1;
            const newPOID = 'PO' + newIncrement.toString().padStart(8, '0');

            // CREATE DETAIL ORDER PO ID
            await OrderPoListing.create({
                MANUFACTURING_COMPANY: DataPOID.MANUFACTURING_COMPANY,
                MANUFACTURING_SITE: DataPOID.MANUFACTURING_SITE,
                ORDER_PLACEMENT_COMPANY: DataPOID.ORDER_PLACEMENT_COMPANY,
                ORDER_TYPE_CODE: DataPOID.ORDER_TYPE_CODE,
                ORDER_NO: DataPOID.ORDER_ID,
                ORDER_REFERENCE_PO_NO: DataPOID.ORDER_REFERENCE_PO_NO,
                ORDER_STYLE_DESCRIPTION: DataPOID.ORDER_STYLE_DESCRIPTION,
                PRODUCT_ITEM_ID: DataPOID.PRODUCT_ITEM_ID,
                PRODUCT_ITEM_CODE: DataPOID.PRODUCT_ITEM_CODE,
                PRODUCT_ITEM_DESCRIPTION: DataPOID.PRODUCT_ITEM_DESCRIPTION,
                CUSTOMER_ID: DataPOID.CUSTOMER_ID,
                CUSTOMER_NAME: DataPOID.CUSTOMER_NAME,
                CUSTOMER_DIVISION_ID: DataPOID.CUSTOMER_DIVISION_ID,
                CUSTOMER_DIVISION: DataPOID.CUSTOMER_DIVISION,
                CUSTOMER_SEASON_ID: DataPOID.CUSTOMER_SEASON_ID,
                CUSTOMER_SEASON: DataPOID.CUSTOMER_SEASON,
                CUSTOMER_BUYPLAN_ID: DataPOID.CUSTOMER_BUYPLAN_ID,
                CUSTOMER_BUY_PLAN: DataPOID.CUSTOMER_BUY_PLAN,
                CUSTOMER_PROGRAM_ID: DataPOID.CUSTOMER_PROGRAM_ID,
                CUSTOMER_PROGRAM: DataPOID.CUSTOMER_PROGRAM,
                ORDER_PO_ID: newPOID,
                PO_REF_CODE: DataPOID.PO_REF_CODE,
                ITEM_COLOR_ID: DataPOID.ITEM_COLOR_ID,
                ITEM_COLOR_CODE: DataPOID.ITEM_COLOR_CODE,
                ITEM_COLOR_NAME: DataPOID.ITEM_COLOR_NAME,
                COUNTRY: DataPOID.COUNTRY,
                DELIVERY_LOCATION_ID: DataPOID.DELIVERY_LOCATION_ID,
                DELIVERY_LOCATION_CODE: DataPOID.DELIVERY_LOCATION_CODE,
                DELIVERY_LOCATION_NAME: DataPOID.DELIVERY_LOCATION_NAME,
                PACKING_METHOD: DataPOID.PACKING_METHOD ? DataPOID.PACKING_METHOD : null,
                DELIVERY_MODE_CODE: DataPOID.DELIVERY_MODE_CODE ? DataPOID.DELIVERY_MODE_CODE : null,
                PO_CONFIRMED_DATE: DataPOID.PO_CONFIRMED_DATE ? DataPOID.PO_CONFIRMED_DATE : null,
                PO_EXPIRED_DATE: DataPOID.PO_EXPIRED_DATE ? DataPOID.PO_EXPIRED_DATE : null,
                ORIGINAL_DELIVERY_DATE: DataPOID.ORIGINAL_DELIVERY_DATE ? DataPOID.ORIGINAL_DELIVERY_DATE : null,
                FINAL_DELIVERY_DATE: DataPOID.FINAL_DELIVERY_DATE ? DataPOID.FINAL_DELIVERY_DATE : DataPOID.ORIGINAL_DELIVERY_DATE,
                PLAN_EXFACTORY_DATE: DataPOID.PLAN_EXFACTORY_DATE ? DataPOID.PLAN_EXFACTORY_DATE : null,
                PRODUCTION_MONTH: moment(DataPOID.PRODUCTION_MONTH, "YYYY-MM").format("MMMM/YYYY"),
                SHIPPING_TERMS_CODE: DataPOID.SHIPPING_TERMS_CODE,
                PRICE_TYPE: DataPOID.PRICE_TYPE,
                UNIT_PRICE: DataPOID.UNIT_PRICE,
                MO_COST: DataPOID.MO_COST,
                REVISED_UNIT_PRICE: DataPOID.REVISED_UNIT_PRICE,
                ORDER_UOM: DataPOID.ORDER_UOM,
                ORDER_QTY: DataPOID.ORDER_QTY,
                MO_QTY: DataPOID.MO_QTY,
                TOTAL_ORDER_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.ORDER_QTY),
                TOTAL_MO_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.MO_QTY),
                SCRAP_PERCENTAGE: DataPOID.SCRAP_PERCENTAGE,
                NOTE_REMARKS: DataPOID.NOTE_REMARKS,
                CURRENCY_CODE: DataPOID.CURRENCY_CODE,
                DELIVERY_TERM: DataPOID.SHIPPING_TERMS_CODE,
                PO_CREATED_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                CREATE_BY: DataPOID.CREATE_BY
            });

            // add to log order status change
            await ModelOrderPOListingLogStatus.create({
                ORDER_ID: DataPOID.ORDER_ID,
                ORDER_PO_ID: newPOID,
                PO_STATUS: 'Open',
                CREATE_BY: DataPOID.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        return res.status(200).json({
            success: true,
            message: "success post po listing"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post po listing"
        });
    }
}


export const postPOSizeListing = async (req, res) => {
    try {
        const {DataPOSize} = req.body;
        for (const data of DataPOSize) {
            if (data.ID_POL_SIZE) {
                await OrderPoListingSize.update({
                    MANUFACTURING_COMPANY: data.MANUFACTURING_COMPANY,
                    ORDER_PLACEMENT_COMPANY: data.ORDER_PLACEMENT_COMPANY,
                    CUSTOMER_NAME: data.CUSTOMER_NAME,
                    CUSTOMER_DIVISION: data.CUSTOMER_DIVISION,
                    CUSTOMER_SEASON: data.CUSTOMER_SEASON,
                    CUSTOMER_PROGRAM: data.CUSTOMER_PROGRAM,
                    CUSTOMER_BUY_PLAN: data.CUSTOMER_BUY_PLAN,
                    ORDER_NO: data.ORDER_NO,
                    ORDER_REFERENCE_PO_NO: data.ORDER_REFERENCE_PO_NO,
                    ORDER_STYLE_DESCRIPTION: data.ORDER_STYLE_DESCRIPTION,
                    PO_STATUS: data.PO_STATUS,
                    MO_AVAILABILITY: data.MO_AVAILABILITY,
                    MO_NO: data.MO_NO,
                    MO_RELEASED_DATE: data.MO_RELEASED_DATE,
                    PO_REF_CODE: data.PO_REF_CODE,
                    PRODUCT_ITEM_ID: data.PRODUCT_ITEM_ID,
                    PRODUCT_ITEM_CODE: data.PRODUCT_ITEM_CODE,
                    PRODUCT_ITEM_DESCRIPTION: data.PRODUCT_ITEM_DESCRIPTION,
                    ITEM_COLOR_ID: data.ITEM_COLOR_ID,
                    ITEM_COLOR_CODE: data.ITEM_COLOR_CODE,
                    ITEM_COLOR_NAME: data.ITEM_COLOR_NAME,
                    SIZE_CODE: data.SIZE_CODE,
                    ORDER_QTY: data.ORDER_QTY,
                    MO_QTY: data.MO_QTY,
                    SHIPMENT_PO_QTY: data.SHIPMENT_PO_QTY,
                    ORDER_UOM: data.ORDER_UOM,
                    SHIPPED_QTY: data.SHIPPED_QTY,
                    DELIVERY_LOCATION_ID: data.DELIVERY_LOCATION_ID,
                    DELIVERY_LOCATION_NAME: data.DELIVERY_LOCATION_NAME,
                    COUNTRY: data.COUNTRY,
                    FINAL_DELIVERY_DATE: data.FINAL_DELIVERY_DATE,
                    PLAN_EXFACTORY_DATE: data.PLAN_EXFACTORY_DATE,
                    PRODUCTION_MONTH: data.PRODUCTION_MONTH,
                    MANUFACTURING_SITE: data.MANUFACTURING_COMPANY,
                    SIZE_ID: data.SIZE_ID,
                    SIZE_DESCRIPTION: data.SIZE_DESCRIPTION
                }, {
                    where: {
                        ORDER_PO_ID: data.ORDER_PO_ID,
                        ID_POL_SIZE: data.ID_POL_SIZE,
                    }
                });
            } else {
                await OrderPoListingSize.create({
                    MANUFACTURING_COMPANY: data.MANUFACTURING_COMPANY,
                    ORDER_PLACEMENT_COMPANY: data.ORDER_PLACEMENT_COMPANY,
                    CUSTOMER_NAME: data.CUSTOMER_NAME,
                    CUSTOMER_DIVISION: data.CUSTOMER_DIVISION,
                    CUSTOMER_SEASON: data.CUSTOMER_SEASON,
                    CUSTOMER_PROGRAM: data.CUSTOMER_PROGRAM,
                    CUSTOMER_BUY_PLAN: data.CUSTOMER_BUY_PLAN,
                    ORDER_NO: data.ORDER_NO,
                    ORDER_REFERENCE_PO_NO: data.ORDER_REFERENCE_PO_NO,
                    ORDER_STYLE_DESCRIPTION: data.ORDER_STYLE_DESCRIPTION,
                    PO_STATUS: data.PO_STATUS,
                    MO_AVAILABILITY: data.MO_AVAILABILITY,
                    MO_NO: data.MO_NO,
                    MO_RELEASED_DATE: data.MO_RELEASED_DATE,
                    PO_REF_CODE: data.PO_REF_CODE,
                    PRODUCT_ITEM_ID: data.PRODUCT_ITEM_ID,
                    PRODUCT_ITEM_CODE: data.PRODUCT_ITEM_CODE,
                    PRODUCT_ITEM_DESCRIPTION: data.PRODUCT_ITEM_DESCRIPTION,
                    ITEM_COLOR_ID: data.ITEM_COLOR_ID,
                    ITEM_COLOR_CODE: data.ITEM_COLOR_CODE,
                    ITEM_COLOR_NAME: data.ITEM_COLOR_NAME,
                    SIZE_CODE: data.SIZE_CODE,
                    ORDER_QTY: data.ORDER_QTY,
                    MO_QTY: data.MO_QTY,
                    SHIPMENT_PO_QTY: data.SHIPMENT_PO_QTY,
                    ORDER_UOM: data.ORDER_UOM,
                    SHIPPED_QTY: data.SHIPPED_QTY,
                    DELIVERY_LOCATION_ID: data.DELIVERY_LOCATION_ID,
                    DELIVERY_LOCATION_NAME: data.DELIVERY_LOCATION_NAME,
                    COUNTRY: data.COUNTRY,
                    FINAL_DELIVERY_DATE: data.FINAL_DELIVERY_DATE,
                    PLAN_EXFACTORY_DATE: data.PLAN_EXFACTORY_DATE,
                    PRODUCTION_MONTH: data.PRODUCTION_MONTH,
                    MANUFACTURING_SITE: data.MANUFACTURING_COMPANY,
                    SIZE_ID: data.SIZE_ID,
                    SIZE_DESCRIPTION: data.SIZE_DESCRIPTION,
                    ORDER_PO_ID: data.ORDER_PO_ID,
                });
            }
        }

        return res.status(200).json({
            success: 200,
            message: "success post po size"
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post po size"
        });
    }
}

export const getSupplyChainPlanningByOrderID = async(req,res)=> {
    try {
        const { ORDER_ID } = req.query;
        const getData = await db.query(querySupplyChainPlanningByOrderID, {
            replacements: {
                orderID: ORDER_ID
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: 200,
            message: "success get data supply chain planning",
            data: getData
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get supply chain planning by order id"
        });
    }
}

export const postSupplyChainPlanning = async(req,res) => {
    try {
        const { DataSupplyChainPlanning } = req.body;
        if(DataSupplyChainPlanning.ID_SCP){
            await ModelSupplyChainPlanning.update({
                ORDER_ID: DataSupplyChainPlanning.ORDER_ID,
                ITEM_GROUP_ID: DataSupplyChainPlanning.ITEM_GROUP_ID,
                ITEM_TYPE_ID: DataSupplyChainPlanning.ITEM_TYPE_ID,
                ITEM_CATEGORY_ID: DataSupplyChainPlanning.ITEM_CATEGORY_ID,
                ITEM_ID: DataSupplyChainPlanning.ITEM_ID,
                ITEM_CODE: DataSupplyChainPlanning.ITEM_CODE,
                VENDOR_ID: DataSupplyChainPlanning.VENDOR_ID,
                ORDER_LEAD_TIME: DataSupplyChainPlanning.ORDER_LEAD_TIME,
                DELIVERY_LEAD_TIME: DataSupplyChainPlanning.DELIVERY_LEAD_TIME,
                DELIVERY_MODE_CODE: DataSupplyChainPlanning.DELIVERY_MODE_CODE,
                GREIGE_LEAD_TIME: DataSupplyChainPlanning.GREIGE_LEAD_TIME,
                PRODUCTION_LEAD_TIME: DataSupplyChainPlanning.PRODUCTION_LEAD_TIME,
                INSPECTION_LEAD_TIME: DataSupplyChainPlanning.INSPECTION_LEAD_TIME,
                OTHER_LEAD_TIME: DataSupplyChainPlanning.OTHER_LEAD_TIME,
                UPDATE_BY: DataSupplyChainPlanning.CREATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    ID_SCP: DataSupplyChainPlanning.ID_SCP
                }
            });
        } else {
            await ModelSupplyChainPlanning.create({
                ORDER_ID: DataSupplyChainPlanning.ORDER_ID,
                ITEM_GROUP_ID: DataSupplyChainPlanning.ITEM_GROUP_ID,
                ITEM_TYPE_ID: DataSupplyChainPlanning.ITEM_TYPE_ID,
                ITEM_CATEGORY_ID: DataSupplyChainPlanning.ITEM_CATEGORY_ID,
                ITEM_ID: DataSupplyChainPlanning.ITEM_ID,
                ITEM_CODE: DataSupplyChainPlanning.ITEM_CODE,
                VENDOR_ID: DataSupplyChainPlanning.VENDOR_ID,
                ORDER_LEAD_TIME: DataSupplyChainPlanning.ORDER_LEAD_TIME,
                DELIVERY_LEAD_TIME: DataSupplyChainPlanning.DELIVERY_LEAD_TIME,
                DELIVERY_MODE_CODE: DataSupplyChainPlanning.DELIVERY_MODE_CODE,
                GREIGE_LEAD_TIME: DataSupplyChainPlanning.GREIGE_LEAD_TIME,
                PRODUCTION_LEAD_TIME: DataSupplyChainPlanning.PRODUCTION_LEAD_TIME,
                INSPECTION_LEAD_TIME: DataSupplyChainPlanning.INSPECTION_LEAD_TIME,
                OTHER_LEAD_TIME: DataSupplyChainPlanning.OTHER_LEAD_TIME,
                CREATE_BY: DataSupplyChainPlanning.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        }
        return res.status(200).json({
            success: 200,
            message: "success post supply chain planning"
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post supply chain planning"
        });
    }
}

export const postMasterOrderPlanning = async(req,res) => {
    try {
        const { DataMOP } = req.body;
        await ModelOrderPOHeader.update({
            PLAN_CUT_DATE: DataMOP.PLAN_CUT_DATE,
            PLAN_SEW_DATE: DataMOP.PLAN_SEW_DATE,
            PLAN_FIN_DATE: DataMOP.PLAN_FIN_DATE,
            PLAN_PP_MEETING: DataMOP.PLAN_PP_MEETING
        }, {
            where: {
                ORDER_ID: DataMOP.ORDER_ID
            }
        })
        return res.status(200).json({
            success: 200,
            message: "success post master order planning"
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post master order planning"
        });
    }
}

export const getLogOrderPOIDStatus = async (req, res) => {
    try {
        const { ORDER_ID, ORDER_PO_ID } = req.query;
        if (!ORDER_ID || !ORDER_PO_ID) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters"
            });
        }
        
        const logs = await db.query(queryGetListPOIDStatus, {
            replacements: {
                orderID: ORDER_ID,
                orderPOID: ORDER_PO_ID
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get log order po id status",
            data: logs
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get log order po id status"
        });
    }
}

export const postUpdateOrderPOIDStatus = async (req, res) => {
    try {
        const { ORDER_ID, ORDER_PO_ID, PO_STATUS, CREATE_BY } = req.query;
        if(!ORDER_ID || !ORDER_PO_ID || !PO_STATUS || !CREATE_BY) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters"
            });
        }
        
        // Update the order status for the specified ORDER_ID and ORDER_PO_ID
        await OrderPoListing.update({
            PO_STATUS: PO_STATUS,
            UPDATE_BY: CREATE_BY,
            UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: {
                ORDER_NO: ORDER_ID,
                ORDER_PO_ID: ORDER_PO_ID
            }
        });

        // add to log order status change
        await ModelOrderPOListingLogStatus.create({
            ORDER_ID: ORDER_ID,
            ORDER_PO_ID: ORDER_PO_ID,
            PO_STATUS: PO_STATUS,
            CREATE_BY: CREATE_BY,
            CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
        });

        return res.status(200).json({
            success: true,
            message: "success update order po id status"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error update order po id status"
        });
    }
}


export const getListMOIDByOrderID = async (req, res) => {
    try { 
        const { orderID} = req.params;
        const listDetail = await db.query(queryGetMOListingByOrderID, {
            replacements: {
                orderID: orderID
            }, type: QueryTypes.SELECT
        });
        
        return res.status(200).json({
            success: true,
            message: "success get list mo detail by order id",
            data: listDetail
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get mo detail by order id"
        });
    }
}

export const changeMOListingStatus = async(req,res) => {
    try {
        const {DataMOID} = req.body;
        
        // Update Status MO
        await OrderMOListing.update({
            MO_STATUS: DataMOID.NEW_MO_STATUS
        }, {
            where: {
                MO_ID: DataMOID.MO_ID,
                ORDER_ID: DataMOID.ORDER_ID
            }
        });

        // Update POID Status if Status is Released to Production
        if(DataMOID.NEW_MO_STATUS==='Released to Production'){
            await OrderPoListing.update({
                PO_STATUS: 'Released to Production',
                MO_RELEASED_DATE: moment().format('YYYY-MM-DD')
            }, {
                where: {
                    MO_ID: DataMOID.MO_ID,
                    ORDER_ID: DataMOID.ORDER_ID
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "success change mo status",
        });

        // Update POID Status if MO Status set to be Cancel

    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error delete mo detail"
        });
    }
}

export const postMOListing = async (req, res) => {
    try {
        const {DataMOID} = req.body;
        if (DataMOID.ORDER_MO_ID) {
            await OrderMOListing.update({
                MO_CODE: DataMOID.MO_CODE,
                MO_DESCRIPTION: DataMOID.MO_DESCRIPTION,
                UPDATE_BY: DataMOID.CREATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    ORDER_MO_ID: DataMOID.ORDER_MO_ID,
                    ORDER_ID: DataMOID.ORDER_ID
                }   
            });
        } else {
            // CREATE NEW ORDER PO ID
            const getLastMOID = await OrderMOListing.findOne({order: [['MO_ID', 'DESC']], raw: true});
            const newIncrement = !getLastMOID ? '0000001' : parseInt(getLastMOID.MO_ID.slice(-8)) + 1;
            const newMOID = 'MO' + newIncrement.toString().padStart(8, '0');

            // CREATE DETAIL ORDER PO ID
            await OrderMOListing.create({
                MO_ID: newMOID,
                MO_CODE: DataMOID.MO_CODE,
                MO_DESCRIPTION: DataMOID.MO_DESCRIPTION,
                ORDER_ID: DataMOID.ORDER_ID,
                CREATE_BY: DataMOID.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });

            // CHECK IS LIST_POID IS ARRAY OR OBJECT
            const listPOID = Array.isArray(DataMOID.LIST_POID) ? DataMOID.LIST_POID : [DataMOID.LIST_POID];

            // UPDATE POID MO NO
            for (const poid of listPOID) {
                await OrderPoListing.update({
                    MO_AVAILABILITY: 'Yes',
                    MO_NO: newMOID,
                    MO_RELEASED_DATE: moment().format('YYYY-MM-DD'),
                    UPDATE_BY: DataMOID.CREATE_BY,
                    UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: {
                        ORDER_NO: DataMOID.ORDER_ID,
                        ORDER_PO_ID: poid.ORDER_PO_ID
                    }   
                });
            }
        }
        return res.status(200).json({
            success: true,
            message: "success post mo listing"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post mo listing"
        });
    }
}