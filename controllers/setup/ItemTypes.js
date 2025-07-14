import { MasterItemTypes } from "../../models/setup/ItemTypes.mod.js";

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

