import { ModelShippingTerms } from "../../models/system/ShippingTerms.mod.js"
import { redisConn } from "../../config/dbAudit.js";



export const getAllShippingTerms = async(req,res) => {
    try {
        let data;
        const dataRedis = await redisConn.get('list-shipping-terms');
        if(dataRedis){
            data = JSON.parse(dataRedis);
        } else {
            data = await ModelShippingTerms.findAll({raw:true});
            redisConn.set('list-shipping-terms', JSON.stringify(data), { EX: 604800 })
        }
        // const data = await ModelShippingTerms.findAll({raw:true});
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