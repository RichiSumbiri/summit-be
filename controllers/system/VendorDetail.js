import moment from "moment";
import { ModelVendorDetail } from "../../models/system/VendorDetail.mod.js";


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