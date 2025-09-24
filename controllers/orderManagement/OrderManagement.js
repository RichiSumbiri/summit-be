import {Op, QueryTypes} from "sequelize";
import db from "../../config/database.js";
import {
    ModelMasterOrderExecuteInfo,
    ModelOrderPOAlteration,
    ModelOrderPOHeader,
    ModelOrderPOHeaderLogStatus,
    ModelOrderPOListingLogStatus,
    ModelOrderPOListingSizeLogRevision,
    ModelOrderRoute,
    ModelSupplyChainPlanning,
    OrderMOListing,
    queryCheckBOMStructureByOrderIDAndItemTypeCode,
    queryCheckTNAEventStatusByOrderID,
    queryDetailPOSizeRevision,
    queryGetAllPOIDByOrderID,
    queryGetDefaultProcessRoute,
    queryGetListOrderHeader,
    queryGetListPOIDStatus,
    queryGetLogPOListingSizeRevision,
    queryGetLogStatusOrderHeaderByOrderID,
    queryGetMOListingByOrderID,
    queryGetOrderInventoryDetail,
    queryGetSizeByGMT,
    queryListOrderPOAlteration,
    queryRecapPOListingDetail,
    queryRecapPOListingSize,
    queryRecapToPOMatrixDelivery,
    querySupplyChainPlanningByOrderID
} from "../../models/orderManagement/orderManagement.mod.js";
import {OrderPoListing, OrderPoListingSize, PoMatrixDelivery} from "../../models/production/order.mod.js";
import moment from "moment";
import MasterItemIdModel, { MasterItemIdAttributesModel } from "../../models/system/masterItemId.mod.js";
import {
    CustomerDetail,
    CustomerProductDivision,
    CustomerProductSeason,
    CustomerProgramName
} from "../../models/system/customer.mod.js";
import { orderitemSMV } from "../../models/orderManagement/orderitemSMV.mod.js";
import BomStructureModel, { BomStructureListModel } from "../../models/system/bomStructure.mod.js";
import { ModelVendorDetail } from "../../models/system/VendorDetail.mod.js";
import Users from "../../models/setup/users.mod.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";
import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";
import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";
import BomTemplateModel, { BomTemplateColor } from "../../models/materialManagement/bomTemplate/bomTemplate.mod.js";
import MasterCompanyModel from "../../models/setup/company.mod.js";
import { MasterOrderType } from "../../models/setup/orderType.mod.js";
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

        // Add log log Order Header
        await ModelOrderPOHeaderLogStatus.create({
            ORDER_ID: ORDER_ID,
            ORDER_STATUS: NEW_STATUS,
            CREATE_BY: UPDATE_BY,
            CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
        })

            
        return res.status(200).json({
            success: true,
            message: "success change order header status"
        });

    } catch(err){
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
            
            // GET SIZE LISTING BY GMT
            const ListSize = await db.query(queryGetSizeByGMT, {
                replacements: {
                    itemID: DataHeader.ITEM_ID
                },
                type: QueryTypes.SELECT
            });

            if(ListSize.length===0){
                return res.status(400).json({
                    success: false,
                    message: `Please Check Size Allocation for Item ${DataHeader.ITEM_ID}`
                });
            }
            
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
                SIZE_TEMPLATE_LIST: JSON.stringify(ListSize),
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

export const getOrderHeaderLogStatus = async(req,res) => {
    try {
        const { ORDER_ID } = req.query;
        if(!ORDER_ID){
            return res.status(400).json({
                success: false,
                message: "failed get order header log status",
            });    
        }
        const getLog = await db.query(queryGetLogStatusOrderHeaderByOrderID, {
            replacements: {
                orderID: ORDER_ID
            },
            type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get order header log status",
            data: getLog
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order header log status"
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

export const getPOSizeListingCheck = async(req,res) => {
    try {
        const { ORDER_ID } = req.query;
        if(!ORDER_ID){
            return res.status(400).json({
                success: false,
                error: err,
                message: "error missing parameter"
            });
        }

        const CheckData = await OrderPoListingSize.findAll({
            where: {
                ORDER_NO: ORDER_ID
            }
        });

        return res.status(200).json({
            success: true,
            message: `success check order po listing size for order ${ORDER_ID}`,
            data: CheckData.length
        });


    } catch(err){
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
    const {ORDER_TYPE_CODE, ORDER_STATUS, IS_BOM_STRUCTURE} = req.query

    const where = {}
    if (ORDER_TYPE_CODE) {
        where.ORDER_TYPE_CODE = ORDER_TYPE_CODE
    }
    if (ORDER_STATUS) {
        where.ORDER_STATUS = ORDER_STATUS
    }

    if (IS_BOM_STRUCTURE) {
        const bomStrcucture = await BomStructureModel.findAll({
            where: {
                IS_DELETED: false
            }
        })

        where.ORDER_ID = {
            [Op.notIn]: bomStrcucture.map((item) => item.ORDER_ID)
        }
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
        const { DataPOID } = req.body;
        
        console.log(DataPOID);

        // CHECK MASTER ORDER TYPE
        const getMasterOrderType = await MasterOrderType.findOne({ where: { TYPE_CODE:(DataPOID.ORDER_ID).substring(0,3) }});
            
        // CHECK BOM TEMPLATE BASE ON GMT & ORDER TYPE
        const getBOMTemplateID = await BomTemplateModel.findOne({
            where: {
                MASTER_ITEM_ID: DataPOID.PRODUCT_ITEM_ID,
                CUSTOMER_ID: DataPOID.CUSTOMER_ID,
                ORDER_TYPE_ID: getMasterOrderType.TYPE_ID
            },
            raw: true
        });

        if(!getBOMTemplateID){
            return res.status(400).json({
                success: true,
                message: "Please create BOM Template for Item " + DataPOID.PRODUCT_ITEM_ID
            });
        }

        // CHECK BOM TEMPLATE COLOR
        const getBOMTemplateColor = await BomTemplateColor.findOne({
            where: {
                BOM_TEMPLATE_ID: getBOMTemplateID.ID,
                REV_ID: getBOMTemplateID.LAST_REV_ID,
                COLOR_ID: DataPOID.ITEM_COLOR_ID
            }
        });

        if(!getBOMTemplateColor){
            return res.status(400).json({
                success: true,
                message: `Please add color ${DataPOID.ITEM_COLOR_CODE} to BOM Template ${DataPOID.PRODUCT_ITEM_ID}`
            });
        }


        if (DataPOID.ORDER_PO_ID) {
            await OrderPoListing.update({
                MANUFACTURING_COMPANY: DataPOID.MANUFACTURING_COMPANY,
                MANUFACTURING_SITE: DataPOID.MANUFACTURING_SITE,
                ORDER_PLACEMENT_COMPANY: DataPOID.ORDER_PLACEMENT_COMPANY,
                ORDER_TYPE_CODE: DataPOID.ORDER_TYPE_CODE,
                // ORDER_NO: DataPOID.ORDER_ID,
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
                UNIT_PRICE_FINAL: DataPOID.UNIT_PRICE,
                MO_COST: DataPOID.MO_COST,
                ORDER_UOM: DataPOID.ORDER_UOM,
                ORDER_QTY: parseInt(DataPOID.ORDER_QTY),
                MO_QTY: parseInt(DataPOID.MO_QTY),
                TOTAL_ORDER_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.ORDER_QTY),
                TOTAL_MO_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.MO_QTY),
                SCRAP_PERCENTAGE: parseFloat(DataPOID.SCRAP_PERCENTAGE),
                CURRENCY_CODE: DataPOID.CURRENCY_CODE,
                NOTE_REMARKS: DataPOID.NOTE_REMARKS,
                DELIVERY_TERM: DataPOID.SHIPPING_TERMS_CODE,
                PO_CREATED_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                UPDATE_BY: DataPOID.CREATE_BY
            }, {
                where: {
                    ORDER_PO_ID: DataPOID.ORDER_PO_ID
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
                UNIT_PRICE_FINAL: DataPOID.UNIT_PRICE,
                MO_COST: DataPOID.MO_COST,
                ORDER_UOM: DataPOID.ORDER_UOM,
                ORDER_QTY: parseInt(DataPOID.ORDER_QTY),
                MO_QTY: parseInt(DataPOID.MO_QTY),
                TOTAL_ORDER_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.ORDER_QTY),
                TOTAL_MO_COST: parseFloat(DataPOID.UNIT_PRICE) * parseInt(DataPOID.MO_QTY),
                SCRAP_PERCENTAGE: parseInt(DataPOID.SCRAP_PERCENTAGE),
                NOTE_REMARKS: DataPOID.NOTE_REMARKS,
                CURRENCY_CODE: DataPOID.CURRENCY_CODE,
                DELIVERY_TERM: DataPOID.SHIPPING_TERMS_CODE,
                PO_CREATED_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                CREATE_BY: DataPOID.CREATE_BY,
                SUMMIT_FLAG: 1
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

        
        // create recap PO Matrix Delivery
        const recapPOMatrix = await db.query(queryRecapToPOMatrixDelivery, { replacements: { orderID: DataPOID.ORDER_ID }, type: QueryTypes.SELECT });
        // clean + normalize data
        const cleanRecap = recapPOMatrix.map(row => ({
            SITE_CODE: row.SITE_CODE,
            PROD_MONTH: moment(row.PROD_MONTH, "YYYY-MM").format("MMMM/YYYY"),
            BUYER_CODE: row.BUYER_CODE,
            ORDER_NO: row.ORDER_NO,
            ORDER_REF_NO: row.ORDER_REF_NO,
            ORDER_PO_STYLE_REF: row.ORDER_PO_STYLE_REF,
            COLOR_CODE: row.COLOR_CODE,
            COLOR_NAME: row.COLOR_NAME,
            PACKING_METHOD: row.PACKING_METHOD,
            EX_FACTORY: row.EX_FACTORY, // already JS Date, Sequelize will map to DATE
            SIZE_CODE: row.SIZE_CODE,
            TOTAL_QTY: parseInt(row.TOTAL_QTY), // ⚡ convert to number
            PDM_ADD_DATE: row.PDM_ADD_DATE,
            PDM_MOD_DATE: row.PDM_MOD_DATE,
            PDM_MOD_ID: row.PDM_MOD_ID,
            PDM_ADD_ID: row.PDM_ADD_ID
        }));
        await PoMatrixDelivery.destroy({ where: { ORDER_NO: DataPOID.ORDER_ID } });
        await PoMatrixDelivery.bulkCreate(cleanRecap);
        
        return res.status(200).json({
            success: true,
            message: "success post po listing"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post po listing"
        });
    }
}


export const postPOSizeListing = async (req, res) => {
    try {
        const { DataPOSize } = req.body;
        for (const data of DataPOSize) {
            const CheckData = await OrderPoListingSize.findOne({ where: { ORDER_PO_ID: data.ORDER_PO_ID, SIZE_CODE: data.SIZE_CODE }, raw: true});
            if (CheckData) {
                // delete data po size jika null order qty & mo qty
                if(data.ORDER_QTY==='' && data.MO_QTY===''){
                    await OrderPoListingSize.destroy({ where: { ORDER_PO_ID: data.ORDER_PO_ID, SIZE_CODE: data.SIZE_CODE }, raw: true})
                } else {
                    // update data po size
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
                        PRODUCT_ID: data.PRODUCT_ID,
                        PRODUCT_TYPE: data.PRODUCT_TYPE,
                        PRODUCT_CATEGORY: data.PRODUCT_CATEGORY,
                        ORDER_QTY: data.ORDER_QTY==='' ? null : data.ORDER_QTY,
                        MO_QTY: data.MO_QTY==='' ? null:data.MO_QTY,
                        SHIPMENT_PO_QTY: data.SHIPMENT_PO_QTY,
                        ORDER_UOM: data.ORDER_UOM,
                        UNIT_PRICE: data.UNIT_PRICE,
                        SHIPPED_QTY: data.SHIPPED_QTY,
                        DELIVERY_LOCATION_ID: data.DELIVERY_LOCATION_ID,
                        DELIVERY_LOCATION_NAME: data.DELIVERY_LOCATION_NAME,
                        COUNTRY: data.COUNTRY,
                        FINAL_DELIVERY_DATE: data.FINAL_DELIVERY_DATE,
                        PLAN_EXFACTORY_DATE: data.PLAN_EXFACTORY_DATE,
                        PRODUCTION_MONTH: data.PRODUCTION_MONTH,
                        MANUFACTURING_SITE: data.MANUFACTURING_SITE,
                        SIZE_ID: data.SIZE_ID,
                        SIZE_DESCRIPTION: data.SIZE_DESCRIPTION,
                        REV_ID: data.PO_STATUS==='Open' ? parseInt(CheckData.REV_ID) : parseInt(CheckData.REV_ID) + 1,
                        REV_NOTE: data.REV_NOTE,
                        UPDATE_BY: data.UPDATE_BY,
                        UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, {
                        where: {
                            ORDER_PO_ID: data.ORDER_PO_ID,
                            SIZE_ID: data.SIZE_ID,
                            SIZE_CODE: data.SIZE_CODE,
                        }
                    });
                }

                // check po status
                if(data.PO_STATUS==='Open'){
                    if(parseInt(data.ORDER_QTY)!==0 || parseInt(data.MO_QTY)!==0){
                        // update existing po size listing log revision
                        await ModelOrderPOListingSizeLogRevision.update({
                                REV_NOTE: data.REV_NOTE,
                                ORDER_QTY: data.ORDER_QTY,
                                MO_QTY: data.MO_QTY,
                                UNIT_PRICE: data.UNIT_PRICE,
                                CREATE_ID: data.CREATE_BY,
                                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
                        }, {
                            where: {
                                ORDER_NO: data.ORDER_NO,
                                ORDER_PO_ID: data.ORDER_PO_ID,
                                REV_ID: parseInt(data.REV_ID),
                                SIZE_ID: data.SIZE_ID,
                                SIZE_CODE: data.SIZE_CODE
                            }
                        });    
                    } else {
                        // delete existing po size listing log revision
                        await ModelOrderPOListingSizeLogRevision.destroy({
                            where: {
                                ORDER_NO: data.ORDER_NO,
                                ORDER_PO_ID: data.ORDER_PO_ID,
                                REV_ID: parseInt(data.REV_ID),
                                SIZE_ID: data.SIZE_ID,
                                SIZE_CODE: data.SIZE_CODE
                            }
                        });
                    }
                } else {
                    // add new data to po size listing log revision
                    await ModelOrderPOListingSizeLogRevision.create({
                            ORDER_NO: data.ORDER_NO,
                            ORDER_PO_ID: data.ORDER_PO_ID,
                            REV_ID: parseInt(data.REV_ID) + 1,
                            REV_NOTE: data.REV_NOTE,
                            SIZE_ID: data.SIZE_ID,
                            SIZE_CODE: data.SIZE_CODE,
                            ORDER_QTY: parseInt(data.ORDER_QTY),
                            MO_QTY: parseInt(data.MO_QTY),
                            UNIT_PRICE: data.UNIT_PRICE,
                            CREATE_ID: data.CREATE_BY,
                            CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                }
                
            } else {
                if(data.ORDER_NO && data.ORDER_PO_ID && data.SIZE_CODE && data.ORDER_QTY!==''){
                    // add data to po size listing log revision
                    await ModelOrderPOListingSizeLogRevision.create({
                        ORDER_NO: data.ORDER_NO,
                        ORDER_PO_ID: data.ORDER_PO_ID,
                        REV_ID: parseInt(data.REV_ID),
                        REV_NOTE: data.REV_NOTE,
                        SIZE_ID: data.SIZE_ID,
                        SIZE_CODE: data.SIZE_CODE,
                        ORDER_QTY: parseInt(data.ORDER_QTY),
                        MO_QTY: parseInt(data.MO_QTY),
                        UNIT_PRICE: data.UNIT_PRICE,
                        CREATE_ID: data.CREATE_BY
                    });

                    // buat data po size
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
                        PRODUCT_ID: data.PRODUCT_ID,
                        PRODUCT_TYPE: data.PRODUCT_TYPE,
                        PRODUCT_CATEGORY: data.PRODUCT_CATEGORY,
                        ORDER_QTY: parseInt(data.ORDER_QTY),
                        MO_QTY: parseInt(data.MO_QTY),
                        SHIPMENT_PO_QTY: parseInt(data.SHIPMENT_PO_QTY),
                        ORDER_UOM: data.ORDER_UOM,
                        SHIPPED_QTY: parseInt(data.SHIPPED_QTY),
                        UNIT_PRICE: data.UNIT_PRICE,
                        DELIVERY_LOCATION_ID: data.DELIVERY_LOCATION_ID,
                        DELIVERY_LOCATION_NAME: data.DELIVERY_LOCATION_NAME,
                        COUNTRY: data.COUNTRY,
                        FINAL_DELIVERY_DATE: data.FINAL_DELIVERY_DATE,
                        PLAN_EXFACTORY_DATE: data.PLAN_EXFACTORY_DATE,
                        PRODUCTION_MONTH: data.PRODUCTION_MONTH,
                        MANUFACTURING_SITE: data.MANUFACTURING_SITE,
                        SIZE_ID: data.SIZE_ID,
                        SIZE_CODE: data.SIZE_CODE,
                        SIZE_DESCRIPTION: data.SIZE_DESCRIPTION,
                        ORDER_PO_ID: data.ORDER_PO_ID,
                        REV_ID: 0,
                        REV_NOTE: data.REV_NOTE,
                        CREATE_BY: data.CREATE_BY,
                        CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                        SUMMIT_FLAG: 1
                    });
                }
            }
        }

        const CheckOrderID = DataPOSize.filter((dd=>dd.ORDER_NO));

        // trigger bom structure revision
        await BomStructureModel.update({ IS_NOT_ALLOW_REVISION:0 },{ where: { ORDER_ID: CheckOrderID[0].ORDER_NO }});

        // create recap PO Matrix Delivery
        const recapPOMatrix = await db.query(queryRecapToPOMatrixDelivery, { replacements: { orderID: CheckOrderID[0].ORDER_NO }, type: QueryTypes.SELECT });
        // clean + normalize data
        const cleanRecap = recapPOMatrix.map(row => ({
            SITE_CODE: row.SITE_CODE,
            PROD_MONTH: moment(row.PROD_MONTH, "YYYY-MM").format("MMMM/YYYY"),
            BUYER_CODE: row.BUYER_CODE,
            ORDER_NO: row.ORDER_NO,
            ORDER_REF_NO: row.ORDER_REF_NO,
            ORDER_PO_STYLE_REF: row.ORDER_PO_STYLE_REF,
            COLOR_CODE: row.COLOR_CODE,
            COLOR_NAME: row.COLOR_NAME,
            PACKING_METHOD: row.PACKING_METHOD,
            EX_FACTORY: moment(row.EX_FACTORY).format('YYYY-MM-DD'),
            SIZE_CODE: row.SIZE_CODE,
            TOTAL_QTY: parseInt(row.TOTAL_QTY), 
            PDM_ADD_DATE: row.PDM_ADD_DATE ? moment(row.PDM_ADD_DATE).format('YYYY-MM-DD HH:mm:ss') : null,
            PDM_MOD_DATE: row.PDM_MOD_DATE ? moment(row.PDM_MOD_DATE).format('YYYY-MM-DD HH:mm:ss') : null,
            PDM_MOD_ID: row.PDM_MOD_ID,
            PDM_ADD_ID: row.PDM_ADD_ID
        }));
        await PoMatrixDelivery.destroy({ where: { ORDER_NO: CheckOrderID[0].ORDER_NO } });
        await PoMatrixDelivery.bulkCreate(cleanRecap);
        
        return res.status(200).json({
            success: 200,
            message: "success post po size"
        });
    } catch (err) {
        console.error(err);
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
        
        // check if post status is CONFIRMED then check for order SMV
        if(PO_STATUS==='Confirmed'){
            const CheckOrderSMV = await orderitemSMV.findAll({
                where: {
                    ORDER_ID: ORDER_ID
                }, raw: true
            });
            if(CheckOrderSMV.length===0){
                return res.status(400).json({
                    success: false,
                    message: "Please set Order Item SMV for this Order!"
                }); 
            }
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

        // Update the order size status for the specified ORDER_ID and ORDER_PO_ID
        await OrderPoListingSize.update({
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


        // create recap PO Matrix Delivery
        const recapPOMatrix = await db.query(queryRecapToPOMatrixDelivery, { replacements: { orderID: ORDER_ID }, type: QueryTypes.SELECT });
        // clean + normalize data
        const cleanRecap = recapPOMatrix.map(row => ({
            SITE_CODE: row.SITE_CODE,
            PROD_MONTH: moment(row.PROD_MONTH, "YYYY-MM").format("MMMM/YYYY"),
            BUYER_CODE: row.BUYER_CODE,
            ORDER_NO: row.ORDER_NO,
            ORDER_REF_NO: row.ORDER_REF_NO,
            ORDER_PO_STYLE_REF: row.ORDER_PO_STYLE_REF,
            COLOR_CODE: row.COLOR_CODE,
            COLOR_NAME: row.COLOR_NAME,
            PACKING_METHOD: row.PACKING_METHOD,
            EX_FACTORY: row.EX_FACTORY, // already JS Date, Sequelize will map to DATE
            SIZE_CODE: row.SIZE_CODE,
            TOTAL_QTY: parseInt(row.TOTAL_QTY), // ⚡ convert to number
            PDM_ADD_DATE: row.PDM_ADD_DATE,
            PDM_MOD_DATE: row.PDM_MOD_DATE,
            PDM_MOD_ID: row.PDM_MOD_ID,
            PDM_ADD_ID: row.PDM_ADD_ID
        }));
        await PoMatrixDelivery.destroy({ where: { ORDER_NO: ORDER_ID } });
        await PoMatrixDelivery.bulkCreate(cleanRecap);
        
        // update allow revision for bom structure if existing bom structure found
        const CheckBOM = await BomStructureModel.findOne({ where: { ORDER_ID: ORDER_ID } });
        if(CheckBOM) await BomStructureModel.update({ IS_NOT_ALLOW_REVISION: false }, { where: { ORDER_ID: ORDER_ID } });

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
        if(DataMOID.NEW_MO_STATUS==='Released to Production'){
                // update POID
                await OrderPoListing.update({ PO_STATUS: 'Released to Production', MO_RELEASED_DATE: moment().format('YYYY-MM-DD')}, {
                    where: {
                        MO_NO: DataMOID.MO_ID,
                        ORDER_NO: DataMOID.ORDER_ID
                    }
                });
                // update PO Size Listing
                await OrderPoListingSize.update({ PO_STATUS: 'Released to Production', MO_RELEASED_DATE: moment().format('YYYY-MM-DD')}, {
                    where: {
                        MO_NO: DataMOID.MO_ID,
                        ORDER_NO: DataMOID.ORDER_ID
                    }
                });
        } else if(DataMOID.NEW_MO_STATUS==='Canceled' || DataMOID.NEW_MO_STATUS==='Deleted'){
            // update POID
                await OrderPoListing.update({ PO_STATUS:'Confirmed', MO_NO:null, MO_AVAILABILITY:'No', MO_RELEASED_DATE: null }, {
                    where: {
                        MO_NO: DataMOID.MO_ID,
                        ORDER_NO: DataMOID.ORDER_ID
                    }
                });
                // update PO Size Listing
                await OrderPoListingSize.update({ PO_STATUS:'Confirmed', MO_NO:null, MO_AVAILABILITY:'No', MO_RELEASED_DATE: null }, {
                    where: {
                        MO_NO: DataMOID.MO_ID,
                        ORDER_NO: DataMOID.ORDER_ID
                    }
                });
        }
        
        // Update Status MO
        await OrderMOListing.update({ MO_STATUS: DataMOID.NEW_MO_STATUS }, {
            where: {
                MO_ID: DataMOID.MO_ID,
                ORDER_ID: DataMOID.ORDER_ID
            }
        });

        return res.status(200).json({
            success: true,
            message: "success change mo status",
        });

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
                ITEM_COLOR_ID: DataMOID.ITEM_COLOR_ID,
                ITEM_COLOR_CODE: DataMOID.ITEM_COLOR_CODE,
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

            // CREATE DETAIL ORDER MO
            await OrderMOListing.create({
                MO_ID: newMOID,
                MO_CODE: DataMOID.MO_CODE,
                MO_DESCRIPTION: DataMOID.MO_DESCRIPTION,
                ORDER_ID: DataMOID.ORDER_ID,
                ITEM_COLOR_ID: DataMOID.ITEM_COLOR_ID,
                ITEM_COLOR_CODE: DataMOID.ITEM_COLOR_CODE,
                CREATE_BY: DataMOID.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });

            // CHECK IS LIST_POID IS ARRAY OR OBJECT
            const listPOID = Array.isArray(DataMOID.LIST_POID) ? DataMOID.LIST_POID : [DataMOID.LIST_POID];

            // UPDATE POID MO NO
            for (const poid of listPOID) {
                // update po listing
                await OrderPoListing.update({
                    MO_AVAILABILITY: 'Yes',
                    MO_NO: newMOID,
                    UPDATE_BY: DataMOID.CREATE_BY,
                    UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
                }, {
                    where: {
                        ORDER_NO: DataMOID.ORDER_ID,
                        ORDER_PO_ID: poid.ORDER_PO_ID
                    }   
                });
                // update po listing size
                await OrderPoListingSize.update({
                    MO_AVAILABILITY: 'Yes',
                    MO_NO: newMOID,
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


export const getListPOIDByMOID = async(req,res) => {
    try {
        const { ORDER_ID, MO_ID } = req.query;
        const data = await OrderPoListing.findAll({
            where: {
                ORDER_NO: ORDER_ID,
                MO_NO: MO_ID
            }
        });
        return res.status(200).json({
            success: true,
            message: `Success get POID listing by Order ${ORDER_ID} and MO ${MO_ID}`,
            data: data
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get poid listing by po"
        });
    }
}


export const getOrderInventoryDetail = async(req,res) => {
    try {
        const { ORDER_ID } = req.query;
        const getData = await db.query(queryGetOrderInventoryDetail, {
            replacements: {
                OrderID: ORDER_ID
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: `Success get inventory listing by Order ${ORDER_ID}`,
            data: getData
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order inventory detail"
        });
    }
}

export const getOrderExecuteInfo = async(req,res) => {
    try {
        const { ORDER_ID } = req.query;
        
        // init data
        let OrderExecuteInfo = [];
        let BOMRMValidationStatus = 0;
        let BOMSAValidationStatus = 0;
        let BOMPMValidationStatus = 0;
        let BOMPCValidationStatus = 0;
        let TNAValidationStatus = 0;
        let CompValidationStatus = 0;
        let RouteValidationStatus = 0;
        let ActualSMVValidationStatus = 0;
        let PCDValidationStatus = 0;
        let PSDValidationStatus = 0;

        // Get Master Order Execute Info
        OrderExecuteInfo = await ModelMasterOrderExecuteInfo.findAll({ raw: true });
        
        // Check Last Revision of BOM Structure
        const ListBOMLastRev = await BomStructureModel.findOne({
            where: {
                ORDER_ID: ORDER_ID
            }, 
            order: [['LAST_REV_ID', 'DESC']],
            raw: true
        });


        
        if(ListBOMLastRev!==null){
            // Check Status BOM Structure 
            const ListBOMDetail = await db.query(queryCheckBOMStructureByOrderIDAndItemTypeCode, {
                replacements: {
                    orderID: ORDER_ID,
                    lastRevID: ListBOMLastRev.LAST_REV_ID ? ListBOMLastRev.LAST_REV_ID : 0
                },
                type: QueryTypes.SELECT
            });

            // get Check BOM Structure Raw Material : index 1
            const ListBOMRMOpen = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='RM' && bom.STATUS==='Open');
            const ListBOMRMConfirmed = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='RM' && bom.STATUS==='Confirmed');
            BOMRMValidationStatus = ListBOMRMOpen.length===0 && ListBOMRMConfirmed.length > 0 ? 1 : 0;

            // get Check BOM Structure Sewing Accessories : index 2
            const ListBOMSAOpen = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='SA' && bom.STATUS==='Open');
            const ListBOMSAConfirmed = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='SA' && bom.STATUS==='Confirmed');
            BOMSAValidationStatus = ListBOMSAOpen.length===0 && ListBOMSAConfirmed.length > 0 ? 1 : 0;

            // get Check BOM Structure Packaging Material : index 3
            const ListBOMPMOpen = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='PM' && bom.STATUS==='Open');
            const ListBOMPMConfirmed = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='PM' && bom.STATUS==='Confirmed');
            BOMPMValidationStatus = ListBOMPMOpen.length===0 && ListBOMPMConfirmed.length > 0 ? 1 : 0;

            // get Check BOM Structure Production Consumable : index 4
            const ListBOMPCOpen = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='PM' && bom.STATUS==='Open');
            const ListBOMPCConfirmed = ListBOMDetail.filter(bom=> bom.ITEM_TYPE_CODE==='PM' && bom.STATUS==='Confirmed');
            BOMPCValidationStatus = ListBOMPCOpen.length===0 && ListBOMPCConfirmed.length > 0 ? 1 : 0;
        }
        

        // Check TNA PreProduction Event Completion
        const ListTNAStatus = await db.query(queryCheckTNAEventStatusByOrderID, {
            replacements: {
                orderID: ORDER_ID
            },
            type: QueryTypes.SELECT
        });

        if(ListTNAStatus.length!==0){
            const ListTNACompleted = ListTNAStatus.filter((tna=>tna.EVENT_STATUS==='Completed'));
            TNAValidationStatus = ListTNACompleted.length === ListTNAStatus.length ? 1 : 0;
        }

        // Check Component Status
        const CurrentCompStatus = await ModelOrderPOHeader.findOne({where: {ORDER_ID: ORDER_ID}, raw: true});
        if(CurrentCompStatus){
            CompValidationStatus = CurrentCompStatus.COMPONENT_STATUS;
        }

        // Check Order Route
        const CurrentOrderRoute = await ModelOrderRoute.findAll({where: {ORDER_ID: ORDER_ID}, raw: true});
        if(CurrentOrderRoute.length>0){
            RouteValidationStatus = 1;
        } 

        // Check Actual Item SMV -  Sewing
        const CheckSMVSewing = await orderitemSMV.findOne({ where: { ORDER_ID:ORDER_ID, PRODUCTION_PROCESS_ID:2 }, raw: true });
        if(CheckSMVSewing && CheckSMVSewing.ACTUAL_SMV!=='0.0000') ActualSMVValidationStatus=1;


        // Check Target PCD Order
        const CheckPCDOrder = await ModelOrderPOHeader.findOne({ where: { ORDER_ID: ORDER_ID }});
        if(CheckPCDOrder.PLAN_CUT_DATE) PCDValidationStatus = 1;
        if(CheckPCDOrder.PLAN_SEW_DATE) PSDValidationStatus = 1;

        // Set Status for Order Execution Info 
        OrderExecuteInfo = OrderExecuteInfo.map((row) => {
            switch(row.ID){
                case 1: 
                    return {
                        ...row,
                            CURRENT_STATUS: BOMRMValidationStatus,
                    };
                case 2:
                    return {
                        ...row,
                            CURRENT_STATUS: BOMSAValidationStatus,
                    };
                case 3:
                    return {
                        ...row,
                            CURRENT_STATUS: BOMPMValidationStatus,
                };
                case 4:
                    return {
                        ...row,
                            CURRENT_STATUS: BOMPCValidationStatus,
                };
                case 5:
                    if(ORDER_ID.substring(0,3)==='BLK'){
                        return {
                            ...row,
                            CURRENT_STATUS: TNAValidationStatus,
                        };  
                    } else {
                        return {
                            ...row,
                                VALIDATION_DEFAULT: 0,
                                CURRENT_STATUS: BOMPCValidationStatus,
                        };
                    }
                case 6:
                    return {
                            ...row,
                        CURRENT_STATUS: CompValidationStatus,
                    };
                case 7:
                    return {
                            ...row,
                        CURRENT_STATUS: RouteValidationStatus,
                    };
                case 8:
                    return {
                            ...row,
                        CURRENT_STATUS: ActualSMVValidationStatus,
                    };
                case 9:
                    return {
                            ...row,
                        CURRENT_STATUS: PCDValidationStatus,
                    };
                case 10:
                    return {
                            ...row,
                        CURRENT_STATUS: PSDValidationStatus,
                    };

            }
            return row;
        });
        
        
        
        return res.status(200).json({
            success: true,
            message: `Success get order execute info for Order ${ORDER_ID}`,
            data: OrderExecuteInfo
        });


    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order execute info"
        });
    }
}

export const postOrderPOAlteration = async(req,res) => {
    try {
        const { DataPOAlter } = req.body;
        
        // Check Last PO Alter
        const CountOrderPOAlter = await ModelOrderPOAlteration.count({
            where: {
                ORDER_ID: DataPOAlter.ORDER_NO,
                ORDER_PO_ID: DataPOAlter.ORDER_PO_ID
            }
        });
        
        // Add new Order PO Alter
        await ModelOrderPOAlteration.create({
            ORDER_ID: DataPOAlter.ORDER_NO,
            ORDER_PO_ID: DataPOAlter.ORDER_PO_ID,
            ALT_ID: CountOrderPOAlter,
            PO_REF_CODE: DataPOAlter.PO_REF_CODE,
            DELIVERY_LOCATION_ID: DataPOAlter.DELIVERY_LOCATION_ID,
            COUNTRY_CODE: DataPOAlter.COUNTRY, 
            PACKING_METHOD: DataPOAlter.PACKING_METHOD, 
            DELIVERY_MODE_CODE: DataPOAlter.DELIVERY_MODE_CODE,
            MANUFACTURING_COMPANY: DataPOAlter.MANUFACTURING_COMPANY,
            MANUFACTURING_SITE: DataPOAlter.MANUFACTURING_SITE,
            PO_CONFIRMED_DATE: DataPOAlter.PO_CONFIRMED_DATE, 
            PO_EXPIRY_DATE: DataPOAlter.PO_EXPIRY_DATE, 
            ORIGINAL_DELIVERY_DATE: DataPOAlter.ORIGINAL_DELIVERY_DATE, 
            FINAL_DELIVERY_DATE: DataPOAlter.FINAL_DELIVERY_DATE, 
            PLAN_EXFACTORY_DATE: DataPOAlter.PLAN_EXFACTORY_DATE, 
            PRODUCTION_MONTH: DataPOAlter.PRODUCTION_MONTH, 
            NOTE_REMARKS: DataPOAlter.NOTE_REMARKS, 
            CREATE_BY: DataPOAlter.CREATE_BY, 
            CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
        });

        // Update PO Listing Data
        await OrderPoListing.update({
            ORDER_REFERENCE_PO_NO: DataPOAlter.PO_REF_CODE,
            DELIVERY_LOCATION_ID: DataPOAlter.DELIVERY_LOCATION_ID,
            COUNTRY_CODE: DataPOAlter.COUNTRY, 
            PACKING_METHOD: DataPOAlter.PACKING_METHOD, 
            DELIVERY_MODE_CODE: DataPOAlter.DELIVERY_MODE_CODE,
            MANUFACTURING_COMPANY: DataPOAlter.MANUFACTURING_COMPANY,
            MANUFACTURING_SITE: DataPOAlter.MANUFACTURING_SITE,
            PO_CONFIRMED_DATE: DataPOAlter.PO_CONFIRMED_DATE, 
            PO_EXPIRY_DATE: DataPOAlter.PO_EXPIRY_DATE, 
            ORIGINAL_DELIVERY_DATE: DataPOAlter.ORIGINAL_DELIVERY_DATE, 
            FINAL_DELIVERY_DATE: DataPOAlter.FINAL_DELIVERY_DATE, 
            PLAN_EXFACTORY_DATE: DataPOAlter.PLAN_EXFACTORY_DATE, 
            PRODUCTION_MONTH: DataPOAlter.PRODUCTION_MONTH, 
            NOTE_REMARKS: DataPOAlter.NOTE_REMARKS, 
        }, {
            where: {
                ORDER_NO: DataPOAlter.ORDER_NO,
                ORDER_PO_ID: DataPOAlter.ORDER_PO_ID,
            }
        });

        // Update PO Listing Size Data
        await OrderPoListingSize.update({
            ORDER_REFERENCE_PO_NO: DataPOAlter.PO_REF_CODE,
            DELIVERY_LOCATION_ID: DataPOAlter.DELIVERY_LOCATION_ID,
            COUNTRY_CODE: DataPOAlter.COUNTRY, 
            PACKING_METHOD: DataPOAlter.PACKING_METHOD, 
            DELIVERY_MODE_CODE: DataPOAlter.DELIVERY_MODE_CODE,
            MANUFACTURING_COMPANY: DataPOAlter.MANUFACTURING_COMPANY,
            MANUFACTURING_SITE: DataPOAlter.MANUFACTURING_SITE,
            PO_CONFIRMED_DATE: DataPOAlter.PO_CONFIRMED_DATE, 
            PO_EXPIRY_DATE: DataPOAlter.PO_EXPIRY_DATE, 
            ORIGINAL_DELIVERY_DATE: DataPOAlter.ORIGINAL_DELIVERY_DATE, 
            FINAL_DELIVERY_DATE: DataPOAlter.FINAL_DELIVERY_DATE, 
            PLAN_EXFACTORY_DATE: DataPOAlter.PLAN_EXFACTORY_DATE, 
            PRODUCTION_MONTH: DataPOAlter.PRODUCTION_MONTH, 
            NOTE_REMARKS: DataPOAlter.NOTE_REMARKS, 
        }, {
            where: {
                ORDER_NO: DataPOAlter.ORDER_NO,
                ORDER_PO_ID: DataPOAlter.ORDER_PO_ID,
            }
        });

        return res.status(200).json({
            success: true,
            message: `Success post order po alter`
        });

    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post order po alteration"
        });
    }
}

export const getOrderPOAlteration = async(req,res) => {
    try {
        const { ORDER_ID, ORDER_PO_ID } = req.query;

        if(!ORDER_ID || !ORDER_PO_ID){
            return res.status(400).json({
                success: false,
                message: `error missing parameter`,
                
            });    
        }

        const dataPOAlteration = await db.query(queryListOrderPOAlteration, {
            replacements: {
                orderID: ORDER_ID,
                orderPOID: ORDER_PO_ID
            },
            type: QueryTypes.SELECT
        });



        return res.status(200).json({
            success: true,
            message: `Success get order po alteration for Order ${ORDER_ID}`,
            data: dataPOAlteration    
        });

    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order po alteration"
        });
    }
}



export const getOrderDefaultRoute = async(req,res) => {
    try {
        const data = await db.query(queryGetDefaultProcessRoute, {
            type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: `Success get default route for process order`,
            data    
        });

    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order default route"
        });
    }
}

export const getOrderDataRoute = async(req,res) => {
    try {
        const { ORDER_ID } = req.query;
        if(!ORDER_ID){
            return res.status(400).json({
                success: false,
                message: `Failed get data route for process order`,
            });
        }
        const data = await ModelOrderRoute.findAll({
            where:{
                ORDER_ID: ORDER_ID
            },
            raw: true
        });
        return res.status(200).json({
            success: true,
            message: `Success get data route for process order`,
            data    
        });

    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order data route"
        });
    }
}

export const postOrderDataRoute = async (req, res) => {
  try {
    const { DataRoute } = req.body;
    
    for (const route of DataRoute.LIST) {
        const CheckExistingRoute = await ModelOrderRoute.findAll({
            where: {
                ORDER_ID: DataRoute.ORDER_ID,
                PROCESS_ID: route.PROCESS_ID,
                SUBPROCESS_ID: route.SUBPROCESS_ID        
            },
            raw: true
        });
        if(CheckExistingRoute.length===0){
            await ModelOrderRoute.create({
                ORDER_ID: DataRoute.ORDER_ID,      // 👈 include ORDER_ID
                PROCESS_ID: route.PROCESS_ID,
                SUBPROCESS_ID: route.SUBPROCESS_ID,
                ORDER_ROUTE_FLAG: route.ORDER_ROUTE_FLAG,
                CREATE_BY: DataRoute.UPDATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });
        } else {
            await ModelOrderRoute.update({
                ORDER_ROUTE_FLAG: route.ORDER_ROUTE_FLAG,
                CREATE_BY: DataRoute.UPDATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    ORDER_ID: DataRoute.ORDER_ID,      // 👈 include ORDER_ID
                    PROCESS_ID: route.PROCESS_ID,
                    SUBPROCESS_ID: route.SUBPROCESS_ID
                }
            });
        }
    }

    return res.status(200).json({
      success: true,
      message: `Success POST data route for process order`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "error post order data route"
    });
  }
};



export const getPOListingSizeLogRevisionByRevID = async(req,res) => {
    try {
        const { ORDER_ID, ORDER_PO_ID } = req.query;
        if(ORDER_ID && ORDER_PO_ID){
            const data = await db.query(queryGetLogPOListingSizeRevision, {
                replacements: {
                    orderID: ORDER_ID,
                    orderPOID: ORDER_PO_ID
                },
                type: QueryTypes.SELECT
            });
             return res.status(200).json({
                success: true,
                message: `Success get data po listing size revision log`,
                data
            });
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "error get order po listing size log revision"
        });
    }
}


export const getPOSizeLogRevisionDetailByRevID = async(req,res) => {
    try {
        const { ORDER_ID, ORDER_PO_ID, REV_ID } = req.query;
        if(ORDER_ID && ORDER_PO_ID && REV_ID){
            const data = await db.query(queryDetailPOSizeRevision, {
                replacements: {
                    orderID: ORDER_ID,
                    orderPOID: ORDER_PO_ID,
                    revID: REV_ID
                },
                type: QueryTypes.SELECT
            });
            return res.status(200).json({
                success: true,
                message: `Success get data po listing size revision detail`,
                data
            });
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "error get order po listing size log revision"
        });
    }
}



export const getReportPOListing = async(req,res) => {
    try {
        const { FilterPO } = req.body;
        const poStatusList = `(${FilterPO.LIST_STATUS.map(s => `'${s.STATUS}'`).join(',')})`;
        let additionalQuery =  ` `;

        // check manufacturing company
        if(FilterPO.MANUFACTURING_COMPANY!=='---') additionalQuery = additionalQuery + ` AND opl.MANUFACTURING_COMPANY = '${FilterPO.MANUFACTURING_COMPANY}' `;
        
        // check manufacturing site
        if(FilterPO.MANUFACTURING_SITE!=='---') additionalQuery = additionalQuery + ` AND opl.MANUFACTURING_SITE = '${FilterPO.MANUFACTURING_SITE}' `;
        
        // check mo availability
        additionalQuery = additionalQuery + `AND opl.MO_AVAILABILITY = '${FilterPO.MO_AVAILABILITY}'`;

        // check filter date range type
        if(FilterPO.DATE_RANGE_TYPE!=='---') additionalQuery = additionalQuery + ` AND opl.${FilterPO.DATE_RANGE_TYPE} BETWEEN '${FilterPO.DATE_FROM}' AND '${FilterPO.DATE_TO}' `;
        
        // check order type
        if(FilterPO.ORDER_TYPE_CODE!=='---') additionalQuery = additionalQuery + ` AND opl.ORDER_TYPE_CODE = '${FilterPO.ORDER_TYPE_CODE}' `;

        // check po status
        additionalQuery = additionalQuery + ` AND opl.PO_STATUS IN${poStatusList} `;

        // check production month
        if(FilterPO.PRODUCTION_MONTH!=='---') additionalQuery = additionalQuery + ` AND opl.PRODUCTION_MONTH = '${moment(FilterPO.PRODUCTION_MONTH, "YYYY-MM").format("MMMM/YYYY")}' `;

        // check projection order
        if(FilterPO.PROJECTION_ORDER_ID!=='---') additionalQuery = additionalQuery + ` AND oph.PROJECTION_ORDER_ID = '${FilterPO.PROJECTION_ORDER_ID}' `;

        // check customer id
        if(FilterPO.CUSTOMER_ID!=='---') additionalQuery = additionalQuery + ` AND oph.CUSTOMER_ID = '${FilterPO.CUSTOMER_ID}' `;

        // check customer division id
        if(FilterPO.CUSTOMER_DIVISION_ID!=='---') additionalQuery = additionalQuery + ` AND oph.CUSTOMER_DIVISION_ID = '${FilterPO.CUSTOMER_DIVISION_ID}' `;

        // check customer season
        if(FilterPO.CUSTOMER_SEASON_ID!=='---') additionalQuery = additionalQuery + ` AND oph.CUSTOMER_SEASON_ID = '${FilterPO.CUSTOMER_SEASON_ID}' `;

        // check product id
        if(FilterPO.PRODUCT_ID!=='---') additionalQuery = additionalQuery + ` AND oph.PRODUCT_ID = '${FilterPO.PRODUCT_ID}' `;

        // get data based on query
        const dataPODetail = await db.query(queryRecapPOListingDetail + additionalQuery, { type: QueryTypes.SELECT });
        const dataPOSizeDetail = await db.query(queryRecapPOListingSize + additionalQuery, { type: QueryTypes.SELECT });
        return res.status(200).json({
                success: true,
                message: `Success get data po listing size revision detail`,
                dataPODetail,
                dataPOSizeDetail
            });
    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err.message,
            message: "error get report po listing"
        });
    }
}