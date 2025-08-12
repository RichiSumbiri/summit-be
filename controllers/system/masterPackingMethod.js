import { redisConn } from "../../config/dbAudit.js";
import { ModelPackingMethod } from "../../models/system/masterPackingMethod.mod.js";

export const getAllPackingMethod = async(req,res) => {
    try {
        let data;
        const dataRedis = await redisConn.get('list-packing-method');
        if(dataRedis){
            data = JSON.parse(dataRedis);
        } else {
            data = await ModelPackingMethod.findAll({raw:true});
            redisConn.set('list-packing-method', JSON.stringify(data), { EX: 604800 })
        }
        
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get master packing method",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list packing method"
        });
    }
}