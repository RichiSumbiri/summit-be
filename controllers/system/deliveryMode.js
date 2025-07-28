import { ModelDeliveryMode } from "../../models/system/deliveryMode.mod.js";



export const getAllDeliveryMode = async(req,res) => {
    try {
        const data = await ModelDeliveryMode.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get master delivery mode",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list delivery mode"
        });
    }
}