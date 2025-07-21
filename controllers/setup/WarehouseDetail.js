import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { ModelWarehouseDetail, ModelWarehouseDetailQuality, ModelWarehouseDetailStatus, qryGetMasterWarehouseDetail } from "../../models/setup/WarehouseDetail.mod.js";
import { ModelMasterItemQuality } from "../../models/setup/ItemQuality.mod.js";




export const getMasterWarehouseDetail = async (req, res) => {
    try {
        const warehouseDetails = await db.query(qryGetMasterWarehouseDetail, {
            type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get master warehouse details",
            data: warehouseDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error getting master warehouse details",
        });
    }
}

export const getWarehouseDetailQuality = async(req,res) => {
    try {
        const { id } = req.params;
        const qualityData = await ModelWarehouseDetailQuality.findAll({
            where: {
                WHI_ID: id 
            }
        });
        return res.status(200).json({
            success: true,
            message: "success get master warehouse details",
            data: qualityData,
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error getting master warehouse details quality",
        });
    }
}


export const getWarehouseDetailStatus = async(req,res) => {
    try {
        const { id } = req.params;
        const statusData = await ModelWarehouseDetailStatus.findAll({
            where: {
                WHI_ID: id 
            }
        });
        return res.status(200).json({
            success: true,
            message: "success get master warehouse details status",
            data: statusData,
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error getting master warehouse details quality",
        });
    }
}




export const postMasterWarehouseDetail = async(req,res) => {
    try {
        const { DataWarehouse } = req.body;
        let CreatedData;
        if(DataWarehouse.WHI_ID==="<< NEW >>" || DataWarehouse.WHI_ID===""){
            const getLastWHID = await ModelWarehouseDetail.findOne({
                order: [['WHI_ID', 'DESC']],
                raw: true
            }); 
            const newIncrement = parseInt(getLastWHID.WHI_ID.slice(-7)) + 1;
            const newWHID = 'WHI' + newIncrement.toString().padStart(7, '0');
            CreatedData = await ModelWarehouseDetail.create({
                WHI_ID: newWHID,
                WHI_CODE: DataWarehouse.WHI_CODE,
                WHI_NAME: DataWarehouse.WHI_NAME,
                WHI_STOCKHOLDING_COMPANY_ID: DataWarehouse.WHI_STOCKHOLDING_COMPANY_ID,
                WHI_OPERATING_COMPANY_ID: DataWarehouse.WHI_OPERATING_COMPANY_ID,
                WHI_SITE_ID: DataWarehouse.WHI_SITE_ID,
                WHI_DEPT_ID: DataWarehouse.WHI_DEPT_ID,
                WHC_ID: DataWarehouse.WHC_ID,
                WHI_OID_ID: DataWarehouse.WHI_OID_ID,
                WHI_LTC_ID: DataWarehouse.WHI_LTC_ID,
                WHI_ACTIVE: DataWarehouse.WHI_ACTIVE,
                WHI_CP_NAME: DataWarehouse.WHI_CP_NAME,
                WHI_CP_POSITION: DataWarehouse.WHI_CP_POSITION,
                WHI_CP_ADDRESS_LINE_1: DataWarehouse.WHI_CP_ADDRESS_LINE_1,
                WHI_CP_ADDRESS_LINE_2: DataWarehouse.WHI_CP_ADDRESS_LINE_2,
                WHI_CP_ADDRESS_CITY: DataWarehouse.WHI_CP_ADDRESS_CITY,
                WHI_CP_ADDRESS_PROVINCE: DataWarehouse.WHI_CP_ADDRESS_PROVINCE,
                WHI_CP_ADDRESS_POSTAL_CODE: DataWarehouse.WHI_CP_ADDRESS_POSTAL_CODE,
                WHI_CP_ADDRESS_COUNTRY: DataWarehouse.WHI_CP_ADDRESS_COUNTRY,
                WHI_CP_PHONE: DataWarehouse.WHI_CP_PHONE,
                WHI_CP_FAX: DataWarehouse.WHI_CP_FAX,
                WHI_CP_EMAIL: DataWarehouse.WHI_CP_EMAIL
            });

            if((DataWarehouse.WHI_ITEM_QUALITY).length!==0){
                for (const quality of DataWarehouse.WHI_ITEM_QUALITY) {
                    await ModelWarehouseDetailQuality.create({ WHI_ID: newWHID, ITEM_QUALITY_CODE: quality.ITEM_QUALITY_CODE },);
                }
            }

            if((DataWarehouse.WHI_ITEM_STATUS).length!==0){
                for (const status of DataWarehouse.WHI_ITEM_STATUS) {
                    await ModelWarehouseDetailStatus.create({ WHI_ID: newWHID, ITEM_STATUS_CODE: status.ITEM_STATUS_CODE },);
                }
            }
            
        } else {
            CreatedData = await ModelWarehouseDetail.update({
                WHI_CODE: DataWarehouse.WHI_CODE,
                WHI_NAME: DataWarehouse.WHI_NAME,
                WHI_STOCKHOLDING_COMPANY_ID: DataWarehouse.WHI_STOCKHOLDING_COMPANY_ID,
                WHI_OPERATING_COMPANY_ID: DataWarehouse.WHI_OPERATING_COMPANY_ID,
                WHI_SITE_ID: DataWarehouse.WHI_SITE_ID,
                WHI_DEPT_ID: DataWarehouse.WHI_DEPT_ID,
                WHC_ID: DataWarehouse.WHC_ID,
                WHI_OID_ID: DataWarehouse.WHI_OID_ID,
                WHI_LTC_ID: DataWarehouse.WHI_LTC_ID,
                WHI_ACTIVE: DataWarehouse.WHI_ACTIVE,
                WHI_CP_NAME: DataWarehouse.WHI_CP_NAME,
                WHI_CP_POSITION: DataWarehouse.WHI_CP_POSITION,
                WHI_CP_ADDRESS_LINE_1: DataWarehouse.WHI_CP_ADDRESS_LINE_1,
                WHI_CP_ADDRESS_CITY: DataWarehouse.WHI_CP_ADDRESS_CITY,
                WHI_CP_ADDRESS_PROVINCE: DataWarehouse.WHI_CP_ADDRESS_PROVINCE,
                WHI_CP_ADDRESS_POSTAL_CODE: DataWarehouse.WHI_CP_ADDRESS_POSTAL_CODE,
                WHI_CP_ADDRESS_COUNTRY: DataWarehouse.WHI_CP_ADDRESS_COUNTRY,
                WHI_CP_PHONE: DataWarehouse.WHI_CP_PHONE,
                WHI_CP_FAX: DataWarehouse.WHI_CP_FAX,
                WHI_CP_EMAIL: DataWarehouse.WHI_CP_EMAIL
            }, {
                where: {
                    WHI_ID: DataWarehouse.WHI_ID
                }
            });
            // reset quality status table by whi id
            await ModelWarehouseDetailQuality.destroy({ where: { WHI_ID: DataWarehouse.WHI_ID }});
            await ModelWarehouseDetailStatus.destroy({ where: { WHI_ID: DataWarehouse.WHI_ID }});

            // insert new quality status data
            await ModelWarehouseDetailQuality.bulkCreate(DataWarehouse.WHI_ITEM_QUALITY);
            await ModelWarehouseDetailStatus.bulkCreate(DataWarehouse.WHI_ITEM_STATUS);
        }

        
        return res.status(200).json({
            success: true,
            message: "success post master warehouse details",
            data: CreatedData.toJSON()
        });

    } catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post master warehouse details",
        });
    }
}