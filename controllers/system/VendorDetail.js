import moment from "moment";
import { ModelVendorDetail, ModelVendorPurchaseDetail, ModelVendorShipperLocation } from "../../models/system/VendorDetail.mod.js";


export const getAllVendorDetail = async(req,res) => {
   try {
        const data = await ModelVendorDetail.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get list vendor detail",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list vendor detail"
        });
    }
}


export const postVendorDetail = async(req,res) => {
    try {
        const { dataVendor } = req.body;
        if(!dataVendor.VENDOR_ID){
            const getLastVDCID = await ModelVendorDetail.findOne({
                order: [['VENDOR_ID', 'DESC']],
                raw: true
            }); 
            const newIncrement = !getLastVDCID ? '0000001' : parseInt(getLastVDCID.VENDOR_ID.slice(-7)) + 1;
            const newVDCID = 'VDC' + newIncrement.toString().padStart(7, '0');
            await ModelVendorDetail.create({
                VENDOR_ID: newVDCID,
                VENDOR_CODE: dataVendor.VENDOR_CODE,
                VENDOR_NAME: dataVendor.VENDOR_NAME,
                VENDOR_ACTIVE: dataVendor.VENDOR_ACTIVE || 1,
                VENDOR_COMPANY_NAME: dataVendor.VENDOR_COMPANY_NAME,
                VENDOR_PHONE: dataVendor.VENDOR_PHONE,
                VENDOR_FAX: dataVendor.VENDOR_FAX,
                VENDOR_WEB: dataVendor.VENDOR_WEB,
                VENDOR_ADDRESS_1: dataVendor.VENDOR_ADDRESS_1,
                VENDOR_ADDRESS_2: dataVendor.VENDOR_ADDRESS_2,
                VENDOR_CITY: dataVendor.VENDOR_CITY,
                VENDOR_PROVINCE: dataVendor.VENDOR_PROVINCE,
                VENDOR_POSTAL_CODE: dataVendor.VENDOR_POSTAL_CODE,
                VENDOR_COUNTRY_CODE: dataVendor.VENDOR_COUNTRY_CODE,
                VENDOR_CONTACT_TITLE: dataVendor.VENDOR_CONTACT_TITLE,
                VENDOR_CONTACT_POSITION: dataVendor.VENDOR_CONTACT_POSITION,
                VENDOR_CONTACT_NAME: dataVendor.VENDOR_CONTACT_NAME,
                VENDOR_CONTACT_PHONE_1: dataVendor.VENDOR_CONTACT_PHONE_1,
                VENDOR_CONTACT_PHONE_2: dataVendor.VENDOR_CONTACT_PHONE_2,
                VENDOR_CONTACT_EMAIL: dataVendor.VENDOR_CONTACT_EMAIL,
                VENDOR_CLASS: dataVendor.VENDOR_CLASS,
                VENDOR_PAYMENT_CURRENCY: dataVendor.VENDOR_PAYMENT_CURRENCY,
                VENDOR_PAYMENT_TERM_CODE: dataVendor.VENDOR_PAYMENT_TERM_CODE,
                VENDOR_PAYMENT_REF: dataVendor.VENDOR_PAYMENT_REF,
                VENDOR_ACCOUNT_BANK_NAME: dataVendor.VENDOR_ACCOUNT_BANK_NAME,
                VENDOR_ACCOUNT_BANK_BRANCH: dataVendor.VENDOR_ACCOUNT_BANK_BRANCH,
                VENDOR_ACCOUNT_BANK_CURRENCY_CODE: dataVendor.VENDOR_ACCOUNT_BANK_CURRENCY_CODE,
                VENDOR_ACCOUNT_BANK_COUNTRY_CODE: dataVendor.VENDOR_ACCOUNT_BANK_COUNTRY_CODE,
                VENDOR_ACCOUNT_NAME: dataVendor.VENDOR_ACCOUNT_NAME,
                VENDOR_ACCOUNT_NO: dataVendor.VENDOR_ACCOUNT_NO,
                VENDOR_ACCOUNT_SWIFT_CODE: dataVendor.VENDOR_ACCOUNT_SWIFT_CODE,
                VENDOR_ACCOUNT_INSTRUCTION: dataVendor.VENDOR_ACCOUNT_INSTRUCTION,
                VENDOR_REMITTANCE_NAME: dataVendor.VENDOR_REMITTANCE_NAME,
                VENDOR_REMITTANCE_TITLE: dataVendor.VENDOR_REMITTANCE_TITLE,
                VENDOR_REMITTANCE_POSITION: dataVendor.VENDOR_REMITTANCE_POSITION,
                VENDOR_REMITTANCE_PHONE_1: dataVendor.VENDOR_REMITTANCE_PHONE_1,
                VENDOR_REMITTANCE_PHONE_2: dataVendor.VENDOR_REMITTANCE_PHONE_2,
                VENDOR_REMITTANCE_EMAIL: dataVendor.VENDOR_REMITTANCE_EMAIL,
                VENDOR_SHIPPING_TERMS_CODE: dataVendor.VENDOR_SHIPPING_TERMS_CODE,
                VENDOR_DELIVERY_MODE_CODE: dataVendor.VENDOR_DELIVERY_MODE_CODE,
                VENDOR_FOB_POINT_CODE: dataVendor.VENDOR_FOB_POINT_CODE,
                CREATE_BY: dataVendor.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
            });
        } else {
            await ModelVendorDetail.update({
                VENDOR_CODE: dataVendor.VENDOR_CODE,
                VENDOR_NAME: dataVendor.VENDOR_NAME,
                VENDOR_ACTIVE: dataVendor.VENDOR_ACTIVE,
                VENDOR_COMPANY_NAME: dataVendor.VENDOR_COMPANY_NAME,
                VENDOR_PHONE: dataVendor.VENDOR_PHONE,
                VENDOR_FAX: dataVendor.VENDOR_FAX,
                VENDOR_WEB: dataVendor.VENDOR_WEB,
                VENDOR_ADDRESS_1: dataVendor.VENDOR_ADDRESS_1,
                VENDOR_ADDRESS_2: dataVendor.VENDOR_ADDRESS_2,
                VENDOR_CITY: dataVendor.VENDOR_CITY,
                VENDOR_PROVINCE: dataVendor.VENDOR_PROVINCE,
                VENDOR_POSTAL_CODE: dataVendor.VENDOR_POSTAL_CODE,
                VENDOR_COUNTRY_CODE: dataVendor.VENDOR_COUNTRY_CODE,
                VENDOR_CONTACT_TITLE: dataVendor.VENDOR_CONTACT_TITLE,
                VENDOR_CONTACT_POSITION: dataVendor.VENDOR_CONTACT_POSITION,
                VENDOR_CONTACT_NAME: dataVendor.VENDOR_CONTACT_NAME,
                VENDOR_CONTACT_PHONE_1: dataVendor.VENDOR_CONTACT_PHONE_1,
                VENDOR_CONTACT_PHONE_2: dataVendor.VENDOR_CONTACT_PHONE_2,
                VENDOR_CONTACT_EMAIL: dataVendor.VENDOR_CONTACT_EMAIL,
                VENDOR_CLASS: dataVendor.VENDOR_CLASS,
                VENDOR_PAYMENT_CURRENCY: dataVendor.VENDOR_PAYMENT_CURRENCY,
                VENDOR_PAYMENT_TERM_CODE: dataVendor.VENDOR_PAYMENT_TERM_CODE,
                VENDOR_PAYMENT_REF: dataVendor.VENDOR_PAYMENT_REF,
                VENDOR_ACCOUNT_BANK_NAME: dataVendor.VENDOR_ACCOUNT_BANK_NAME,
                VENDOR_ACCOUNT_BANK_BRANCH: dataVendor.VENDOR_ACCOUNT_BANK_BRANCH,
                VENDOR_ACCOUNT_BANK_CURRENCY_CODE: dataVendor.VENDOR_ACCOUNT_BANK_CURRENCY_CODE,
                VENDOR_ACCOUNT_BANK_COUNTRY_CODE: dataVendor.VENDOR_ACCOUNT_BANK_COUNTRY_CODE,
                VENDOR_ACCOUNT_NAME: dataVendor.VENDOR_ACCOUNT_NAME,
                VENDOR_ACCOUNT_NO: dataVendor.VENDOR_ACCOUNT_NO,
                VENDOR_ACCOUNT_SWIFT_CODE: dataVendor.VENDOR_ACCOUNT_SWIFT_CODE,
                VENDOR_ACCOUNT_INSTRUCTION: dataVendor.VENDOR_ACCOUNT_INSTRUCTION,
                VENDOR_REMITTANCE_NAME: dataVendor.VENDOR_REMITTANCE_NAME,
                VENDOR_REMITTANCE_TITLE: dataVendor.VENDOR_REMITTANCE_TITLE,
                VENDOR_REMITTANCE_POSITION: dataVendor.VENDOR_REMITTANCE_POSITION,
                VENDOR_REMITTANCE_PHONE_1: dataVendor.VENDOR_REMITTANCE_PHONE_1,
                VENDOR_REMITTANCE_PHONE_2: dataVendor.VENDOR_REMITTANCE_PHONE_2,
                VENDOR_REMITTANCE_EMAIL: dataVendor.VENDOR_REMITTANCE_EMAIL,
                VENDOR_SHIPPING_TERMS_CODE: dataVendor.VENDOR_SHIPPING_TERMS_CODE,
                VENDOR_DELIVERY_MODE_CODE: dataVendor.VENDOR_DELIVERY_MODE_CODE,
                VENDOR_FOB_POINT_CODE: dataVendor.VENDOR_FOB_POINT_CODE,
                UPDATE_BY: dataVendor.UPDATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
            }, {
                where: {
                    VENDOR_ID: dataVendor.VENDOR_ID,
                }
            });
        }
        return res.status(200).json({
            success: true,
            message: "success post vendor detail",
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post vendor detail"
        });
    }
}



export const getVendorShipperLocationByVDC = async(req,res) => {
    try {
        const { vdc } = req.params;
        const dataVSL = await ModelVendorShipperLocation.findAll({
            where: {
                VENDOR_ID: vdc
            }
        });
        return res.status(200).json({
            success: true,
            message: "success get vendor shipper location",
            data: dataVSL
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get vendor shipper location"
        });
    }
}


export const postVendorShipperLocation = async(req,res) => {
    try {
        const { dataVSL } = req.body;
        if(dataVSL.VSL_ID){
            await ModelVendorShipperLocation.update({
                VENDOR_ID: dataVSL.VENDOR_ID,
                VSL_NAME: dataVSL.VSL_NAME,
                VSL_CONTACT_TITLE: dataVSL.VSL_CONTACT_TITLE,
                VSL_CONTACT_NAME: dataVSL.VSL_CONTACT_NAME,
                VSL_CONTACT_POSITION: dataVSL.VSL_CONTACT_POSITION,
                VSL_PHONE: dataVSL.VSL_PHONE,
                VSL_EMAIL: dataVSL.VSL_EMAIL,
                VSL_FAX: dataVSL.VSL_FAX,
                VSL_ADDRESS_1: dataVSL.VSL_ADDRESS_1,
                VSL_ADDRESS_2: dataVSL.VSL_ADDRESS_2,
                VSL_ADDRESS_CITY: dataVSL.VSL_ADDRESS_CITY,
                VSL_ADDRESS_PROVINCE: dataVSL.VSL_ADDRESS_PROVINCE,
                VSL_ADDRESS_COUNTRY_CODE: dataVSL.VSL_ADDRESS_COUNTRY_CODE,
                VSL_ADDRESS_POSTAL_CODE: dataVSL.VSL_ADDRESS_POSTAL_CODE,
                VSL_SHIPPING_TERMS_CODE: dataVSL.VSL_SHIPPING_TERMS_CODE,
                VSL_PORT_LOADING: dataVSL.VSL_PORT_LOADING,
                VSL_DEFAULT: dataVSL.VSL_DEFAULT,
                VSL_ACTIVE: dataVSL.VSL_ACTIVE,
                UPDATE_BY: dataVSL.UPDATE_BY,
                UPDATE_DATE:  moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    VSL_ID: dataVSL.VSL_ID
                }
            })
        } else {
            await ModelVendorShipperLocation.create({
                VENDOR_ID: dataVSL.VENDOR_ID,
                VSL_NAME: dataVSL.VSL_NAME,
                VSL_CONTACT_TITLE: dataVSL.VSL_CONTACT_TITLE,
                VSL_CONTACT_NAME: dataVSL.VSL_CONTACT_NAME,
                VSL_CONTACT_POSITION: dataVSL.VSL_CONTACT_POSITION,
                VSL_PHONE: dataVSL.VSL_PHONE,
                VSL_EMAIL: dataVSL.VSL_EMAIL,
                VSL_FAX: dataVSL.VSL_FAX,
                VSL_ADDRESS_1: dataVSL.VSL_ADDRESS_1,
                VSL_ADDRESS_2: dataVSL.VSL_ADDRESS_2,
                VSL_ADDRESS_CITY: dataVSL.VSL_ADDRESS_CITY,
                VSL_ADDRESS_PROVINCE: dataVSL.VSL_ADDRESS_PROVINCE,
                VSL_ADDRESS_COUNTRY_CODE: dataVSL.VSL_ADDRESS_COUNTRY_CODE,
                VSL_ADDRESS_POSTAL_CODE: dataVSL.VSL_ADDRESS_POSTAL_CODE,
                VSL_SHIPPING_TERMS_CODE: dataVSL.VSL_SHIPPING_TERMS_CODE,
                VSL_PORT_LOADING: dataVSL.VSL_PORT_LOADING,
                VSL_DEFAULT: dataVSL.VSL_DEFAULT,
                VSL_ACTIVE: dataVSL.VSL_ACTIVE,
                CREATE_BY: dataVSL.UPDATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            })
        }
        return res.status(200).json({
            success: true,
            message: "success get vendor shipper location"
        });
    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get vendor shipper location"
        });
    }
}


export const getVendorPurchaseDetailByVDC = async(req,res) => {
    try {
        const { vdc } = req.params;
        const dataPurchase = await ModelVendorPurchaseDetail.findAll({
            where: {
                VENDOR_ID: vdc
            }
        });
        return res.status(200).json({
            success: true,
            message: "success get vendor purchase detail",
            data: dataPurchase
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get vendor shipper location"
        });
    }
}


export const postVendorPurchaseDetail = async(req,res) => {
    try {
        const { dataVPD } = req.body;
        if(dataVPD.VPD_ID){
            await ModelVendorPurchaseDetail.update({
                CUSTOMER_ID: dataVPD.CUSTOMER_ID,
                VENDOR_ID: dataVPD.VENDOR_ID,
                UPDATE_BY: dataVPD.UPDATE_BY,
                UPDATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                ITEM_GROUP_ID: dataVPD.ITEM_GROUP_ID,
                ITEM_TYPE_ID: dataVPD.ITEM_TYPE_ID,
                UOM_CODE: dataVPD.UOM_CODE,
                ITEM_CATEGORY_ID: dataVPD.ITEM_CATEGORY_ID,
                MANUFACTURE_LEAD_TIME: dataVPD.MANUFACTURE_LEAD_TIME,
                DELIVERY_MODE_CODE: dataVPD.DELIVERY_MODE_CODE,
                DELIVERY_LEAD_TIME: dataVPD.DELIVERY_MODE_CODE,
                MIN_ORDER_QTY: dataVPD.MIN_ORDER_QTY,
                MIN_ORDER_QTY_COLOR_VALIDATION: dataVPD.MIN_ORDER_QTY_COLOR_VALIDATION,
                MIN_ORDER_QTY_SIZE_VALIDATION: dataVPD.MIN_ORDER_QTY_SIZE_VALIDATION,
                MIN_ORDER_QTY_COLOR_QTY: dataVPD.MIN_ORDER_QTY_COLOR_QTY,
                MIN_ORDER_QTY_SIZE_QTY: dataVPD.MIN_ORDER_QTY_SIZE_QTY,
                MIN_UNDER_RECEIPT: dataVPD.MIN_UNDER_RECEIPT,
                MIN_OVER_RECEIPT: dataVPD.MIN_OVER_RECEIPT,
                NOTE_REMARKS: dataVPD.NOTE_REMARKS
            }, {
                where: {
                    VPD_ID: dataVPD.VPD_ID
                }
            })
        } else {
            await ModelVendorPurchaseDetail.create({
                CUSTOMER_ID: dataVPD.CUSTOMER_ID,
                VENDOR_ID: dataVPD.VENDOR_ID,
                CREATE_BY: dataVPD.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
                ITEM_GROUP_ID: dataVPD.ITEM_GROUP_ID,
                ITEM_TYPE_ID: dataVPD.ITEM_TYPE_ID,
                ITEM_CATEGORY_ID: dataVPD.ITEM_CATEGORY_ID,
                UOM_CODE: dataVPD.UOM_CODE,
                MANUFACTURE_LEAD_TIME: dataVPD.MANUFACTURE_LEAD_TIME,
                DELIVERY_MODE_CODE: dataVPD.DELIVERY_MODE_CODE,
                DELIVERY_LEAD_TIME: dataVPD.DELIVERY_LEAD_TIME,
                MIN_ORDER_QTY: dataVPD.MIN_ORDER_QTY,
                MIN_ORDER_QTY_COLOR_VALIDATION: dataVPD.MIN_ORDER_QTY_COLOR_VALIDATION,
                MIN_ORDER_QTY_SIZE_VALIDATION: dataVPD.MIN_ORDER_QTY_SIZE_VALIDATION,
                MIN_ORDER_QTY_COLOR_QTY: dataVPD.MIN_ORDER_QTY_COLOR_QTY,
                MIN_ORDER_QTY_SIZE_QTY: dataVPD.MIN_ORDER_QTY_SIZE_QTY,
                MIN_UNDER_RECEIPT: dataVPD.MIN_UNDER_RECEIPT,
                MIN_OVER_RECEIPT: dataVPD.MIN_OVER_RECEIPT,
                NOTE_REMARKS: dataVPD.NOTE_REMARKS
            })
        }
        return res.status(200).json({
            success: true,
            message: "success post vendor purchase detail"
        });
    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post vendor shipper location"
        });
    }
}