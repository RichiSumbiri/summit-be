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
                VENDOR_COUNTRY_ID: dataVendor.VENDOR_COUNTRY_ID,
                VENDOR_CONTACT_NAME: dataVendor.VENDOR_CONTACT_NAME,
                VENDOR_CONTACT_PHONE_1: dataVendor.VENDOR_CONTACT_PHONE_1,
                VENDOR_CONTACT_PHONE_2: dataVendor.VENDOR_CONTACT_PHONE_2,
                VENDOR_CONTACT_EMAIL: dataVendor.VENDOR_CONTACT_EMAIL,
                VENDOR_CLASS: dataVendor.VENDOR_CLASS
            });
        } else {
            await ModelVendorDetail.update({
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
                VENDOR_COUNTRY_ID: dataVendor.VENDOR_COUNTRY_ID,
                VENDOR_CONTACT_NAME: dataVendor.VENDOR_CONTACT_NAME,
                VENDOR_CONTACT_PHONE_1: dataVendor.VENDOR_CONTACT_PHONE_1,
                VENDOR_CONTACT_PHONE_2: dataVendor.VENDOR_CONTACT_PHONE_2,
                VENDOR_CONTACT_EMAIL: dataVendor.VENDOR_CONTACT_EMAIL,
                VENDOR_CLASS: dataVendor.VENDOR_CLASS
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
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post vendor detail"
        });
    }
}