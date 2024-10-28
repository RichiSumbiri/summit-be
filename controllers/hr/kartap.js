import { sumbiriSPKT } from "../../models/hr/kartap.mod.js";



export const getKarTap = async(req,res) => {
    try {
        const listKarTap = await sumbiriSPKT.findAll();
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list kartap docs",
                data: listKarTap
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list kartap docs",
        });
    }
}