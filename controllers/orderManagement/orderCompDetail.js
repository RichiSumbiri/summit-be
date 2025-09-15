import { QueryTypes } from "sequelize";
import db from "../../config/database.js";
import { OrderComponentDetail, qryGetBomRmList, qryGetCompListColor, qryGetDimByStructure, qryGetListCompDetail, qryListGetServices, qryListOrderCompDetail } from "../../models/orderManagement/orderCompDetail.mod.js";

export const createOrderCompDetail = async (req, res) => {
    try {

        const dataPost = req.body
        let dataSucess = []
        let dataDuplicate = []
        for (const data of dataPost) {
            //check berdasarkan order id, component id(tabel), master item id, dan fg color tidak boleh sama
            const checkData = await OrderComponentDetail.findOne({
                where: {
                    ORDER_ID: data.ORDER_ID,
                    COMPONENT_TBL_ID: data.COMPONENT_TBL_ID,
                    MASTER_ITEM_ID: data.MASTER_ITEM_ID,
                    ITEM_COLOR_CODE: data.ITEM_COLOR_CODE,
                    IS_DELETED : 0
                    // ITEM_DIMENSION_ID: data.ITEM_DIMENSION_ID,
                    // DIMENSION_ID: data.DIMENSION_ID,
                }})

            if (checkData) {
                dataDuplicate.push(data)
            }else{
                 await OrderComponentDetail.create(data)
                dataSucess.push(data) 
            }
        } 

        if(dataDuplicate.length > 0 && dataSucess.length > 0){
            return res.status(200).json({
                success: true,
                message: "success create list component detail with some duplicate data",
                dataDuplicate: dataDuplicate,
            });
        }
        if(dataDuplicate.length > 0 && dataSucess.length === 0){
            return res.status(202).json({
                success: true,
                message: "Data Already Exist or duplicate data",
                dataDuplicate: dataDuplicate,
            });
        }
        if(dataDuplicate.length === 0 && dataSucess.length > 0){
            return res.status(200).json({
                success: true,
                message: "Success create list component detail",
            });
        }


    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order component detail",
        });
    }
}

export const getListCompDetail = async (req, res) => {
    try {
        const {productId} = req.params;
        const getList = await db.query(qryGetListCompDetail, {
            replacements: {
                productId: productId
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get list component detail",
            data: getList
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order component detail",
        });
    }
}


export const getListProdServices = async (req, res) => {
    try {
        const {productId} = req.params;
        const getList = await db.query(qryListGetServices, {
            replacements: {
                productId: productId
            }, type: QueryTypes.SELECT
        });
        return res.status(200).json({
            success: true,
            message: "success get list services",
            data: getList
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list services",
        });
    }
}

export const getListOrderCompDetail = async (req, res) => {
    try {
        const {orderId} = req.params;
        const getListRm = await db.query(qryListOrderCompDetail, {
            replacements: {
                orderId: orderId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get list order component detail",
            data: getListRm
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order component detail",
        });
    }
}


export const getCompRmList = async (req, res) => {
    try {
        const {orderId} = req.params;
        const getListRm = await db.query(qryGetBomRmList, {
            replacements: {
                orderId: orderId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get list raw material",
            data: getListRm
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get order raw  material",
        });
    }
}


export const getComFgColorList = async (req, res) => {
    try {
        const {orderId} = req.params;
        
        const getListRm = await db.query(qryGetCompListColor, {
            replacements: {
                orderId: orderId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get po FG color",
            data: getListRm
        });
    } catch (err) {
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get  Po FG color",
        });
    }
}



export const getDimiensionItem = async (req, res) => {
    try {
        const {itemId} = req.params;
        const getListRm = await db.query(qryGetDimByStructure, {
            replacements: {
                itemId: itemId
            }, type: QueryTypes.SELECT
        });

        return res.status(200).json({
            success: true,
            message: "success get item dimension",
            data: getListRm
        });
    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get item dimension",
        });
    }
}


export const putMainComponent = async (req, res) => {
    try {
        const {orderId, compId, itemId, userId} = req.body;


        // set 0 all comp main 
        await OrderComponentDetail.update({MAIN_COMPONENT : 0, MOD_ID : userId},{
        where: {
            ORDER_ID: orderId,
            IS_DELETED : 0
        }})


        const setMain = await OrderComponentDetail.update({MAIN_COMPONENT : 1, MOD_ID : userId}, {
        where: {
            ORDER_ID: orderId,
            COMPONENT_ID: compId,
            MASTER_ITEM_ID: itemId,
            IS_DELETED : 0
        }})
;

        if(setMain){
            return res.status(200).json({
                success: true,
                message: "success set component main",
            });
        }else{
             
        return res.status(400).json({
            success: false,
            error: err,
            message: "error set component main",
        });
        }

    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error set component main",
        });
    }
}


export const revertCompDetail = async (req, res) => {
    try {
        const data = req.body;
        if(data.length === 0){
            return res.status(400).json({
                success: false,
                error: err,
                message: "no data component selected",
            });

        }else{
            const arrID = data.map(item=> item.ID)
            await OrderComponentDetail.update({IS_DELETED : 1, MOD_ID : data[0].MOD_ID},{
            where: {
                ID: arrID
            }})

            return res.status(200).json({
                success: true,
                message: "success set Revert Component",
            });
        }


    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error set revert component ",
        });
    }
}


export const setActived = async (req, res) => {
    try {
        const data = req.body;
        if(data.length === 0){
            return res.status(400).json({
                success: false,
                error: err,
                message: "no data component selected",
            });

        }else{
           
            for (const item of data) {
                const findData = await OrderComponentDetail.findOne({
                    where: {
                        ID: item.ID
                    }})
                if(findData){
                    const statusActive = findData.IS_ACTIVE === 1 ? 0 : 1
                    await OrderComponentDetail.update({IS_ACTIVE : statusActive, MOD_ID : item.MOD_ID},{
                    where: {
                        ID: item.ID
                    }})

                }

            }
            

                return res.status(200).json({
                success: true,
                message: "success set active deactive Component",
            });
        }


    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error set active deactive",
        });
    }
}


export const setComponentDim = async (req, res) => {
    try {
        const data = req.body;
        if(!data){
            return res.status(400).json({
                success: false,
                error: err,
                message: "no data component selected",
            });

        }else{
            const findData = await OrderComponentDetail.findOne({
                    where: {
                        ID: data.ID
                    }})
                if(findData){
                    const statusActive = findData.IS_ACTIVE === 1 ? 0 : 1
                    await OrderComponentDetail.update(data,{
                    where: {
                        ID: data.ID
                    }})

                }

                return res.status(200).json({
                success: true,
                message: "success set Dimension Component",
            });
        }


    } catch (err) {
        console.log(err);
        
        return res.status(500).json({
            success: false,
            error: err,
            message: "error set Dimension Component",
        });
    }
}
