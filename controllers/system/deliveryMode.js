import { ModelDeliveryMode } from "../../models/system/deliveryMode.mod.js";
import { redisConn } from "../../config/dbAudit.js";



export const getAllDeliveryMode = async(req,res) => {
    try {
        let data;
        const getDeliveryModeRedis = await redisConn.get('list-delivery-mode');
        if(getDeliveryModeRedis){
            data = JSON.parse(getDeliveryModeRedis);
        } else {
            data = await ModelDeliveryMode.findAll({raw:true});
            redisConn.set('list-delivery-mode', JSON.stringify(data), { EX: 604800 })
        }
        return res.status(200).json({
                success: true,
                message: "success get master delivery mode",
                data
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list delivery mode"
        });
    }
}