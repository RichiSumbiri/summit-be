import { ModelFOBPoint } from "../../models/system/FOBPoint.mod.js";
import { redisConn } from "../../config/dbAudit.js";



export const getAllFOBPoint = async(req,res) => {
    try {
        let data;
        const dataRedis = await redisConn.get('list-fob-point');
        if(dataRedis){
            data = JSON.parse(dataRedis);
        } else {
            data = await ModelFOBPoint.findAll({raw:true});
            redisConn.set('list-fob-point', JSON.stringify(data), { EX: 604800 })
        }
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