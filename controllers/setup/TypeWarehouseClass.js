import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { MasterItemCategories, MasterItemGroup, MasterItemTypes, MasterWarehouseClass, queryGetAllMasterWarehouseClass } from "../../models/setup/TypeWarehouseClass.js";


export const getMasterItemGroup = async(req, res) => {
    try {
        const getData = await MasterItemGroup.findAll();
        if(getData){
            return res.status(200).json({
                success: true,
                message: "success get master item group",
                data: getData,
        });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            error: err,
            message: "error get list item group",
        });
    }
}

export const postMasterItemGroup = async (req, res) => {
    try {
        const { DataGroup } = req.body;

        if (DataGroup.ITEM_GROUP_ID === 0) {
            await MasterItemGroup.create(DataGroup);
        } else {
            await MasterItemGroup.update(
                {
                    ITEM_GROUP_CODE: DataGroup.ITEM_GROUP_CODE,
                    ITEM_GROUP_DESCRIPTION: DataGroup.ITEM_GROUP_DESCRIPTION
                },
                {
                    where: {
                        ITEM_GROUP_ID: DataGroup.ITEM_GROUP_ID
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "success post master item group"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post list item group"
        });
    }
};



export const getMasterItemType = async(req, res) => {
    try {
        const { id } = req.params;
        const getData = await MasterItemTypes.findAll({
            where: {
                ITEM_GROUP_ID: id 
            }
        });
        if(getData){
            return res.status(200).json({
                success: true,
                message: "success get master item type",
                data: getData,
        });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            error: err,
            message: "error get list item type",
        });
    }
}



export const postMasterItemType = async (req, res) => {
    try {
        const { DataType } = req.body;
        if (DataType.ITEM_TYPE_ID === 0) {
            await MasterItemTypes.create(DataType);
        } else {
            await MasterItemTypes.update(
                {
                    ITEM_TYPE_CODE: DataType.ITEM_TYPE_CODE,
                    ITEM_TYPE_DESCRIPTION: DataType.ITEM_TYPE_DESCRIPTION,
                    ITEM_TYPE_STOCK: DataType.ITEM_TYPE_STOCK
                },
                {
                    where: {
                        ITEM_TYPE_ID: DataType.ITEM_TYPE_ID
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "success post master item type"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post list item type"
        });
    }
};


export const getMasterItemCategory = async(req, res) => {
    try {
        const { id } = req.params;
        const getData = await MasterItemCategories.findAll({
            where: {
                ITEM_TYPE_ID: id 
            }
        });
        if(getData){
            return res.status(200).json({
                success: true,
                message: "success get master item category",
                data: getData,
        });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            error: err,
            message: "error get list item category",
        });
    }
}


export const postMasterItemCategory = async (req, res) => {
    try {
        const { DataCategory } = req.body;
        if (DataCategory.ITEM_CATEGORY_ID === 0) {
            await MasterItemCategories.create(DataCategory);
        } else {
            await MasterItemCategories.update(
                {
                    ITEM_CATEGORY_CODE: DataCategory.ITEM_CATEGORY_CODE,
                    ITEM_CATEGORY_DESCRIPTION: DataCategory.ITEM_CATEGORY_DESCRIPTION,
                    ITEM_TYPE_ID: DataCategory.ITEM_TYPE_ID,
                    ITEM_CATEGORY_INSPECTION_FLAG: DataCategory.ITEM_CATEGORY_INSPECTION_FLAG,
                    ITEM_CATEGORY_LOTSERIAL_FLAG: DataCategory.ITEM_CATEGORY_LOTSERIAL_FLAG,
                    ITEM_CATEGORY_LABDIPS_AVAILABILITY: DataCategory.ITEM_CATEGORY_LABDIPS_AVAILABILITY,
                    ITEM_CATEGORY_LOTBATCH_UOM_CODE: DataCategory.ITEM_CATEGORY_LOTBATCH_UOM_CODE
                },
                {
                    where: {
                        ITEM_CATEGORY_ID: DataCategory.ITEM_CATEGORY_ID
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            message: "success post master item category"
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post list item category"
        });
    }
};


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