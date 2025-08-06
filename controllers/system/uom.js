import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { ModelMasterUOM, ModelUOMConversion, queryGetUOMConversion } from "../../models/system/uom.mod.js";
import { redisConn } from "../../config/dbAudit.js";


export const getMasterUOMAll = async(req, res) => {
    try {
        let data;
        const dataRedis = await redisConn.get('list-uom');
        if(dataRedis){
            data = JSON.parse(dataRedis);
        } else {
            data = await ModelMasterUOM.findAll({ raw: true });
            redisConn.set('list-uom', JSON.stringify(data), { EX: 604800 })
        }
        
        // const listUOM = await ModelMasterUOM.findAll({ raw: true });
        return res.status(200).json({
            success: true,
            message: "success get list UOM",
            data
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list UOM"
        });
    }
}


export const getUOMConversion = async(req,res) => {
    try {
        const listUOMConversion = await db.query(queryGetUOMConversion, { type: QueryTypes.SELECT });
        return res.status(200).json({
            success: true,
            message: "success get list UOM conversion",
            data: listUOMConversion
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get UOM Conversion"
        });
    }
}

export const postUOMConversion = async(req,res) => {
    try {
        const { DataUOMConversion } = req.body;
        if(DataUOMConversion.ID_CONVERSION){
            await ModelUOMConversion.update({
                UOM_ID_SOURCE: DataUOMConversion.UOM_ID_SOURCE,
                UOM_ID_DESTINATION: DataUOMConversion.UOM_ID_DESTINATION,
                CONVERSION_FACTOR: DataUOMConversion.CONVERSION_FACTOR,
                ACTIVE_FLAG: DataUOMConversion.ACTIVE_FLAG
            }, {
                where: {
                    ID_CONVERSION: DataUOMConversion.ID_CONVERSION
                }
            });
        } else {
            await ModelUOMConversion.create({
                UOM_ID_SOURCE: DataUOMConversion.UOM_ID_SOURCE,
                UOM_ID_DESTINATION: DataUOMConversion.UOM_ID_DESTINATION,
                CONVERSION_FACTOR: DataUOMConversion.CONVERSION_FACTOR,
                ACTIVE_FLAG: DataUOMConversion.ACTIVE_FLAG
            });
        }

        return res.status(200).json({
            success: true,
            message: "success post UOM Conversion"
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post UOM Conversion"
        });
    }
}