import { MasterItemCategories } from "../../models/setup/ItemCategories.mod.js";


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
