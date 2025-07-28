import { ModelShippingTerms } from "../../models/system/ShippingTerms.mod.js"



export const getAllShippingTerms = async(req,res) => {
    try {
        const data = await ModelShippingTerms.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get master shipping terms",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list shipping terms"
        });
    }
}