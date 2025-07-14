import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { MasterWarehouseClass, queryGetAllMasterWarehouseClass } from "../../models/setup/WarehouseClass.mod.js";





export const getMasterWarehouseClassAll = async(req,res) => {
    try {
        const data = await db.query(queryGetAllMasterWarehouseClass, { type: QueryTypes.SELECT });
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get master warehouse class",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list warehouse class"
        });
    }
}

export const postMasterWarehouseClass = async(req,res) => {
    try {
        const { DataWarehouseClass } = req.body;
        if(DataWarehouseClass.WHC_ID==='<< NEW >>'){
            const getLastWHCID = await MasterWarehouseClass.findOne({
                order: [['WHC_ID', 'DESC']],
                raw: true
            }); 
            const newIncrement = parseInt(getLastWHCID.WHC_ID.slice(-7)) + 1;
            const newWHCID = 'WHI' + newIncrement.toString().padStart(7, '0');
            await MasterWarehouseClass.create({
                WHC_ID: newWHCID,
                WHC_REF_CODE: DataWarehouseClass.WHC_REF_CODE,
                WHC_DESCRIPTION: DataWarehouseClass.WHC_DESCRIPTION,
                WHC_ACTIVE: DataWarehouseClass.WHC_ACTIVE,
                WHC_ITEM_CATEGORY_ID: DataWarehouseClass.ITEM_CATEGORY_ID,
            });
        } else {
            await MasterWarehouseClass.update({
                WHC_REF_CODE: DataWarehouseClass.WHC_REF_CODE,
                WHC_DESCRIPTION: DataWarehouseClass.WHC_DESCRIPTION,
                WHC_ACTIVE: DataWarehouseClass.WHC_ACTIVE,
                WHC_ITEM_CATEGORY_ID: DataWarehouseClass.ITEM_CATEGORY_ID,
            }, {
                where: {
                    WHC_ID: DataWarehouseClass.WHC_ID,
                }
            });
        }
        return res.status(200).json({
            success: true,
            message: "success post master warehouse class",
        });
    } catch(err){
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post warehouse class"
        });
    }
}