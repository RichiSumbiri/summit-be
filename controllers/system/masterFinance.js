import { MasterCurrency, MasterPayMethode } from "../../models/system/finance.mod.js";

export const getListCurrency = async(req,res) => {
    try {
        const data = await MasterCurrency.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get list finance currency",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list finance currency"
        });
    }
}


export const getListPayMethode = async(req,res) => {
    try {
        const data = await MasterPayMethode.findAll({raw:true});
        if(data){
            return res.status(200).json({
                success: true,
                message: "success get list payment methode ",
                data
            });    
        }
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error get list payment methode ",
        });
    }
}