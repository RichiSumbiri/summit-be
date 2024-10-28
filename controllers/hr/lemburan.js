import { Op, QueryTypes } from "sequelize";
import { dbSPL } from "../../config/dbAudit.js";
import { queryLemburanPending } from "../../models/hr/lemburanspl.mod.js";

export const getLemburanPending = async(req,res) => {
    try {
        const listPending = await dbSPL.query(queryLemburanPending, { type: QueryTypes.SELECT });
        if(listPending){
            res.status(200).json({
                success: true,
                message: "success get list pending lemburan",
                data: listPending
            });
        }
    } catch(err){
        res.status(404).json({
            success: false,
            message: "error get list pending lemburan",
        });
    }
}