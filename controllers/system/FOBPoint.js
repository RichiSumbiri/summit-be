import { ModelFOBPoint } from "../../models/system/FOBPoint.mod.js";
import { ModelShippingTerms } from "../../models/system/ShippingTerms.mod.js"



export const getAllFOBPoint = async(req,res) => {
    try {
        const data = await ModelFOBPoint.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get list fob point",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list fob point"
        });
    }
}