import { ModelVendorDetail } from "../../models/system/VendorDetail.mod.js";


export const getAllVendorDetail = async(req,res) => {
   try {
        const data = await ModelVendorDetail.findAll({});
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