import db from "../../config/database.js"
import { ModelMasterItemQuality } from "../../models/setup/ItemQuality.mod.js";
import { ModelMasterItemStatus } from "../../models/setup/ItemStatus.mod.js";


export const getMasterItemStatus = async(req, res) => {
    try {
        const data = await ModelMasterItemStatus.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get master item status",
                data,
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            error: err,
            message: "error get list item status",
        });
    }
}