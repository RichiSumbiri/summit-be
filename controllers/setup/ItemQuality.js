import db from "../../config/database.js"
import { ModelMasterItemQuality } from "../../models/setup/ItemQuality.mod.js";


export const getMasterItemQuality = async(req, res) => {
    try {
        const data = await ModelMasterItemQuality.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get master item quality",
                data,
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            error: err,
            message: "error get list item quality",
        });
    }
}