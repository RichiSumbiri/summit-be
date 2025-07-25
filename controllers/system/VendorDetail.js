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
        if(dataVendor.VENDOR_ID==='<< NEW >>'){
            const getLastVDCID = await ModelVendorDetail.findOne({
                order: [['VENDOR_ID', 'DESC']],
                raw: true
            }); 
            const newIncrement = parseInt(getLastVDCID.WHC_ID.slice(-7)) + 1;
            const newVDCID = 'VDC' + newIncrement.toString().padStart(7, '0');
            await ModelVendorDetail.create({
                VENDOR_ID: newVDCID,
                VENDOR_CODE: dataVendor.VENDOR_CODE,
                VENDOR_NAME: dataVendor.VENDOR_NAME,
                VENDOR_ACTIVE: dataVendor.VENDOR_ACTIVE
            });
        } else {
            await ModelVendorDetail.update({
                VENDOR_CODE: dataVendor.VENDOR_CODE,
                VENDOR_NAME: dataVendor.VENDOR_NAME,
                VENDOR_ACTIVE: dataVendor.VENDOR_ACTIVE
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