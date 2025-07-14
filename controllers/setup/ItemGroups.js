import db from "../../config/database.js";
import { MasterItemGroup } from "../../models/setup/ItemGroups.mod.js";


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

