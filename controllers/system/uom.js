import {Op, QueryTypes} from "sequelize";
import db from "../../config/database.js";
import {ModelMasterUOM, ModelUOMConversion, queryGetUOMConversion, UomCategories} from "../../models/system/uom.mod.js";
import { redisConn } from "../../config/dbAudit.js";
import MasterItemIdModel from "../../models/system/masterItemId.mod.js";


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


export const getAllUomCategoryByItemid = async (req, res) => {
    const {masterItemid} = req.params

    if (!masterItemid) return res.status(400).json({
        success: false,
        message: "Master item id cannot be empty"
    })
    try {
        const  data = await MasterItemIdModel.findByPk(masterItemid)
        if (!data)  return res.status(400).json({
            success: false,
            message: "Master item id not found"
        })

        const categories = await UomCategories.findAll({ where: {
            ITEM_CATEGORY_ID: data.ITEM_CATEGORY_ID
        }});

        return res.status(200).json({
            success: true,
            message: "Kategori UOM berhasil diambil",
            data: categories,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post UOM Conversion"
        });
    }
}

export const getAllUomCategories = async (req, res) => {
    const { ITEM_CATEGORY_ID, ITEM_CATEGORY_CODE, UOM } = req.query;
    const where = {};

    if (ITEM_CATEGORY_ID) where.ITEM_CATEGORY_ID = ITEM_CATEGORY_ID;
    if (ITEM_CATEGORY_CODE) where.ITEM_CATEGORY_CODE = ITEM_CATEGORY_CODE
    if (UOM) where.UOM = UOM;


    try {
        const response = []
        const categories = await UomCategories.findAll({ where });
        for (let i = 0; i < categories.length; i++) {
            const data = categories[i].dataValues
            const masterUom = await ModelMasterUOM.findOne({where: {UOM_CODE: data.UOM}})
            if (!masterUom) {
                continue
            }
            response.push({...data, UOM_DESCRIPTION: masterUom.UOM_DESCRIPTION})
        }
        return res.status(200).json({
            success: true,
            message: "Kategori UOM berhasil diambil",
            data: response,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil data kategori UOM: ${error.message}`,
        });
    }
};

export const getUomCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await UomCategories.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori UOM tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Kategori UOM berhasil diambil",
            data: category,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal mengambil kategori UOM: ${error.message}`,
        });
    }
};

export const createUomCategory = async (req, res) => {
    const { ITEM_CATEGORY_ID, ITEM_CATEGORY_CODE, UOM } = req.body;

    if (!ITEM_CATEGORY_ID || !ITEM_CATEGORY_CODE) {
        return res.status(400).json({
            success: false,
            message: "ITEM_CATEGORY_ID dan ITEM_CATEGORY_CODE wajib diisi",
        });
    }

    try {
        const existing = await UomCategories.findOne({
            where: { ITEM_CATEGORY_ID }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Kategori dengan ITEM_CATEGORY_ID ini sudah ada",
            });
        }

        await UomCategories.create({
            ITEM_CATEGORY_ID,
            ITEM_CATEGORY_CODE,
            UOM: UOM || null,
        });

        return res.status(201).json({
            success: true,
            message: "Kategori UOM berhasil dibuat",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal membuat kategori UOM: ${error.message}`,
        });
    }
};


export const updateUomCategory = async (req, res) => {
    const { id } = req.params;
    const { ITEM_CATEGORY_CODE, UOM } = req.body;

    if (!UOM) return res.status(400).json({success: false, message: "UOM must be required"})

    try {
        const category = await UomCategories.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori UOM tidak ditemukan",
            });
        }

        if (ITEM_CATEGORY_CODE && ITEM_CATEGORY_CODE !== category.ITEM_CATEGORY_CODE) {
            const exists = await UomCategories.findOne({
                where: {
                    ITEM_CATEGORY_CODE,
                    ID: { [Op.ne]: id }
                }
            });
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: "ITEM_CATEGORY_CODE sudah digunakan",
                });
            }
        }

        await category.update({
            ITEM_CATEGORY_CODE: ITEM_CATEGORY_CODE || category.ITEM_CATEGORY_CODE,
            UOM: UOM,
        });

        return res.status(200).json({
            success: true,
            message: "Kategori UOM berhasil diperbarui",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal memperbarui kategori UOM: ${error.message}`,
        });
    }
};

export const deleteUomCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await UomCategories.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Kategori UOM tidak ditemukan",
            });
        }

        await category.destroy();
        return res.status(200).json({
            success: true,
            message: "Kategori UOM berhasil dihapus",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Gagal menghapus kategori UOM: ${error.message}`,
        });
    }
};