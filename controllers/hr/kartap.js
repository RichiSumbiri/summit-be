import { QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryListSPKT, sumbiriSPKT } from "../../models/hr/kartap.mod.js";



export const getKarTap = async(req,res) => {
    try {
        const listKarTap = await dbSPL.query(queryListSPKT, { type: QueryTypes.SELECT});
        if(listKarTap){
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